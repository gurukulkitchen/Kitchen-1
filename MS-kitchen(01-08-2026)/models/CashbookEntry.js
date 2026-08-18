import mongoose from 'mongoose';

const CashbookEntrySchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CashbookVendor',
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    time: {
        type: String, // HH:MM AM/PM or HH:MM
        required: true,
    },
    detail: {
        type: String,
        trim: true,
    },
    modeOfPayment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMode',
        required: true, // Cash, UPI, etc.
    },
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    bills: {
        type: [String], // Array of URLs or file names
        default: [],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CashbookCategory',
    },
    signatureName: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    lockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

// Force model recompilation if needed
if (mongoose.models.CashbookEntry) {
    delete mongoose.models.CashbookEntry;
}
export default mongoose.model('CashbookEntry', CashbookEntrySchema);
