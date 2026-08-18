import connectDB from '@/lib/db';
import Unit from '@/models/Unit';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

const defaultUnits = ["gm", "kg", "L", "PC", "PA", "Tin", "Rs.", "ML."];

export async function GET(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);

        // Allow if companyId exists OR if user is Super Admin
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            console.log("Debug: Unauthorized access attempt - missing companyId or not Super Admin");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'UNIT_VIEW');

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');

        let query = {};
        if (user.role !== 'Super Admin') {
            query.companyId = new mongoose.Types.ObjectId(user.companyId);
        } else if (companyId) {
            query.companyId = new mongoose.Types.ObjectId(companyId);
        }

        console.log("Debug: Fetching units with query:", JSON.stringify(query));
        let units = await Unit.find(query).populate('companyId', 'name').sort({ name: 1 });
        console.log(`Debug: Found ${units.length} units`);

        if (units.length === 0) {
            // Seed default units for this company
            try {
                const seedDocs = defaultUnits.map(name => ({ name, companyId: user.companyId }));
                await Unit.insertMany(seedDocs);
                units = await Unit.find(query).sort({ name: 1 });
                console.log('Seeded default units for company:', user.companyId);
            } catch (seedError) {
                // Auto-fix for old index
                if (seedError.code === 11000 && seedError.message.includes('name_1')) {
                    console.log('Detected old unique index on name. Dropping index...');
                    try {
                        await Unit.collection.dropIndex('name_1');
                        console.log('Index dropped. Retrying seed...');
                        const seedDocs = defaultUnits.map(name => ({ name, companyId: user.companyId }));
                        await Unit.insertMany(seedDocs);
                        units = await Unit.find(query).sort({ name: 1 });
                    } catch (retryError) {
                        console.error('Failed to auto-fix index:', retryError);
                    }
                } else {
                    console.error('Error seeding units:', seedError);
                }
            }
        }

        return NextResponse.json(units);
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
        const unit = await Unit.create({ name, companyId: user.companyId });

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'UNIT_CREATE', {
            unitId: unit._id,
            name: unit.name
        });

        return NextResponse.json(unit, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Unit already exists' }, { status: 400 });
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
        const unit = await Unit.findByIdAndUpdate(id, { name, companyId }, { new: true, runValidators: true });
        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        if (user) {
            // LOG ACTIVITY
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'UNIT_UPDATE', {
                    unitId: unit._id,
                    name: unit.name
                });
            }
        }

        return NextResponse.json(unit);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Unit name already exists' }, { status: 400 });
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

        const unit = await Unit.findByIdAndDelete(id);
        if (!unit) {
            return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        if (user) {
            // LOG ACTIVITY
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'UNIT_DELETE', {
                    unitId: id,
                    name: unit.name
                });
            }
        }

        return NextResponse.json({ message: 'Unit deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
