import mongoose from 'mongoose';

const CleaningAreaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

// Compound index to ensure unique area names per company
CleaningAreaSchema.index({ name: 1, companyId: 1 }, { unique: true });

if (mongoose.models.CleaningArea) {
    delete mongoose.models.CleaningArea;
}

export default mongoose.models.CleaningArea || mongoose.model('CleaningArea', CleaningAreaSchema);
