
import mongoose from 'mongoose';

const MonthlyMenuSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD format
        required: true,
    },
    // Dynamic meal fields stored as a flexible map: { breakfast: "...", snack: "...", customMeal: "..." }
    meals: {
        type: Map,
        of: String,
        default: {},
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Ensure unique menu per date per company
MonthlyMenuSchema.index({ date: 1, companyId: 1 }, { unique: true });

// Prevent overwrite warning if model already exists (development hack)
if (mongoose.models.MonthlyMenu) {
    delete mongoose.models.MonthlyMenu;
}

export default mongoose.model('MonthlyMenu', MonthlyMenuSchema);
