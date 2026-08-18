import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import KitchenItem from '../../../../models/KitchenItem';
import Category from '../../../../models/Category';
import User from '../../../../models/User';
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
    if (assigned.length > 0) query.companyId = { $in: assigned.map(id => new mongoose.Types.ObjectId(id)) };
    else if (user.companyId) query.companyId = new mongoose.Types.ObjectId(user.companyId);
  }

  return query;
}

async function getSectionCategoryNames(section, companyQuery) {
  // Handle variations of section names
  const sectionVariations = [section];
  if (section === 'veg-fruits') sectionVariations.push('veg-fruit', 'vegetable-fruit', 'veg-fruits');
  if (section === 'dairy') sectionVariations.push('dairy', 'milk-dairy');

  const catQuery = { section: { $in: sectionVariations } };
  if (companyQuery.companyId) catQuery.companyId = companyQuery.companyId;

  const categories = await Category.find(catQuery).select('name');
  const names = categories.map(c => c.name);

  if (section === 'veg-fruits' || section === 'veg-fruit') {
    names.push('VEGETABLE & FRUIT', 'VEGETABLE AND FRUIT', 'vegetable & fruit', 'Veg & Fruit', 'Veg & Fruits');
  } else if (section === 'dairy') {
    names.push('MILK', 'Milk', 'MILK & BUTTERMILK', 'Dairy');
  }

  return [...new Set(names)];
}

async function getSectionCategoryIds(section, companyQuery) {
  const sectionVariations = [section];
  if (section === 'veg-fruits') sectionVariations.push('veg-fruit', 'vegetable-fruit', 'veg-fruits');
  if (section === 'dairy') sectionVariations.push('dairy', 'milk-dairy');

  const catQuery = { section: { $in: sectionVariations } };
  if (companyQuery.companyId) catQuery.companyId = companyQuery.companyId;

  const categories = await Category.find(catQuery).select('_id');
  return categories.map(c => c._id);
}

async function getItemIdsBySection(section, companyQuery) {
  const categoryNames = await getSectionCategoryNames(section, companyQuery);
  
  // Find categories by these names to get their ObjectIds
  const cats = await Category.find({ name: { $in: categoryNames } }).select('_id');
  const categoryIds = cats.map(c => c._id);

  const itemQuery = { category: { $in: categoryIds } };
  if (companyQuery.companyId) itemQuery.companyId = companyQuery.companyId;

  const items = await KitchenItem.find(itemQuery).select('_id');
  return items.map(i => i._id);
}

function startOfYear(year) {
  return new Date(year, 0, 1);
}

function endOfYear(year) {
  return new Date(year, 11, 31, 23, 59, 59, 999);
}

function startOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1);
}

function endOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export async function GET(req) {
  await dbConnect();
  try {
    const payload = getDataFromToken(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get('companyId');
    const section = searchParams.get('section'); // 'dairy' | 'veg-fruits'
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month'); // 1-12
    const type = searchParams.get('type') || 'OUT';
    const itemId = searchParams.get('itemId');

    if (!section) return NextResponse.json({ error: 'section is required' }, { status: 400 });

    const now = new Date();
    const year = yearParam ? Number(yearParam) : now.getFullYear();
    const month = monthParam ? Number(monthParam) : now.getMonth() + 1;
    const monthIndex = Math.min(11, Math.max(0, month - 1));

    const companyQuery = await buildCompanyQuery(payload, companyIdParam);
    const itemIds = itemId ? [new mongoose.Types.ObjectId(itemId)] : await getItemIdsBySection(section, companyQuery);

    const yStart = startOfYear(year);
    const yEnd = endOfYear(year);
    const mStart = startOfMonth(year, monthIndex);
    const mEnd = endOfMonth(year, monthIndex);

    const baseMatchYear = {
      ...companyQuery,
      type,
      item: { $in: itemIds },
      date: { $gte: yStart, $lte: yEnd }
    };

    const baseMatchMonth = {
      ...companyQuery,
      type,
      item: { $in: itemIds },
      date: { $gte: mStart, $lte: mEnd }
    };

    const [monthlyAgg, dailyAgg, ytdAgg] = await Promise.all([
      KitchenTransaction.aggregate([
        { $match: baseMatchYear },
        {
          $group: {
            _id: { month: { $month: '$date' } },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            totalQty: { $sum: { $ifNull: ['$quantity', 0] } }
          }
        },
        { $sort: { '_id.month': 1 } }
      ]),
      KitchenTransaction.aggregate([
        { $match: baseMatchMonth },
        {
          $group: {
            _id: { day: { $dayOfMonth: '$date' } },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            totalQty: { $sum: { $ifNull: ['$quantity', 0] } }
          }
        },
        { $sort: { '_id.day': 1 } }
      ]),
      KitchenTransaction.aggregate([
        { $match: { ...baseMatchYear, date: { $gte: yStart, $lte: new Date() } } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            totalQty: { $sum: { $ifNull: ['$quantity', 0] } }
          }
        }
      ])
    ]);

    const monthly = new Array(12).fill(null).map((_, idx) => ({
      month: idx + 1,
      totalAmount: 0,
      totalQty: 0
    }));
    monthlyAgg.forEach(row => {
      const idx = (row._id?.month || 1) - 1;
      monthly[idx] = {
        month: idx + 1,
        totalAmount: Number(row.totalAmount || 0),
        totalQty: Number(row.totalQty || 0)
      };
    });

    const totalDays = daysInMonth(year, monthIndex);
    const daily = new Array(totalDays).fill(null).map((_, idx) => ({
      day: idx + 1,
      totalAmount: 0,
      totalQty: 0,
      avgRate: 0
    }));
    dailyAgg.forEach(row => {
      const idx = (row._id?.day || 1) - 1;
      const qty = Number(row.totalQty || 0);
      const amount = Number(row.totalAmount || 0);
      daily[idx] = {
        day: idx + 1,
        totalAmount: amount,
        totalQty: qty,
        avgRate: qty > 0 ? amount / qty : 0
      };
    });

    const ytdTotalAmount = ytdAgg?.[0]?.totalAmount || 0;
    const ytdTotalQty = ytdAgg?.[0]?.totalQty || 0;

    return NextResponse.json({
      section,
      type,
      year,
      month: monthIndex + 1,
      ytd: { totalAmount: ytdTotalAmount, totalQty: ytdTotalQty },
      monthly,
      daily
    });
  } catch (error) {
    console.error('Dashboard section API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
