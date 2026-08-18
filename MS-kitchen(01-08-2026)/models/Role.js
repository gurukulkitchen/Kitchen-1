import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    isSystem: {
        type: Boolean,
        default: false, // System roles (like Super Admin) cannot be deleted
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
}, { timestamps: true });

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);
