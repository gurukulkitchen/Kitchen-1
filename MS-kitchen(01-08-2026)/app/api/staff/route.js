import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Role from '../../../models/Role';
import bcrypt from 'bcryptjs';
import { getDataFromToken } from '../../../helpers/getDataFromToken';

export async function GET(req) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);

        // LOG ACTIVITY (GET)
        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'STAFF_VIEW');
        }

        const { searchParams } = new URL(req.url);
        const filterCompanyId = searchParams.get('companyId');

        let query = { role: { $ne: 'Super Admin' } };

        // Multi-Company and Default Logic
        if (user && user.role === 'Super Admin') {
            if (filterCompanyId) {
                const ids = filterCompanyId.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            }
        } else if (user) {
            if (filterCompanyId) {
                const ids = filterCompanyId.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            } else {
                // DEFAULT: Use ALL assigned companies
                const dbUser = await User.findById(user.userId).select('assignedCompanies companyId');
                if (dbUser) {
                    const assigned = dbUser.assignedCompanies || [];
                    if (assigned.length > 0) {
                        query.companyId = { $in: assigned };
                    } else if (dbUser.companyId) {
                        query.companyId = dbUser.companyId;
                    }
                }
            }
        }

        const staff = await User.find(query).select('-password').sort({ createdAt: -1 });
        return NextResponse.json(staff, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch staff:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const { id, editingId, ...actualData } = await req.json();
        const user = getDataFromToken(req);

        // Check if email exists
        if (actualData.email) {
            const existingUser = await User.findOne({ email: actualData.email });
            if (existingUser) {
                return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
            }
        }

        // Hash the password if login is required
        let hashedPassword = "";
        if (!actualData.noLogin) {
            const salt = await bcrypt.genSalt(10);
            const passwordToHash = actualData.password || Math.random().toString(36).slice(-8);
            hashedPassword = await bcrypt.hash(passwordToHash, salt);
        }

        // Fetch Role name for the roleId
        let roleName = 'Staff';
        if (actualData.roleId) {
            const roleDoc = await Role.findById(actualData.roleId);
            if (roleDoc) {
                roleName = roleDoc.name;
            }
        }

        const newStaff = new User({
            ...actualData,
            password: hashedPassword,
            role: roleName,
            roleId: (actualData.roleId && actualData.roleId !== "") ? actualData.roleId : null,
            phone: (actualData.phone && actualData.phone !== "") ? actualData.phone : undefined,
            companyId: (user.role === 'Super Admin' && actualData.companyId) ? actualData.companyId : (user?.companyId || null),
            assignedCompanies: actualData.assignedCompanies || [],
            advances: []
        });

        await newStaff.save();

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'STAFF_CREATE', {
            staffId: newStaff._id,
            name: newStaff.name,
            email: newStaff.email,
            role: newStaff.role
        });

        const staffData = newStaff.toObject();
        delete staffData.password;

        return NextResponse.json({ message: 'Staff created successfully', staff: staffData }, { status: 201 });
    } catch (error) {
        console.error('Failed to create staff:', error);
        return NextResponse.json({ 
            message: error.name === 'MongoServerError' && error.code === 11000 
                ? `Duplicate value: ${Object.keys(error.keyValue).join(', ')} already exists`
                : error.message || 'Internal Server Error' 
        }, { status: 500 });
    }
}
