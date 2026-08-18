import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    shortName: {
        type: String,
        default: '',
    },
    code: {
        type: String,
        default: '',
    },
    address: {
        type: String,
    },
    mobileNumber: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    loginStartTime: {
        type: String, // Format "HH:mm"
        default: ''
    },
    loginEndTime: {
        type: String, // Format "HH:mm"
        default: ''
    }
}, { timestamps: true });

// Prevent Mongoose OverwriteModelError
if (mongoose.models.Company) {
    delete mongoose.models.Company;
}

export default mongoose.model('Company', CompanySchema);
