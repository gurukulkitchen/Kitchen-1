import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Menu from '../../../models/Menu';
import Role from '../../../models/Role';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();

    try {
        // 0. Seed Roles
        const rolesToSeed = [
            { name: 'Super Admin', isSystem: true },
            { name: 'Admin', isSystem: false },
            { name: 'Staff', isSystem: false }
        ];

        for (const r of rolesToSeed) {
            await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true });
        }

        // 1. Seed Super Admin
        const email = 'admin@example.com';
        const password = 'supersecretpassword';
        const role = 'Super Admin';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });
        let userMsg = 'User already exists';

        if (!existingUser) {
            await User.create({
                email,
                password: hashedPassword,
                role,
            });
            userMsg = 'Super Admin created';
        }

        // 2. Seed Menus (Hierarchical)
        await Menu.deleteMany({}); // Clear existing menus to avoid duplicates/conflicts with new structure

        const sidebarMenus = [
            {
                label: 'Dashboard',
                route: '/',
                icon: 'LayoutDashboard',
                type: 'link',
                order: 1
            },
            {
                label: 'Inventory',
                icon: 'Package',
                type: 'parent',
                order: 2,
                children: [
                    { label: 'Stock Items', route: '/inventory', icon: 'Package' },
                    { label: 'Stock In', route: '/inventory/in', icon: 'ArrowDownToLine' },
                    { label: 'Stock Out', route: '/inventory/out', icon: 'ArrowUpFromLine' }
                ]
            },
            {
                label: 'Veg & Fruit',
                icon: 'Carrot', // Using Carrot or similar for Veg/Fruit section parent if available, or just Package
                type: 'parent',
                order: 3,
                children: [
                    { label: 'Veg-Fruit In', route: '/inventory/vegetable-fruit/in', icon: 'ArrowDownToLine', iconClassName: 'text-emerald-500' },
                    { label: 'Veg-Fruit Out', route: '/inventory/vegetable-fruit/out', icon: 'ArrowUpFromLine', iconClassName: 'text-red-500' }
                ]
            },
            {
                label: 'Milk',
                icon: 'Milk',
                type: 'parent',
                order: 4,
                children: [
                    { label: 'Milk In', route: '/inventory/milk/in', icon: 'ArrowDownToLine', iconClassName: 'text-blue-500' },
                    { label: 'Milk Out', route: '/inventory/milk/out', icon: 'ArrowUpFromLine', iconClassName: 'text-red-500' }
                ]
            },
            {
                label: 'Management',
                icon: 'Settings',
                type: 'parent',
                order: 4,
                children: [
                    { label: 'Menus', route: '/menus', icon: 'UtensilsCrossed' }
                ]
            }
        ];

        for (const m of sidebarMenus) {
            await Menu.create(m);
        }

        return NextResponse.json({
            message: `Seeding complete. ${userMsg}. Menus seeded with hierarchy.`
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
