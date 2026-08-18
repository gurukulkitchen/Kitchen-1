import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: false,
    },
    action: {
        type: String,
        required: true,
    },
    details: {
        type: Object,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    method: {
        type: String,
    },
    route: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5184000,
    },
});

if (process.env.NODE_ENV !== 'production' && mongoose.models.ActivityLog) {
    delete mongoose.models.ActivityLog;
}

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);