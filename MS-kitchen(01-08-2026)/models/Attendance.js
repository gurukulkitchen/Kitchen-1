import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Half Day', 'Absent', 'Paid Leave', 'Not Set'],
        default: 'Not Set'
    },
    workingHours: {
        type: Number,
        default: 0
    },
    overtime: {
        type: Number,
        default: 0
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Ensure unique attendance per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
