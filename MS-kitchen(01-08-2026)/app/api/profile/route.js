import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import { jwtVerify } from 'jose';

export async function GET(req) {
    try {
        await dbConnect();

        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);

        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();

        const token = req.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);

        const data = await req.json();

        // Prevent updating sensitive fields directly
        delete data.password;
        delete data.role;
        delete data._id;

        const user = await User.findByIdAndUpdate(
            payload.userId,
            { $set: data },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated successfully', user }, { status: 200 });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
