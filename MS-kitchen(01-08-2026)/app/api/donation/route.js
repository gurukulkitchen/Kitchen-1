import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Donation from '../../../models/Donation';
import User from '../../../models/User';
import { getDataFromToken } from '../../../helpers/getDataFromToken';

export async function GET(req) {
    try {
        await dbConnect();
        const payload = getDataFromToken(req);
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, payload, 'DONATION_VIEW');

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');

        let query = {};

        // Multi-Company and Default Logic
        if (payload.role === 'Super Admin') {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            }
        } else {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            } else {
                // DEFAULT: Use ALL assigned companies
                const user = await User.findById(payload.userId).select('assignedCompanies companyId');
                if (user) {
                    const assigned = user.assignedCompanies || [];
                    if (assigned.length > 0) {
                        query.companyId = { $in: assigned };
                    } else if (user.companyId) {
                        query.companyId = user.companyId;
                    }
                }
            }
        }

        const rawEntries = await Donation.find(query)
            .sort({ date: -1, createdAt: -1 })
            .lean();

        const isObjectId = (val) => val && /^[0-9a-fA-F]{24}$/.test(String(val._id || val));

        const modeIds = [...new Set(rawEntries.map(d => d.donationMode).filter(isObjectId))];
        const eventIds = [...new Set(rawEntries.map(d => d.eventType).filter(isObjectId))];

        const { default: PaymentMode } = await import('../../../models/PaymentMode');
        const { default: DonationEventType } = await import('../../../models/DonationEventType');

        const [pModes, dEvents] = await Promise.all([
            modeIds.length ? PaymentMode.find({ _id: { $in: modeIds } }).select('name').lean() : [],
            eventIds.length ? DonationEventType.find({ _id: { $in: eventIds } }).select('name').lean() : [],
        ]);

        const modeMap = Object.fromEntries(pModes.map(m => [String(m._id), m]));
        const eventMap = Object.fromEntries(dEvents.map(e => [String(e._id), e]));

        const entries = rawEntries.map(d => ({
            ...d,
            donationMode: isObjectId(d.donationMode) ? modeMap[String(d.donationMode)] : (typeof d.donationMode === 'string' ? { name: d.donationMode } : d.donationMode),
            eventType: isObjectId(d.eventType) ? eventMap[String(d.eventType)] : (typeof d.eventType === 'string' ? { name: d.eventType } : d.eventType),
        }));

        return NextResponse.json(entries, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch donation entries:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        const data = await req.json();

        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Sanitize ObjectId fields
        if (data.eventType === "" || data.eventType === "null") data.eventType = null;
        if (data.donationMode === "" || data.donationMode === "null") data.donationMode = null;

        const newEntry = new Donation({
            ...data,
            companyId: user.companyId || data.companyId
        });

        await newEntry.save();
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'DONATION_CREATE', { entryId: newEntry._id, date: newEntry.date });

        return NextResponse.json({ message: 'Entry created successfully', entry: newEntry }, { status: 201 });
    } catch (error) {
        console.error('Failed to create donation entry:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

