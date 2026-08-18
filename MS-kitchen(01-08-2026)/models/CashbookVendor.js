import mongoose from 'mongoose';

const CashbookVendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        default: "",
    },
    type: {
        type: String,
        default: "Vendor", // Vendor, Supplier, Customer, Other
        trim: true,
    },
    color: {
        type: String,
        default: "bg-orange-500",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

// Force model recompilation if needed
if (mongoose.models.CashbookVendor) {
    delete mongoose.models.CashbookVendor;
}

export default mongoose.models.CashbookVendor || mongoose.model('CashbookVendor', CashbookVendorSchema);
