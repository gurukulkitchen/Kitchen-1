import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import KitchenTransaction from '../../../../../models/KitchenTransaction';
import KitchenItem from '../../../../../models/KitchenItem';
import Category from '../../../../../models/Category';
import Unit from '../../../../../models/Unit';

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
}

export async function POST(req) {
    try {
        await connectDB();

        const { rows, type, companyId, userId, userName } = await req.json();

        if (!rows || !Array.isArray(rows) || !type || !companyId) {
            const missing = [];
            if (!rows) missing.push('rows');
            if (!Array.isArray(rows)) missing.push('rows (not an array)');
            if (!type) missing.push('type');
            if (!companyId) missing.push('companyId');
            return NextResponse.json({ error: `Invalid data: missing ${missing.join(', ')}` }, { status: 400 });
        }

        let successCount = 0;
        let errors = [];

        const logCategories = await mongoose.model('LogCategory').find({}).lean();
        const logCategoryMap = new Map();
        logCategories.forEach(c => logCategoryMap.set(c.name.toLowerCase().trim(), c._id));

        const departments = await mongoose.model('Department').find({ companyId }).lean();
        const departmentMap = new Map();
        departments.forEach(d => departmentMap.set(d.name.toLowerCase().trim(), d._id));

        const events = await mongoose.model('Event').find({ companyId }).lean();
        const eventMap = new Map();
        events.forEach(e => eventMap.set(e.name.toLowerCase().trim(), e._id));

        const categories = await Category.find({}).lean();
        const categoryMap = new Map();
        categories.forEach(c => {
            const key = c.name.toLowerCase().trim();
            if (!categoryMap.has(key) || c.companyId?.toString() === companyId.toString()) {
                categoryMap.set(key, c._id);
            }
        });

        const units = await Unit.find({}).lean();
        const unitMap = new Map();
        units.forEach(u => {
            const key = u.name.toLowerCase().trim();
            if (!unitMap.has(key) || u.companyId?.toString() === companyId.toString()) {
                unitMap.set(key, u._id);
            }
        });

        for (const [index, row] of rows.entries()) {
            try {
                if (type === 'REGISTER') {
                    // Resolve category and unit names to database ObjectIds
                    const categoryName = row.category?.toString().trim().toLowerCase();
                    const unitName = row.unit?.toString().trim().toLowerCase();

                    const categoryId = categoryMap.get(categoryName);
                    const unitId = unitMap.get(unitName);

                    if (!categoryId) {
                        throw new Error(`Category '${row.category}' is invalid or not registered in Master Data.`);
                    }
                    if (!unitId) {
                        throw new Error(`Unit '${row.unit}' is invalid or not registered in Master Data.`);
                    }

                    // Create new item
                    const dbUser = await mongoose.model('User').findById(userId);
                    await KitchenItem.create({
                        ...row,
                        category: categoryId,
                        unit: unitId,
                        companyId,
                        createdBy: userId,
                        createdByName: dbUser ? dbUser.name : userName || 'System'
                    });
                    successCount++;
                    continue;
                }

                const item = await KitchenItem.findById(row.item);
                if (!item) throw new Error(`Item ${row.itemName} no longer exists`);

                let qty = Number(row.quantity);
                if (isNaN(qty)) qty = 0;
                const date = new Date(row.date);

                if (type === 'IN') {
                    const totalAmount = Number(row.totalAmount || (qty * (Number(row.mrp || row.rate) || 0)));

                    const subTypeName = row.subType?.toString().trim();
                    let subTypeId = null;
                    if (subTypeName) {
                        subTypeId = logCategoryMap.get(subTypeName.toLowerCase());
                        if (!subTypeId) {
                            const newCat = await mongoose.model('LogCategory').create({ name: subTypeName });
                            subTypeId = newCat._id;
                            logCategoryMap.set(subTypeName.toLowerCase(), subTypeId);
                        }
                    }

                    await KitchenTransaction.create({
                        type: 'IN',
                        item: item._id,
                        quantity: qty,
                        rate: Number(row.rate),
                        mrp: Number(row.mrp || 0),
                        totalAmount,
                        gstRate: Number(row.gstRate || 0),
                        gstAmount: Number(row.gstAmount || 0),
                        vendor: row.vendor,
                        subType: subTypeId,
                        remainingQuantity: qty,
                        date: date,
                        companyId,
                        narration: row.narration || (row.billNumber ? `Bill: ${row.billNumber}` : ''),
                        createdBy: userId,
                        createdByName: userName
                    });

                    item.currentStock = (item.currentStock || 0) + qty;
                    if (Number(row.rate) > 0) item.currentRate = Number(row.rate);
                    await item.save();

                    successCount++;

                } else if (type === 'OUT') {

                    if ((item.currentStock || 0) < qty) {
                        throw new Error(`Insufficient stock for ${item.name}. Available: ${item.currentStock}`);
                    }

                    const batches = await KitchenTransaction.find({
                        item: item._id,
                        type: 'IN',
                        remainingQuantity: { $gt: 0 },
                        companyId,
                        rate: Number(row.rate)
                    }).sort({ date: 1 });

                    let qtyToDeduct = qty;

                    const deptName = row.department?.toString().trim();
                    let deptId = null;
                    if (deptName) {
                        deptId = departmentMap.get(deptName.toLowerCase());
                        if (!deptId) {
                            const newDept = await mongoose.model('Department').create({ name: deptName, companyId });
                            deptId = newDept._id;
                            departmentMap.set(deptName.toLowerCase(), deptId);
                        }
                    }

                    const eventName = row.event?.toString().trim();
                    let eventId = null;
                    if (eventName) {
                        eventId = eventMap.get(eventName.toLowerCase());
                        if (!eventId) {
                            const newEvent = await mongoose.model('Event').create({ name: eventName, companyId });
                            eventId = newEvent._id;
                            eventMap.set(eventName.toLowerCase(), eventId);
                        }
                    }

                    for (const batch of batches) {
                        if (qtyToDeduct <= 0) break;

                        const deduct = Math.min(batch.remainingQuantity, qtyToDeduct);

                        await KitchenTransaction.create({
                            type: 'OUT',
                            item: item._id,
                            quantity: deduct,
                            rate: Number(row.rate), // Log the rate used for this OUT
                            totalAmount: Number(row.rate) * deduct,
                            date: date,
                            department: deptId,
                            event: eventId,
                            batchId: batch._id,
                            companyId,
                            narration: row.narration,
                            createdBy: userId,
                            createdByName: userName
                        });

                        batch.remainingQuantity -= deduct;
                        await batch.save();

                        qtyToDeduct -= deduct;
                    }

                    if (qtyToDeduct > 0) {
                        throw new Error(`Insufficient stock found for '${item.name}' at rate ₹${row.rate}. Missing ${qtyToDeduct} units at this rate.`);
                    }

                    item.currentStock -= qty;
                    await item.save();

                    successCount++;
                }

            } catch (err) {
                errors.push(`Row ${index + 1} (${row.itemName || row.name}): ${err.message}`);
            }
        }

        // ✅ LOG ACTIVITY (INSIDE MAIN TRY)
        if (successCount > 0) {
            // LOG ACTIVITY
            const { activityMiddleware } = await import('../../../../../lib/activityMiddleware');
            await activityMiddleware(
                req,
                { userId, companyId }, // Construct user object since getUserFromToken isn't available here in the same way, or use existing variables
                'KITCHEN_BULK_UPLOAD',
                {
                    type: type,
                    count: successCount,
                    errors: errors.length
                }
            );
        }

        return NextResponse.json({
            message: `Successfully processed ${successCount} transactions.`,
            errors
        });

    } catch (error) {
        console.error("Bulk Save Error:", error);
        return NextResponse.json(
            { error: 'Failed to save data' },
            { status: 500 }
        );
    }
}



// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import KitchenTransaction from '../../../../../models/KitchenTransaction';
// import KitchenItem from '../../../../../models/KitchenItem';

// const connectDB = async () => {
//     if (mongoose.connections[0].readyState) return;
//     await mongoose.connect(process.env.MONGODB_URI);
// }

// export async function POST(req) {
//     try {
//         await connectDB();

//         const { rows, type, companyId, userId, userName } = await req.json();

//         if (!rows || !Array.isArray(rows) || !type || !companyId) {
//             const missing = [];
//             if (!rows) missing.push('rows');
//             if (!Array.isArray(rows)) missing.push('rows (not an array)');
//             if (!type) missing.push('type');
//             if (!companyId) missing.push('companyId');
//             return NextResponse.json({ error: `Invalid data: missing ${missing.join(', ')}` }, { status: 400 });
//         }

//         let successCount = 0;
//         let errors = [];

//         const logCategories = await mongoose.model('LogCategory').find({}).lean();
//         const logCategoryMap = new Map();
//         logCategories.forEach(c => logCategoryMap.set(c.name.toLowerCase().trim(), c._id));

//         const departments = await mongoose.model('Department').find({ companyId }).lean();
//         const departmentMap = new Map();
//         departments.forEach(d => departmentMap.set(d.name.toLowerCase().trim(), d._id));

//         const events = await mongoose.model('Event').find({ companyId }).lean();
//         const eventMap = new Map();
//         events.forEach(e => eventMap.set(e.name.toLowerCase().trim(), e._id));

//         for (const [index, row] of rows.entries()) {
//             try {
//                 if (type === 'REGISTER') {
//                     // Create new item
//                     const dbUser = await mongoose.model('User').findById(userId);
//                     await KitchenItem.create({
//                         ...row,
//                         companyId,
//                         createdBy: userId,
//                         createdByName: dbUser ? dbUser.name : userName || 'System'
//                     });
//                     successCount++;
//                     continue;
//                 }

//                 const item = await KitchenItem.findById(row.item);
//                 if (!item) throw new Error(`Item ${row.itemName} no longer exists`);

