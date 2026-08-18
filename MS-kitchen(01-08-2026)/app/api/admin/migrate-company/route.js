import dbConnect from '../../../../lib/db';
import KitchenItem from '../../../../models/KitchenItem';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const targetCompanyId = '6989a8017eada5f60f3a7501';

        const itemsResult = await KitchenItem.updateMany(
            {},
            { $set: { companyId: targetCompanyId } }
        );

        const transactionsResult = await KitchenTransaction.updateMany(
            {},
            { $set: { companyId: targetCompanyId } }
        );

        return NextResponse.json({
            message: 'Migration successful',
            itemsUpdated: itemsResult.modifiedCount,
            transactionsUpdated: transactionsResult.modifiedCount
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
