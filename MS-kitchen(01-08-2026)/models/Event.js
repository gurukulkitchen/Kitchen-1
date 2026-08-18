import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide an event name'],
        trim: true,
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }
}, { timestamps: true });

// Compound index for multi-tenancy
EventSchema.index({ name: 1, companyId: 1 }, { unique: true });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
