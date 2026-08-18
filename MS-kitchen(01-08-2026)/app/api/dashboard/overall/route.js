import Donation from '../../../../models/Donation';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';
import KitchenTransaction from '../../../../models/KitchenTransaction';
import KitchenItem from '../../../../models/KitchenItem';
import Category from '../../../../models/Category';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';
import { getDataFromToken } from '../../../../helpers/getDataFromToken';
import StudentCount from '../../../../models/StudentCount';

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

async function getSectionCategoryNames(section, companyQuery) {
  const catQuery = { section };
  if (companyQuery.companyId) catQuery.companyId = companyQuery.companyId;

  const categories = await Category.find(catQuery).select('name');
  const names = categories.map(c => c.name);

  if (section === 'veg-fruits') {
    names.push('VEGETABLE & FRUIT', 'VEGETABLE AND FRUIT', 'vegetable & fruit');
  } else if (section === 'dairy') {
    names.push('MILK', 'Milk', 'MILK & BUTTERMILK');
  }

  return [...new Set(names)];
}

async function getItemIdsBySection(section, companyQuery) {
  const categoryNames = await getSectionCategoryNames(section, companyQuery);
  
  const catQuery = { name: { $in: categoryNames } };
  if (companyQuery.companyId) catQuery.companyId = companyQuery.companyId;
  
  const categories = await Category.find(catQuery).select('_id');
  const categoryIds = categories.map(c => c._id);
  
  if (categoryIds.length === 0) return [];

  const itemQuery = { category: { $in: categoryIds } };
  if (companyQuery.companyId) itemQuery.companyId = companyQuery.companyId;

  const items = await KitchenItem.find(itemQuery).select('_id');
  return items.map(i => i._id);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}


function monthAbbrs() {
  return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
}

function monthlyAggToArrays(rows) {
  const monthlyAmounts = new Array(12).fill(0);
  const monthlyCounts = new Array(12).fill(null);
  let totalAmount = 0;

  (rows || []).forEach(row => {
    const monthIndex = (row._id?.month || 1) - 1;
    const amount = Number(row.totalAmount || 0);
    totalAmount += amount;
    monthlyAmounts[monthIndex] = amount;
    const count = Number(row.count || 0);
    monthlyCounts[monthIndex] = count > 0 ? count : null;
  });

  return { monthlyAmounts, monthlyCounts, totalAmount };
}

function addMonthlySeries(a, b) {
  const monthlyAmounts = a.monthlyAmounts.map((v, i) => Number(v || 0) + Number(b.monthlyAmounts[i] || 0));
  const monthlyCounts = a.monthlyCounts.map((v, i) => {
    const count = Number(v || 0) + Number(b.monthlyCounts[i] || 0);
    return count > 0 ? count : null;
  });
  return { monthlyAmounts, monthlyCounts, totalAmount: Number(a.totalAmount || 0) + Number(b.totalAmount || 0) };
}

function subMonthlySeries(a, b) {
  const monthlyAmounts = a.monthlyAmounts.map((v, i) => Number(v || 0) - Number(b.monthlyAmounts[i] || 0));
  const monthlyCounts = a.monthlyCounts.map((v, i) => {
    const count = Number(v || 0) + Number(b.monthlyCounts[i] || 0);
    return count > 0 ? count : null;
  });
  return { monthlyAmounts, monthlyCounts, totalAmount: Number(a.totalAmount || 0) - Number(b.totalAmount || 0) };
}

