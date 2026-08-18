const fs = require('fs');
const path = require('path');

// Natively parse .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

const mongoose = require('mongoose');
const dbConnect = require('../lib/db').default || require('../lib/db');
const User = require('../models/User').default || require('../models/User');
const Donation = require('../models/Donation').default || require('../models/Donation');

async function testForMonth(year, month) {
  const companyQuery = { companyId: new mongoose.Types.ObjectId('6989a8017eada5f60f3a7501') };
  const targetYear = year;
  const targetMonth = month;

  const yearStr = String(targetYear);
  const monthStr = String(targetMonth).padStart(2, '0');

  const yearStart = new Date(targetYear, 0, 1);
  const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  const monthStart = new Date(targetYear, targetMonth - 1, 1);
  const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  // 1. Staff calculation
  const staffSummaryAgg = await User.find({
    ...companyQuery,
    role: { $ne: 'Super Admin' }
  });

  const filterMonthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  let totalStaff = 0;
  let activeStaff = 0;
  let totalSalary = 0;
  let totalAdvanceDue = 0;

  (staffSummaryAgg || []).forEach(u => {
    totalStaff++;
    if (u.status === 'Active') {
      activeStaff++;
      
      if (typeof u.salary === 'number') {
        totalSalary += u.salary;
      } else if (Array.isArray(u.salary)) {
        const sortedHistory = [...u.salary]
          .filter(sal => sal && typeof sal === 'object' && sal.month)
          .sort((a, b) => a.month.localeCompare(b.month));
          
        const relevantRecords = sortedHistory.filter(sal => sal.month <= filterMonthStr);
        const effectiveSalaryRecord = relevantRecords.length > 0
          ? relevantRecords[relevantRecords.length - 1]
          : (sortedHistory.length > 0 ? sortedHistory[0] : null);
          
        if (effectiveSalaryRecord) {
          totalSalary += effectiveSalaryRecord.amount || 0;
        }
      }
    }

    const advances = u.advances || [];
    advances.forEach(adv => {
      if (adv.status === 'Pending') {
        totalAdvanceDue += adv.amount || 0;
      }
    });
  });

  // 2. Donation calculation
  const donationAgg = await Donation.aggregate([
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
  ]);

  const donationStats = {
    total: donationAgg?.[0]?.total?.[0]?.amount || 0,
    monthly: donationAgg?.[0]?.monthly?.[0]?.amount || 0
  };

  console.log(`\n================= RESULTS FOR ${filterMonthStr} =================`);
  console.log('--- Staff Stats ---');
  console.log(`Total Staff: ${totalStaff}`);
  console.log(`Active Staff: ${activeStaff}`);
  console.log(`Estim. Monthly Salary: ₹ ${totalSalary}`);
  console.log(`Total Advance Outstanding: ₹ ${totalAdvanceDue}`);
  console.log('--- Donation Stats ---');
  console.log(`Total Donations: ₹ ${donationStats.total}`);
  console.log(`Monthly Donations: ₹ ${donationStats.monthly}`);
}

async function run() {
  await dbConnect();
  console.log('Database connected!');

  // Test for May 2026 (should include Vraj's May salary 5000 -> total 70000)
  await testForMonth(2026, 5);

  // Test for March 2026 (should include Vraj's March salary 3000 -> total 68000)
  await testForMonth(2026, 3);

  mongoose.connection.close();
}

run().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
