import mongoose from 'mongoose';

const RasoiSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    time: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner'],
        required: true
    },
    narration: {
        type: String,
        default: ''
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

export default mongoose.models.Rasoi || mongoose.model('Rasoi', RasoiSchema);
