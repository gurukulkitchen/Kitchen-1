import dbConnect from '../lib/db.js';
import KitchenItem from '../models/KitchenItem.js';

async function updateMilkUnits() {
    try {
        await dbConnect();
        const result = await KitchenItem.updateMany(
            { name: /milk/i },
            { $set: { unit: 'L' } }
        );
        console.log('Update result:', result);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

updateMilkUnits();
