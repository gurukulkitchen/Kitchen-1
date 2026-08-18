import dbConnect from '../../../lib/db';
import Role from '../../../models/Role';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);

        // LOG ACTIVITY
        if (user) {
            const { activityMiddleware } = await import('../../../lib/activityMiddleware');
            await activityMiddleware(req, user, 'ROLE_VIEW');
        }
        let query = {};

        // If not super admin, hides super admin role from list
        // If admin, also hides admin role from list
        if (!user || user.role !== 'Super Admin') {
            query.name = { $nin: ['Super Admin', 'Admin'] };

            // Filter by company or system roles
            if (user.companyId) {
                query.$or = [
                    { companyId: user.companyId },
                    { isSystem: true }
                ];
            } else {
                // Fallback if no companyId but not Super Admin (shouldn't happen for valid admins)
                query.$or = [
                    { isSystem: true }
                ];
            }
        }

        const roles = await Role.find(query).sort({ createdAt: 1 });
        return NextResponse.json(roles);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user || (user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Developer')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { name, description, companyId } = await req.json();

        // Admin cannot create sensitive roles
        if (user.role === 'Admin') {
            const sensitiveRoles = ['Super Admin', 'Admin', 'Developer'];
            if (sensitiveRoles.includes(name)) {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
        }

        if (!name) {
            return NextResponse.json({ message: 'Role name is required' }, { status: 400 });
        }

        // Prepare role data
        const roleData = { name, description };

        // Assign companyId
        if (user.role === 'Super Admin' && companyId) {
            roleData.companyId = companyId;
        } else if (user.role === 'Admin') {
            roleData.companyId = user.companyId;
        }

        // Check if exists (scope by company if applicable)
        let existingQuery = { name };
        if (roleData.companyId) {
            existingQuery.companyId = roleData.companyId;
        }

        const existing = await Role.findOne(existingQuery);
        if (existing) {

            return NextResponse.json({ message: 'Role already exists' }, { status: 400 });
        }

        const role = await Role.create(roleData);

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'ROLE_CREATE', {
            roleId: role._id,
            name: role.name,
            companyId: role.companyId
        });

        return NextResponse.json(role, { status: 201 });
    } catch (error) {
        // Handle duplicate key error specially if possible, or just catch all
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Role name already exists (Project-wide unique)' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user || (user.role !== 'Super Admin' && user.role !== 'Admin' && user.role !== 'Developer')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { id, name, description } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'ID required' }, { status: 400 });
        }

        const role = await Role.findById(id);
        if (!role) {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }

        // System roles cannot be renamed
        if (role.isSystem && name && name !== role.name) {
            return NextResponse.json({ message: 'Cannot rename system role' }, { status: 403 });
        }

        // Admin cannot edit sensitive roles, system roles, or other company roles
        if (user.role === 'Admin') {
            const sensitiveRoles = ['Super Admin', 'Admin', 'Developer'];
            if (sensitiveRoles.includes(role.name)) {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
            if (name && sensitiveRoles.includes(name)) {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
            if (role.isSystem || !role.companyId || String(role.companyId) !== String(user.companyId)) {
                return NextResponse.json({ message: 'Forbidden: You can only edit your own company roles' }, { status: 403 });
            }
        }

        const oldName = role.name;
        if (name) role.name = name;
        if (description !== undefined) role.description = description;

        await role.save();

        // If renamed, update all permissions and users that used the old name
        if (name && name !== oldName) {
            const Permission = (await import('../../../models/Permission')).default;
            await Permission.updateMany({ role: oldName }, { role: name });

            const User = (await import('../../../models/User')).default;
            await User.updateMany({ role: oldName }, { role: name });
        }

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'ROLE_UPDATE', {
            roleId: id,
            name: role.name
        });

        return NextResponse.json(role);
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Role name already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();

        const user = getDataFromToken(req);
        if (
            !user ||
            (user.role !== 'Super Admin' &&
                user.role !== 'Admin' &&
                user.role !== 'Developer')
        ) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'ID required' }, { status: 400 });
        }

        const role = await Role.findById(id);
        if (!role) {
            return NextResponse.json({ message: 'Role not found' }, { status: 404 });
        }

        // Admin cannot delete sensitive roles, system roles, or other company roles
        if (user.role === 'Admin') {
            const sensitiveRoles = ['Super Admin', 'Admin', 'Developer'];
            if (sensitiveRoles.includes(role.name)) {
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
            if (role.isSystem || !role.companyId || String(role.companyId) !== String(user.companyId)) {
                return NextResponse.json({ message: 'Forbidden: You can only delete your own company roles' }, { status: 403 });
            }
        }

        if (role.isSystem) {
            return NextResponse.json(
                { message: 'Cannot delete system role' },
                { status: 403 }
            );
        }

        await Role.findByIdAndDelete(id);

        // LOG ACTIVITY
        const { activityMiddleware } = await import('../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'ROLE_DELETE', {
            roleId: id,
            roleName: role.name
        });

        return NextResponse.json({ message: 'Role deleted' });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
