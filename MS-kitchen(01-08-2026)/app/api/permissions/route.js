import dbConnect from '../../../lib/db';
import Permission from '../../../models/Permission';
import Menu from '../../../models/Menu';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const user = getDataFromToken(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!role) {
        return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    const userRoleLower = user.role?.toLowerCase();

    // Find canonical role name from DB case-insensitively
    const RoleModel = (await import('../../../models/Role')).default;
    const dbRole = await RoleModel.findOne({ name: { $regex: new RegExp(`^${role}$`, 'i') } });
    const canonicalRole = dbRole ? dbRole.name : role;
    const canonicalRoleLower = canonicalRole.toLowerCase();

    // Restriction: Users can only see their own role's permissions, 
    // unless they are Super Admin or Admin (who can see non-admin roles)
    const isAuthorized = (
        userRoleLower === 'super admin' ||
        userRoleLower === 'superadmin' ||
        userRoleLower === 'developer' ||
        userRoleLower === canonicalRoleLower ||
        ((userRoleLower === 'admin' || userRoleLower === 'branch admin') &&
            canonicalRoleLower !== 'super admin' &&
            canonicalRoleLower !== 'superadmin' &&
            canonicalRoleLower !== 'admin' &&
            canonicalRoleLower !== 'developer')
    );

    // if (!isAuthorized) {
    //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    try {
        const permissions = await Permission.find({ role: canonicalRole });
        return NextResponse.json(permissions);
    } catch (error) {
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

        const body = await req.json();
        const userRoleLower = user.role?.toLowerCase();

        // Restriction: Only Super Admin/Developer can modify anything.
        // Admins can modify non-sensitive roles belonging to their own company.
        // Others cannot modify any permissions.
        if (userRoleLower !== 'super admin' && userRoleLower !== 'superadmin' && userRoleLower !== 'developer') {
            if (userRoleLower === 'admin' || userRoleLower === 'branch admin') {
                const sensitiveRolesLower = ['super admin', 'superadmin', 'admin', 'developer'];
                const targetRoleLower = body.role?.toLowerCase();
                if (sensitiveRolesLower.includes(targetRoleLower)) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }

                // Verify the role belongs to the admin's company
                const Role = (await import('../../../models/Role')).default;
                const dbRole = await Role.findOne({ name: { $regex: new RegExp(`^${body.role}$`, 'i') } });
                if (!dbRole || dbRole.isSystem || !dbRole.companyId || String(dbRole.companyId) !== String(user.companyId)) {
                    return NextResponse.json({ error: 'Forbidden: You can only modify permissions for your own company' }, { status: 403 });
                }

                // Ensure we use canonical name
                body.role = dbRole.name;
            } else {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // body expected to be { role, menuId, read, write, edit, delete }
        // Upsert permission
        const permission = await Permission.findOneAndUpdate(
            { role: body.role, menuId: body.menuId },
            body,
            { new: true, upsert: true }
        );
        return NextResponse.json(permission, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
