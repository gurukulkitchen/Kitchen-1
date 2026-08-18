import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function POST(req) {
    try {
        await dbConnect();

        const { fcmToken, userId } = await req.json();
        console.log('Updating FCM Token:', { userId, fcmTokenLength: fcmToken?.length });

        // If userId is provided (e.g. for testing from curl), use it.
        // Otherwise try to get from token.
        let targetUserId = userId;

        if (!targetUserId) {
            const decodedToken = await getDataFromToken(req);
            if (!decodedToken) {
                return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
            }
            targetUserId = decodedToken.id;
        }

        if (!fcmToken) {
            return NextResponse.json({ message: 'FCM Token is required' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            targetUserId,
            { fcmToken },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'FCM token updated successfully' });

    } catch (error) {
        console.error('Error updating FCM token:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
