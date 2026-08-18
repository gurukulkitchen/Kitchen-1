import connectDB from '@/lib/db';
import Event from '@/models/Event';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

const defaultEvents = [
    "REGULAR", "HARIBHAKTO", "DHOSA", "ANANDOTSAV", "MANCHURIYAN",
    "SHAKOTSAV &ANNUAL DAY", "PIZZA", "FRUT SALAT", "PATOTSAV"
];

export async function GET(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        // Allow if companyId exists OR if user is Super Admin
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');

        let query = {};
        if (user.role !== 'Super Admin') {
            query.companyId = new mongoose.Types.ObjectId(user.companyId);
        } else if (companyId) {
            query.companyId = new mongoose.Types.ObjectId(companyId);
        }
        let events = await Event.find(query).populate('companyId', 'name').sort({ name: 1 });

        if (events.length === 0) {
            // Seed default events for this company
            try {
                const seedDocs = defaultEvents.map(name => ({ name, companyId: user.companyId }));
                await Event.insertMany(seedDocs);
                events = await Event.find(query).sort({ name: 1 });
                console.log('Seeded default events for company:', user.companyId);
            } catch (seedError) {
                // Auto-fix for old index
                if (seedError.code === 11000 && seedError.message.includes('name_1')) {
                    console.log('Detected old unique index on name. Dropping index...');
                    try {
                        await Event.collection.dropIndex('name_1');
                        console.log('Index dropped. Retrying seed...');
                        const seedDocs = defaultEvents.map(name => ({ name, companyId: user.companyId }));
                        await Event.insertMany(seedDocs);
                        events = await Event.find(query).sort({ name: 1 });
                    } catch (retryError) {
                        console.error('Failed to auto-fix index:', retryError);
                    }
                } else {
                    console.error('Error seeding events:', seedError);
                }
            }
        }

        return NextResponse.json(events);
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
        const event = await Event.create({ name, companyId: user.companyId });
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Event already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await connectDB();
    try {
        const { id, name, companyId } = await req.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }
        const event = await Event.findByIdAndUpdate(id, { name, companyId }, { new: true, runValidators: true });
        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
        return NextResponse.json(event);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Event name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Event deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
