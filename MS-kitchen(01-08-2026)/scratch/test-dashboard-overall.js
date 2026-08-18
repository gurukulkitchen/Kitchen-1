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
const User = require('../models/User').default || require('../models/User');
const KitchenTransaction = require('../models/KitchenTransaction').default || require('../models/KitchenTransaction');
const KitchenItem = require('../models/KitchenItem').default || require('../models/KitchenItem');
const Category = require('../models/Category').default || require('../models/Category');
const StudentCount = require('../models/StudentCount').default || require('../models/StudentCount');

async function test() {
  await dbConnect();
  console.log('Database connected!');

  // Mock buildCompanyQuery and companyQuery
  const companyQuery = { companyId: new mongoose.Types.ObjectId('6989a8017eada5f60f3a7501') };
  const targetYear = 2026;
  const targetMonth = 5;

  const yearStr = String(targetYear);
  const monthStr = String(targetMonth).padStart(2, '0');

  const donationAgg = await Donation.aggregate([
    { $match: { ...companyQuery, date: { $regex: `^${yearStr}` } } },
    {
      $facet: {
        total: [{ $group: { _id: null, amount: { $sum: '$amount' } } }],
        monthly: [
          { $match: { date: { $regex: `^${yearStr}-${monthStr}` } } },
          { $group: { _id: null, amount: { $sum: '$amount' } } }
        ]
      }
    }
  ]);

  console.log('--- Donation aggregation output from overall API: ---');
  console.log(JSON.stringify(donationAgg, null, 2));

  const donationStats = {
    total: donationAgg?.[0]?.total?.[0]?.amount || 0,
    monthly: donationAgg?.[0]?.monthly?.[0]?.amount || 0
  };

  console.log('donationStats parsed:');
  console.log(donationStats);

  mongoose.connection.close();
}

test().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