//                 let qty = Number(row.quantity);
//                 if (isNaN(qty)) qty = 0;
//                 const date = new Date(row.date);

//                 if (type === 'IN') {
//                     const totalAmount = Number(row.totalAmount || (qty * (Number(row.mrp || row.rate) || 0)));

//                     const subTypeName = row.subType?.toString().trim();
//                     let subTypeId = null;
//                     if (subTypeName) {
//                         subTypeId = logCategoryMap.get(subTypeName.toLowerCase());
//                         if (!subTypeId) {
//                             const newCat = await mongoose.model('LogCategory').create({ name: subTypeName });
//                             subTypeId = newCat._id;
//                             logCategoryMap.set(subTypeName.toLowerCase(), subTypeId);
//                         }
//                     }

//                     await KitchenTransaction.create({
//                         type: 'IN',
//                         item: item._id,
//                         quantity: qty,
//                         rate: Number(row.rate),
//                         mrp: Number(row.mrp || 0),
//                         totalAmount,
//                         gstRate: Number(row.gstRate || 0),
//                         gstAmount: Number(row.gstAmount || 0),
//                         vendor: row.vendor,
//                         subType: subTypeId,
//                         remainingQuantity: qty,
//                         date: date,
//                         companyId,
//                         narration: row.narration || (row.billNumber ? `Bill: ${row.billNumber}` : ''),
//                         createdBy: userId,
//                         createdByName: userName
//                     });

//                     item.currentStock = (item.currentStock || 0) + qty;
//                     if (Number(row.rate) > 0) item.currentRate = Number(row.rate);
//                     await item.save();

//                     successCount++;

//                 } else if (type === 'OUT') {

//                     if ((item.currentStock || 0) < qty) {
//                         throw new Error(`Insufficient stock for ${item.name}. Available: ${item.currentStock}`);
//                     }

//                     const batches = await KitchenTransaction.find({
//                         item: item._id,
//                         type: 'IN',
//                         remainingQuantity: { $gt: 0 },
//                         companyId,
//                         rate: Number(row.rate)
//                     }).sort({ date: 1 });

//                     let qtyToDeduct = qty;

//                     const deptName = row.department?.toString().trim();
//                     let deptId = null;
//                     if (deptName) {
//                         deptId = departmentMap.get(deptName.toLowerCase());
//                         if (!deptId) {
//                             const newDept = await mongoose.model('Department').create({ name: deptName, companyId });
//                             deptId = newDept._id;
//                             departmentMap.set(deptName.toLowerCase(), deptId);
//                         }
//                     }

//                     const eventName = row.event?.toString().trim();
//                     let eventId = null;
//                     if (eventName) {
//                         eventId = eventMap.get(eventName.toLowerCase());
//                         if (!eventId) {
//                             const newEvent = await mongoose.model('Event').create({ name: eventName, companyId });
//                             eventId = newEvent._id;
//                             eventMap.set(eventName.toLowerCase(), eventId);
//                         }
//                     }

//                     for (const batch of batches) {
//                         if (qtyToDeduct <= 0) break;

//                         const deduct = Math.min(batch.remainingQuantity, qtyToDeduct);

//                         await KitchenTransaction.create({
//                             type: 'OUT',
//                             item: item._id,
//                             quantity: deduct,
//                             rate: Number(row.rate), // Log the rate used for this OUT
//                             totalAmount: Number(row.rate) * deduct,
//                             date: date,
//                             department: deptId,
//                             event: eventId,
//                             batchId: batch._id,
//                             companyId,
//                             narration: row.narration,
//                             createdBy: userId,
//                             createdByName: userName
//                         });

//                         batch.remainingQuantity -= deduct;
//                         await batch.save();

//                         qtyToDeduct -= deduct;
//                     }

//                     if (qtyToDeduct > 0) {
//                         throw new Error(`Insufficient stock found for '${item.name}' at rate ₹${row.rate}. Missing ${qtyToDeduct} units at this rate.`);
//                     }

//                     item.currentStock -= qty;
//                     await item.save();

//                     successCount++;
//                 }

//             } catch (err) {
//                 errors.push(`Row ${index + 1} (${row.itemName || row.name}): ${err.message}`);
//             }
//         }

//         // ✅ LOG ACTIVITY (INSIDE MAIN TRY)
//         if (successCount > 0) {
//             // LOG ACTIVITY
//             const { activityMiddleware } = await import('../../../../../lib/activityMiddleware');
//             await activityMiddleware(
//                 req,
//                 { userId, companyId }, // Construct user object since getUserFromToken isn't available here in the same way, or use existing variables
//                 'KITCHEN_BULK_UPLOAD',
//                 {
//                     type: type,
//                     count: successCount,
//                     errors: errors.length
//                 }
//             );
//         }

//         return NextResponse.json({
//             message: `Successfully processed ${successCount} transactions.`,
//             errors
//         });

//     } catch (error) {
//         console.error("Bulk Save Error:", error);
//         return NextResponse.json(
//             { error: 'Failed to save data' },
//             { status: 500 }
//         );
//     }
// }
