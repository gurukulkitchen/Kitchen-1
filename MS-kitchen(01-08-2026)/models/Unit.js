import mongoose from 'mongoose';

const UnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a unit name'],
        trim: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Compound index to ensure name is unique per company, but allows duplicates across companies
UnitSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.Unit || mongoose.model('Unit', UnitSchema);
