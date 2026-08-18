import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        const { id } = await params;
        const data = await req.json();

        // Handle password update if provided
        if (data.password && !data.noLogin) {
            const bcrypt = (await import('bcryptjs')).default;
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        } else {
            delete data.password;
        }

        // If roleId is changed, update the role string as well
        if (data.roleId) {
            const Role = (await import('../../../../models/Role')).default;
            const roleDoc = await Role.findById(data.roleId);
            if (roleDoc) {
                data.role = roleDoc.name;
            }
        }

        const updatedStaff = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedStaff) {
            return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'STAFF_UPDATE', {
            staffId: updatedStaff._id,
            name: updatedStaff.name,
            updatedFields: Object.keys(data),
            changes: data
        });

        return NextResponse.json({ message: 'Staff updated successfully', staff: updatedStaff }, { status: 200 });
    } catch (error) {
        console.error('Failed to update staff:', error);
        return NextResponse.json({ 
            message: error.name === 'MongoServerError' && error.code === 11000 
                ? `Duplicate value: ${Object.keys(error.keyValue).join(', ')} already exists`
                : error.message || 'Internal Server Error' 
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const user = getDataFromToken(req);
        const { id } = await params;

        const deletedStaff = await User.findByIdAndDelete(id);

        if (!deletedStaff) {
            return NextResponse.json({ message: 'Staff member not found' }, { status: 404 });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'STAFF_DELETE', {
            staffId: id,
            name: deletedStaff.name,
            role: deletedStaff.role
        });

        return NextResponse.json({ message: 'Staff deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to delete staff:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

