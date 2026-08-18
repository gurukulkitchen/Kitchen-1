import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import User from '../../../../models/User';
import Event from '../../../../models/Event';
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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function monthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export async function GET(req) {
  await dbConnect();
  try {
    const payload = getDataFromToken(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get('companyId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(200, Math.max(1, Number(limitParam))) : 50;

    const companyQuery = await buildCompanyQuery(payload, companyIdParam);

    const now = new Date();
    const rangeEnd = endOfMonth(now);
    const rangeStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const rangeStart = startOfMonth(rangeStartDate);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const event = searchParams.get('event');

    const recentQuery = { ...companyQuery, type: 'OUT' };
    if (from || to) {
      recentQuery.date = {};
      if (from) recentQuery.date.$gte = new Date(from);
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        recentQuery.date.$lte = endDate;
      }
    }
    if (event && event !== 'All') {
      if (mongoose.Types.ObjectId.isValid(event)) {
        recentQuery.event = new mongoose.Types.ObjectId(event);
      } else {
        const eventDoc = await Event.findOne({ name: event, ...companyQuery });
        if (eventDoc) {
          recentQuery.event = eventDoc._id;
        } else {
          recentQuery.event = new mongoose.Types.ObjectId();
        }
      }
    }

    const [monthlyAgg, recent, eventsList] = await Promise.all([
      KitchenTransaction.aggregate([
        {
          $match: {
            ...companyQuery,
            type: 'OUT',
            date: { $gte: rangeStart, $lte: rangeEnd }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            totalQty: { $sum: { $ifNull: ['$quantity', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      KitchenTransaction.find(recentQuery)
        .populate({
          path: 'item',
          select: 'name unit category image',
          populate: [
            { path: 'unit', select: 'name' },
            { path: 'category', select: 'name' }
          ]
        })
        .populate('department', 'name')
        .populate('event', 'name')
        .sort({ date: -1 })
        .limit(limit),
      KitchenTransaction.distinct('event', { ...companyQuery, type: 'OUT' })
    ]);

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d), year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const monthlyMap = new Map();
    monthlyAgg.forEach(r => {
      const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`;
      monthlyMap.set(key, {
        totalAmount: Number(r.totalAmount || 0),
        totalQty: Number(r.totalQty || 0),
        count: Number(r.count || 0)
      });
    });

    const monthly = months.map(m => ({
      key: m.key,
      year: m.year,
      month: m.month,
      ...(monthlyMap.get(m.key) || { totalAmount: 0, totalQty: 0, count: 0 })
    }));

    const eventIds = (eventsList || []).filter(Boolean);
    const dbEvents = await Event.find({ _id: { $in: eventIds } }).select('name');
    const finalEventNames = dbEvents.map(e => e.name).filter(Boolean);

    return NextResponse.json({
      range: { from: rangeStart, to: rangeEnd },
      monthly,
      recent,
      eventsList: finalEventNames
    });
  } catch (error) {
    console.error('Dashboard events API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

