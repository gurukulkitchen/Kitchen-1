import dbConnect from '../../../../lib/db';
import Menu from '../../../../models/Menu';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();

    try {
        const newMenus = [
            { label: 'Milk Stock In', route: '/inventory/milk/in', order: 11 },
            { label: 'Milk Stock Out', route: '/inventory/milk/out', order: 12 },
        ];

        for (const m of newMenus) {
            await Menu.findOneAndUpdate({ label: m.label }, m, { upsert: true });
        }

        return NextResponse.json({ message: 'Milk Menus added successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
