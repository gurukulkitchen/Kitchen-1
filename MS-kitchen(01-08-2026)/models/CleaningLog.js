// import mongoose from 'mongoose';

// const CleaningLogSchema = new mongoose.Schema({
//     date: {
//         type: String, // YYYY-MM-DD
//         required: true,
//     },
//     companyId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//     },
//     // Store simple status map: areaId -> boolean
//     // Or array of objects. Let's use flexible map for easier querying/updates if needed, 
//     // but array is better for preserving historical area names if they get deleted?
//     // Let's stick to the plan: Array of { areaId, areaName, status } to preserve history.
//     logs: [{
//         areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'CleaningArea' },
//         areaName: String, // Snapshot of name in case it changes/deletes
//         status: { type: Boolean, default: false }
//     }],
//     note: {
//         type: String,
//         default: ''
//     }
// }, { timestamps: true });

// // Compound index: One log per date per company
// CleaningLogSchema.index({ date: 1, companyId: 1 }, { unique: true });

// if (mongoose.models.CleaningLog) {
//     delete mongoose.models.CleaningLog;
// }

// export default mongoose.models.CleaningLog || mongoose.model('CleaningLog', CleaningLogSchema);


import mongoose from 'mongoose';

const CleaningLogSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    logs: [{
        areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'CleaningArea' },
        areaName: String, 
        status: { 
            type: Number, // CHANGED: Boolean to Number
            default: 0    // 0 = Pending, 1 = Half, 2 = Completed
        }
    }],
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

CleaningLogSchema.index({ date: 1, companyId: 1 }, { unique: true });

if (mongoose.models.CleaningLog) {
    delete mongoose.models.CleaningLog;
}

export default mongoose.models.CleaningLog || mongoose.model('CleaningLog', CleaningLogSchema);