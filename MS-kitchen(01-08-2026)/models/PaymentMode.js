import mongoose from 'mongoose';

const PaymentModeSchema = new mongoose.Schema({
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

export default mongoose.models.PaymentMode || mongoose.model('PaymentMode', PaymentModeSchema);
