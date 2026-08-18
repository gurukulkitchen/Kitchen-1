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

async function test() {
  await dbConnect();
  console.log('Database connected!');

  const companyQuery = { companyId: new mongoose.Types.ObjectId('6989a8017eada5f60f3a7501') };

  const staffSummaryAgg = await User.aggregate([
    {
      $match: {
        ...(companyQuery.companyId ? { companyId: companyQuery.companyId } : {}),
        role: { $ne: 'Super Admin' }
      }
    },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        activeStaff: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        totalSalary: { $sum: { $ifNull: ['$salary', 0] } },
        totalAdvanceDue: {
          $sum: {
            $reduce: {
              input: { $ifNull: ['$advances', []] },
              initialValue: 0,
              in: { $add: ['$$value', { $cond: [{ $eq: ['$$this.status', 'Pending'] }, '$$this.amount', 0] }] }
            }
          }
        }
      }
    }
  ]);

  console.log('--- Staff aggregation output: ---');
  console.log(JSON.stringify(staffSummaryAgg, null, 2));

  // Let's also look at raw salaries of active users for this company
  const activeUsers = await User.find({
    ...(companyQuery.companyId ? { companyId: companyQuery.companyId } : {}),
    role: { $ne: 'Super Admin' }
  });
  console.log('\n--- Active Users count:', activeUsers.length);
  activeUsers.forEach((u, i) => {
    console.log(`[${i+1}] Name: ${u.name}, Status: ${u.status}, Salary Field Type: ${Array.isArray(u.salary) ? 'Array' : typeof u.salary}, Salary Raw:`, u.salary);
  });

  mongoose.connection.close();
}

test().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
