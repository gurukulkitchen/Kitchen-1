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

async function test() {
  await dbConnect();
  console.log('Database connected!');

  const db = mongoose.connection.db;
  const rawUsers = await db.collection('users').find({}).toArray();

  console.log('Raw users in DB count:', rawUsers.length);
  rawUsers.forEach((u, idx) => {
    console.log(`[${idx + 1}] Name: ${u.name}, Status: ${u.status}, Role: ${u.role}, Company: ${u.companyId}`);
    console.log('Raw salary field:', JSON.stringify(u.salary));
    console.log('Raw advances field:', JSON.stringify(u.advances));
    console.log('All fields:', Object.keys(u));
    console.log('--------------------------------------------------');
  });

  mongoose.connection.close();
}

test().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
