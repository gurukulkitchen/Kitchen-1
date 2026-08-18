import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import CashbookVendorType from '../../../../models/CashbookVendorType';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// GET  /api/cashbook/vendor-types?companyId=xxx
export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    let companyId = searchParams.get('companyId');

    if (!companyId) {
        const user = getDataFromToken(req);
        if (user && user.role !== 'Super Admin') companyId = user.companyId;
    }

    try {
        const query = companyId ? { companyId } : {};
        let types = await CashbookVendorType.find(query).sort({ name: 1 });
        
        // Dynamically seed default vendor types if collection is empty
        if (types.length === 0 && companyId && isValidObjectId(companyId)) {
            const defaults = ['Vendor', 'Supplier', 'Customer', 'Other'];
            for (const name of defaults) {
                try {
                    await CashbookVendorType.create({ name, companyId });
                } catch (err) {
                    // Ignore duplicate key error in concurrent operations
                }
            }
            types = await CashbookVendorType.find(query).sort({ name: 1 });
        }
        
        if (types.length === 0) {
            // Return default fallback types if none exist
            types = [
                { _id: 'def-1', name: 'Vendor' },
                { _id: 'def-2', name: 'Supplier' },
                { _id: 'def-3', name: 'Customer' },
                { _id: 'def-4', name: 'Other' }
            ];
        }
        
        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/cashbook/vendor-types  { name, companyId? }
export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { name, companyId: bodyCompanyId } = body;

        const user = getDataFromToken(req);
        const companyId = bodyCompanyId || (user && user.companyId);

        if (!name || !companyId) {
            return NextResponse.json({ error: 'Name and companyId are required' }, { status: 400 });
        }

        const type = await CashbookVendorType.create({ name: name.trim(), companyId });
        return NextResponse.json(type, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Type already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/cashbook/vendor-types  { id, name }
export async function PUT(req) {
    await dbConnect();
    try {
        const { id, name } = await req.json();
        if (!id || !name) {
            return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
        }

        // If it is a mock ID, return mock update success
        if (!isValidObjectId(id)) {
            return NextResponse.json({ _id: id, name: name.trim() });
        }

        const updated = await CashbookVendorType.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Type name already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/cashbook/vendor-types?id=xxx
export async function DELETE(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // If it is a mock ID, return mock delete success
    if (!isValidObjectId(id)) {
        return NextResponse.json({ success: true });
    }

    try {
        await CashbookVendorType.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
