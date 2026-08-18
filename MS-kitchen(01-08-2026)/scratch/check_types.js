const mongoose = require('mongoose');

const CashbookVendorTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

const CashbookVendorType = mongoose.models.CashbookVendorType || mongoose.model('CashbookVendorType', CashbookVendorTypeSchema);

async function check() {
    await mongoose.connect('mongodb://localhost:27017/ms-kitchen'); // Adjust if needed
    const types = await CashbookVendorType.find({});
    console.log('Existing types:', types);
    process.exit();
}

check().catch(console.error);
