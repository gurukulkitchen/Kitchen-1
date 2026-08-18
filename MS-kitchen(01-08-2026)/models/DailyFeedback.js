import mongoose from 'mongoose';

const DailyFeedbackSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    mealType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealType',
        required: true,
    },
    studentCount: {
        type: Number,
        required: true,
    },
    menuName: {
        type: String,
        required: true,
    },
    ratings: [{
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PeopleCategory',
        },
        rating: {
            type: Number,
            default: 0,
        },
        narration: {
            type: String,
            default: "",
        },
    }],
    averageRating: {
        type: Number,
        default: 0,
    },
    image: {
        type: String, // Path to the uploaded dish image
        default: null,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    narration: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// Compound index to ensure one feedback per meal type per date per company
DailyFeedbackSchema.index({ date: 1, mealType: 1, companyId: 1 }, { unique: true });

if (mongoose.models.DailyFeedback) {
    delete mongoose.models.DailyFeedback;
}

export default mongoose.model('DailyFeedback', DailyFeedbackSchema);
