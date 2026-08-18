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
const Donation = require('../models/Donation').default || require('../models/Donation');

async function test() {
  await dbConnect();
  console.log('Database connected!');

  const companyQuery = { companyId: new mongoose.Types.ObjectId('6989a8017eada5f60f3a7501') };
  const targetYear = 2026;
  const targetMonth = 5;

  const yearStr = String(targetYear);
  const monthStr = String(targetMonth).padStart(2, '0');

  const yearStart = new Date(targetYear, 0, 1);
  const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  const monthStart = new Date(targetYear, targetMonth - 1, 1);
  const monthEnd = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

  console.log('Query parameters:');
  console.log('Year Range:', yearStart, 'to', yearEnd);
  console.log('Month Range:', monthStart, 'to', monthEnd);

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

  console.log('--- Aggregation Output with $or matches: ---');
  console.log(JSON.stringify(donationAgg, null, 2));

  mongoose.connection.close();
}

test().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
