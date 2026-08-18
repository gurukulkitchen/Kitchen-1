import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db';
import CashbookEntry from '../../../../../models/CashbookEntry';
import { getDataFromToken } from '../../../../../helpers/getDataFromToken';

export async function PUT(req, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // ── Lock/unlock toggle ──────────────────────────────────────────────────
        // Trigger only if it's explicitly a toggle request (only isLocked present)
        const bodyKeys = Object.keys(body);
        if (bodyKeys.length === 1 && bodyKeys[0] === 'isLocked') {
            const entry = await CashbookEntry.findById(id);
            if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

            const userId = user.userId || user.id || user._id;
            const isAdmin = user.role === 'Admin' || user.role === 'Super Admin';
            if (entry.isLocked && !isAdmin) {
                return NextResponse.json({ error: "Only Admin or Super Admin can unlock this entry" }, { status: 403 });
            }
            const isCreator = String(entry.createdBy) === String(userId);
            if (!entry.isLocked && !isCreator && !isAdmin) {
                return NextResponse.json({ error: "Only the entry creator or Admin can lock this entry" }, { status: 403 });
            }

            const updated = await CashbookEntry.findByIdAndUpdate(
                id,
                {
                    isLocked: body.isLocked,
                    lockedBy: body.isLocked ? userId : null,
                },
                { new: true }
            );
            return NextResponse.json(updated);
        }

        // ── Normal update ───────────────────────────────────────────────────────
        const query = { _id: id };
        if (user.role !== 'Super Admin') query.companyId = user.companyId;

        // Fetch entry first to check lock status
        const existing = await CashbookEntry.findOne(query);
        if (!existing) return NextResponse.json({ error: "Entry not found or access denied" }, { status: 404 });

        // Block edit if locked and caller is not Admin or Super Admin
        if (existing.isLocked) {
            const isAdmin = user.role === 'Admin' || user.role === 'Super Admin';
            if (!isAdmin) {
                return NextResponse.json({ error: "This entry is locked and can only be edited by an Admin" }, { status: 403 });
            }
        }

        // Sanitize body: remove fields that should not be updated via regular edit
        const updateData = { ...body };
        delete updateData._id;
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.createdBy;
        delete updateData.lockedBy;

        if (user.role !== 'Super Admin') {
            delete updateData.companyId;
            delete updateData.vendorId;
        }

        const updatedEntry = await CashbookEntry.findOneAndUpdate(
            query,
            { ...updateData },
            { new: true }
        );

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CASHBOOK_ENTRY_UPDATE', {
            entryId: updatedEntry._id,
            vendorId: updatedEntry.vendorId,
            amount: updatedEntry.amount,
            updatedFields: Object.keys(updateData)
        });

        return NextResponse.json(updatedEntry);
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

        const query = { _id: id };
        if (user.role !== 'Super Admin') query.companyId = user.companyId;

        // Fetch before delete to check lock
        const existing = await CashbookEntry.findOne(query);
        if (!existing) return NextResponse.json({ error: "Entry not found or access denied" }, { status: 404 });

        // Block delete if locked and caller is not Admin or Super Admin
        if (existing.isLocked) {
            const isAdmin = user.role === 'Admin' || user.role === 'Super Admin';
            if (!isAdmin) {
                return NextResponse.json({ error: "This entry is locked and can only be deleted by an Admin" }, { status: 403 });
            }
        }

        const deletedEntry = await CashbookEntry.findOneAndDelete(query);

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'CASHBOOK_ENTRY_DELETE', {
            entryId: id,
            vendorId: deletedEntry.vendorId,
            amount: deletedEntry.amount
        });

        return NextResponse.json({ message: "Entry deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
