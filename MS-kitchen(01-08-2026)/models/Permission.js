import mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        // enum: ['Staff', 'Admin'], // Removed for dynamic roles
    },
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true,
    },
    read: { type: Boolean, default: false },
    write: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    mrp: { type: Boolean, default: false },
    source: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index to ensure unique role-menu combination
PermissionSchema.index({ role: 1, menuId: 1 }, { unique: true });

// Force recompilation if schema changed
if (mongoose.models.Permission) {
    delete mongoose.models.Permission;
}

export default mongoose.models.Permission || mongoose.model('Permission', PermissionSchema);
