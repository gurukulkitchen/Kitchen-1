import mongoose from 'mongoose';

const EventPlanSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Please provide an event date']
    },
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    rasoiName: String, // Cached name for quick display
    counts: {
        students: { type: Number, default: 0 },
        haribhakts: { type: Number, default: 0 },
        vvip: { type: Number, default: 0 },
        others: { type: Number, default: 0 }
    },
    totalPersons: {
        type: Number,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

export default mongoose.models.EventPlan || mongoose.model('EventPlan', EventPlanSchema);
