import mongoose from 'mongoose';

const CashbookCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
}, { timestamps: true });

// Unique per company
CashbookCategorySchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.CashbookCategory || mongoose.model('CashbookCategory', CashbookCategorySchema);
