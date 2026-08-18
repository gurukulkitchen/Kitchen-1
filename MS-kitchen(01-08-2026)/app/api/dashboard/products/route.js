import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import KitchenItem from '../../../../models/KitchenItem';
import User from '../../../../models/User';
import Unit from '../../../../models/Unit';
import Category from '../../../../models/Category';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';

function parseCompanyIdParam(companyIdParam) {
  if (!companyIdParam) return null;
  const ids = companyIdParam.split(',').map(s => s.trim()).filter(Boolean);
  if (ids.length === 0) return null;
  
  if (ids.length > 1) {
    return { $in: ids.map(id => new mongoose.Types.ObjectId(id)) };
  }
  return new mongoose.Types.ObjectId(ids[0]);
}

async function buildCompanyQuery(payload, companyIdParam) {
  const query = {};
  const companyId = parseCompanyIdParam(companyIdParam);

  if (payload.role === 'Super Admin') {
    if (companyId) query.companyId = companyId;
    return query;
  }

  if (companyId) {
    query.companyId = companyId;
    return query;
  }

  const user = await User.findById(payload.userId).select('assignedCompanies companyId');
  if (user) {
    const assigned = user.assignedCompanies || [];
    if (assigned.length > 0) query.companyId = { $in: assigned };
    else if (user.companyId) query.companyId = user.companyId;
  }

  return query;
}

