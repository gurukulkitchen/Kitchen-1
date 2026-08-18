import mongoose from 'mongoose';

const KitchenItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // e.g., 'ANAJ', 'MASALA'
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true }, // e.g., 'kg', 'L'
    alertLow: { type: Number, default: 0 }, // For Yellow alert
    alertCritical: { type: Number, default: 0 }, // For Red alert
    currentStock: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }, // GST Percentage
    mrp: { type: Number, default: 0 }, // Maximum Retail Price
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // Optional multi-tenancy support
    image: { type: String }, // Path to item image
    note: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String }
}, { timestamps: true });

// Prevent duplicate names in same category
KitchenItemSchema.index({ name: 1, category: 1, companyId: 1 }, { unique: true });

// Force recompilation in dev to pick up schema changes
if (process.env.NODE_ENV !== 'production') delete mongoose.models.KitchenItem;
export default mongoose.models.KitchenItem || mongoose.model('KitchenItem', KitchenItemSchema);
