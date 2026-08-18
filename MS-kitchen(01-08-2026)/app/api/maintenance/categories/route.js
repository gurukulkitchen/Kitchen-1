import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import MaintenanceCategory from '../../../../models/MaintenanceCategory';
import User from '../../../../models/User';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const companyIdParam = searchParams.get('companyId');
        let targetCompanyId = companyIdParam;

        if (!targetCompanyId) {
            // Fallback for non-Super Admins if no ID in URL
            if (user.role !== 'Super Admin') {
                const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
                if (dbUser) {
                    const assigned = dbUser.assignedCompanies || [];
                    targetCompanyId = assigned[0] || dbUser.companyId;
                }
            } else {
                // If Super Admin didn't provide index, use theirown if exists
                targetCompanyId = user.companyId;
            }
        }

        if (!targetCompanyId) {
            console.error("GET /api/maintenance/categories - Company ID missing", { userId: user.userId, role: user.role });
            return NextResponse.json({ error: 'Please select a company' }, { status: 400 });
        }

        const categories = await MaintenanceCategory.find({ companyId: targetCompanyId }).sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("GET /api/maintenance/categories - Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await req.json().catch(() => ({}));
        const { name, companyId } = body;
        const trimmedName = name?.trim();
        
        let targetCompanyId = companyId;
        if (!targetCompanyId) {
            if (user.role !== 'Super Admin') {
                targetCompanyId = user.companyId;
            }
        }
        
        console.log("POST /api/maintenance/categories - Debug:", { name: trimmedName, companyId: targetCompanyId, userRole: user.role });

        if (!targetCompanyId) return NextResponse.json({ error: 'Target Company not found. Please select a company.' }, { status: 400 });
        if (!trimmedName) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const existingCategory = await MaintenanceCategory.findOne({
            companyId: targetCompanyId,
            name: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
        });
        
        if (existingCategory) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }

        const newCategory = new MaintenanceCategory({
            name: trimmedName,
            companyId: targetCompanyId
        });

        await newCategory.save();
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("POST /api/maintenance/categories - Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const companyIdParam = searchParams.get('companyId');
        const targetCompanyId = companyIdParam || user.companyId;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        if (!targetCompanyId) return NextResponse.json({ error: 'Company context lost. Please refresh.' }, { status: 400 });

        await MaintenanceCategory.findOneAndDelete({ _id: id, companyId: targetCompanyId });
        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        console.error("DELETE /api/maintenance/categories - Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
