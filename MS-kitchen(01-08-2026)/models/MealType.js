import mongoose from 'mongoose';

const MealTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
}, { timestamps: true });

MealTypeSchema.index({ name: 1, companyId: 1 }, { unique: true });

if (mongoose.models.MealType) {
    delete mongoose.models.MealType;
}

export default mongoose.model('MealType', MealTypeSchema);
