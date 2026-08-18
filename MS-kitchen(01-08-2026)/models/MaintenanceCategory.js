import mongoose from 'mongoose';

const MaintenanceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        trim: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
}, { timestamps: true });

// Compound index to ensure unique category names per company
MaintenanceCategorySchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.MaintenanceCategory || mongoose.model('MaintenanceCategory', MaintenanceCategorySchema);
