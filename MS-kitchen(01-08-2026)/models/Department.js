import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a department name'],
        trim: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Compound index for multi-tenancy
DepartmentSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
