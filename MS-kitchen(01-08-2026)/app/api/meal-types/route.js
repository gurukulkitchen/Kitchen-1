import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import MealType from '../../../models/MealType';
import MonthlyMenu from '../../../models/MonthlyMenu';
import { getDataFromToken } from '../../../helpers/getDataFromToken';

// GET – fetch all meal types for the company
export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const user = getDataFromToken(req);

    try {
        const query = {};
        if (companyId) {
            query.companyId = companyId;
        } else if (user && user.role !== 'Super Admin') {
            query.companyId = user.companyId;
        }

        const mealTypes = await MealType.find(query).populate('companyId', 'name').sort({ order: 1, createdAt: 1 });
        return NextResponse.json(mealTypes);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST – create a new meal type
export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { name, companyId: bodyCompanyId } = body;

        const user = getDataFromToken(req);
        const companyId = bodyCompanyId || (user && user.companyId);

        if (!name || !companyId) {
            return NextResponse.json({ error: 'Name and Company ID are required' }, { status: 400 });
        }

        // Get count to assign order
        const count = await MealType.countDocuments({ companyId });

        const mealType = await MealType.create({
            name: name.trim().toLowerCase(),
            order: count,
            companyId,
        });

        return NextResponse.json(mealType, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Meal type already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        // 1. Find the meal type to get its name and companyId
        const mealType = await MealType.findById(id);
        if (!mealType) {
            return NextResponse.json({ error: 'Meal type not found' }, { status: 404 });
        }

        const { name, companyId } = mealType;

        // 2. Delete the meal type document
        await MealType.findByIdAndDelete(id);

        // 3. Clear data for this source in all monthly menu entries for this company
        // Map keys are accessed as sub-fields: meals.key
        const mealKey = `meals.${name.toLowerCase()}`;
        await MonthlyMenu.updateMany(
            { companyId },
            { $unset: { [mealKey]: "" } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT – update a meal type by ID
export async function PUT(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { id, name } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }

        const updated = await MealType.findByIdAndUpdate(
            id,
            { name: name.trim().toLowerCase() },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Meal type not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Meal type name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
