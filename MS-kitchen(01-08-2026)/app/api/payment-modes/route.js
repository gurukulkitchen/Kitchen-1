import connectDB from '@/lib/db';
import PaymentMode from '@/models/PaymentMode';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';

const defaultModes = [
    "Cash", "UPI", "Bank Transfer", "Cheque", "Card"
];

export async function GET(req) {
    await connectDB();
    try {
        const user = getDataFromToken(req);
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

        let modes = await PaymentMode.find(query).populate('companyId', 'name').sort({ name: 1 });

        if (modes.length === 0 && user.companyId) {
            // Seed default modes
            const seedDocs = defaultModes.map(name => ({ name, companyId: user.companyId }));
            await PaymentMode.insertMany(seedDocs);
            modes = await PaymentMode.find(query).sort({ name: 1 });
        }

        return NextResponse.json(modes);
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
        const mode = await PaymentMode.create({ name, companyId: user.companyId });
        return NextResponse.json(mode, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await connectDB();
    try {
        const { id, name } = await req.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }
        const mode = await PaymentMode.findByIdAndUpdate(id, { name }, { new: true });
        return NextResponse.json(mode);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        await PaymentMode.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
