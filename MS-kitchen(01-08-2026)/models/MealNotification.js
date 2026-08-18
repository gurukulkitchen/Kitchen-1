import mongoose from 'mongoose';

const MealNotificationSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
    },
    mealType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealType',
        required: true,
    },
    notificationDate: {
        type: String,
        required: true,
        trim: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

MealNotificationSchema.index({ date: 1, mealType: 1, companyId: 1 }, { unique: true });

if (mongoose.models.MealNotification) {
    delete mongoose.models.MealNotification;
}

export default mongoose.model('MealNotification', MealNotificationSchema);
