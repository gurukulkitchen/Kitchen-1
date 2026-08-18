import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req) {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized', role: null }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);

        // Fetch full user details from DB to ensure latest role and companies
        const dbConnect = (await import('../../../../lib/db')).default;
        const User = (await import('../../../../models/User')).default;
        await dbConnect();
        
        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                assignedCompanies: user.assignedCompanies || [],
                name: user.name,
                avatar: user.avatar || ''
            },
            role: user.role
        }, { status: 200 });

    } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ message: 'Invalid token', role: null }, { status: 401 });
    }
}
