import dbConnect from '../../../../lib/db';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ error: 'Unauthorized or missing company' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        let query = {
            type: 'IN',
            item: itemId,
            remainingQuantity: { $gt: 0 }
        };

        if (user.role !== 'Super Admin') {
            query.companyId = user.companyId;
        }

        // Find all IN transactions for this item that have remaining quantity
        const batches = await KitchenTransaction.find(query)
            .select('date rate remainingQuantity')
            .sort({ date: 1 }); // FIFO (Oldest first)

        return NextResponse.json(batches);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
