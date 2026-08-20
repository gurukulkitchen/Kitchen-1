module.exports = [
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/image.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function LoginPage() {
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rememberMe, setRememberMe] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Force light mode on login page
        const html = document.documentElement;
        const hadDark = html.classList.contains('dark');
        const prevTheme = html.getAttribute('data-theme');
        if (hadDark) html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
        return ()=>{
            if (hadDark) html.classList.add('dark');
            if (prevTheme) {
                html.setAttribute('data-theme', prevTheme);
            } else {
                html.removeAttribute('data-theme');
            }
        };
    }, []);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('companyName', data.companyName);
                if (data.companyId) {
                    localStorage.setItem('companyId', data.companyId);
                    localStorage.setItem('selectedCompanyId', data.companyId);
                }
                if (data.assignedCompanies) {
                    localStorage.setItem('assignedCompanies', JSON.stringify(data.assignedCompanies));
                }
                if (data.id) localStorage.setItem('id', data.id);
                if (data.name) localStorage.setItem('name', data.name);
                localStorage.setItem('user', JSON.stringify({
                    id: data.id,
                    name: data.name,
                    role: data.role,
                    companyId: data.companyId,
                    company: data.companyId,
                    assignedCompanies: data.assignedCompanies || []
                }));
                if (data.loginStartTime && data.loginEndTime) {
                    localStorage.setItem('loginStartTime', data.loginStartTime);
                    localStorage.setItem('loginEndTime', data.loginEndTime);
                } else {
                    localStorage.removeItem('loginStartTime');
                    localStorage.removeItem('loginEndTime');
                }
                try {
                    const routeRes = await fetch('/api/auth/initial-route');
                    if (routeRes.ok) {
                        const routeData = await routeRes.json();
                        router.push(routeData.initialRoute || '/dashboard');
                    } else {
                        router.push('/dashboard');
                    }
                } catch (routeErr) {
                    console.error("Failed to determine initial route", routeErr);
                    router.push('/dashboard');
                }
            } else {
                const data = await res.json();
                setError(data.message || 'Verification failed. Please check credentials.');
            }
        } catch (err) {
            setError('System synchronization error. Please try again.');
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
          #login-page-root input[type="text"] {
            background-color: transparent !important;
            color: #222 !important;
          }
          #login-page-root input[type="password"] {
            background-color: transparent !important;
            color: transparent !important;
            -webkit-text-fill-color: transparent !important;
          }
          
          /* Autofill Overrides */
          #login-page-root input:-webkit-autofill,
          #login-page-root input:-webkit-autofill:hover, 
          #login-page-root input:-webkit-autofill:focus, 
          #login-page-root input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px white inset !important;
            -webkit-text-fill-color: #8F2B1B !important;
          }

          #login-page-root input[type="password"]:-webkit-autofill,
          #login-page-root input[type="password"]:-webkit-autofill:hover, 
          #login-page-root input[type="password"]:-webkit-autofill:focus, 
          #login-page-root input[type="password"]:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px white inset !important;
            -webkit-text-fill-color: transparent !important;
          }

          #login-page-root button[type="submit"] {
            background: linear-gradient(to right, #8F2B1B, #CB5A2B) !important;
            background-image: linear-gradient(to right, #8F2B1B, #CB5A2B) !important;
          }
          #login-page-root label {
            color: #999 !important;
            font-style: italic !important;
          }
          #login-page-root .brand-footer-text {
            font-family: 'ZapfHumnst-BT-Bold' !important;
            font-variant: small-caps !important;
            letter-spacing: 1.5px !important;
            text-align: center !important;
            position: relative !important;
            z-index: 10 !important;
            display: block !important;
          }
        `
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                lineNumber: 107,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                id: "login-page-root",
                style: {
                    minHeight: '100vh',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundImage: "url('/uploads/login_bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(95, 34, 15, 0.55)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                        lineNumber: 167,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'relative',
                            zIndex: 10,
                            marginLeft: '170px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    src: "/uploads/Tulsi 1 (1).png",
                                    alt: "",
                                    width: 75,
                                    height: 75,
                                    style: {
                                        position: 'absolute',
                                        right: '-25px',
                                        bottom: '105px',
                                        zIndex: 20
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                    lineNumber: 177,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: "relative",
                                        width: "340px",
                                        height: "520px"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: "absolute",
                                                top: "25px",
                                                left: "-20px",
                                                width: "90%",
                                                height: "95%",
                                                border: "1.5px solid rgba(255,255,255,0.35)",
                                                borderRadius: "24px",
                                                zIndex: 1
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                            lineNumber: 197,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: "relative",
                                                width: "320px",
                                                height: "500px",
                                                background: "rgba(255,255,255,0.97)",
                                                borderRadius: "18px",
                                                boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
                                                overflow: "hidden",
                                                zIndex: 2
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    src: "/uploads/Vector.png",
                                                    alt: "",
                                                    fill: true,
                                                    style: {
                                                        objectFit: 'cover',
                                                        opacity: 1,
                                                        pointerEvents: 'none'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                    lineNumber: 224,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        position: 'relative',
                                                        zIndex: 10,
                                                        padding: '30px 32px 0 32px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                marginBottom: '12px'
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                src: "/uploads/Untitled-1.png",
                                                                alt: "Logo",
                                                                width: 82,
                                                                height: 82
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                lineNumber: 234,
                                                                columnNumber: 41
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                            lineNumber: 233,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                            style: {
                                                                textAlign: 'center',
                                                                marginTop: '6px',
                                                                marginBottom: '24px',
                                                                color: '#AF4313',
                                                                fontFamily: 'SegoePrint, cursive',
                                                                fontSize: '21px',
                                                                fontWeight: '600',
                                                                lineHeight: 1.2
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '30px',
                                                                        color: 'black'
                                                                    },
                                                                    children: "G"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                    lineNumber: 253,
                                                                    columnNumber: 41
                                                                }, this),
                                                                "urukul ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '30px',
                                                                        color: 'black'
                                                                    },
                                                                    children: "K"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                    lineNumber: 253,
                                                                    columnNumber: 107
                                                                }, this),
                                                                "itchen"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                            lineNumber: 243,
                                                            columnNumber: 37
                                                        }, this),
                                                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                textAlign: 'center',
                                                                color: '#ef4444',
                                                                fontSize: '11px',
                                                                marginBottom: '10px'
                                                            },
                                                            children: error
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                            lineNumber: 258,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                            onSubmit: handleSubmit,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        marginBottom: '20px'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            style: {
                                                                                display: 'block',
                                                                                fontSize: '11px',
                                                                                fontStyle: 'italic',
                                                                                color: '#999',
                                                                                marginBottom: '6px',
                                                                                paddingLeft: '20px'
                                                                            },
                                                                            children: "User ID :"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                            lineNumber: 271,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                position: 'relative'
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    style: {
                                                                                        position: 'absolute',
                                                                                        left: '24px',
                                                                                        top: '50%',
                                                                                        transform: 'translateY(-50%)',
                                                                                        color: '#B1B1B1',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        zIndex: 10
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                        width: "14",
                                                                                        height: "14",
                                                                                        viewBox: "0 0 24 24",
                                                                                        fill: "none",
                                                                                        stroke: "currentColor",
                                                                                        strokeWidth: "2",
                                                                                        strokeLinecap: "round",
                                                                                        strokeLinejoin: "round",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                                lineNumber: 294,
                                                                                                columnNumber: 57
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                                                                cx: "12",
                                                                                                cy: "7",
                                                                                                r: "4"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                                lineNumber: 295,
                                                                                                columnNumber: 57
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                        lineNumber: 293,
                                                                                        columnNumber: 53
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                    lineNumber: 283,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        position: 'relative',
                                                                                        borderRadius: '9999px',
                                                                                        border: '2px solid #CB5A2B',
                                                                                        backgroundColor: 'white',
                                                                                        boxShadow: '0 8px 10px #b1b1b1b1',
                                                                                        overflow: 'hidden'
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                        type: "text",
                                                                                        value: email,
                                                                                        onChange: (e)=>setEmail(e.target.value),
                                                                                        required: true,
                                                                                        style: {
                                                                                            width: '100%',
                                                                                            height: '37px',
                                                                                            paddingLeft: '48px',
                                                                                            paddingRight: '16px',
                                                                                            borderRadius: '9999px',
                                                                                            border: 'none',
                                                                                            backgroundColor: 'transparent',
                                                                                            fontSize: '13px',
                                                                                            fontWeight: '600',
                                                                                            caretColor: '#8F2B1B',
                                                                                            outline: 'none',
                                                                                            boxSizing: 'border-box',
                                                                                            display: 'block',
                                                                                            background: 'linear-gradient(to right, #CB5A2B, #8F2B1B)',
                                                                                            WebkitBackgroundClip: 'text',
                                                                                            WebkitTextFillColor: 'transparent'
                                                                                        }
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                        lineNumber: 306,
                                                                                        columnNumber: 53
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                    lineNumber: 298,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                            lineNumber: 281,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                    lineNumber: 270,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        marginBottom: '20px'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            style: {
                                                                                display: 'block',
                                                                                fontSize: '11px',
                                                                                fontStyle: 'italic',
                                                                                color: '#999',
                                                                                marginBottom: '6px',
                                                                                paddingLeft: '20px'
                                                                            },
                                                                            children: "Password :"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                            lineNumber: 336,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                position: 'relative'
                                                                            },
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    style: {
                                                                                        position: 'absolute',
                                                                                        left: '24px',
                                                                                        top: '50%',
                                                                                        transform: 'translateY(-50%)',
                                                                                        color: '#B1B1B1',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        zIndex: 10
                                                                                    },
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                        width: "14",
                                                                                        height: "14",
                                                                                        viewBox: "0 0 24 24",
                                                                                        fill: "none",
                                                                                        stroke: "currentColor",
                                                                                        strokeWidth: "2",
                                                                                        strokeLinecap: "round",
                                                                                        strokeLinejoin: "round",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                                                                x: "3",
                                                                                                y: "11",
                                                                                                width: "18",
                                                                                                height: "11",
                                                                                                rx: "2",
                                                                                                ry: "2"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                                lineNumber: 360,
                                                                                                columnNumber: 57
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                d: "M7 11V7a5 5 0 0 1 10 0v4"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                                lineNumber: 361,
                                                                                                columnNumber: 57
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                        lineNumber: 359,
                                                                                        columnNumber: 53
                                                                                    }, this)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                    lineNumber: 349,
                                                                                    columnNumber: 49
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    style: {
                                                                                        position: 'relative',
                                                                                        borderRadius: '9999px',
                                                                                        border: '2px solid #CB5A2B',
                                                                                        backgroundColor: 'white',
                                                                                        boxShadow: '0 8px 10px #b1b1b1b1',
                                                                                        overflow: 'hidden'
                                                                                    },
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                            type: "password",
                                                                                            value: password,
                                                                                            onChange: (e)=>setPassword(e.target.value),
                                                                                            required: true,
                                                                                            style: {
                                                                                                width: '100%',
                                                                                                height: '37px',
                                                                                                paddingLeft: '48px',
                                                                                                paddingRight: '16px',
                                                                                                borderRadius: '9999px',
                                                                                                border: 'none',
                                                                                                backgroundColor: 'transparent',
                                                                                                fontFamily: 'monospace',
                                                                                                fontSize: '18px',
                                                                                                letterSpacing: '3px',
                                                                                                color: 'transparent',
                                                                                                caretColor: '#8F2B1B',
                                                                                                outline: 'none',
                                                                                                boxSizing: 'border-box',
                                                                                                display: 'block'
                                                                                            }
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                            lineNumber: 372,
                                                                                            columnNumber: 53
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            style: {
                                                                                                position: 'absolute',
                                                                                                left: 0,
                                                                                                top: 0,
                                                                                                height: '37px',
                                                                                                width: '100%',
                                                                                                paddingLeft: '48px',
                                                                                                paddingRight: '16px',
                                                                                                boxSizing: 'border-box',
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                pointerEvents: 'none',
                                                                                                fontFamily: 'monospace',
                                                                                                fontSize: '18px',
                                                                                                letterSpacing: '3px',
                                                                                                background: 'linear-gradient(to right, #CB5A2B, #8F2B1B)',
                                                                                                WebkitBackgroundClip: 'text',
                                                                                                WebkitTextFillColor: 'transparent',
                                                                                                userSelect: 'none',
                                                                                                overflow: 'hidden',
                                                                                                whiteSpace: 'nowrap'
                                                                                            },
                                                                                            children: '●'.repeat(password.length)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                            lineNumber: 396,
                                                                                            columnNumber: 53
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                    lineNumber: 364,
                                                                                    columnNumber: 49
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                            lineNumber: 347,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                    lineNumber: 335,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    htmlFor: "rememberMe",
                                                                    style: {
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        marginBottom: '22px',
                                                                        cursor: 'pointer',
                                                                        userSelect: 'none',
                                                                        paddingLeft: '20px'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                width: '16px',
                                                                                height: '16px',
                                                                                borderRadius: '4px',
                                                                                border: '2px solid transparent',
                                                                                background: rememberMe ? 'linear-gradient(to right, #8F2B1B, #CB5A2B) border-box' : 'linear-gradient(white, white) padding-box, linear-gradient(to right, #8F2B1B, #CB5A2B) border-box',
                                                                                backgroundOrigin: 'border-box',
                                                                                backgroundClip: 'padding-box, border-box',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                boxSizing: 'border-box'
                                                                            },
                                                                            children: rememberMe && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                width: "10",
                                                                                height: "10",
                                                                                viewBox: "0 0 24 24",
                                                                                fill: "none",
                                                                                stroke: "white",
                                                                                strokeWidth: "3",
                                                                                strokeLinecap: "round",
                                                                                strokeLinejoin: "round",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                                                    points: "20 6 9 17 4 12"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                    lineNumber: 454,
                                                                                    columnNumber: 57
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                                lineNumber: 453,
                                                                                columnNumber: 53
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                            lineNumber: 437,
                                                                            columnNumber: 45
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                fontStyle: 'italic',
                                                                                color: '#9a9a9a'
                                                                            },
                                                                            children: "Remember"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                            lineNumber: 458,
                                                                            columnNumber: 45
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                    lineNumber: 425,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "submit",
                                                                    disabled: loading,
                                                                    style: {
                                                                        width: '100%',
                                                                        height: '42px',
                                                                        borderRadius: '9999px',
                                                                        background: 'linear-gradient(to right, #8F2B1B, #CB5A2B)',
                                                                        color: 'white',
                                                                        fontSize: '14px',
                                                                        fontStyle: 'italic',
                                                                        letterSpacing: '0.5px',
                                                                        border: 'none',
                                                                        cursor: loading ? 'not-allowed' : 'pointer',
                                                                        opacity: loading ? 0.8 : 1,
                                                                        boxShadow: '0 4px 14px rgba(139, 41, 16, 0.55)',
                                                                        transition: 'opacity 0.2s'
                                                                    },
                                                                    children: loading ? "Loading..." : "Log In"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                                    lineNumber: 470,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                            lineNumber: 268,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                    lineNumber: 231,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "brand-footer-text text-[10px] text-center mt-5 font-[700] text-[#B1B1B1] whitespace-nowrap",
                                                    children: "Shree Swaminarayan Gurukul Rajkot Sansthan"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                                    lineNumber: 494,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                            lineNumber: 211,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                    lineNumber: 189,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        bottom: '-30px',
                                        fontSize: '10px',
                                        color: 'white',
                                        whiteSpace: 'nowrap',
                                        fontWeight: '500',
                                        letterSpacing: '0.05em'
                                    },
                                    className: "brand-footer-text"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                                    lineNumber: 500,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                            lineNumber: 175,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                        lineNumber: 174,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/app/login/page.js",
                lineNumber: 153,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=Downloads_MS-kitchen%2801-08-2026%29_MS-kitchen%2801-08-2026%29_app_login_page_c3dba675.js.map