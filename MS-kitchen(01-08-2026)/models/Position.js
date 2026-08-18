import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

export default mongoose.models.Position || mongoose.model('Position', PositionSchema);
