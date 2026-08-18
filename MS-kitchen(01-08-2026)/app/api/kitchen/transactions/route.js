import dbConnect from '../../../../lib/db';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import KitchenItem from '../../../../models/KitchenItem';
import Company from '../../../../models/Company';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

export async function GET(req) {
    await dbConnect();
    try {
        const payload = getDataFromToken(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const companyIdParam = searchParams.get('companyId');
        const category = searchParams.get('category');
        const section = searchParams.get('section');

        const query = {};

        // Handle Multi-Company IDs and Default Behavior
        if (payload.role === 'Super Admin') {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            }
            // Super Admin defaults to ALl companies if no param
        } else {
            if (companyIdParam) {
                const ids = companyIdParam.split(',').filter(Boolean);
                query.companyId = ids.length > 1 ? { $in: ids } : ids[0];
            } else {
                // DEFAULT: Use ALL assigned companies from database
                const user = await User.findById(payload.userId).select('assignedCompanies companyId');
                if (user) {
                    const assigned = user.assignedCompanies || [];
                    if (assigned.length > 0) {
                        query.companyId = { $in: assigned };
                    } else if (user.companyId) {
                        query.companyId = user.companyId;
                    }
                }
            }
        }

        if (type) query.type = type;

        const vegCategories = ['VEGETABLE & FRUIT', 'VEGETABLE AND FRUIT', 'vegetable & fruit', 'VEG', 'FRUIT', 'VEGETABLES', 'FRUITS', 'GREEN VEGETABLES', 'LEAFY VEGETABLES', 'SEASONAL FRUITS', 'ROOT VEGETABLES'];
        const dairyCategories = ['MILK', 'Milk', 'MILK & BUTTERMILK', 'DAIRY', 'Dairy', 'BUTTERMILK', 'Buttermilk', 'DAIRY PRODUCTS', 'Dairy Products', 'CURD', 'PANEER', 'CHEESE', 'CREAM', 'YOGURT'];

        let targetCategories = [];
        if (section) {
            const Category = (await import('../../../../models/Category')).default;

            if (section === 'general') {
                const excludedCategories = await Category.find({ section: { $in: ['veg-fruits', 'dairy'] } }).select('_id');
                const excludedIds = excludedCategories.map(c => c._id);
                const items = await KitchenItem.find({ category: { $nin: excludedIds } }).select('_id');
                const itemIds = items.map(i => i._id);
                query.item = { $in: itemIds };
            } else {
                const catQuery = { section };
                if (query.companyId) {
                    catQuery.companyId = query.companyId;
                }

                const mappedCategories = await Category.find(catQuery).select('_id');
                const targetCategoryIds = mappedCategories.map(c => c._id);

                const items = await KitchenItem.find({ category: { $in: targetCategoryIds } }).select('_id');
                const itemIds = items.map(i => i._id);
                query.item = { $in: itemIds };
            }
        }

        const transactions = await KitchenTransaction.find(query)
            .populate({
                path: 'item',
                select: 'name unit category currentStock image',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' }
                ]
            })
            .populate('subType', 'name')
            .populate('department', 'name')
            .populate('event', 'name')
            .populate('companyId', 'name')
            .populate('batchId')
            .sort({ date: -1 })
            .limit(100);

        // Calculate average rates for unique items in results
        const itemIds = [...new Set(transactions.map(tx => tx.item?._id).filter(Boolean))];
        // Fetch all IN and OUT transactions for self-healing and exact average rate calculation
        const [allInTransactions, allOutTransactions, items] = await Promise.all([
            KitchenTransaction.find({ type: 'IN', item: { $in: itemIds } }),
            KitchenTransaction.find({ type: 'OUT', item: { $in: itemIds } }),
            KitchenItem.find({ _id: { $in: itemIds } })
        ]);

        const bulkUpdates = [];
        const healedBatches = [];

        // 1. Heal item currentStock based on transaction history (IN - OUT)
        for (const item of items) {
            const itemIdStr = item._id.toString();
            const itemInTxs = allInTransactions.filter(t => t.item.toString() === itemIdStr);
            const itemOutTxs = allOutTransactions.filter(t => t.item.toString() === itemIdStr);

            const totalIn = itemInTxs.reduce((sum, t) => sum + (t.quantity || 0), 0);
            const totalOut = itemOutTxs.reduce((sum, t) => sum + (t.quantity || 0), 0);
            const correctStock = totalIn - totalOut;

            if (item.currentStock !== correctStock) {
                bulkUpdates.push(
                    KitchenItem.findByIdAndUpdate(item._id, { currentStock: correctStock })
                );
                item.currentStock = correctStock;
            }
        }

        // Update populated item stock in the retrieved transactions list as well
        transactions.forEach(tx => {
            if (tx.item) {
                const matchedItem = items.find(i => i._id.toString() === tx.item._id.toString());
                if (matchedItem) {
                    tx.item.currentStock = matchedItem.currentStock;
                }
            }
        });

        // 2. Heal batch remainingQuantity
        for (const inTx of allInTransactions) {
            const linkedOuts = allOutTransactions.filter(o => o.batchId && o.batchId.toString() === inTx._id.toString());
            const totalOutQty = linkedOuts.reduce((sum, o) => sum + (o.quantity || 0), 0);
            const calculatedRemaining = Math.max(0, inTx.quantity - totalOutQty);

            if (inTx.remainingQuantity !== calculatedRemaining) {
                bulkUpdates.push(
                    KitchenTransaction.findByIdAndUpdate(inTx._id, { remainingQuantity: calculatedRemaining })
                );
                inTx.remainingQuantity = calculatedRemaining;
            }

            if (calculatedRemaining > 0) {
                healedBatches.push(inTx);
            }
        }

        if (bulkUpdates.length > 0) {
            await Promise.all(bulkUpdates);
        }

        const avgRateMap = {};
        itemIds.forEach(id => {
            const batches = healedBatches.filter(b => b.item.toString() === id.toString());
            const totalVal = batches.reduce((sum, b) => sum + (b.remainingQuantity * (b.rate || 0)), 0);
            const totalQty = batches.reduce((sum, b) => sum + b.remainingQuantity, 0);
            avgRateMap[id] = totalQty > 0 ? (totalVal / totalQty).toFixed(2) : 0;
        });

        const result = transactions.map(tx => {
            const txObj = tx.toObject();
            if (txObj.item) {
                txObj.item.avgRate = avgRateMap[txObj.item._id] || 0;
            }
            if (tx.type === 'OUT') {
                if (tx.populated('batchId') && !tx.batchId) {
                    txObj.isBatchDeleted = true;
                } else if (tx.batchId) {
                    const batchItem = tx.batchId.item;
                    const txItem = tx.item?._id || tx.item;
                    if (batchItem && txItem && String(batchItem) !== String(txItem)) {
                        txObj.isBatchMismatch = true;
                    }
                    if (tx.rate !== undefined && tx.batchId.rate !== undefined && Number(tx.rate) !== Number(tx.batchId.rate)) {
                        txObj.isBatchRateMismatch = true;
                    }
                }
            }
            return txObj;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Transactions GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();

    try {
        const user = getDataFromToken(req);
        if (!user || (!user.companyId && user.role !== 'Super Admin')) {
            return NextResponse.json({ error: 'Unauthorized or missing company' }, { status: 401 });
        }

        const body = await req.json();
        if (body.batchId === "") delete body.batchId;
        const { type, item, quantity, rate } = body;

        // Auto-create or find references for string values (Self-Healing)
        const isObjectId = /^[0-9a-fA-F]{24}$/;

        console.log('API RECEIVED subType:', body.subType);

        if (body.subType && !isObjectId.test(body.subType)) {
            const LogCategory = (await import('../../../../models/LogCategory')).default;
            let logCategory = await LogCategory.findOne({ name: { $regex: new RegExp(`^${body.subType}$`, 'i') } });
            console.log('Found logCategory:', logCategory);
            if (!logCategory) {
                logCategory = await LogCategory.create({ name: body.subType });
                console.log('Created logCategory:', logCategory);
            }
            body.subType = logCategory._id;
            console.log('Updated body.subType to:', body.subType);
        }

        if (body.department && !isObjectId.test(body.department)) {
            const Department = (await import('../../../../models/Department')).default;
            let dept = await Department.findOne({ 
                name: { $regex: new RegExp(`^${body.department}$`, 'i') },
                companyId: body.companyId || user.companyId
            });
            if (!dept) {
                dept = await Department.create({ 
                    name: body.department,
                    companyId: body.companyId || user.companyId
                });
            }
            body.department = dept._id;
        }

        if (body.event && !isObjectId.test(body.event)) {
            const Event = (await import('../../../../models/Event')).default;
            let ev = await Event.findOne({ 
                name: { $regex: new RegExp(`^${body.event}$`, 'i') },
                companyId: body.companyId || user.companyId
            });
            if (!ev) {
                ev = await Event.create({ 
                    name: body.event,
                    companyId: body.companyId || user.companyId
                });
            }
            body.event = ev._id;
        }

        let finalTotal = body.totalAmount ? Number(body.totalAmount) : 0;

        if (type === 'OUT') {
            const { batchId } = body;
            if (batchId) {
                const batch = await KitchenTransaction.findById(batchId);
                if (!batch) return NextResponse.json({ error: 'Selected batch not found' }, { status: 404 });

                if (batch.remainingQuantity < quantity) {
                    return NextResponse.json(
                        { error: `Insufficient stock in selected batch. Available: ${batch.remainingQuantity}` },
                        { status: 400 }
                    );
                }

                const batchTotal = (batch.totalAmount || 0) + (batch.gstAmount || 0);
                const effectiveUnitCost = batch.quantity > 0 ? (batchTotal / batch.quantity) : 0;
                finalTotal = rate ? (Number(rate) * Number(quantity)) : (effectiveUnitCost * Number(quantity));

                await KitchenTransaction.findByIdAndUpdate(batchId, {
                    $inc: { remainingQuantity: -Number(quantity) }
                });
            } else {
                const kitchenItem = await KitchenItem.findById(item);
                if (!kitchenItem) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

                if (kitchenItem.currentStock < quantity) {
                    return NextResponse.json(
                        { error: `Insufficient total stock. Available: ${kitchenItem.currentStock}` },
                        { status: 400 }
                    );
                }
                finalTotal = (Number(rate) || 0) * Number(quantity);
            }
        } else {
            const calculatedTotal = (rate && quantity)
                ? ((Number(rate) * Number(quantity)) + (Number(body.gstAmount) || 0) - (Number(body.discount) || 0))
                : 0;
            finalTotal = body.totalAmount ? Number(body.totalAmount) : calculatedTotal;
        }

        const dbUser = await User.findById(user.userId);
        const createdByName = dbUser ? dbUser.name : 'Unknown User';

        const transaction = await KitchenTransaction.create({
            ...body,
            totalAmount: finalTotal,
            remainingQuantity: type === 'IN' ? Number(quantity) : undefined,
            companyId: body.companyId || user.companyId,
            createdBy: user.userId,
            createdByName: createdByName
        });

        const adjustment = type === 'IN' ? Number(quantity) : -Number(quantity);
        await KitchenItem.findByIdAndUpdate(item, { $inc: { currentStock: adjustment } });

        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'KITCHEN_TRANSACTION_CREATE', {
            transactionId: transaction._id,
            type: transaction.type,
            itemId: transaction.item,
            quantity: transaction.quantity,
            amount: transaction.totalAmount
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user || user.role !== 'Super Admin' && !user.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...updates } = body;

        if (updates.batchId === "") updates.batchId = null;
        const isObjectId = /^[0-9a-fA-F]{24}$/;
        if (updates.subType && !isObjectId.test(updates.subType)) {
            const LogCategory = (await import('../../../../models/LogCategory')).default;
            let logCategory = await LogCategory.findOne({ name: { $regex: new RegExp(`^${updates.subType}$`, 'i') } });
            if (!logCategory) {
                logCategory = await LogCategory.create({ name: updates.subType });
            }
            updates.subType = logCategory._id;
        }
        delete updates.createdBy;
        delete updates.createdByName;
        delete updates.companyId;

        if (!id) return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });

        const oldTransaction = await KitchenTransaction.findById(id);
        if (!oldTransaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        const oldQty = Number(oldTransaction.quantity);
        const newQty = Number(updates.quantity);
        const qtyDiff = newQty - oldQty;

        if (oldTransaction.type === 'IN') {
            if (qtyDiff !== 0) {
                await KitchenItem.findByIdAndUpdate(oldTransaction.item, { $inc: { currentStock: qtyDiff } });
                if (oldTransaction.remainingQuantity !== undefined) {
                    updates.remainingQuantity = (oldTransaction.remainingQuantity || 0) + qtyDiff;
                }
            }
            if (updates.rate && updates.quantity) {
                const calculatedTotal = (Number(updates.rate) * newQty) + (Number(updates.gstAmount) || 0) - (Number(updates.discount) || 0);
                // Prioritize totalAmount if provided in body, otherwise use calculated
                if (updates.totalAmount === undefined) {
                    updates.totalAmount = calculatedTotal;
                } else {
                    updates.totalAmount = Number(updates.totalAmount);
                }
            }
        } else if (oldTransaction.type === 'OUT') {
            if (qtyDiff !== 0) {
                await KitchenItem.findByIdAndUpdate(oldTransaction.item, { $inc: { currentStock: -qtyDiff } });
                if (oldTransaction.batchId) {
                    await KitchenTransaction.findByIdAndUpdate(oldTransaction.batchId, { $inc: { remainingQuantity: -qtyDiff } });
                }
            }
            if (updates.quantity && (oldTransaction.rate || updates.rate)) {
                updates.totalAmount = Number(updates.rate || oldTransaction.rate) * newQty;
            }
        }

        if (user.role === 'Super Admin' && body.companyId) updates.companyId = body.companyId;

        const dbUser = await User.findById(user.userId);
        updates.updatedBy = user.userId;
        updates.updatedByName = dbUser ? dbUser.name : 'Unknown User';

        const updatedTransaction = await KitchenTransaction.findByIdAndUpdate(id, { ...updates }, { new: true })
            .populate({
                path: 'item',
                select: 'name unit category currentStock image',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name' }
                ]
            })
            .populate('subType', 'name')
            .populate('department', 'name')
            .populate('event', 'name')
            .populate('companyId', 'name');

        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'KITCHEN_TRANSACTION_UPDATE', {
            transactionId: updatedTransaction._id,
            type: updatedTransaction.type,
            itemId: updatedTransaction.item?._id || updatedTransaction.item,
            newQuantity: updatedTransaction.quantity,
            updatedFields: Object.keys(updates)
        });

        return NextResponse.json(updatedTransaction);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    try {
        const user = getDataFromToken(req);
        if (!user || user.role !== 'Super Admin' && !user.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });

        const transaction = await KitchenTransaction.findById(id);
        if (!transaction) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

        if (transaction.type === 'IN') {
            await KitchenItem.findByIdAndUpdate(transaction.item, { $inc: { currentStock: -Number(transaction.quantity) } });
        } else if (transaction.type === 'OUT') {
            await KitchenItem.findByIdAndUpdate(transaction.item, { $inc: { currentStock: Number(transaction.quantity) } });
            if (transaction.batchId) {
                await KitchenTransaction.findByIdAndUpdate(transaction.batchId, { $inc: { remainingQuantity: Number(transaction.quantity) } });
            }
        }

        await KitchenTransaction.findByIdAndDelete(id);
        const { activityMiddleware } = await import('../../../../lib/activityMiddleware');
        await activityMiddleware(req, user, 'KITCHEN_TRANSACTION_DELETE', {
            transactionId: id,
            type: transaction.type,
            itemId: transaction.item,
            quantity: transaction.quantity
        });

        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}