import mongoose from 'mongoose';

const StudentCountSchema = new mongoose.Schema({
    month: {
        type: String, // YYYY-MM format
        required: true,
    },
    count: {
        type: Number,
        required: true,
        default: 0
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Ensure unique count per month per company
StudentCountSchema.index({ month: 1, companyId: 1 }, { unique: true });

// Prevent overwrite warning if model already exists (development hack)
if (mongoose.models.StudentCount) {
    delete mongoose.models.StudentCount;
}

export default mongoose.model('StudentCount', StudentCountSchema);
