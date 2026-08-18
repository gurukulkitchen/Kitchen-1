import dbConnect from '../../../lib/db';
import LogCategory from '../../../models/LogCategory';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        let categories = await LogCategory.find({}).sort({ name: 1 });

        if (categories.length === 0) {
            const defaultCategories = ["PURCHASE", "DONATION", "AASHRAM", "NILKANTHDHAM", "SURAT", "OTHER", "OFFER", "HOSTEL"];
            await LogCategory.insertMany(defaultCategories.map(name => ({ name })));
            categories = await LogCategory.find({}).sort({ name: 1 });
        }

        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const category = await LogCategory.create({ name });
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const { id, name } = await req.json();
        if (!id || !name) return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });

        const category = await LogCategory.findByIdAndUpdate(id, { name }, { new: true });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await LogCategory.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
