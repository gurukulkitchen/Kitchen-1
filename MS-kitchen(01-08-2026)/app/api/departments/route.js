import connectDB from '@/lib/db';
import Department from '@/models/Department';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

const defaultDepartments = [
    "BRACKFAST", "LUNCH", "DINNER", "ALL", "AASHRAM", "TO", "OTHER",
    "SWEET", "HOSTEL", "NIGHT", "NILKANTHDHAM", "SURAT", "SPORT"
];

export async function GET(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        // Allow if companyId exists OR if user is Super Admin
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'DEPARTMENT_VIEW');

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');

        let query = {};
        if (user.role !== 'Super Admin') {
            query.companyId = new mongoose.Types.ObjectId(user.companyId);
        } else if (companyId) {
            query.companyId = new mongoose.Types.ObjectId(companyId);
        }
        let departments = await Department.find(query).populate('companyId', 'name').sort({ name: 1 });

        if (departments.length === 0) {
            // Seed default departments for this company
            try {
                const seedDocs = defaultDepartments.map(name => ({ name, companyId: user.companyId }));
                await Department.insertMany(seedDocs);
                departments = await Department.find(query).sort({ name: 1 });
                console.log('Seeded default departments for company:', user.companyId);
            } catch (seedError) {
                // Auto-fix for old index
                if (seedError.code === 11000 && seedError.message.includes('name_1')) {
                    console.log('Detected old unique index on name. Dropping index...');
                    try {
                        await Department.collection.dropIndex('name_1');
                        console.log('Index dropped. Retrying seed...');
                        const seedDocs = defaultDepartments.map(name => ({ name, companyId: user.companyId }));
                        await Department.insertMany(seedDocs);
                        departments = await Department.find(query).sort({ name: 1 });
                    } catch (retryError) {
                        console.error('Failed to auto-fix index:', retryError);
                    }
                } else {
                    console.error('Error seeding departments:', seedError);
                }
            }
        }

        return NextResponse.json(departments);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        if (!user || !user.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await req.json();
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const department = await Department.create({ name, companyId: user.companyId });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'DEPARTMENT_CREATE', {
            departmentId: department._id,
            name: department.name
        });

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Department already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req); // Added for logging
        const { id, name, companyId } = await req.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }
        const department = await Department.findByIdAndUpdate(id, { name, companyId }, { new: true, runValidators: true });
        if (!department) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        if (user) {
            // LOG ACTIVITY
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'DEPARTMENT_UPDATE', {
                    departmentId: department._id,
                    name: department.name
                });
            }
        }

        return NextResponse.json(department);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Department name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req); // Added for logging
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const department = await Department.findByIdAndDelete(id);
        if (!department) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        if (user) {
            // LOG ACTIVITY
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'DEPARTMENT_DELETE', {
                    departmentId: id,
                    name: department.name
                });
            }
        }

        return NextResponse.json({ message: 'Department deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
