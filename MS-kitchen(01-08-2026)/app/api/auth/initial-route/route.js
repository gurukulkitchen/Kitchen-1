import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';
import Permission from '../../../../models/Permission';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    const user = getDataFromToken(req);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Special case for Super Admin
        if (user.role === 'Super Admin' || user.role === 'Admin') {
            return NextResponse.json({ initialRoute: '/dashboard' });
        }

        // Fetch all permissions for this role
        const permissionsList = await Permission.find({ role: user.role, read: true });

        if (permissionsList.length === 0) {
            // Default fallback if no permissions found
            return NextResponse.json({ initialRoute: '/profile' });
        }

        const allowedMenuIds = permissionsList.map(p => p.menuId.toString());

        // Check if dashboard is allowed
        // Usually dashboard might not be in the Permission table if it's considered public for all logged-in users,
        // but the requirement says "in staff i not permission od dashboard".
        // Let's find the dashboard menu item first.
        const allMenus = await Menu.find({}).sort({ order: 1 });

        // Find the first available menu item the user can READ
        let firstAvailableRoute = null;

        for (const menu of allMenus) {
            if (allowedMenuIds.includes(menu._id.toString())) {
                if (menu.type === 'link' && menu.route && menu.route !== '#') {
                    firstAvailableRoute = menu.route;
                    break;
                } else if (menu.type === 'parent' && menu.children && menu.children.length > 0) {
                    // Check children
                    const child = menu.children.find(c => allowedMenuIds.includes(c._id.toString()));
                    if (child) {
                        firstAvailableRoute = child.route;
                        break;
                    }
                }
            }
        }

        // Specifically check if Dashboard (usually '/') is allowed
        const hasDashboardAccess = allMenus.some(m =>
            (m.route === '/' || m.route === '/dashboard') &&
            allowedMenuIds.includes(m._id.toString())
        );

        const initialRoute = hasDashboardAccess ? '/dashboard' : (firstAvailableRoute || '/profile');

        return NextResponse.json({ initialRoute });

    } catch (error) {
        console.error("Initial route determination error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
