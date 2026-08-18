import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'IN' or 'OUT'
    const category = searchParams.get('category'); // 'GROCERY', 'VEG', 'MILK', etc.

    if (!type) {
        return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    let headers = [];
    let sampleData = [];

    const today = new Date().toISOString().split('T')[0];

    if (type === 'IN') {
        headers = ['Item Name', 'Category', 'Quantity', 'MRP', 'Rate', 'GST %', 'Vendor', 'Bill Number', 'Date (YYYY-MM-DD)', 'Type (Purchase/Donation)'];
        sampleData = [
            ['Rice', 'GROCERY', 10, 60, 50, 5, 'Grocery Store', 'BILL-123', today, 'Purchase'],
            ['Dal', 'GROCERY', 5, 90, 80, 5, 'Grocery Store', 'BILL-456', today, 'Purchase']
        ];
    } else if (type === 'OUT') {
        headers = ['Item Name', 'Category', 'Quantity', 'Rate', 'Department', 'Event', 'Narration', 'Date (YYYY-MM-DD)'];
        sampleData = [
            ['Rice', 'GROCERY', 2, 50, 'LUNCH', 'REGULAR', 'Daily usage', today],
            ['Dal', 'GROCERY', 1, 80, 'DINNER', 'REGULAR', 'Daily usage', today]
        ];
    } else if (type === 'REGISTER') {
        headers = ['Item Name', 'Category', 'Unit', 'Alert Low', 'Alert Crit', 'Note / Remark'];
        sampleData = [
            ['Basmati Rice', 'GROCERY', 'KG', 20, 10, 'Premium quality'],
            ['Cooking Oil', 'GROCERY', 'Liter', 15, 5, 'Refined oil']
        ];
    } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="sample_${category}_${type}.xlsx"`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
    });
}
