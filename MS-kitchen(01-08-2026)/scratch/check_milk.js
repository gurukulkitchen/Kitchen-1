import dbConnect from '../lib/db.js';
import KitchenItem from '../models/KitchenItem.js';

async function checkMilk() {
    try {
        await dbConnect();
        const items = await KitchenItem.find({ name: /milk/i });
        console.log('Milk items found:', JSON.stringify(items, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkMilk();
