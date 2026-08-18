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

async function testForMonth(year, month) {
  const companyQuery = { companyId: new mongoose.Types.ObjectId('6989a8017eada5f60f3a7501') };
  const targetYear = year;
  const targetMonth = month;
  const filterMonthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  const db = mongoose.connection.db;
  const rawUsers = await db.collection('users').find({
    ...(companyQuery.companyId ? { companyId: companyQuery.companyId } : {}),
    role: { $ne: 'Super Admin' }
  }).toArray();

  let totalStaff = 0;
  let activeStaff = 0;
  let totalSalary = 0;
  let totalAdvanceDue = 0;

  rawUsers.forEach(u => {
    totalStaff++;
    if (u.status === 'Active') {
      activeStaff++;
      
      // Calculate salary for this active staff for the target month
      if (typeof u.salary === 'number') {
        totalSalary += u.salary;
      } else if (Array.isArray(u.salary)) {
        // Carry Forward Logic: Find the latest salary record that is <= filterMonthStr
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

    // Calculate advance due (pending advances)
    const advances = u.advances || [];
    advances.forEach(adv => {
      if (adv.status === 'Pending') {
        totalAdvanceDue += adv.amount || 0;
      }
    });
  });

  console.log(`\n================= RAW RESULTS FOR ${filterMonthStr} =================`);
  console.log('--- Staff Stats ---');
  console.log(`Total Staff: ${totalStaff}`);
  console.log(`Active Staff: ${activeStaff}`);
  console.log(`Estim. Monthly Salary: ₹ ${totalSalary}`);
  console.log(`Total Advance Outstanding: ₹ ${totalAdvanceDue}`);
}

async function run() {
  await dbConnect();
  console.log('Database connected!');

  // Test for May 2026 (should be 65000 + 5000 = 70000)
  await testForMonth(2026, 5);

  // Test for March 2026 (should be 65000 + 3000 = 68000)
  await testForMonth(2026, 3);

  mongoose.connection.close();
}

run().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
