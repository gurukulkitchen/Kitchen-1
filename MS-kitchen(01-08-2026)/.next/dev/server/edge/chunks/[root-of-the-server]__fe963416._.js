(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__fe963416._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/middleware.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/jose/dist/webapi/jwt/verify.js [middleware-edge] (ecmascript)");
;
;
async function middleware(req) {
    const token = req.cookies.get('auth_token')?.value;
    const pathname = req.nextUrl.pathname;
    // Check for protected routes
    if (pathname.startsWith('/super-admin') || pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
        if (!token) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
        }
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
            const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwtVerify"])(token, secret);
            // Super Admin Route Protection
            if (pathname.startsWith('/super-admin') && payload.role !== 'Super Admin') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
            }
            // Admin Route Protection
            if (pathname.startsWith('/admin') && payload.role !== 'Admin' && payload.role !== 'Super Admin') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
            }
        } catch (error) {
            console.error('Middleware token verification failed:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
        }
    }
    // Redirect root to dashboard if logged in
    if (pathname === '/') {
        if (token) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/dashboard', req.url));
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/super-admin/:path*',
        '/admin/:path*',
        '/dashboard/:path*',
        '/profile/:path*',
        '/'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__fe963416._.js.map