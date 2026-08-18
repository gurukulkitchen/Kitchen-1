import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import CashbookVendor from '../../../../../models/CashbookVendor';
import CashbookEntry from '../../../../../models/CashbookEntry';
import { getDataFromToken } from '../../../../../helpers/getDataFromToken';

export async function PUT(req, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // Role-based restrictions
        const query = { _id: id };
        if (user.role !== 'Super Admin') {
            query.company = user.companyId;
            delete body.company; // Prevent non-Super Admins from changing company
        }

        const updatedVendor = await CashbookVendor.findOneAndUpdate(
            query,
            { ...body, lastUpdatedBy: user?.userId },
            { new: true }
        );

        if (!updatedVendor) {
            return NextResponse.json({ error: "Vendor not found or access denied" }, { status: 404 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'VENDOR_UPDATE', {
            vendorId: updatedVendor._id,
            name: updatedVendor.name,
            changes: body
        });

        return NextResponse.json(updatedVendor);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Role-based restrictions
        const query = { _id: id };
        if (user.role !== 'Super Admin') {
            query.company = user.companyId;
        }

        console.log("DELETE Vendor Query:", JSON.stringify(query));
        console.log("User Context:", JSON.stringify({ id: user.userId, role: user.role, company: user.companyId }));

        // Find and delete vendor to ensure ownership
        const deletedVendor = await CashbookVendor.findOneAndDelete(query);

        if (!deletedVendor) {
            // Check if vendor exists at all to differentiate 404 vs 403
            const exists = await CashbookVendor.findById(id);
            console.log("Vendor exists check:", exists ? "Found (Access Denied)" : "Not Found");
            return NextResponse.json({ error: "Vendor not found or access denied" }, { status: 404 });
        }

        // Delete associated entries
        const deletedEntries = await CashbookEntry.deleteMany({ vendorId: id });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'VENDOR_DELETE', {
            vendorId: id,
            name: deletedVendor.name,
            entriesDeleted: deletedEntries.deletedCount
        });

        return NextResponse.json({ message: "Vendor and associated entries deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
