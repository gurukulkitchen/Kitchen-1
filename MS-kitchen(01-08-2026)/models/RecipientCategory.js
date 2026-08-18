import mongoose from 'mongoose';

const RecipientCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Compound index to ensure unique category names per company
RecipientCategorySchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.RecipientCategory || mongoose.model('RecipientCategory', RecipientCategorySchema);