export async function GET(req) {
  await dbConnect();
  try {
    const payload = getDataFromToken(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get('companyId');
    const limitParam = searchParams.get('limit');
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    const mode = searchParams.get('mode') || 'monthly'; // 'monthly' or 'daily'
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const now = new Date();
    const year = yearParam ? Number(yearParam) : now.getFullYear();
    const month = monthParam ? Number(monthParam) : now.getMonth() + 1;

    const companyQuery = await buildCompanyQuery(payload, companyIdParam);
    
    // Build items query
    const itemsFilter = { ...companyQuery };
    if (category && category !== 'all') {
      const cats = category.split(',').map(c => c.trim()).filter(Boolean);
      if (cats.length > 0) itemsFilter.category = { $in: cats };
    }
    if (search) itemsFilter.name = { $regex: search, $options: 'i' };

    const noLimit = limitParam === 'all' || mode === 'daily' || mode === 'monthly';
    const limit = noLimit ? null : (limitParam ? Math.min(500, Math.max(1, Number(limitParam))) : 100);

    let itemsQuery = KitchenItem.find(itemsFilter)
      .sort({ name: 1 })
      .select('_id name unit category currentStock image mrp')
      .populate('category', 'name')
      .populate('unit', 'name');
    if (limit) itemsQuery = itemsQuery.limit(limit);
    const items = await itemsQuery;
    const itemIds = items.map(i => i._id);

    if (itemIds.length === 0) {
      return NextResponse.json({ year, month, items: [], mode });
    }

    // Fetch all IN and OUT transactions for self-healing and exact batch calculation
    const [allInTransactions, allOutTransactions] = await Promise.all([
      KitchenTransaction.find({ type: 'IN', item: { $in: itemIds } }),
      KitchenTransaction.find({ type: 'OUT', item: { $in: itemIds } })
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
      const correctStock = Math.max(0, totalIn - totalOut);

      if (item.currentStock !== correctStock) {
        bulkUpdates.push(
          KitchenItem.findByIdAndUpdate(item._id, { currentStock: correctStock })
        );
        item.currentStock = correctStock;
      }
    }

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

    const mrpValueMap = {};
    const totalBatchQtyMap = {};

    healedBatches.forEach(b => {
      const itemId = b.item.toString();
      const itemObj = items.find(i => i._id.toString() === itemId);
      const batchMRP = b.mrp || (itemObj ? itemObj.mrp : 0) || 0;
      const val = b.remainingQuantity * batchMRP;
      mrpValueMap[itemId] = (mrpValueMap[itemId] || 0) + val;
      totalBatchQtyMap[itemId] = (totalBatchQtyMap[itemId] || 0) + b.remainingQuantity;
    });

    const currentStockMRPValueMap = {};
    items.forEach(item => {
      const itemId = item._id.toString();
      const totalBatchQty = totalBatchQtyMap[itemId] || 0;
      const trackedMRPValue = mrpValueMap[itemId] || 0;
      let finalMRPValue = trackedMRPValue;
      if (item.currentStock > totalBatchQty) {
        const untrackedQty = item.currentStock - totalBatchQty;
        finalMRPValue += untrackedQty * (item.mrp || 0);
      }
      currentStockMRPValueMap[itemId] = finalMRPValue;
    });

    if (mode === 'daily') {
      // Daily aggregation for a specific month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      const agg = await KitchenTransaction.aggregate([
        {
          $match: {
            ...companyQuery,
            item: { $in: itemIds },
            date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: {
              item: '$item',
              day: { $dayOfMonth: '$date' },
              type: '$type'
            },
            qty: { $sum: { $ifNull: ['$quantity', 0] } },
            amount: { $sum: { $add: [{ $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$gstAmount', 0] }] } }
          }
        }
      ]);

      const daysInMonth = new Date(year, month, 0).getDate();
      const perItem = new Map();
      items.forEach(item => {
        const days = {};
        for(let d=1; d<=daysInMonth; d++) {
          days[d] = { inQty: 0, inAmount: 0, outQty: 0, outAmount: 0 };
        }
        perItem.set(item._id.toString(), {
          id: item._id,
          name: item.name,
          unit: item.unit,
          category: item.category,
          currentStock: item.currentStock || 0,
          mrp: item.mrp || 0,
          image: item.image,
          days,
          total: { inQty: 0, inAmount: 0, outQty: 0, outAmount: 0, currentStockMRPValue: currentStockMRPValueMap[item._id.toString()] || 0 }
        });
      });

      agg.forEach(row => {
        const itemId = row._id?.item?.toString();
        const day = row._id?.day;
        const type = row._id?.type;
        const entry = perItem.get(itemId);
        if (!entry || !day) return;

        const qty = Number(row.qty || 0);
        const amount = Number(row.amount || 0);

        if (type === 'IN') {
          entry.days[day].inQty += qty;
          entry.days[day].inAmount += amount;
          entry.total.inQty += qty;
          entry.total.inAmount += amount;
        } else if (type === 'OUT') {
          entry.days[day].outQty += qty;
          entry.days[day].outAmount += amount;
          entry.total.outQty += qty;
          entry.total.outAmount += amount;
        }
      });

      return NextResponse.json({ 
        year, 
        month, 
        daysInMonth, 
        mode,
        items: Array.from(perItem.values()) 
      });

    } else {
      // Existing Monthly aggregation for a year
      const yStart = new Date(year, 0, 1);
      const yEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      const agg = await KitchenTransaction.aggregate([
        {
          $match: {
            ...companyQuery,
            item: { $in: itemIds },
            date: { $gte: yStart, $lte: yEnd }
          }
        },
        {
          $group: {
            _id: {
              item: '$item',
              month: { $month: '$date' },
              type: '$type'
            },
            qty: { $sum: { $ifNull: ['$quantity', 0] } },
            amount: { $sum: { $add: [{ $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$gstAmount', 0] }] } }
          }
        }
      ]);

      const perItem = new Map();
      items.forEach(item => {
        perItem.set(item._id.toString(), {
          id: item._id,
          name: item.name,
          unit: item.unit,
          category: item.category,
          mrp: item.mrp || 0,
          currentStock: item.currentStock || 0,
          months: new Array(12).fill(null).map((_, idx) => ({
            month: idx + 1,
            inQty: 0,
            inAmount: 0,
            outQty: 0,
            outAmount: 0
          })),
          summary: {
            inQty: 0,
            inAmount: 0,
            outQty: 0,
            outAmount: 0,
            currentStockMRPValue: currentStockMRPValueMap[item._id.toString()] || 0
          }
        });
      });

      agg.forEach(row => {
        const itemId = row._id?.item?.toString();
        const monthIndex = (row._id?.month || 1) - 1;
        const type = row._id?.type;
        const entry = perItem.get(itemId);
        if (!entry) return;
        const qty = Number(row.qty || 0);
        const amount = Number(row.amount || 0);

        if (type === 'IN') {
          entry.months[monthIndex].inQty += qty;
          entry.months[monthIndex].inAmount += amount;
          entry.summary.inQty += qty;
          entry.summary.inAmount += amount;
        } else if (type === 'OUT') {
          entry.months[monthIndex].outQty += qty;
          entry.months[monthIndex].outAmount += amount;
          entry.summary.outQty += qty;
          entry.summary.outAmount += amount;
        }
      });

      const responseItems = Array.from(perItem.values()).map(item => ({
        ...item,
        summary: {
          ...item.summary,
          balanceQty: Number(item.summary.inQty || 0) - Number(item.summary.outQty || 0),
          balanceAmount: Number(item.summary.inAmount || 0) - Number(item.summary.outAmount || 0)
        },
        months: item.months.map(m => ({
          ...m,
          balanceQty: m.inQty - m.outQty,
          balanceAmount: m.inAmount - m.outAmount
        }))
      }));

      return NextResponse.json({ year, items: responseItems, mode });
    }
  } catch (error) {
    console.error('Dashboard products API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
