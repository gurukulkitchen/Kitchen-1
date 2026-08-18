import mongoose from 'mongoose';

const LogCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production') delete mongoose.models.LogCategory;
export default mongoose.models.LogCategory || mongoose.model('LogCategory', LogCategorySchema);
