import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        // Password is not strictly required if noLogin is true
    },
    noLogin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true,
        default: 'Staff',
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    assignedCompanies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    }],
    name: {
        type: String,
        default: 'User'
    },
    phone: {
        type: String,
        default: ''
    },
    phone2: {
        type: String,
        default: ''
    },
    employeeId: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    avatar: {
        type: String,
        default: ''
    },
    // Staff specific fields
    position: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    dob: {
        type: Date,
        default: null
    },
    salary: [{
        month: String, // format: "YYYY-MM"
        amount: Number,
        status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
        paymentDate: Date,
        remarks: String
    }],
    joinDate: {
        type: Date,
        default: Date.now
    },
    advances: [{
        advanceType: String, // GIVE or BACK
        amount: Number,
        date: Date,
        reason: String,
        paidBy: String,
        paymentType: String,
        status: { type: String, default: 'Pending' },
        receiptUrl: String
    }],
    // New Staff Fields
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
    },
    cast: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    aadharNo: {
        type: String,
        default: ''
    },
    aadharPhoto: {
        type: String,
        default: ''
    },
    dateOfJoining: {
        type: Date,
        default: null
    },
    dateOfLeave: {
        type: Date,
        default: null
    },
    narration: {
        type: String,
        default: ''
    },
    fcmToken: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Force delete model to ensure schema updates are applied in dev mode
if (mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
