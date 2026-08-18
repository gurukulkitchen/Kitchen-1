import mongoose from 'mongoose';

const MaintenanceRecordSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LogCategory',
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceCategory',
    },
    categoryName: {
        type: String,
    },
    narration: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    billPath: {
        type: String, // Path to uploaded file
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    time: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    }
}, { timestamps: true });

export default mongoose.models.MaintenanceRecord || mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);
