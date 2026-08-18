import mongoose from 'mongoose';

const DonationEventTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

export default mongoose.models.DonationEventType || mongoose.model('DonationEventType', DonationEventTypeSchema);
