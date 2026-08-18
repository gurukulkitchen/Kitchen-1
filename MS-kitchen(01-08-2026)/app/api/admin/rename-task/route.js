import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';
import EventPlan from '../../../../models/EventPlan';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();

    try {
        // 1. Final Menu Update (ensure plurality and icon)
        const updateMain = await Menu.updateMany(
            { label: { $regex: /^(rasoi|donation)$/i } },
            { $set: { label: "Donations", route: "/donation", icon: "Calendar" } }
        );

        // 2. Rename rasoiName to eventName in EventPlan collection
        const eventUpdate = await EventPlan.updateMany(
            { rasoiName: { $exists: true } },
            { $rename: { "rasoiName": "eventName" } }
        );

        return NextResponse.json({
            success: true,
            results: {
                updateMain,
                eventUpdate
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
