import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';
import Permission from '../../../../models/Permission';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const route = searchParams.get('route');
        const user = getDataFromToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!route) {
            return NextResponse.json({ error: 'Route is required' }, { status: 400 });
        }

        const userRoleLower = user.role?.toLowerCase();

        // Special case for Super Admin and Developer - Full Access
        const superRoles = ['super admin', 'superadmin', 'developer'];
        if (superRoles.includes(userRoleLower)) {
            return NextResponse.json({
                read: true,
                write: true,
                edit: true,
                delete: true,
                mrp: true,
                source: true,
                isSuper: true
            });
        }

        // 1. Find the menu item matching this route
        // We need to check both main menus and submenus
        const allMenus = await Menu.find({});
        let targetMenuId = null;

        for (const menu of allMenus) {
            if (menu.route === route || (route === '/dashboard' && menu.route === '/')) {
                targetMenuId = menu._id;
                break;
            }
            if (menu.children && menu.children.length > 0) {
                const subMenu = menu.children.find(child => child.route === route || (route === '/dashboard' && child.route === '/'));
                if (subMenu) {
                    targetMenuId = subMenu._id;
                    break;
                }
            }
        }

        const isAlwaysSeeMRP = userRoleLower === 'admin' || userRoleLower === 'branch admin';

        // After fetching targetMenuId, if it's not found:
        if (!targetMenuId) {
             return NextResponse.json({
                read: false,
                write: false,
                edit: false,
                delete: false,
                mrp: isAlwaysSeeMRP,
                source: isAlwaysSeeMRP
            });
        }

        // Find canonical role name from DB case-insensitively
        const Role = (await import('../../../../models/Role')).default;
        const dbRole = await Role.findOne({ name: { $regex: new RegExp(`^${user.role}$`, 'i') } });
        const canonicalUserRole = dbRole ? dbRole.name : user.role;

        const permission = await Permission.findOne({
            role: canonicalUserRole,
            menuId: targetMenuId
        });

        if (!permission) {
            return NextResponse.json({
                read: false,
                write: false,
                edit: false,
                delete: false,
                mrp: isAlwaysSeeMRP,
                source: isAlwaysSeeMRP
            });
        }

        return NextResponse.json({
            read: permission.read,
            write: permission.write,
            edit: permission.edit,
            delete: permission.delete,
            mrp: isAlwaysSeeMRP ? true : permission.mrp,
            source: isAlwaysSeeMRP ? true : permission.source
        });

    } catch (error) {
        console.error('Permission check error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
