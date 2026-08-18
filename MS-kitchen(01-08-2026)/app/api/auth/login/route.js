import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import Company from '../../../../models/Company'; // Import Company model
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(req) {
    try {
        await dbConnect();

        const { email, password } = await req.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ message: 'Missing fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = await User.findOne({
            $or: [
                { email: email },
                { phone: email }
            ]
        }).populate('companyId');

        if (!user) {
            return new Response(JSON.stringify({ message: 'User not found' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (user.status === 'Inactive' || user.status === 'Suspended') {
            return new Response(JSON.stringify({ message: 'Your account has been deactivated. Please contact your administrator.' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Time Restriction Check for Company Admins/Staff
        if (user.role !== 'Super Admin' && user.companyId) {
            // Check if Company is Active
            if (user.companyId.status === 'inactive') {
                return new Response(JSON.stringify({
                    message: 'Your company account is inactive. Please contact support.'
                }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const { loginStartTime, loginEndTime } = user.companyId;

            if (loginStartTime && loginEndTime) {
                // Get current time in IST
                const now = new Date();

                // Use Intl to get parts for robust conversion
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Kolkata',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // formatToParts gives us type: 'hour', value: '09' etc.
                const parts = formatter.formatToParts(now);
                const hour = parts.find(p => p.type === 'hour')?.value;
                const minute = parts.find(p => p.type === 'minute')?.value;

                const currentTime = `${hour}:${minute}`; // e.g., "09:30" or "14:05"

                // Comparison (String comparison works for HH:mm 24h format)
                if (currentTime < loginStartTime || currentTime > loginEndTime) {
                    return new Response(JSON.stringify({
                        message: `Login allowed only between ${loginStartTime} and ${loginEndTime}`
                    }), {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            }
        }

        // Sign JWT
        const secret = process.env.JWT_SECRET || 'secret';
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role, companyId: user.companyId?._id },
            secret,
            { expiresIn: '1d' }
        );

        // Set Cookie
        const serialized = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        let companyName = 'Gurukul';
        let companyId = user.companyId?._id;

        if (user.companyId) {
            companyName = user.companyId.name;
        } else {
            const mainCompany = await Company.findOne({ status: 'active' });
            if (mainCompany) {
                companyName = mainCompany.name;
            }
        }

        console.log('Login attempt for:', email);
        console.log('User found:', user ? user.email : 'No user');
        console.log('User company:', user?.companyId);
        console.log('Resolved Company Name:', companyName);

        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(
            req,
            user,
            'LOGIN',
            { method: 'email' }
        );

        return new Response(JSON.stringify({
            message: 'Login successful',
            role: user.role,
            token,
            companyId: user.companyId?._id,
            companyName,
            assignedCompanies: user.assignedCompanies || [],
            id: user._id,
            name: user.name,
            loginStartTime: user.companyId?.loginStartTime,
            loginEndTime: user.companyId?.loginEndTime
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': serialized,
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
