import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        trim: true,
    },
    section: {
        type: String,
        enum: ['general', 'veg-fruits', 'dairy'],
        default: 'general'
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true // Optional for now to not break existing data immediately, but good practice
    }
}, { timestamps: true });

// Compound index for multi-tenancy
CategorySchema.index({ name: 1, companyId: 1 }, { unique: true });

// Force recompilation in dev to pick up schema changes
if (process.env.NODE_ENV !== 'production') delete mongoose.models.Category;
export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
