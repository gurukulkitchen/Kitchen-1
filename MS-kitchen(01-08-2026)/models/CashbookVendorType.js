import mongoose from 'mongoose';

const CashbookVendorTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

CashbookVendorTypeSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.CashbookVendorType || mongoose.model('CashbookVendorType', CashbookVendorTypeSchema);
