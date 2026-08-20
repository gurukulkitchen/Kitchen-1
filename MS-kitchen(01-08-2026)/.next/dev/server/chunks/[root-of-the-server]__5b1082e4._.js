module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/lib/db.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/mongoose)");
;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}
let cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose;
if (!cached) {
    cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose = {
        conn: null,
        promise: null
    };
}
async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000
        };
        cached.promise = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].connect(MONGODB_URI, opts).then((mongoose)=>{
            return mongoose;
        });
        console.log("MongoDB connected successfully");
    }
    try {
        cached.conn = await cached.promise;
        console.log("MongoDB connected successfully");
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
const __TURBOPACK__default__export__ = dbConnect;
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/models/Company.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/mongoose)");
;
const CompanySchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].Schema({
    name: {
        type: String,
        required: true
    },
    shortName: {
        type: String,
        default: ''
    },
    code: {
        type: String,
        default: ''
    },
    address: {
        type: String
    },
    mobileNumber: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: [
            'active',
            'inactive'
        ],
        default: 'active'
    },
    loginStartTime: {
        type: String,
        default: ''
    },
    loginEndTime: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});
// Prevent Mongoose OverwriteModelError
if (__TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].models.Company) {
    delete __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].models.Company;
}
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].model('Company', CompanySchema);
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/models/User.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/mongoose)");
;
const UserSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].Schema({
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },
    noLogin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true,
        default: 'Staff'
    },
    companyId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].Schema.Types.ObjectId,
        ref: 'Company'
    },
    assignedCompanies: [
        {
            type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].Schema.Types.ObjectId,
            ref: 'Company'
        }
    ],
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
        enum: [
            'Active',
            'Inactive',
            'Suspended'
        ],
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
        enum: [
            'Male',
            'Female',
            'Other'
        ],
        default: 'Male'
    },
    dob: {
        type: Date,
        default: null
    },
    salary: [
        {
            month: String,
            amount: Number,
            status: {
                type: String,
                enum: [
                    'Paid',
                    'Pending'
                ],
                default: 'Pending'
            },
            paymentDate: Date,
            remarks: String
        }
    ],
    joinDate: {
        type: Date,
        default: Date.now
    },
    advances: [
        {
            advanceType: String,
            amount: Number,
            date: Date,
            reason: String,
            paidBy: String,
            paymentType: String,
            status: {
                type: String,
                default: 'Pending'
            },
            receiptUrl: String
        }
    ],
    // New Staff Fields
    roleId: {
        type: __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].Schema.Types.ObjectId,
        ref: 'Role'
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
}, {
    timestamps: true
});
// Force delete model to ensure schema updates are applied in dev mode
if (__TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].models.User) {
    delete __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].models.User;
}
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$mongoose$29$__["default"].model('User', UserSchema);
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/api/companies/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/lib/db.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$models$2f$Company$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/models/Company.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$models$2f$User$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/models/User.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/server.js [app-route] (ecmascript)");
;
;
;
;
;
async function GET() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    try {
        const companies = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$models$2f$Company$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].find({}).sort({
            createdAt: -1
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(companies);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
async function POST(req) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    try {
        const { name, shortName, code, address, mobileNumber, loginStartTime, loginEndTime } = await req.json();
        if (!name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Branch Name is required'
            }, {
                status: 400
            });
        }
        // Create Company
        const company = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$models$2f$Company$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create({
            name,
            shortName,
            code,
            address,
            mobileNumber,
            loginStartTime,
            loginEndTime
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(company, {
            status: 201
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
async function PUT(req) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    try {
        const { id, name, shortName, code, address, mobileNumber, loginStartTime, loginEndTime, status } = await req.json();
        if (!id || !name) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Company ID and Name are required'
            }, {
                status: 400
            });
        }
        const updatedCompany = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$models$2f$Company$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findByIdAndUpdate(id, {
            name,
            shortName,
            code,
            address,
            mobileNumber,
            loginStartTime,
            loginEndTime,
            status
        }, {
            new: true,
            runValidators: true
        });
        if (!updatedCompany) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Company not found'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(updatedCompany);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
async function DELETE(req) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$lib$2f$db$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'ID required'
            }, {
                status: 400
            });
        }
        const deletedCompany = await __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$models$2f$Company$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].findByIdAndDelete(id);
        if (!deletedCompany) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: 'Branch not found'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: 'Branch deleted successfully'
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5b1082e4._.js.map