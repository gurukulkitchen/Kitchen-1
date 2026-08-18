import mongoose from 'mongoose';

const AppSettingSchema = new mongoose.Schema({
    loginImage: {
        type: String,
        default: ''
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Prevent Mongoose OverwriteModelError
if (mongoose.models.AppSetting) {
    delete mongoose.models.AppSetting;
}

export default mongoose.model('AppSetting', AppSettingSchema);