export async function GET(req) {
  await dbConnect();
  try {
    const payload = getDataFromToken(req);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get('companyId');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const companyQuery = await buildCompanyQuery(payload, companyIdParam);

    const now = new Date();
    const targetYear = yearParam ? Number(yearParam) : now.getFullYear();
    const targetMonth = monthParam ? Number(monthParam) : now.getMonth() + 1;

    // Helper functions for month range
    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    // For summary cards (Month specific)
    const from = startOfMonth(new Date(targetYear, targetMonth - 1));
    const to = endOfMonth(new Date(targetYear, targetMonth - 1));

    const baseMatchOutYtd = {
      ...companyQuery,
      type: 'OUT',
      date: { $gte: from, $lte: to }
    };

    const [vegItemIds, dairyItemIds] = await Promise.all([
      getItemIdsBySection('veg-fruits', companyQuery),
      getItemIdsBySection('dairy', companyQuery)
    ]);

    const yearStart = startOfYear(new Date(targetYear, 0, 1));
    const yearEnd = endOfYear(new Date(targetYear, 0, 1));
    const yearStr = String(targetYear);
    const monthStr = String(targetMonth).padStart(2, '0');

    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const baseMatchOutYear = {
      ...companyQuery,
      type: 'OUT',
      date: { $gte: yearStart, $lte: yearEnd }
    };

    const baseMatchInYear = {
      ...companyQuery,
      type: 'IN',
      date: { $gte: yearStart, $lte: yearEnd }
    };

    const [
      totalAgg, vegAgg, dairyAgg, 
      monthlyOutAgg, monthlyInAgg, 
      monthlyVegOutAgg, monthlyDairyOutAgg, 
      staffSummaryAgg, donationAgg,
      studentCountAgg
    ] = await Promise.all([
      KitchenTransaction.aggregate([
        { $match: baseMatchOutYtd },
        { $group: { _id: null, totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } } } }
      ]),
      KitchenTransaction.aggregate([
        { $match: { ...baseMatchOutYtd, item: { $in: vegItemIds } } },
        { $group: { _id: null, totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } } } }
      ]),
      KitchenTransaction.aggregate([
        { $match: { ...baseMatchOutYtd, item: { $in: dairyItemIds } } },
        { $group: { _id: null, totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } } } }
      ]),
      KitchenTransaction.aggregate([
        { $match: baseMatchOutYear },
        {
          $group: {
            _id: { month: { $month: '$date' } },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.month': 1 } }
      ]),
      KitchenTransaction.aggregate([
        { $match: baseMatchInYear },
        {
          $group: {
            _id: { month: { $month: '$date' } },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.month': 1 } }
      ]),
      KitchenTransaction.aggregate([
        { $match: { ...baseMatchOutYear, item: { $in: vegItemIds } } },
        {
          $group: {
            _id: { month: { $month: '$date' } },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.month': 1 } }
      ]),
      KitchenTransaction.aggregate([
        { $match: { ...baseMatchOutYear, item: { $in: dairyItemIds } } },
        {
          $group: {
            _id: { month: { $month: '$date' } },
            totalAmount: { $sum: { $ifNull: ['$totalAmount', 0] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.month': 1 } }
      ]),
      mongoose.connection.db.collection('users').find({
        ...(companyQuery.companyId ? { companyId: companyQuery.companyId } : {}),
        role: { $ne: 'Super Admin' }
      }).toArray(),
      Donation.aggregate([
        {
          $match: {
            ...companyQuery,
            $or: [
              { date: { $regex: `^${yearStr}` } },
              { date: { $gte: yearStart, $lte: yearEnd } }
            ]
          }
        },
        {
          $facet: {
            total: [{ $group: { _id: null, amount: { $sum: '$amount' } } }],
            monthly: [
              {
                $match: {
                  $or: [
                    { date: { $regex: `^${yearStr}-${monthStr}` } },
                    { date: { $gte: monthStart, $lte: monthEnd } }
                  ]
                }
              },
              { $group: { _id: null, amount: { $sum: '$amount' } } }
            ]
          }
        }
      ]),
      StudentCount.find({
        ...companyQuery,
        month: { $regex: `^${yearStr}` }
      })
    ]);

    const studentCounts = new Array(12).fill(null);
    (studentCountAgg || []).forEach(sc => {
      const mIdx = parseInt(sc.month.split('-')[1]) - 1;
      if (mIdx >= 0 && mIdx < 12) studentCounts[mIdx] = sc.count;
    });

    const totalExpense = totalAgg?.[0]?.totalAmount || 0;
    const vegExpense = vegAgg?.[0]?.totalAmount || 0;
    const dairyExpense = dairyAgg?.[0]?.totalAmount || 0;

    const filterMonthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    let totalStaff = 0;
    let activeStaff = 0;
    let totalSalary = 0;
    let totalAdvanceDue = 0;

    (staffSummaryAgg || []).forEach(u => {
      totalStaff++;
      if (u.status === 'Active') {
        activeStaff++;
        
        // Calculate salary for this active staff for the target month
        if (typeof u.salary === 'number') {
          totalSalary += u.salary;
        } else if (Array.isArray(u.salary)) {
          // Find the salary record matching the selected month. If none exists, use the base salary (first record)
          const sortedHistory = [...u.salary]
            .filter(sal => sal && typeof sal === 'object' && sal.month)
            .sort((a, b) => a.month.localeCompare(b.month));
            
          const exactRecord = sortedHistory.find(sal => sal.month === filterMonthStr);
          const effectiveSalaryRecord = exactRecord || (sortedHistory.length > 0 ? sortedHistory[0] : null);
            
          if (effectiveSalaryRecord) {
            totalSalary += effectiveSalaryRecord.amount || 0;
          }
        }
      }

      // Calculate advance due (pending advances)
      const advances = u.advances || [];
      advances.forEach(adv => {
        if (adv.status === 'Pending') {
          totalAdvanceDue += adv.amount || 0;
        }
      });
    });

    const staffStats = {
      totalStaff,
      activeStaff,
      totalSalary,
      totalAdvanceDue
    };
    const donationStats = {
      total: donationAgg?.[0]?.total?.[0]?.amount || 0,
      monthly: donationAgg?.[0]?.monthly?.[0]?.amount || 0
    };

    const monthsElapsed = targetMonth; // Jan=1
    const totalMonthlySalary = staffStats.totalSalary || 0;
    const hrExpense = totalMonthlySalary; // Show monthly expense instead of cumulative YTD

    const months = monthAbbrs();
    const outSeries = monthlyAggToArrays(monthlyOutAgg);
    const inSeries = monthlyAggToArrays(monthlyInAgg);
    const inOutSeries = addMonthlySeries(outSeries, inSeries);
    const balanceSeries = subMonthlySeries(inSeries, outSeries);
    const vegSeries = monthlyAggToArrays(monthlyVegOutAgg);
    const dairySeries = monthlyAggToArrays(monthlyDairyOutAgg);
    const otherSeries = subMonthlySeries(subMonthlySeries(outSeries, vegSeries), dairySeries);

    const hrMonthlyAmounts = new Array(12).fill(0).map((_, idx) => (idx < monthsElapsed ? totalMonthlySalary : 0));
    const hrMonthlyCounts = new Array(12).fill(null);
    const hrSeries = { monthlyAmounts: hrMonthlyAmounts, monthlyCounts: hrMonthlyCounts, totalAmount: hrExpense };

    const tabData = {
      'TOTAL EEP.': { ...outSeries, monthlyCounts: studentCounts, totalAmount: outSeries.totalAmount },
      'OUT': { ...outSeries, monthlyCounts: studentCounts, totalAmount: outSeries.totalAmount },
      'IN & OUT': { ...inOutSeries, monthlyCounts: studentCounts, totalAmount: inOutSeries.totalAmount },
      'BALANCE': { ...balanceSeries, monthlyCounts: studentCounts, totalAmount: balanceSeries.totalAmount },
      'VEG.': { ...vegSeries, monthlyCounts: studentCounts, totalAmount: vegSeries.totalAmount },
      'MILK & CHHASH': { ...dairySeries, monthlyCounts: studentCounts, totalAmount: dairySeries.totalAmount },
      'OTHER': { ...otherSeries, monthlyCounts: studentCounts, totalAmount: otherSeries.totalAmount },
      'HR': { ...hrSeries, monthlyCounts: studentCounts, totalAmount: hrSeries.totalAmount }
    };

    return NextResponse.json({
      range: { from, to },
      cards: {
        totalExpense,
        vegExpense,
        dairyExpense,
        hrExpense
      },
      staffSummary: {
        totalStaff: staffStats.totalStaff,
        activeStaff: staffStats.activeStaff,
        totalAdvanceDue: staffStats.totalAdvanceDue,
        monthlySalary: staffStats.totalSalary
      },
      donationSummary: {
        total: donationStats.total,
        monthly: donationStats.monthly
      },
      chart: {
        months,
        monthlyAmounts: outSeries.monthlyAmounts,
        monthlyCounts: studentCounts
      },
      tabData
    });
  } catch (error) {
    console.error('Dashboard overall API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
