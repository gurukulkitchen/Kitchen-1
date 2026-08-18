import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
    receiptNo: { type: String, required: true },
    date: { type: Date, required: true },
    phone: { type: String },
    name: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
    panNo: { type: String },
    aadharNo: { type: String },
    email: { type: String },
    amount: { type: Number, required: true },
    donationMode: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMode' },
    chequeNo: { type: String },
    bankName: { type: String },
    notes: { type: String },
    eventType: { type: mongoose.Schema.Types.ObjectId, ref: 'DonationEventType' },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
}, { timestamps: true });

if (mongoose.models.Donation) {
    delete mongoose.models.Donation;
}
export default mongoose.model('Donation', DonationSchema);
