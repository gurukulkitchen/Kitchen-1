import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

export async function PUT(req) {
    try {
        await dbConnect();

        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        const user = await User.findById(payload.userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
