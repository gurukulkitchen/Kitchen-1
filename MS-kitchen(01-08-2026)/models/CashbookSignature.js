import mongoose from 'mongoose';

const CashbookSignatureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Signature name is required'],
        trim: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
}, { timestamps: true });

// Unique per company
CashbookSignatureSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.CashbookSignature || mongoose.model('CashbookSignature', CashbookSignatureSchema);
