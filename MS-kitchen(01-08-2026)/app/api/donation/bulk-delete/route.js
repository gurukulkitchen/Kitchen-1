import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Donation from '../../../../models/Donation';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function DELETE(req) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { ids } = await req.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: 'No IDs provided' }, { status: 400 });
        }

        const result = await Donation.deleteMany({ _id: { $in: ids } });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'DONATION_BULK_DELETE', { count: result.deletedCount, ids });

        return NextResponse.json({ 
            message: `${result.deletedCount} entries deleted successfully`, 
            deletedCount: result.deletedCount 
        }, { status: 200 });
    } catch (error) {
        console.error('Failed to bulk delete donation entries:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
