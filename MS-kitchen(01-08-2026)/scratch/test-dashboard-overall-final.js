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

async function test(targetYear, targetMonth) {
  await dbConnect();

  const companyQuery = { companyId: new mongoose.Types.ObjectId('6989a8017eada5f60f3a7501') };

  const yearStr = String(targetYear);
  const monthStr = String(targetMonth).padStart(2, '0');
  const filterMonthStr = `${targetYear}-${monthStr}`;

  const staffSummaryAgg = await mongoose.connection.db.collection('users').find({
    ...(companyQuery.companyId ? { companyId: companyQuery.companyId } : {}),
    role: { $ne: 'Super Admin' }
  }).toArray();

  console.log(`\n--- TRACE FOR ${filterMonthStr} ---`);
  let totalStaff = 0;
  let activeStaff = 0;
  let totalSalary = 0;

  staffSummaryAgg.forEach(u => {
    totalStaff++;
    if (u.status === 'Active') {
      activeStaff++;
      
      let uSalary = 0;
      if (typeof u.salary === 'number') {
        uSalary = u.salary;
        totalSalary += uSalary;
        console.log(`Name: ${u.name}, Type: Number, Raw: ${u.salary}, Selected Month Salary: ${uSalary}`);
      } else if (Array.isArray(u.salary)) {
        const sortedHistory = [...u.salary]
          .filter(sal => sal && typeof sal === 'object' && sal.month)
          .sort((a, b) => a.month.localeCompare(b.month));
          
        const exactRecord = sortedHistory.find(sal => sal.month === filterMonthStr);
        const effectiveSalaryRecord = exactRecord || (sortedHistory.length > 0 ? sortedHistory[0] : null);
          
        if (effectiveSalaryRecord) {
          uSalary = effectiveSalaryRecord.amount || 0;
          totalSalary += uSalary;
        }
        console.log(`Name: ${u.name}, Type: Array, Selected Record: ${JSON.stringify(effectiveSalaryRecord)}, Selected Month Salary: ${uSalary}`);
      } else {
        console.log(`Name: ${u.name}, Type: Other/Unknown, Selected Month Salary: ${uSalary}`);
      }
    }
  });

  console.log(`Total Salary calculated: ₹ ${totalSalary}`);
  mongoose.connection.close();
}

async function run() {
  await test(2026, 5);
}

run().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
