import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import MaintenanceRecord from '../../../../models/MaintenanceRecord';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';
import User from '../../../../models/User';
import MaintenanceCategory from '../../../../models/MaintenanceCategory';
import LogCategory from '../../../../models/LogCategory';
import Event from '../../../../models/Event';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';


async function handleFileUpload(file) {
    if (!file || typeof file === 'string') return null;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = join(process.cwd(), 'public/uploads/bills');

        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);
        return `/uploads/bills/${filename}`;
    } catch (error) {
        console.error("File upload failed:", error);
        return null;
    }
}

export async function GET(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');

        const query = {};
        if (user.role === 'Super Admin') {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            }
        } else {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            } else {
                const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
                if (dbUser) {
                    const assigned = dbUser.assignedCompanies || [];
                    if (assigned.length > 0) {
                        query.companyId = { $in: assigned };
                    } else if (dbUser.companyId) {
                        query.companyId = dbUser.companyId;
                    }
                }
            }
        }

        const records = await MaintenanceRecord.find(query)
            .populate('type', 'name')
            .populate('categoryId', 'name')
            .populate('time', 'name')
            .populate('event', 'name')
            .sort({ date: -1, createdAt: -1 });

        return NextResponse.json(records);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const contentType = req.headers.get('content-type') || '';
        let body = {};
        let billPath = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            body = Object.fromEntries(formData.entries());

            // Handle file upload
            const file = formData.get('bill');
            if (file) {
                billPath = await handleFileUpload(file);
            }
        } else {
            body = await req.json();
        }

        const companyId = body.companyId;

        // Basic validation
        if (!body.date || !body.type || !body.narration || !body.amount || !companyId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate access
        if (user.role !== 'Super Admin') {
            const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
            const assigned = dbUser?.assignedCompanies || [];
            const isAuthorized = assigned.length > 0
                ? assigned.some(id => String(id) === String(companyId))
                : String(dbUser?.companyId) === String(companyId);

            if (!isAuthorized) {
                return NextResponse.json({ error: "Unauthorized access to this company" }, { status: 403 });
            }
        }

        const recordData = {
            ...body,
            companyId,
            createdBy: user.userId,
            categoryId: (body.categoryId === "" || body.categoryId === "null") ? null : body.categoryId,
            time: (body.time === "" || body.time === "null") ? null : body.time,
            event: (body.event === "" || body.event === "null") ? null : body.event,
        };
        if (billPath) recordData.billPath = billPath;

        const record = await MaintenanceRecord.create(recordData);

        // Activity logging
        try {
            const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'MAINTENANCE_RECORD_CREATE', {
                recordId: record._id,
                amount: record.amount,
                type: record.type
            });
        } catch (activityError) {
            console.error("Activity logging failed:", activityError);
        }

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error("POST maintenance error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const contentType = req.headers.get('content-type') || '';
        let body = {};
        let billPath = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            body = Object.fromEntries(formData.entries());

            const file = formData.get('bill');
            if (file) {
                billPath = await handleFileUpload(file);
            }
        } else {
            body = await req.json();
        }

        const recordId = body.id || body._id;
        if (!recordId) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const existingRecord = await MaintenanceRecord.findById(recordId);
        if (!existingRecord) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        // Validate access
        if (user.role !== 'Super Admin') {
            const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
            const assigned = dbUser?.assignedCompanies || [];
            const isAuthorized = assigned.length > 0
                ? assigned.some(id => String(id) === String(existingRecord.companyId))
                : String(dbUser?.companyId) === String(existingRecord.companyId);

            if (!isAuthorized) {
                return NextResponse.json({ error: "Unauthorized access to this record" }, { status: 403 });
            }
        }

        const updateData = {
            ...body,
            updatedBy: user.userId,
            categoryId: (body.categoryId === "" || body.categoryId === "null") ? null : body.categoryId,
            time: (body.time === "" || body.time === "null") ? null : body.time,
            event: (body.event === "" || body.event === "null") ? null : body.event,
        };
        if (billPath) updateData.billPath = billPath;

        // Remove ID from update fields
        delete updateData.id;
        delete updateData._id;

        const updatedRecord = await MaintenanceRecord.findByIdAndUpdate(
            recordId,
            updateData,
            { new: true }
        );

        return NextResponse.json(updatedRecord);
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
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const record = await MaintenanceRecord.findById(id);
        if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        // Validate access
        if (user.role !== 'Super Admin') {
            const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
            const assigned = dbUser?.assignedCompanies || [];
            const isAuthorized = assigned.length > 0
                ? assigned.some(id => String(id) === String(record.companyId))
                : String(dbUser?.companyId) === String(record.companyId);

            if (!isAuthorized) {
                return NextResponse.json({ error: "Unauthorized access to this record" }, { status: 403 });
            }
        }

        await MaintenanceRecord.findByIdAndDelete(id);

        return NextResponse.json({ message: "Record deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
