import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import CashbookVendor from '../../../../models/CashbookVendor';
import CashbookEntry from '../../../../models/CashbookEntry';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');

        const query = {};

        // Role-based filtering
        if (user.role === 'Super Admin') {
            if (companyId && companyId !== 'All') {
                query.company = companyId;
            }
        } else {
            // Non-Super Admins can only see their own company's vendors
            query.company = user.companyId;
        }

        // LOG ACTIVITY
        if (user) {
            const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'VENDOR_VIEW');
        }

        const vendors = await CashbookVendor.find(query).sort({ createdAt: -1 });
        return NextResponse.json(vendors);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        let { name, phone, type, color, company } = body;

        // Force company for non-Super Admins
        if (user.role !== 'Super Admin' && !company) {
            company = user.companyId;
        }

        // Handle empty string company (create as undefined/null if empty)
        if (company === "") {
            company = undefined;
        }

        const newVendor = await CashbookVendor.create({
            name,
            phone,
            type,
            color,
            company,
            createdBy: user?.userId
        });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'VENDOR_CREATE', {
            vendorId: newVendor._id,
            name: newVendor.name,
            type: newVendor.type
        });

        return NextResponse.json(newVendor, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
