import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import CashbookCategory from '../../../../models/CashbookCategory';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

// GET  /api/cashbook/categories?companyId=xxx
export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    let companyId = searchParams.get('companyId');

    if (!companyId) {
        const user = getDataFromToken(req);
        if (user && user.role !== 'Super Admin') companyId = user.companyId;
    }

    try {
        const query = companyId ? { companyId } : {};
        const categories = await CashbookCategory.find(query).sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/cashbook/categories  { name, companyId? }
export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { name, companyId: bodyCompanyId } = body;

        const user = getDataFromToken(req);
        const companyId = bodyCompanyId || (user && user.companyId);

        if (!name || !companyId) {
            return NextResponse.json({ error: 'Name and companyId are required' }, { status: 400 });
        }

        const category = await CashbookCategory.create({ name: name.trim(), companyId });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/cashbook/categories  { id, name }
export async function PUT(req) {
    await dbConnect();
    try {
        const { id, name } = await req.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
        }
        const updated = await CashbookCategory.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/cashbook/categories?id=xxx
export async function DELETE(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    try {
        await CashbookCategory.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
