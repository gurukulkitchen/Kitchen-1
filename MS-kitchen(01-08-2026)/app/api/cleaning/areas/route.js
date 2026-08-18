import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import CleaningArea from '../../../../models/CleaningArea';
import User from '../../../../models/User';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');
        let targetCompanyId = companyIdParam;

        if (!targetCompanyId) {
            if (user.role === 'Super Admin') {
                targetCompanyId = user.companyId;
            } else {
                const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
                if (dbUser) {
                    const assigned = dbUser.assignedCompanies || [];
                    targetCompanyId = assigned[0] || dbUser.companyId;
                }
            }
        }

        if (!targetCompanyId) {
            return NextResponse.json({ error: 'Company not found' }, { status: 400 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CLEANING_AREA_VIEW');

        const areas = await CleaningArea.find({ companyId: targetCompanyId }).sort({ order: 1, createdAt: 1 });
        return NextResponse.json(areas);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, companyId } = await req.json();
        const trimmedName = name?.trim();
        const targetCompanyId = companyId || user.companyId;

        if (!targetCompanyId) {
            return NextResponse.json({ error: 'Company not found' }, { status: 400 });
        }
        if (!trimmedName) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const existingArea = await CleaningArea.findOne({
            companyId: targetCompanyId,
            name: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        });
        if (existingArea) {
            return NextResponse.json({ error: 'Cleaning area already exists' }, { status: 400 });
        }

        const count = await CleaningArea.countDocuments({ companyId: targetCompanyId });

        const newArea = await CleaningArea.create({
            name: trimmedName,
            companyId: targetCompanyId,
            order: count + 1
        });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CLEANING_AREA_CREATE', {
            areaId: newArea._id,
            name: newArea.name
        });

        return NextResponse.json(newArea, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const companyIdParam = searchParams.get('companyId');
        const targetCompanyId = companyIdParam || user.companyId;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        if (!targetCompanyId) return NextResponse.json({ error: 'Company not found' }, { status: 400 });

        const deleted = await CleaningArea.findOneAndDelete({ _id: id, companyId: targetCompanyId });
        if (!deleted) return NextResponse.json({ error: 'Area not found' }, { status: 404 });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CLEANING_AREA_DELETE', {
            areaId: id,
            name: deleted.name
        });

        return NextResponse.json({ message: 'Area deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, companyId } = await req.json();
        const trimmedName = name?.trim();
        const targetCompanyId = companyId || user.companyId;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        if (!trimmedName) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        if (!targetCompanyId) return NextResponse.json({ error: 'Company not found' }, { status: 400 });

        // Check if another area with the same name exists
        const existingArea = await CleaningArea.findOne({
            companyId: targetCompanyId,
            _id: { $ne: id },
            name: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        });

        if (existingArea) {
            return NextResponse.json({ error: 'Cleaning area name already exists' }, { status: 400 });
        }

        const updated = await CleaningArea.findOneAndUpdate(
            { _id: id, companyId: targetCompanyId },
            { name: trimmedName },
            { new: true }
        );

        if (!updated) return NextResponse.json({ error: 'Area not found' }, { status: 404 });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CLEANING_AREA_UPDATE', {
            areaId: id,
            name: updated.name
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
