import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Donation from '../../../../models/Donation';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const entry = await Donation.findById(id);
        if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
        return NextResponse.json(entry, { status: 200 });
    } catch (error) {
        console.error('Failed to get donation entry:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const data = await req.json();
        const user = getDataFromToken(req);

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Sanitize ObjectId fields
        if (data.eventType === "" || data.eventType === "null") data.eventType = null;
        if (data.donationMode === "" || data.donationMode === "null") data.donationMode = null;

        const updatedEntry = await Donation.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'DONATION_UPDATE', {
            entryId: updatedEntry._id,
            date: updatedEntry.date
        });

        return NextResponse.json({ message: 'Entry updated successfully', entry: updatedEntry }, { status: 200 });
    } catch (error) {
        console.error('Failed to update donation entry:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = getDataFromToken(req);

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const deletedEntry = await Donation.findByIdAndDelete(id);

        if (!deletedEntry) {
            return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'DONATION_DELETE', {
            entryId: id,
            date: deletedEntry.date
        });

        return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete donation entry:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
