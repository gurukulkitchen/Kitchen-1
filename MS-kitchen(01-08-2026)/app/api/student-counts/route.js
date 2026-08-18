import dbConnect from '../../../lib/db';
import StudentCount from '../../../models/StudentCount';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');

        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);

        let query = {};
        if (companyId) {
            query.companyId = companyId;
        } else if (user && user.role !== 'Super Admin') {
            query.companyId = user.companyId;
        }

        const counts = await StudentCount.find(query).sort({ month: -1 });
        return NextResponse.json(counts);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
        const user = getDataFromToken(req);

        const { month, count, companyId: bodyCompanyId } = body;

        if (!month || count === undefined) {
            return NextResponse.json({ error: "Month and Count are required" }, { status: 400 });
        }

        const targetCompanyId = bodyCompanyId || (user && user.role !== 'Super Admin' ? user.companyId : null);

        if (!targetCompanyId) {
            return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
        }

        const result = await StudentCount.findOneAndUpdate(
            { month, companyId: targetCompanyId },
            { $set: { count, companyId: targetCompanyId } },
            { new: true, upsert: true }
        );

        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'STUDENT_COUNT_UPDATE', { month, count });
        }

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await StudentCount.findByIdAndDelete(id);
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
