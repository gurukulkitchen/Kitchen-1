import dbConnect from '../../../lib/db';
import Menu from '../../../models/Menu';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const menus = await Menu.find({}).sort({ order: 1 });
        return NextResponse.json(menus);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const menu = await Menu.create(body);
        return NextResponse.json(menu, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const { id, ...updateData } = await req.json();
        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

        const menu = await Menu.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(menu);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

        await Menu.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Menu deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
