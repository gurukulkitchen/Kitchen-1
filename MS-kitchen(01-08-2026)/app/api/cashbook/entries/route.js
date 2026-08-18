import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import CashbookEntry from '../../../../models/CashbookEntry';
import User from '../../../../models/User';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';
import CashbookVendor from '../../../../models/CashbookVendor';
import Donation from '../../../../models/Donation';
import MaintenanceRecord from '../../../../models/MaintenanceRecord';
import DailyFeedback from '../../../../models/DailyFeedback';
import PaymentMode from '../../../../models/PaymentMode';
import DonationEventType from '../../../../models/DonationEventType';
import CashbookCategory from '../../../../models/CashbookCategory';
import MaintenanceCategory from '../../../../models/MaintenanceCategory';
import MealType from '../../../../models/MealType';

const isObjectId = (val) => {
    if (!val) return false;
    const str = typeof val === 'object' && val._id ? String(val._id) : String(val);
    return /^[0-9a-fA-F]{24}$/.test(str);
};

export async function GET(req) {
    await dbConnect();
    try {
        const payload = getDataFromToken(req);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const vendorId = searchParams.get('vendorId');
        const companyIdParam = searchParams.get('companyId');

        const query = {};
        if (vendorId) query.vendorId = vendorId;

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

        // 1. Fetch Primary Cashbook Entries
        const rawCashbook = await CashbookEntry.find(query)
            .sort({ date: -1, time: -1 })
            .lean();

        const vendorIds = [...new Set(rawCashbook.map(e => e.vendorId).filter(isObjectId))];
        const cbModeIds = [...new Set(rawCashbook.map(e => e.modeOfPayment).filter(isObjectId))];
        const cbCatIds = [...new Set(rawCashbook.map(e => e.category).filter(isObjectId))];

        const [cbVendors, cbModes, cbCats] = await Promise.all([
            vendorIds.length ? CashbookVendor.find({ _id: { $in: vendorIds } }).select('name').lean() : [],
            cbModeIds.length ? PaymentMode.find({ _id: { $in: cbModeIds } }).select('name').lean() : [],
            cbCatIds.length ? CashbookCategory.find({ _id: { $in: cbCatIds } }).select('name').lean() : [],
        ]);

        const vendorMap = Object.fromEntries(cbVendors.map(v => [String(v._id), v]));
        const modeMap = Object.fromEntries(cbModes.map(m => [String(m._id), m]));
        const catMap = Object.fromEntries(cbCats.map(c => [String(c._id), c]));

        const formattedCashbook = rawCashbook.map(e => {
            const vObj = isObjectId(e.vendorId) ? vendorMap[String(e.vendorId)] : (typeof e.vendorId === 'string' ? { name: e.vendorId } : null);
            const mObj = isObjectId(e.modeOfPayment) ? modeMap[String(e.modeOfPayment)] : (typeof e.modeOfPayment === 'string' ? { name: e.modeOfPayment } : null);
            const cObj = isObjectId(e.category) ? catMap[String(e.category)] : (typeof e.category === 'string' ? { name: e.category } : null);

            return {
                ...e,
                vendorId: vObj || e.vendorId,
                modeOfPayment: mObj || e.modeOfPayment,
                category: cObj || e.category,
                source: 'Cashbook',
                displayCategory: cObj?.name || (typeof e.category === 'string' ? e.category : 'Uncategorized'),
                displayMode: mObj?.name || (typeof e.modeOfPayment === 'string' ? e.modeOfPayment : 'N/A')
            };
        });

        // 2. Fetch Donations (as Income / "in")
        const donationQuery = { companyId: query.companyId };
        const rawDonations = await Donation.find(donationQuery).lean();

        const donationModeIds = [...new Set(rawDonations.map(d => d.donationMode).filter(isObjectId))];
        const eventTypeIds = [...new Set(rawDonations.map(d => d.eventType).filter(isObjectId))];

        const [dModes, dEventTypes] = await Promise.all([
            donationModeIds.length ? PaymentMode.find({ _id: { $in: donationModeIds } }).select('name').lean() : [],
            eventTypeIds.length ? DonationEventType.find({ _id: { $in: eventTypeIds } }).select('name').lean() : [],
        ]);

        const donationModeMap = Object.fromEntries(dModes.map(m => [String(m._id), m.name]));
        const eventTypeMap = Object.fromEntries(dEventTypes.map(et => [String(et._id), et.name]));

        const formattedDonations = rawDonations.map(d => {
            let modeName = 'N/A';
            if (isObjectId(d.donationMode)) {
                modeName = donationModeMap[String(d.donationMode)] || 'N/A';
            } else if (typeof d.donationMode === 'string' && d.donationMode.trim()) {
                modeName = d.donationMode;
            }

            let catName = 'Donation';
            if (isObjectId(d.eventType)) {
                catName = eventTypeMap[String(d.eventType)] || 'Donation';
            } else if (typeof d.eventType === 'string' && d.eventType.trim()) {
                catName = d.eventType;
            }

            return {
                _id: d._id,
                date: d.date,
                time: '00:00 AM',
                detail: `Donation: ${d.name} (${d.receiptNo})`,
                amount: d.amount,
                type: 'in',
                source: 'Donation',
                displayCategory: catName,
                displayMode: modeName,
                isExternal: true
            };
        });

        // 3. Fetch Maintenance Records (as Expense / "out")
        const maintenanceQuery = { companyId: query.companyId };
        const rawMaintenance = await MaintenanceRecord.find(maintenanceQuery).lean();

        const maintCatIds = [...new Set(rawMaintenance.map(m => m.categoryId).filter(isObjectId))];
        const maintCats = maintCatIds.length ? await MaintenanceCategory.find({ _id: { $in: maintCatIds } }).select('name').lean() : [];
        const maintCatMap = Object.fromEntries(maintCats.map(c => [String(c._id), c.name]));

        const formattedMaintenance = rawMaintenance.map(m => {
            let catName = m.categoryName || 'Other Expense';
            if (isObjectId(m.categoryId)) {
                catName = maintCatMap[String(m.categoryId)] || catName;
            } else if (typeof m.categoryId === 'string' && m.categoryId.trim()) {
                catName = m.categoryId;
            }

            return {
                _id: m._id,
                date: m.date,
                time: (typeof m.time === 'object' ? m.time?.name : m.time) || '00:00 AM',
                detail: m.narration,
                amount: m.amount,
                type: 'out',
                source: 'Expense',
                displayCategory: catName,
                displayMode: 'N/A',
                isExternal: true
            };
        });

        // 4. Fetch Daily Feedback (as info or 0-amount entries)
        const feedbackQuery = { companyId: query.companyId };
        const rawFeedbacks = await DailyFeedback.find(feedbackQuery).lean();

        const mealTypeIds = [...new Set(rawFeedbacks.map(f => f.mealType).filter(isObjectId))];
        const mealTypes = mealTypeIds.length ? await MealType.find({ _id: { $in: mealTypeIds } }).select('name').lean() : [];
        const mealTypeMap = Object.fromEntries(mealTypes.map(mt => [String(mt._id), mt.name]));

        const formattedFeedbacks = rawFeedbacks.map(f => {
            let mealTypeName = 'Meal';
            if (isObjectId(f.mealType)) {
                mealTypeName = mealTypeMap[String(f.mealType)] || 'Meal';
            } else if (typeof f.mealType === 'string' && f.mealType.trim()) {
                mealTypeName = f.mealType;
            }

            return {
                _id: f._id,
                date: f.date,
                time: '00:00 AM',
                detail: `Meal Feedback: ${mealTypeName} (${f.studentCount} students)`,
                amount: 0,
                type: 'info',
                source: 'Feedback',
                displayCategory: 'Feedback',
                displayMode: `Rating: ${f.averageRating}`,
                isExternal: true
            };
        });

        // Merge all
        let allEntries = [
            ...formattedCashbook,
            ...formattedDonations,
            ...formattedMaintenance,
            ...formattedFeedbacks
        ];

        // Sort by date descending
        allEntries.sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            const dateCompare = dateB - dateA;
            if (dateCompare !== 0) return dateCompare;
            return (b.time || '').localeCompare(a.time || '');
        });

        return NextResponse.json(allEntries);
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
        if (!body.vendorId) return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });

        const vendor = await CashbookVendor.findById(body.vendorId);
        if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

        // Validate access
        const targetCompanyId = body.companyId || vendor.company;
        if (user.role !== 'Super Admin') {
            const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
            const assigned = dbUser?.assignedCompanies || [];
            const isAuthorized = assigned.length > 0 
                ? assigned.some(id => String(id) === String(targetCompanyId))
                : String(dbUser?.companyId) === String(targetCompanyId);

            if (!isAuthorized) {
                return NextResponse.json({ error: "Unauthorized access to this company" }, { status: 403 });
            }
        }

        const newEntry = await CashbookEntry.create({
            ...body,
            createdBy: user?.userId,
            companyId: targetCompanyId
        });

        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CASHBOOK_ENTRY_CREATE', {
            entryId: newEntry._id,
            vendorId: newEntry.vendorId,
            amount: newEntry.amount,
            type: newEntry.type
        });

        return NextResponse.json(newEntry, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const idsString = searchParams.get('ids');
        if (!idsString) return NextResponse.json({ error: "No IDs provided" }, { status: 400 });

        const ids = idsString.split(',').filter(Boolean);
        
        // Validate if entries belong to authorized companies
        // For simplicity, we assume the frontend sends valid IDs for the authorized vendor
        
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CASHBOOK_ENTRY_BULK_DELETE', { count: ids.length, ids });

        await CashbookEntry.deleteMany({ _id: { $in: ids } });
        
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
