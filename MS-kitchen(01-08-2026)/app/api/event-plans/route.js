import connectDB from '@/lib/db';
import EventPlan from '@/models/EventPlan';
import Recipe from '@/models/Recipe';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
        if (!user || !user.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const query = {};
        if (user.role !== 'Super Admin') {
            query.companyId = new mongoose.Types.ObjectId(user.companyId);
        }

        // Optional: Filter by Date Range
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const events = await EventPlan.find(query).sort({ date: 1 }); // Ascending date
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

        const { date, recipeId, counts, eventName } = await req.json();

        if (!date || !recipeId || !counts) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const totalPersons = Object.values(counts).reduce((a, b) => Number(a) + Number(b), 0);

        // Fetch recipe name if not provided (though frontend should send it for cache)
        let finalEventName = eventName;
        if (!finalEventName) {
            const recipe = await Recipe.findById(recipeId);
            if (recipe) finalEventName = recipe.name;
        }

        const newEvent = new EventPlan({
            date,
            recipeId,
            eventName: finalEventName,
            counts,
            totalPersons,
            companyId: user.companyId
        });

        await newEvent.save();
        return NextResponse.json(newEvent, { status: 201 });
    } catch (error) {
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

        const deleted = await EventPlan.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Event deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
