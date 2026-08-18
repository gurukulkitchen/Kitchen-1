import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';
import User from '@/models/User';
import Company from '@/models/Company';
import jwt from 'jsonwebtoken';

export async function GET(req) {
    try {
        await dbConnect();

        // 1. Auth Check
        const token = req.cookies.get('auth_token')?.value;
        if (!token) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
        }

        const secret = process.env.JWT_SECRET || 'secret';
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (e) {
            return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
        }

        const { role, companyId: userCompanyId } = decoded;
        // Only Admins allowed
        // Only Admins allowed
        if (!['Super Admin', 'Company Admin', 'Admin'].includes(role)) {
            return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        // 2. Parse Query Params
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const filterCompanyId = url.searchParams.get('companyId'); // Super Admin can request specific company
        const filterUserId = url.searchParams.get('userId');
        const filterMethod = url.searchParams.get('method');

        // 3. Build Query
        const query = {};

        // Company Filter Logic
        if (role === 'Super Admin') {
            if (filterCompanyId) {
                query.company = filterCompanyId;
            }
            // If no filterCompanyId, Super Admin sees ALL by default
        } else {
            // Company Admin LIMITED to their own company
            query.company = userCompanyId;
        }

        // User Filter
        if (filterUserId) {
            query.user = filterUserId;
        }

        // Method Filter
        if (filterMethod) {
            query.method = filterMethod;
        }

        // Date Filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) {
                // Set end date to end of day if it's just a date string, or use as provided
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        // 4. Execute Query
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            ActivityLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'name email')
                .populate('company', 'name')
                .lean(),
            ActivityLog.countDocuments(query),
        ]);

        return new Response(JSON.stringify({
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Activity Log Fetch Error:', error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    }
}
