import mongoose from 'mongoose';

const PeopleCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        default: 'Users',
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.PeopleCategory || mongoose.model('PeopleCategory', PeopleCategorySchema);
