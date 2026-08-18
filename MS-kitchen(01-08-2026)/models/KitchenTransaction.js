import mongoose from 'mongoose';

const KitchenTransactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'KitchenItem', required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },

    // For Stock IN
    rate: { type: Number },
    gstRate: { type: Number, default: 0 },
    gstAmount: { type: Number },
    discount: { type: Number, default: 0 },
    mrp: { type: Number },
    totalAmount: { type: Number },
    vendor: { type: String },
    subType: { type: mongoose.Schema.Types.ObjectId, ref: 'LogCategory' }, // e.g., 'PURCHASE', 'DONATION', 'AASHRAM' (from Excel 'TYPE' column)
    remainingQuantity: { type: Number }, // For tracking batch stock

    // For Stock OUT
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // e.g., 'Brackfast', 'Lunch' (from Excel 'TO' column)
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // e.g., 'Regular', 'Anandotsav'
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'KitchenTransaction' }, // Link to source batch

    narration: { type: String },

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    billPath: { type: String, required: false }, // Path to uploaded bill image/file
    billName: { type: String }, // Custom display name for the bill document
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String }
}, { timestamps: true });

// Force recompilation in dev to pick up schema changes
if (process.env.NODE_ENV !== 'production') delete mongoose.models.KitchenTransaction;
export default mongoose.models.KitchenTransaction || mongoose.model('KitchenTransaction', KitchenTransactionSchema);
