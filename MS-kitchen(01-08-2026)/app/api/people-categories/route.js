import dbConnect from '@/lib/db';
import PeopleCategory from '@/models/PeopleCategory';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get('companyId');
        
        let query = {};
        if (companyId && companyId !== 'null' && companyId !== 'undefined') {
            query = { companyId };
        } else {
            // For global/default fetch or Super Admin without selected company
            query = { companyId: { $exists: false } };
        }
        
        const categories = await PeopleCategory.find(query).populate('companyId', 'name').sort({ createdAt: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const data = await req.json();
        const category = await PeopleCategory.create(data);
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        
        await PeopleCategory.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function PUT(req) {
    try {
        await dbConnect();
        const { id, ...updateData } = await req.json();
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const category = await PeopleCategory.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
