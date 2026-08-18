import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import CashbookEntry from '../../../../../models/CashbookEntry';
import User from '../../../../../models/User';
import CashbookVendor from '../../../../../models/CashbookVendor';
import CashbookCategory from '../../../../../models/CashbookCategory';
import CashbookSignature from '../../../../../models/CashbookSignature';
import PaymentMode from '../../../../../models/PaymentMode';
import { getDataFromToken } from '../../../../../helpers/getDataFromToken';

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { entries, vendorId, companyId } = body;

        if (!vendorId) {
            return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });
        }

        if (!Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json({ error: "No entries provided for bulk upload" }, { status: 400 });
        }

        const vendor = await CashbookVendor.findById(vendorId);
        if (!vendor) {
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        const targetCompanyId = companyId || vendor.company;

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

        // 1. Fetch existing Master Data / Source items for company
        const [existingCategories, existingSignatures, existingModes] = await Promise.all([
            CashbookCategory.find({ companyId: targetCompanyId }).lean(),
            CashbookSignature.find({ companyId: targetCompanyId }).lean(),
            PaymentMode.find({ companyId: targetCompanyId }).lean()
        ]);

        const categoryMap = new Map(existingCategories.map(c => [c.name.trim().toLowerCase(), String(c._id)]));
        const signatureMap = new Map(existingSignatures.map(s => [s.name.trim().toLowerCase(), String(s._id)]));
        const modeMap = new Map(existingModes.map(m => [m.name.trim().toLowerCase(), String(m._id)]));

        // 2. Auto-add missing Category, Signature, or Payment Mode to Source / Master Data
        for (const entry of entries) {
            // Auto-add Category to Source
            const rawCatName = (entry.categoryName || (typeof entry.category === 'string' ? entry.category : '')).trim();
            if (rawCatName && rawCatName !== '-' && !categoryMap.has(rawCatName.toLowerCase())) {
                try {
                    const newCat = await CashbookCategory.create({ name: rawCatName, companyId: targetCompanyId });
                    categoryMap.set(rawCatName.toLowerCase(), String(newCat._id));
                } catch (catErr) {
                    console.error("Category auto-creation in Source error:", catErr);
                }
            }

            // Auto-add Signature to Source
            const rawSigName = (entry.signatureName || entry.sign || '').trim();
            if (rawSigName && rawSigName !== '-' && !signatureMap.has(rawSigName.toLowerCase())) {
                try {
                    const newSig = await CashbookSignature.create({ name: rawSigName, companyId: targetCompanyId });
                    signatureMap.set(rawSigName.toLowerCase(), String(newSig._id));
                } catch (sigErr) {
                    console.error("Signature auto-creation in Source error:", sigErr);
                }
            }

            // Auto-add Payment Mode to Source
            const rawModeName = (entry.modeName || (typeof entry.modeOfPayment === 'string' ? entry.modeOfPayment : '')).trim();
            if (rawModeName && rawModeName !== '-' && !modeMap.has(rawModeName.toLowerCase())) {
                try {
                    const newMode = await PaymentMode.create({ name: rawModeName, companyId: targetCompanyId });
                    modeMap.set(rawModeName.toLowerCase(), String(newMode._id));
                } catch (modeErr) {
                    console.error("Payment Mode auto-creation in Source error:", modeErr);
                }
            }
        }

        // 3. Map entries to MongoDB schema with linked Master Data IDs
        const formattedEntries = entries.map(entry => {
            const rawCatName = (entry.categoryName || (typeof entry.category === 'string' ? entry.category : '')).trim();
            const rawModeName = (entry.modeName || (typeof entry.modeOfPayment === 'string' ? entry.modeOfPayment : '')).trim();
            const rawSigName = (entry.signatureName || entry.sign || '').trim();

            const catId = (rawCatName && categoryMap.get(rawCatName.toLowerCase())) || (typeof entry.category === 'string' && entry.category.length === 24 ? entry.category : null);
            const modeId = (rawModeName && modeMap.get(rawModeName.toLowerCase())) || (typeof entry.modeOfPayment === 'string' && entry.modeOfPayment.length === 24 ? entry.modeOfPayment : null);

            return {
                vendorId,
                companyId: targetCompanyId,
                createdBy: user.userId,
                date: entry.date || new Date().toISOString().split('T')[0],
                time: entry.time || '12:00 PM',
                detail: entry.detail || entry.note || '',
                modeOfPayment: modeId,
                category: catId,
                type: entry.type === 'in' ? 'in' : 'out',
                amount: Number(entry.amount) || 0,
                signatureName: rawSigName,
                bills: []
            };
        });

        const inserted = await CashbookEntry.insertMany(formattedEntries);

        try {
            const { activityMiddleware } = await import('../../../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'CASHBOOK_ENTRY_BULK_CREATE', {
                vendorId,
                count: inserted.length,
                companyId: targetCompanyId
            });
        } catch (actErr) {
            console.error("Activity logging error:", actErr);
        }

        return NextResponse.json({
            message: `${inserted.length} entries created successfully`,
            count: inserted.length
        }, { status: 201 });
    } catch (error) {
        console.error("Bulk create cashbook entries error:", error);
        return NextResponse.json({ error: error.message || "Failed to create entries" }, { status: 500 });
    }
}
