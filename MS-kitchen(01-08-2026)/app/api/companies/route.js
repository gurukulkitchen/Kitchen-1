import dbConnect from '../../../lib/db';
import Company from '../../../models/Company';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const companies = await Company.find({}).sort({ createdAt: -1 });
        return NextResponse.json(companies);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const { name, shortName, code, address, mobileNumber, loginStartTime, loginEndTime } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Branch Name is required' }, { status: 400 });
        }

        // Create Company
        const company = await Company.create({
            name,
            shortName,
            code,
            address,
            mobileNumber,
            loginStartTime,
            loginEndTime
        });

        return NextResponse.json(company, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const { id, name, shortName, code, address, mobileNumber, loginStartTime, loginEndTime, status } = await req.json();

        if (!id || !name) {
            return NextResponse.json({ message: 'Company ID and Name are required' }, { status: 400 });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            id,
            { name, shortName, code, address, mobileNumber, loginStartTime, loginEndTime, status },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return NextResponse.json({ message: 'Company not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCompany);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'ID required' }, { status: 400 });
        }

        const deletedCompany = await Company.findByIdAndDelete(id);

        if (!deletedCompany) {
            return NextResponse.json({ message: 'Branch not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
