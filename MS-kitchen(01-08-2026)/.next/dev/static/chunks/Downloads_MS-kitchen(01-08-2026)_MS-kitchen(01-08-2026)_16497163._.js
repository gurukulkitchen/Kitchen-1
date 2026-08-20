(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/context/CompanyContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompanyProvider",
    ()=>CompanyProvider,
    "useCompany",
    ()=>useCompany
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const CompanyContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])();
function CompanyProvider({ children }) {
    _s();
    const [selectedCompanyIds, setSelectedCompanyIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CompanyProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const stored = localStorage.getItem('selectedCompanyIds');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch (e) {}
            }
            const single = localStorage.getItem('selectedCompanyId');
            return single ? [
                single
            ] : [];
        }
    }["CompanyProvider.useState"]);
    const [assignedCompanies, setAssignedCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CompanyProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const stored = localStorage.getItem('assignedCompanies');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    return [];
                }
            }
            return [];
        }
    }["CompanyProvider.useState"]);
    const [companyName, setCompanyName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CompanyProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('companyName') || 'All Assigned Companies';
        }
    }["CompanyProvider.useState"]);
    const [companyAddress, setCompanyAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CompanyProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('companyAddress') || '';
        }
    }["CompanyProvider.useState"]);
    const [companyPhone, setCompanyPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CompanyProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('companyPhone') || '';
        }
    }["CompanyProvider.useState"]);
    const hasInitializedSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    // Computed states
    const isReadOnly = selectedCompanyIds.length !== 1;
    const syncCompanyName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompanyProvider.useCallback[syncCompanyName]": async (ids)=>{
            if (!ids || ids.length === 0) {
                setCompanyName('All Assigned Companies');
                localStorage.setItem('companyName', 'All Assigned Companies');
                setCompanyAddress('');
                localStorage.removeItem('companyAddress');
                setCompanyPhone('');
                localStorage.removeItem('companyPhone');
                localStorage.removeItem('selectedCompanyId');
                return;
            }
            if (ids.length > 1) {
                try {
                    const res = await fetch('/api/companies');
                    if (res.ok) {
                        const allCompanies = await res.json();
                        const names = ids.map({
                            "CompanyProvider.useCallback[syncCompanyName].names": (id)=>{
                                const comp = allCompanies.find({
                                    "CompanyProvider.useCallback[syncCompanyName].names.comp": (c)=>{
                                        const companyId = String(c?._id?.$oid || c?._id || '');
                                        const targetId = String(id?.$oid || id || '');
                                        return companyId === targetId;
                                    }
                                }["CompanyProvider.useCallback[syncCompanyName].names.comp"]);
                                return comp ? comp.name : null;
                            }
                        }["CompanyProvider.useCallback[syncCompanyName].names"]).filter(Boolean);
                        if (names.length > 0) {
                            const label = names.join(' & ');
                            setCompanyName(label);
                            localStorage.setItem('companyName', label);
                            setCompanyAddress('');
                            localStorage.removeItem('companyAddress');
                            setCompanyPhone('');
                            localStorage.removeItem('companyPhone');
                            localStorage.removeItem('selectedCompanyId');
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch multiple company names:', error);
                }
                const label = `Multiple Companies (${ids.length})`;
                setCompanyName(label);
                localStorage.setItem('companyName', label);
                setCompanyAddress('');
                localStorage.removeItem('companyAddress');
                setCompanyPhone('');
                localStorage.removeItem('companyPhone');
                localStorage.removeItem('selectedCompanyId');
                return;
            }
            const selectedId = ids[0];
            localStorage.setItem('selectedCompanyId', selectedId);
            try {
                const res = await fetch('/api/companies');
                const companies = await res.json();
                const selectedCompany = Array.isArray(companies) ? companies.find({
                    "CompanyProvider.useCallback[syncCompanyName]": (company)=>{
                        const companyId = String(company?._id?.$oid || company?._id || '');
                        const targetId = String(selectedId?.$oid || selectedId || '');
                        return companyId === targetId;
                    }
                }["CompanyProvider.useCallback[syncCompanyName]"]) : null;
                if (selectedCompany?.name) {
                    setCompanyName(selectedCompany.name);
                    localStorage.setItem('companyName', selectedCompany.name);
                    setCompanyAddress(selectedCompany.address || '');
                    localStorage.setItem('companyAddress', selectedCompany.address || '');
                    setCompanyPhone(selectedCompany.mobileNumber || '');
                    localStorage.setItem('companyPhone', selectedCompany.mobileNumber || '');
                    return;
                }
            } catch (error) {
                console.error('Failed to sync selected company name:', error);
            }
            setCompanyName('Selected Company');
            localStorage.setItem('companyName', 'Selected Company');
        }
    }["CompanyProvider.useCallback[syncCompanyName]"], []);
    const updateUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CompanyProvider.useCallback[updateUrl]": (ids)=>{
            const params = new URLSearchParams(searchParams);
            if (ids.length > 0) {
                params.set('companyId', ids.join(','));
            } else {
                params.delete('companyId');
            }
            const nextQuery = params.toString();
            const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
            const currentQuery = searchParams.toString();
            const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
            if (nextUrl !== currentUrl) {
                router.replace(nextUrl);
            }
        }
    }["CompanyProvider.useCallback[updateUrl]"], [
        pathname,
        router,
        searchParams
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompanyProvider.useEffect": ()=>{
            const fetchUserData = {
                "CompanyProvider.useEffect.fetchUserData": async ()=>{
                    try {
                        const res = await fetch('/api/auth/me');
                        if (res.ok) {
                            const data = await res.json();
                            const user = data.user || data;
                            if (user.role === 'Super Admin') {
                                const compRes = await fetch('/api/companies');
                                if (compRes.ok) {
                                    const allComps = await compRes.json();
                                    const companyIds = allComps.map({
                                        "CompanyProvider.useEffect.fetchUserData.companyIds": (c)=>c._id
                                    }["CompanyProvider.useEffect.fetchUserData.companyIds"]);
                                    setAssignedCompanies(companyIds);
                                    localStorage.setItem('assignedCompanies', JSON.stringify(companyIds));
                                }
                            } else if (user.assignedCompanies && user.assignedCompanies.length > 0) {
                                setAssignedCompanies(user.assignedCompanies);
                                localStorage.setItem('assignedCompanies', JSON.stringify(user.assignedCompanies));
                            } else if (user.companyId) {
                                const ids = [
                                    user.companyId
                                ];
                                setAssignedCompanies(ids);
                                localStorage.setItem('assignedCompanies', JSON.stringify(ids));
                            }
                        }
                    } catch (error) {
                        console.error('Failed to fetch user companies:', error);
                    }
                }
            }["CompanyProvider.useEffect.fetchUserData"];
            const isPublicPage = pathname === '/login' || pathname === '/register';
            if (!isPublicPage) {
                fetchUserData();
            }
        }
    }["CompanyProvider.useEffect"], [
        pathname
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompanyProvider.useEffect": ()=>{
            const companyIdsFromUrl = searchParams.get('companyId');
            if (companyIdsFromUrl) {
                const ids = companyIdsFromUrl.split(',').filter(Boolean);
                setSelectedCompanyIds(ids);
            }
            hasInitializedSelection.current = true;
        }
    }["CompanyProvider.useEffect"], [
        searchParams
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompanyProvider.useEffect": ()=>{
            if (!hasInitializedSelection.current) return;
            localStorage.setItem('selectedCompanyIds', JSON.stringify(selectedCompanyIds));
            updateUrl(selectedCompanyIds);
            setTimeout({
                "CompanyProvider.useEffect": ()=>{
                    syncCompanyName(selectedCompanyIds);
                }
            }["CompanyProvider.useEffect"], 0);
        }
    }["CompanyProvider.useEffect"], [
        selectedCompanyIds,
        syncCompanyName,
        updateUrl
    ]);
    // Auto-select if only one company is assigned and no selection is active
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CompanyProvider.useEffect": ()=>{
            if (assignedCompanies.length === 1 && selectedCompanyIds.length === 0 && !searchParams.get('companyId')) {
                const onlyId = (assignedCompanies[0]?.$oid || assignedCompanies[0]).toString();
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedCompanyIds([
                    onlyId
                ]);
            }
        }
    }["CompanyProvider.useEffect"], [
        assignedCompanies,
        selectedCompanyIds,
        searchParams
    ]);
    const toggleCompanyId = (id)=>{
        const targetId = String(id?.$oid || id || '');
        if (!targetId) return;
        setSelectedCompanyIds((prev)=>{
            const stringifiedPrev = prev.map((p)=>String(p?.$oid || p || ''));
            return stringifiedPrev.includes(targetId) ? stringifiedPrev.filter((i)=>i !== targetId) : [
                ...stringifiedPrev,
                targetId
            ];
        });
    };
    const selectSingleCompany = (id)=>{
        const targetId = String(id?.$oid || id || '');
        if (!targetId) {
            setSelectedCompanyIds([]);
            return;
        }
        setSelectedCompanyIds([
            targetId
        ]);
    };
    const selectCompany = (id)=>{
        selectSingleCompany(id);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompanyContext.Provider, {
        value: {
            selectedCompanyId: selectedCompanyIds[0] || '',
            selectedCompanyIds,
            assignedCompanies,
            companyName,
            selectCompany,
            toggleCompanyId,
            selectSingleCompany,
            isReadOnly,
            companyAddress,
            companyPhone
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/context/CompanyContext.js",
        lineNumber: 245,
        columnNumber: 9
    }, this);
}
_s(CompanyProvider, "4CPUZS/9IWHNmXslGi8BUbwA+aY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = CompanyProvider;
function useCompany() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CompanyContext);
}
_s1(useCompany, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "CompanyProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NavItem",
    ()=>NavItem,
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$to$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownToLine$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/arrow-down-to-line.js [app-client] (ecmascript) <export default as ArrowDownToLine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$from$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpFromLine$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/arrow-up-from-line.js [app-client] (ecmascript) <export default as ArrowUpFromLine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2d$crossed$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UtensilsCrossed$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/utensils-crossed.js [app-client] (ecmascript) <export default as UtensilsCrossed>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$milk$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Milk$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/milk.js [app-client] (ecmascript) <export default as Milk>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$context$2f$CompanyContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/context/CompanyContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function Sidebar({ isCollapsed, toggleSidebar }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const isDark = resolvedTheme === "dark";
    const { selectedCompanyIds } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$context$2f$CompanyContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCompany"])();
    const desktopProfileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mobileProfileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Sidebar.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem("role") || null;
        }
    }["Sidebar.useState"]);
    const [userName, setUserName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Sidebar.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem("name") || "My Profile";
        }
    }["Sidebar.useState"]);
    const [avatar, setAvatar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Sidebar.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem("avatar") || null;
        }
    }["Sidebar.useState"]);
    const [menuItems, setMenuItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [expandedMenus, setExpandedMenus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [allCompanies, setAllCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            // Auth check
            const verifyAuth = {
                "Sidebar.useEffect.verifyAuth": async ()=>{
                    try {
                        const res = await fetch("/api/auth/me");
                        if (res.ok) {
                            const data = await res.json();
                            setRole(data.role);
                            setUserName(data.user?.name || "My Profile");
                            setAvatar(data.user?.avatar || null);
                            if (data.role) localStorage.setItem("role", data.role);
                            if (data.user?.name) localStorage.setItem("name", data.user.name);
                            if (data.user?.avatar) localStorage.setItem("avatar", data.user.avatar);
                            else localStorage.removeItem("avatar");
                        } else {
                            setRole("Guest");
                            setUserName("Guest");
                            setAvatar(null);
                        }
                    } catch (error) {
                        console.error("Auth verification failed", error);
                        setRole("Guest");
                        setUserName("Guest");
                    }
                }
            }["Sidebar.useEffect.verifyAuth"];
            verifyAuth();
            // Fetch Menus & Companies
            const fetchMenusAndCompanies = {
                "Sidebar.useEffect.fetchMenusAndCompanies": async ()=>{
                    try {
                        const [menusRes, companiesRes] = await Promise.all([
                            fetch("/api/menus"),
                            fetch("/api/companies")
                        ]);
                        if (menusRes.ok) setMenuItems(await menusRes.json());
                        if (companiesRes.ok) setAllCompanies(await companiesRes.json());
                    } catch (error) {
                        console.error("Failed to fetch menus/companies", error);
                    }
                }
            }["Sidebar.useEffect.fetchMenusAndCompanies"];
            fetchMenusAndCompanies();
        }
    }["Sidebar.useEffect"], []);
    // Fetch Permissions when role changes
    const [permissions, setPermissions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            if (role) {
                const fetchPermissions = {
                    "Sidebar.useEffect.fetchPermissions": async ()=>{
                        try {
                            const res = await fetch(`/api/permissions?role=${role}`);
                            if (res.ok) {
                                const data = await res.json();
                                const permMap = {};
                                data.forEach({
                                    "Sidebar.useEffect.fetchPermissions": (p)=>{
                                        if (p.menuId) {
                                            const mId = p.menuId._id || p.menuId;
                                            permMap[mId] = p;
                                        }
                                    }
                                }["Sidebar.useEffect.fetchPermissions"]);
                                setPermissions(permMap);
                            }
                        } catch (error) {
                            console.error("Failed to fetch permissions", error);
                        }
                    }
                }["Sidebar.useEffect.fetchPermissions"];
                fetchPermissions();
            }
        }
    }["Sidebar.useEffect"], [
        role
    ]);
    const isVisible = (item)=>{
        if (item.route === "/super-admin/settings" || item.label === "Settings") return false;
        if (role === "Super Admin") return true;
        const perm = permissions[item._id];
        if (!perm) return false;
        return perm.read === true;
    };
    const toggleMenu = (label)=>{
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExpandedMenus((prev)=>({
                ...prev,
                [label]: !prev[label]
            }));
    };
    const renderIcon = (iconName, label = "", route = "", className = "")=>{
        const cleanLabel = label ? label.trim().toLowerCase() : "";
        const cleanRoute = route ? route.trim().toLowerCase() : "";
        let svgFile = "";
        if (cleanLabel.includes("dashboard") || cleanRoute === "/dashboard" || cleanRoute === "/") {
            svgFile = "Dashboard.svg";
        } else if (cleanLabel.includes("product data") || cleanRoute === "/inventory") {
            svgFile = "P. Data.svg";
        } else if (cleanLabel.endsWith(" in") || cleanRoute.endsWith("/in")) {
            svgFile = "In.svg";
        } else if (cleanLabel.endsWith(" out") || cleanRoute.endsWith("/out")) {
            svgFile = "Out.svg";
        } else if (cleanLabel.includes("stock data") || cleanLabel.includes("inventory")) {
            svgFile = "Inventory.svg";
        } else if (cleanLabel.includes("veg & fruit")) {
            svgFile = "Veg.svg";
        } else if (cleanLabel.includes("milk & butter.m")) {
            svgFile = "Milk.svg";
        } else if (cleanLabel.includes("daily menu") || cleanRoute === "/daily-menu") {
            svgFile = "review.svg";
        } else if (cleanLabel.includes("monthly menu") || cleanRoute === "/monthly-menu") {
            svgFile = "Monthly.svg";
        } else if (cleanLabel.includes("menu")) {
            svgFile = "Menu.svg";
        } else if (cleanLabel.includes("other exp") || cleanRoute === "/othermaintenance") {
            svgFile = "Other Exp..svg";
        } else if (cleanLabel.includes("cleaning") || cleanRoute === "/cleaning") {
            svgFile = "Cleaning.svg";
        } else if (cleanLabel.includes("recipe") || cleanRoute === "/recipe-qty") {
            svgFile = "Recipe Qty..svg";
        } else if (cleanLabel.includes("attendance") || cleanRoute === "/attendance") {
            svgFile = "Attendance.svg";
        } else if (cleanLabel.includes("staff data") || cleanRoute === "/staff" || cleanLabel.includes("emp. data")) {
            svgFile = "Emp. Data.svg";
        } else if (cleanLabel.includes("employee")) {
            svgFile = "Employee.svg";
        } else if (cleanLabel.includes("donation") || cleanRoute === "/donation") {
            svgFile = "Donations.svg";
        } else if (cleanLabel.includes("cash book") || cleanRoute === "/cashbook") {
            svgFile = "Cash Book.svg";
        } else if (cleanLabel.includes("setting") || cleanRoute === "/admin/settings" || cleanRoute.startsWith("/super-admin")) {
            svgFile = "Vector (1).svg";
        } else if (cleanLabel.includes("activity log") || cleanRoute === "/activity-logs") {
            svgFile = "Activity.svg";
        }
        if (svgFile) {
            const src = `/icons/sidebar/${svgFile}`;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: src,
                className: `w-[18px] h-[18px] min-w-[18px] min-h-[18px] object-contain ${className}`,
                alt: label
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                lineNumber: 190,
                columnNumber: 9
            }, this);
        }
        const IconComponent = {
            LayoutDashboard: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"],
            Package: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
            ArrowDownToLine: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2d$to$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDownToLine$3e$__["ArrowDownToLine"],
            ArrowUpFromLine: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2d$from$2d$line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUpFromLine$3e$__["ArrowUpFromLine"],
            Menu: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"],
            LogOut: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"],
            UtensilsCrossed: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$utensils$2d$crossed$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UtensilsCrossed$3e$__["UtensilsCrossed"],
            Carrot: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
            Settings: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
            Milk: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$milk$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Milk$3e$__["Milk"],
            Activity: __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"]
        }[iconName] || __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComponent, {
            size: 18,
            className: className
        }, void 0, false, {
            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
            lineNumber: 213,
            columnNumber: 12
        }, this);
    };
    // Helper to check if any child is active
    const isParentActive = (item)=>{
        if (!item.children) return false;
        return item.children.some((child)=>child.route === pathname);
    };
    // Auto-expand active parents on load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            const newExpanded = {};
            menuItems.forEach({
                "Sidebar.useEffect": (item)=>{
                    if (item.children && (isParentActive(item) || pathname === '/dashboard' && (item.label === 'Stock Data' || item.label === 'Inventory'))) {
                        newExpanded[item.label] = true;
                    }
                }
            }["Sidebar.useEffect"]);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExpandedMenus({
                "Sidebar.useEffect": (prev)=>({
                        ...prev,
                        ...newExpanded
                    })
            }["Sidebar.useEffect"]);
        }
    }["Sidebar.useEffect"], [
        pathname,
        menuItems
    ]);
    // Profile dropdown handlers removed as profile is moved to Navbar
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMobileMenuOpen(false);
            setIsMobileProfileMenuOpen(false);
        }
    }["Sidebar.useEffect"], [
        pathname
    ]);
    const handleLogout = ()=>{
        // Clear localStorage
        localStorage.clear();
        // Clear all cookies
        document.cookie.split(";").forEach((cookie)=>{
            const name = cookie.split("=")[0].trim();
            document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        });
        // Clear session storage
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.clear();
        }
        // Redirect to login
        window.location.href = "/login";
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: `text-slate-300 px-5 py-6 hidden md:flex flex-col h-screen sticky top-0 font-sans no-scrollbar relative overflow-hidden self-start shadow-xl border-r border-[#D2602D]/20 dark:border-stone-800/60 transition-all duration-300 bg-gradient-to-r from-[#8A281A] to-[#D2602D] dark:bg-gradient-to-b dark:from-[#2D2C2C] dark:to-[#333333] ${isCollapsed ? 'w-0 px-0 opacity-0' : 'w-[280px]'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative z-10 mb-6 mt-2 flex flex-col items-center select-none",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-[64px] h-[64px] relative mb-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "/uploads/Untitled-1.png",
                                    alt: "Gurukul Kitchen",
                                    className: "w-full h-full object-contain",
                                    style: {
                                        filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.65))'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                    lineNumber: 269,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                lineNumber: 268,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-centerleading-none mb-4",
                                style: {
                                    fontFamily: 'SegoePrint, cursive',
                                    fontSize: '18px',
                                    color: 'white'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: '#FF850a',
                                            fontSize: '25px'
                                        },
                                        children: "G"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                        lineNumber: 277,
                                        columnNumber: 13
                                    }, this),
                                    "urukul ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: '#FF850a',
                                            fontSize: '25px'
                                        },
                                        children: "K"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                        lineNumber: 277,
                                        columnNumber: 81
                                    }, this),
                                    "itchen"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                lineNumber: 276,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-[2px] bg-white w-full"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                lineNumber: 279,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                        lineNumber: 267,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "space-y-1 flex-1 overflow-y-auto no-scrollbar relative z-10",
                        children: [
                            (()=>{
                                if (role === "Super Admin" || role === "Developer" || role === "Admin") {
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                        icon: renderIcon("LayoutDashboard", "Dashboard", "/dashboard"),
                                        label: "Dashboard",
                                        href: "/dashboard",
                                        active: pathname === "/dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                        lineNumber: 286,
                                        columnNumber: 17
                                    }, this);
                                }
                                if (menuItems.length === 0) return null;
                                const dashboardMenu = menuItems.find((item)=>item.label === 'Dashboard');
                                if (dashboardMenu) {
                                    const perm = permissions[dashboardMenu._id];
                                    if (!perm || perm.read !== true) return null;
                                } else {
                                    return null;
                                }
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                    icon: renderIcon("LayoutDashboard", "Dashboard", "/dashboard"),
                                    label: "Dashboard",
                                    href: "/dashboard",
                                    active: pathname === "/dashboard"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                    lineNumber: 303,
                                    columnNumber: 15
                                }, this);
                            })(),
                            menuItems.filter((item)=>item.label !== 'Dashboard' && item.route !== '/dashboard').map((item)=>{
                                if (!isVisible(item)) return null;
                                const hasChildren = item.children && item.children.length > 0;
                                const isActive = pathname === item.route;
                                const isExpanded = expandedMenus[item.label];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                    children: [
                                        hasChildren ? (()=>{
                                            const visibleChildren = item.children.filter((child)=>isVisible(child));
                                            if (visibleChildren.length === 0 && item.type === "parent") return null;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-0.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>toggleMenu(item.label),
                                                        className: `
                            flex items-center justify-between px-5 py-2 rounded-[16px] cursor-pointer transition-all select-none group focus:outline-none border
                            ${isExpanded ? "border-transparent text-white" : "border-transparent text-white/90 hover:bg-white/5 hover:text-white"}
                          `,
                                                        style: isExpanded ? isDark ? {
                                                            border: "1.5px solid #D4612D",
                                                            backgroundColor: "rgba(37, 37, 37, 0.6)",
                                                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                                                        } : {
                                                            border: "2.5px solid transparent",
                                                            backgroundImage: "linear-gradient(rgba(122, 43, 14, 0.25), rgba(122, 43, 14, 0.25)), linear-gradient(to right, #882619, #D4612D)",
                                                            backgroundOrigin: "border-box",
                                                            backgroundClip: "padding-box, border-box",
                                                            boxShadow: "inset 0 3px 5px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.2)"
                                                        } : {},
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: `transition-colors shrink-0 ${isExpanded ? "text-white [filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`,
                                                                        children: renderIcon(item.icon, item.label, item.route, item.iconClassName)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                        lineNumber: 349,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: `font-bold text-[14px] ${isExpanded ? "text-white" : "text-white/90 group-hover:text-white"}`,
                                                                        children: item.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                        lineNumber: 352,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                lineNumber: 348,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                width: "10",
                                                                height: "6",
                                                                viewBox: "0 0 10 6",
                                                                fill: "currentColor",
                                                                className: `transform transition-all duration-300 ${isExpanded ? "rotate-0 text-[#F9C8B0]" : "-rotate-90 text-white/80 group-hover:text-white"}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    d: "M0 0 L10 0 L5 6 Z"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                    lineNumber: 363,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                lineNumber: 356,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 327,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-96 opacity-100 mt-2 mb-3" : "max-h-0 opacity-0"}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "pl-8 pr-4 space-y-[4px] py-1 relative",
                                                            children: item.children.map((child, idx)=>{
                                                                if (!isVisible(child)) return null;
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                                                    icon: renderIcon(child.icon, child.label, child.route, child.iconClassName),
                                                                    label: child.label,
                                                                    href: child.route,
                                                                    active: pathname === child.route,
                                                                    isSubItem: true
                                                                }, child._id || idx, false, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                    lineNumber: 379,
                                                                    columnNumber: 33
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                            lineNumber: 372,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 368,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                lineNumber: 326,
                                                columnNumber: 23
                                            }, this);
                                        })() : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                            icon: renderIcon(item.icon, item.label, item.route, item.iconClassName),
                                            label: item.label,
                                            href: item.route,
                                            active: isActive
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                            lineNumber: 395,
                                            columnNumber: 19
                                        }, this),
                                        item.label && item.label.toLowerCase().includes("milk & butter.m") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "my-4 px-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-[1px] bg-[#EA8468] w-full"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                lineNumber: 405,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                            lineNumber: 404,
                                            columnNumber: 19
                                        }, this),
                                        item.label && item.label.toLowerCase() === "employee" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "my-4 px-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-[1px] bg-[#EA8468] w-full"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                lineNumber: 411,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                            lineNumber: 410,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, item._id, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                    lineNumber: 319,
                                    columnNumber: 15
                                }, this);
                            }),
                            (role === "Super Admin" || role === "Admin") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                        icon: renderIcon("Settings", role === "Super Admin" ? "Setting" : "Setting", role === "Super Admin" ? "/super-admin/companies" : "/admin/settings"),
                                        label: role === "Super Admin" ? "Setting" : "Setting",
                                        href: role === "Super Admin" ? "/super-admin/companies" : "/admin/settings",
                                        active: role === "Super Admin" ? pathname.startsWith("/super-admin") : pathname === "/admin/settings"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                        lineNumber: 420,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                        icon: renderIcon("Activity", "Activity Logs", "/activity-logs"),
                                        label: "Activity Logs",
                                        href: "/activity-logs",
                                        active: pathname === "/activity-logs"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                        lineNumber: 426,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "my-4 px-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-[1px] bg-[#EA8468] w-full"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                            lineNumber: 433,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                        lineNumber: 432,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                        lineNumber: 282,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                lineNumber: 263,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setIsMobileMenuOpen(true),
                className: "md:hidden fixed bottom-5 right-4 z-50 w-14 h-14 bg-gradient-to-r from-[#FF7029] to-[#C34C0E] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                    size: 24,
                    strokeWidth: 2.5
                }, void 0, false, {
                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                    lineNumber: 459,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                lineNumber: 454,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isMobileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            onClick: ()=>setIsMobileMenuOpen(false),
                            className: "md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        }, void 0, false, {
                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                            lineNumber: 466,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].aside, {
                            initial: {
                                x: "-100%"
                            },
                            animate: {
                                x: 0
                            },
                            exit: {
                                x: "-100%"
                            },
                            transition: {
                                type: "spring",
                                damping: 25,
                                stiffness: 200
                            },
                            className: "md:hidden fixed left-0 top-0 bottom-0 w-[min(280px,calc(100vw-1rem))] max-w-full text-slate-600 p-5 flex flex-col z-[70] overflow-hidden bg-gradient-to-r from-[#8A281A] to-[#D2602D] dark:bg-gradient-to-b dark:from-[#2D2C2C] dark:to-[#333333]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative z-10 mb-4 flex items-start justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center flex-1 mt-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-[50px] h-[50px] relative mb-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: "/uploads/Untitled-1.png",
                                                        alt: "Gurukul Kitchen",
                                                        className: "w-full h-full object-contain",
                                                        style: {
                                                            filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.35))'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 487,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                    lineNumber: 486,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "text-center font-bold leading-none mb-3",
                                                    style: {
                                                        fontFamily: 'SegoePrint, cursive',
                                                        fontSize: '15px',
                                                        color: 'white'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#FF850a',
                                                                fontSize: '20px'
                                                            },
                                                            children: "G"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                            lineNumber: 495,
                                                            columnNumber: 21
                                                        }, this),
                                                        "urukul ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#FF850a',
                                                                fontSize: '20px'
                                                            },
                                                            children: "K"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                            lineNumber: 495,
                                                            columnNumber: 89
                                                        }, this),
                                                        "itchen"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                    lineNumber: 494,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                            lineNumber: 485,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            className: "p-2 hover:bg-stone-800 rounded-full transition-colors text-slate-700 hover:text-white shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                lineNumber: 502,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                            lineNumber: 498,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                    lineNumber: 484,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-[1px] bg-white/20 w-full mb-4 relative z-10"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                    lineNumber: 505,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                    className: "space-y-2 flex-1 overflow-y-auto no-scrollbar relative z-10",
                                    children: [
                                        (()=>{
                                            if (role === "Super Admin" || role === "Developer") {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: ()=>setIsMobileMenuOpen(false),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                                        icon: renderIcon("LayoutDashboard", "Dashboard", "/dashboard"),
                                                        label: "Dashboard",
                                                        href: "/dashboard",
                                                        active: pathname === "/dashboard"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 512,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                    lineNumber: 511,
                                                    columnNumber: 23
                                                }, this);
                                            }
                                            if (menuItems.length === 0) return null;
                                            const dashboardMenu = menuItems.find((item)=>item.label === 'Dashboard');
                                            if (dashboardMenu) {
                                                const perm = permissions[dashboardMenu._id];
                                                if (!perm || perm.read !== true) return null;
                                            } else {
                                                return null;
                                            }
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                onClick: ()=>setIsMobileMenuOpen(false),
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                                    icon: renderIcon("LayoutDashboard", "Dashboard", "/dashboard"),
                                                    label: "Dashboard",
                                                    href: "/dashboard",
                                                    active: pathname === "/dashboard"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                    lineNumber: 531,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                lineNumber: 530,
                                                columnNumber: 21
                                            }, this);
                                        })(),
                                        menuItems.filter((item)=>item.label !== 'Dashboard' && item.route !== '/dashboard').map((item)=>{
                                            if (!isVisible(item)) return null;
                                            const hasChildren = item.children && item.children.length > 0;
                                            const isActive = pathname === item.route;
                                            const isExpanded = expandedMenus[item.label];
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                                children: [
                                                    hasChildren ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-0.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                onClick: ()=>toggleMenu(item.label),
                                                                className: `
                              flex items-center justify-between px-4 py-3 rounded-[2rem] cursor-pointer transition-all select-none group border
                              ${isExpanded ? "border-transparent text-white" : "border-transparent text-white/90 hover:bg-white/5"}
                            `,
                                                                style: isExpanded ? isDark ? {
                                                                    border: "1.5px solid #D4612D",
                                                                    backgroundColor: "rgba(37, 37, 37, 0.6)",
                                                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                                                                } : {
                                                                    border: "2.5px solid transparent",
                                                                    backgroundImage: "linear-gradient(rgba(122, 43, 14, 0.25), rgba(122, 43, 14, 0.25)), linear-gradient(to right, #882619, #D4612D)",
                                                                    backgroundOrigin: "border-box",
                                                                    backgroundClip: "padding-box, border-box",
                                                                    boxShadow: "inset 0 3px 5px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.2)"
                                                                } : {},
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: `transition-colors shrink-0 ${isExpanded ? "text-white [filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`,
                                                                                children: renderIcon(item.icon, item.label, item.route, item.iconClassName)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                                lineNumber: 573,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `font-bold text-[14px] ${isExpanded ? "text-white" : "text-white/90 group-hover:text-white"}`,
                                                                                children: item.label
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                                lineNumber: 576,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                        lineNumber: 572,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                        width: "10",
                                                                        height: "6",
                                                                        viewBox: "0 0 10 6",
                                                                        fill: "currentColor",
                                                                        className: `transform transition-all duration-300 ${isExpanded ? "rotate-0 text-[#FFB593]" : "-rotate-90 text-white/80 group-hover:text-white"}`,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            d: "M0 0 L10 0 L5 6 Z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                            lineNumber: 587,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                        lineNumber: 580,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                lineNumber: 551,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-96 opacity-100 mt-2 mb-3" : "max-h-0 opacity-0"}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "pl-6 pr-2 space-y-[4px] py-1 relative",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute left-[16px] top-1 bottom-1 w-[2px] bg-stone-800/50 rounded-full"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                            lineNumber: 597,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        item.children.map((child, idx)=>{
                                                                            if (!isVisible(child)) return null;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                onClick: ()=>setIsMobileMenuOpen(false),
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                                                                    icon: renderIcon(child.icon, child.label, child.route, child.iconClassName),
                                                                                    label: child.label,
                                                                                    href: child.route,
                                                                                    active: pathname === child.route,
                                                                                    isSubItem: true
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                                    lineNumber: 604,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            }, child._id || idx, false, {
                                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                                lineNumber: 602,
                                                                                columnNumber: 35
                                                                            }, this);
                                                                        })
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                    lineNumber: 595,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                                lineNumber: 591,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 550,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>setIsMobileMenuOpen(false),
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                                            icon: renderIcon(item.icon, item.label, item.route, item.iconClassName),
                                                            label: item.label,
                                                            href: item.route,
                                                            active: isActive
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                            lineNumber: 620,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 618,
                                                        columnNumber: 25
                                                    }, this),
                                                    item.label && item.label.toLowerCase().includes("milk & butter.m") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "my-6 px-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-[1px] bg-white/20 w-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                            lineNumber: 631,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 630,
                                                        columnNumber: 25
                                                    }, this),
                                                    item.label && item.label.toLowerCase() === "employee" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "my-6 px-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-[1px] bg-white/20 w-full"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                            lineNumber: 637,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 636,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, item._id, true, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                lineNumber: 548,
                                                columnNumber: 21
                                            }, this);
                                        }),
                                        (role === "Super Admin" || role === "Admin") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                                    icon: renderIcon("Settings", role === "Super Admin" ? "Settings" : "Settings", role === "Super Admin" ? "/super-admin/companies" : "/admin/settings"),
                                                    label: role === "Super Admin" ? "Settings" : "Settings",
                                                    href: role === "Super Admin" ? "/super-admin/companies" : "/admin/settings",
                                                    active: role === "Super Admin" ? pathname.startsWith("/super-admin") : pathname === "/admin/settings"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                    lineNumber: 646,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NavItem, {
                                                    icon: renderIcon("Activity", "Activity Logs", "/activity-logs"),
                                                    label: "Activity Logs",
                                                    href: "/activity-logs",
                                                    active: pathname === "/activity-logs"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                    lineNumber: 652,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "my-6 px-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-[1px] bg-white/20 w-full"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                        lineNumber: 659,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                                    lineNumber: 658,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                            lineNumber: 645,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                                    lineNumber: 507,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                            lineNumber: 475,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                lineNumber: 463,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Sidebar, "gIOvXwm+xzt9dtdfgpGLoiN9R88=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$context$2f$CompanyContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCompany"]
    ];
});
_c = Sidebar;
function NavItem({ icon, label, href, active = false, isSubItem = false }) {
    if (isSubItem) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: href || "#",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `
            flex items-center gap-3 px-4 py-2.5 rounded-[16px] cursor-pointer transition-all group relative border
            ${active ? "bg-white text-[#A63D13] border-[#C85A2A] shadow-lg shadow-black/20 dark:bg-gradient-to-r dark:from-[#882619] dark:via-[#AA3A1E] dark:to-[#D4612D] dark:text-white dark:border-[#D4612D] dark:shadow-md" : "border-transparent text-white/90 hover:bg-white/5 hover:text-white"}
          `,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `transition-colors shrink-0 ${active ? "text-[#A63D13] dark:text-white dark:[filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`,
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                        lineNumber: 695,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-[13.5px] leading-tight ${active ? "font-bold text-[#A63D13] dark:text-white" : "font-semibold text-white/90 group-hover:text-white"}`,
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                        lineNumber: 698,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                lineNumber: 686,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
            lineNumber: 685,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href || "#",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `
          flex items-center gap-3 px-5 py-2.5 rounded-[16px] cursor-pointer transition-all group relative border
          ${active ? "bg-white text-[#A63D13] border-[#C85A2A] shadow-lg shadow-black/20 dark:bg-gradient-to-r dark:from-[#882619] dark:via-[#AA3A1E] dark:to-[#D4612D] dark:text-white dark:border-[#D4612D] dark:shadow-md" : "border-transparent text-white/90 hover:bg-white/5"}
        `,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `shrink-0 ${active ? "text-[#A63D13] dark:text-white dark:[filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`,
                    children: icon
                }, void 0, false, {
                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                    lineNumber: 717,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `text-[14px] font-bold ${active ? "text-[#A63D13] dark:text-white" : "text-white"}`,
                    children: label
                }, void 0, false, {
                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
                    lineNumber: 718,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
            lineNumber: 708,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js",
        lineNumber: 707,
        columnNumber: 5
    }, this);
}
_c1 = NavItem;
var _c, _c1;
__turbopack_context__.k.register(_c, "Sidebar");
__turbopack_context__.k.register(_c1, "NavItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ThemeToggle() {
    _s();
    const { theme, setTheme, resolvedTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    const [mounted, setMounted] = __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    // useEffect only runs on the client, so now we can safely show the UI
    __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "ThemeToggle.useEffect": ()=>{
            setMounted(true);
        }
    }["ThemeToggle.useEffect"], []);
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-9 h-9"
        }, void 0, false, {
            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js",
            lineNumber: 18,
            columnNumber: 16
        }, this); // Placeholder to avoid hydration mismatch
    }
    const toggleTheme = ()=>{
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: toggleTheme,
        className: "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 relative overflow-hidden cursor-pointer",
        title: `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
            mode: "wait",
            initial: false,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    y: 20,
                    opacity: 0,
                    rotate: -45
                },
                animate: {
                    y: 0,
                    opacity: 1,
                    rotate: 0
                },
                exit: {
                    y: -20,
                    opacity: 0,
                    rotate: 45
                },
                transition: {
                    duration: 0.2,
                    ease: "easeInOut"
                },
                className: "flex items-center justify-center w-full h-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: "/icons/navbar/dark mode.svg",
                        alt: "Dark Mode",
                        className: "w-5 h-5 object-contain transition-all hover:opacity-70 hover:brightness-125 dark:hidden"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js",
                        lineNumber: 40,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: "/icons/navbar/DarkDark.svg",
                        alt: "Dark Mode",
                        className: "w-5 h-5 object-contain transition-all hover:opacity-70 hover:brightness-125 hidden dark:block"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js",
                        lineNumber: 45,
                        columnNumber: 21
                    }, this)
                ]
            }, resolvedTheme, true, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js",
                lineNumber: 32,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js",
            lineNumber: 31,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js",
        lineNumber: 26,
        columnNumber: 9
    }, this);
}
_s(ThemeToggle, "OPO4/Bwn/B3wErFIC5J6lGmQcgg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = ThemeToggle;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$context$2f$CompanyContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/context/CompanyContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$components$2f$ThemeToggle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeToggle.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function Navbar({ toggleSidebar, isSidebarCollapsed }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mobileCompanyDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mobileProfileDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mobileProfileButtonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { selectedCompanyIds, assignedCompanies, toggleCompanyId, companyName } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$context$2f$CompanyContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCompany"])();
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMobileCompanyDropdownOpen, setIsMobileCompanyDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMobileProfileOpen, setIsMobileProfileOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [allCompanies, setAllCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [menuItems, setMenuItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userName, setUserName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Navbar.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('name') || '';
        }
    }["Navbar.useState"]);
    const [userRole, setUserRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Navbar.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('role') || '';
        }
    }["Navbar.useState"]);
    const [avatar, setAvatar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Navbar.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('avatar') || null;
        }
    }["Navbar.useState"]);
    const [isFullScreen, setIsFullScreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const notifDropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            const fetchNavbarData = {
                "Navbar.useEffect.fetchNavbarData": async ()=>{
                    try {
                        const [companiesRes, menusRes, authRes] = await Promise.all([
                            fetch('/api/companies'),
                            fetch('/api/menus'),
                            fetch('/api/auth/me')
                        ]);
                        if (companiesRes.ok) setAllCompanies(await companiesRes.json());
                        if (menusRes.ok) setMenuItems(await menusRes.json());
                        if (authRes.ok) {
                            const authData = await authRes.json();
                            const user = authData.user || authData;
                            setUserName(user.name || user.username || 'User');
                            setUserRole(user.role || '');
                            const fetchedAvatar = user.avatar || user.profileImage || user.image || null;
                            if (fetchedAvatar) {
                                setAvatar(fetchedAvatar);
                                localStorage.setItem('avatar', fetchedAvatar);
                            } else {
                                const localAv = localStorage.getItem('avatar');
                                if (localAv) setAvatar(localAv);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to fetch navbar data:', error);
                    }
                }
            }["Navbar.useEffect.fetchNavbarData"];
            fetchNavbarData();
            const handleClickOutside = {
                "Navbar.useEffect.handleClickOutside": (event)=>{
                    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                        setIsCompanyDropdownOpen(false);
                    }
                    if (mobileCompanyDropdownRef.current && !mobileCompanyDropdownRef.current.contains(event.target)) {
                        setIsMobileCompanyDropdownOpen(false);
                    }
                    if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                        setIsNotifDropdownOpen(false);
                    }
                    if (mobileProfileDropdownRef.current && !mobileProfileDropdownRef.current.contains(event.target)) {
                        if (mobileProfileButtonRef.current && !mobileProfileButtonRef.current.contains(event.target)) {
                            setIsMobileProfileOpen(false);
                        }
                    }
                }
            }["Navbar.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            const handleFullScreenChange = {
                "Navbar.useEffect.handleFullScreenChange": ()=>{
                    setIsFullScreen(!!document.fullscreenElement);
                }
            }["Navbar.useEffect.handleFullScreenChange"];
            document.addEventListener('fullscreenchange', handleFullScreenChange);
            return ({
                "Navbar.useEffect": ()=>{
                    document.removeEventListener('mousedown', handleClickOutside);
                    document.removeEventListener('fullscreenchange', handleFullScreenChange);
                }
            })["Navbar.useEffect"];
        }
    }["Navbar.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navbar.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                fetchCurrentNotifications();
            }
        }
    }["Navbar.useEffect"], [
        selectedCompanyIds
    ]);
    const fetchCurrentNotifications = async ()=>{
        try {
            const today = new Date().toISOString().split('T')[0];
            let notifUrl = `/api/meal-notifications?notificationDate=${today}`;
            if (selectedCompanyIds?.[0]) notifUrl += `&companyId=${selectedCompanyIds[0]}`;
            const res = await fetch(notifUrl);
            if (res.ok) setNotifications(await res.json());
        } catch (e) {
            console.error(e);
        }
    };
    const handleHardRefresh = ()=>{
        if ("TURBOPACK compile-time truthy", 1) window.location.reload();
    };
    const toggleFullScreen = ()=>{
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err)=>{
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };
    const currentAssignedCompanies = allCompanies.filter((c)=>assignedCompanies.some((ac)=>(ac?.$oid || ac).toString() === (c._id?.$oid || c._id).toString()));
    const findMenuLabel = (items, route)=>{
        for (const item of items){
            if (item.route === route) return item.label;
            if (item.children?.length) {
                const childLabel = findMenuLabel(item.children, route);
                if (childLabel) return childLabel;
            }
        }
        return '';
    };
    const formatPathLabel = (route)=>route.split('?')[0].split('/').filter(Boolean).map((part)=>part.replace(/-/g, ' ')).map((part)=>part.charAt(0).toUpperCase() + part.slice(1)).join(' / ');
    const currentPageTitle = findMenuLabel(menuItems, pathname) || formatPathLabel(pathname) || 'Dashboard';
    const selectedCompany = selectedCompanyIds.length === 1 ? allCompanies.find((c)=>String(c._id?.$oid || c._id) === String(selectedCompanyIds[0])) : null;
    const branchButtonLabel = selectedCompanyIds.length > 1 ? `${selectedCompanyIds.length} Branches` : selectedCompany ? selectedCompany.shortName || selectedCompany.name : companyName || 'All Branches';
    const branchFullName = selectedCompany ? selectedCompany.name : companyName || 'All Branches';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "sticky top-0 z-[50] flex items-center justify-between px-5 py-10 h-[58px] border-b border-[#E8C5B0]/40 dark:border-stone-700/60 bg-gradient-to-l from-[#FFF1E6] via-[#FFFDFC] to-[#FFEBDF] dark:bg-none dark:from-[#2F2F2F] dark:via-[#2F2F2F] dark:to-[#2F2F2F] dark:bg-[#2F2F2F]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleSidebar,
                        className: "flex items-center justify-center cursor-pointer p-1 shrink-0",
                        title: isSidebarCollapsed ? 'Open Sidebar' : 'Close Sidebar',
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/icons/navbar/Hide & Unhide.svg",
                            alt: "Toggle Sidebar",
                            className: "w-5 h-5 object-contain transition-all hover:opacity-60 dark:brightness-0 dark:invert"
                        }, void 0, false, {
                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                            lineNumber: 181,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                        lineNumber: 176,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-[22px] font-black tracking-[0.15em] uppercase leading-none bg-gradient-to-r from-[#FF5102] to-[#862519] dark:from-[#FF7A45] dark:to-[#E2765A] bg-clip-text text-transparent drop-shadow-xs",
                        children: currentPageTitle
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                        lineNumber: 187,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                lineNumber: 175,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 lg:gap-5",
                children: [
                    currentAssignedCompanies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative hidden lg:block",
                        ref: dropdownRef,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] font-medium text-[#0E0E0E] dark:text-stone-300 text-center mb-0.5 leading-none italic",
                                children: "Select Branch"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 200,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setIsCompanyDropdownOpen(!isCompanyDropdownOpen),
                                className: "flex items-center gap-2 px-4 py-[6px] text-white rounded-[9px] text-[12px] font-semibold whitespace-nowrap min-w-[110px] justify-between cursor-pointer shadow-md bg-gradient-to-r from-[#8A281A] to-[#C85A2A] dark:from-[#882619] dark:via-[#AA3A1E] dark:to-[#D4612D]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate max-w-[120px]",
                                        children: branchButtonLabel
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 205,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "10",
                                        height: "6",
                                        viewBox: "0 0 10 6",
                                        fill: "none",
                                        className: `shrink-0 transition-transform duration-200 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M0 0H10L5 6L0 0Z",
                                            fill: "white"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 207,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 206,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 201,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                children: isCompanyDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 8
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: 8
                                    },
                                    className: "absolute right-0 mt-2 w-[min(14rem,calc(100vw-2rem))] bg-card rounded-xl shadow-xl border border-border overflow-hidden z-[60] p-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-2 border-b border-border/50 mb-1",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
                                                children: "Select Branch"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                lineNumber: 220,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 219,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "max-h-64 overflow-y-auto",
                                            children: currentAssignedCompanies.map((company)=>{
                                                const companyId = String(company._id?.$oid || company._id);
                                                const isSelected = selectedCompanyIds.map((id)=>String(id?.$oid || id)).includes(companyId);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "w-full px-3 py-2 flex items-center justify-between text-xs font-bold rounded-lg transition-all mb-0.5 cursor-pointer hover:bg-muted group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `truncate pr-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`,
                                                            children: company.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 231,
                                                            columnNumber: 53
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "checkbox",
                                                            className: "hidden",
                                                            checked: isSelected,
                                                            onChange: ()=>toggleCompanyId(company._id)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 232,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, company._id, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 227,
                                                    columnNumber: 49
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 222,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 213,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 211,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                        lineNumber: 199,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                ref: notifDropdownRef,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            const newState = !isNotifDropdownOpen;
                                            setIsNotifDropdownOpen(newState);
                                            if (newState) fetchCurrentNotifications();
                                        },
                                        className: "w-9 h-9 flex items-center justify-center cursor-pointer relative",
                                        title: "Notifications",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: "/icons/navbar/Notification.svg",
                                                alt: "Notifications",
                                                className: "w-5 h-5 object-contain transition-all hover:opacity-60 dark:hidden"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                lineNumber: 257,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: "/icons/navbar/NotificationDark.svg",
                                                alt: "Notifications",
                                                className: "w-5 h-5 object-contain transition-all hover:opacity-60 hidden dark:block"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                lineNumber: 258,
                                                columnNumber: 29
                                            }, this),
                                            notifications.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-red-500 rounded-full border border-white"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                lineNumber: 260,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 248,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                        children: isNotifDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                y: 8
                                            },
                                            animate: {
                                                opacity: 1,
                                                y: 0
                                            },
                                            exit: {
                                                opacity: 0,
                                                y: 8
                                            },
                                            className: "absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-card rounded-xl shadow-xl border border-border overflow-hidden z-[60] p-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 border-b border-border/50 mb-1 flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider",
                                                            children: "Notifications"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 273,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[9px] font-bold px-2 py-0.5 bg-[#8A281A]/10 text-[#8A281A] rounded-full",
                                                            children: [
                                                                notifications.length,
                                                                " New"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 274,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 272,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "max-h-64 overflow-y-auto",
                                                    children: notifications.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-8 text-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
                                                            children: "All caught up!"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 279,
                                                            columnNumber: 49
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                        lineNumber: 278,
                                                        columnNumber: 45
                                                    }, this) : notifications.map((notif, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            onClick: async ()=>{
                                                                try {
                                                                    await fetch(`/api/meal-notifications?id=${notif._id}`, {
                                                                        method: 'PATCH'
                                                                    });
                                                                    setNotifications((prev)=>prev.filter((n)=>n._id !== notif._id));
                                                                    window.location.href = `/monthly-menu?month=${notif.date.slice(0, 7)}&date=${notif.date}`;
                                                                    setIsNotifDropdownOpen(false);
                                                                } catch (e) {
                                                                    console.error(e);
                                                                }
                                                            },
                                                            className: "p-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 cursor-pointer",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "min-w-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[10px] font-black text-[#8A281A] uppercase tracking-widest mb-0.5 truncate",
                                                                        children: notif.mealType
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                        lineNumber: 296,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[11px] font-medium text-foreground leading-relaxed",
                                                                        children: notif.text
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                        lineNumber: 297,
                                                                        columnNumber: 57
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-[9px] text-muted-foreground mt-1 font-bold",
                                                                        children: notif.date
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                        lineNumber: 298,
                                                                        columnNumber: 57
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                lineNumber: 295,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, idx, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 283,
                                                            columnNumber: 49
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 276,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 266,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 264,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 247,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden lg:block",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$components$2f$ThemeToggle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 311,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 310,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleFullScreen,
                                className: "w-9 h-9 flex items-center justify-center cursor-pointer hidden lg:flex",
                                title: isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen',
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/icons/navbar/full screen.svg",
                                        alt: "Full Screen",
                                        className: "w-5 h-5 object-contain transition-all hover:opacity-60 dark:hidden"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 320,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/icons/navbar/FullscreenDark.svg",
                                        alt: "Full Screen",
                                        className: "w-5 h-5 object-contain transition-all hover:opacity-60 hidden dark:block"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 321,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 315,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleHardRefresh,
                                className: "w-9 h-9 flex items-center justify-center cursor-pointer hidden lg:flex",
                                title: "Hard Refresh",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/icons/navbar/hard refresh.svg",
                                        alt: "Hard Refresh",
                                        className: "w-5 h-5 object-contain transition-all hover:opacity-60 dark:hidden"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 331,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/icons/navbar/RefreshDark.svg",
                                        alt: "Full Screen",
                                        className: "w-5 h-5 object-contain transition-all hover:opacity-60 hidden dark:block"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 332,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 326,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                        lineNumber: 244,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-right hidden lg:block",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[14px] font-bold text-[#8A281A] dark:text-[#E2765A] leading-tight",
                                        children: userName
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 340,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-gray-400 dark:text-stone-300 leading-tight mt-0.5",
                                        children: [
                                            branchFullName,
                                            userRole && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    " | ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-gray-800 dark:text-white",
                                                        children: userRole
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                        lineNumber: 346,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                        lineNumber: 341,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 339,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                ref: mobileProfileButtonRef,
                                onClick: ()=>setIsMobileProfileOpen(!isMobileProfileOpen),
                                className: "w-9 h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center border-2 border-[#D2602D]/80 bg-gradient-to-br from-[#882619] via-[#AA3A1E] to-[#D4612D] text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none",
                                children: avatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: avatar,
                                    alt: userName,
                                    className: "w-full h-full object-cover",
                                    onError: ()=>setAvatar(null)
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 357,
                                    columnNumber: 29
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-bold text-[13px] text-white select-none",
                                    children: userName ? userName.split(' ').map((n)=>n[0]).join('').toUpperCase().slice(0, 2) : 'U'
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 364,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                lineNumber: 351,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                        lineNumber: 338,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: isMobileProfileOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            ref: mobileProfileDropdownRef,
                            initial: {
                                opacity: 0,
                                y: 8,
                                scale: 0.95
                            },
                            animate: {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            },
                            exit: {
                                opacity: 0,
                                y: 8,
                                scale: 0.95
                            },
                            transition: {
                                duration: 0.15
                            },
                            className: "absolute right-5 top-[58px] w-72 bg-[#FDF6F2] dark:bg-[#171717] rounded-2xl shadow-2xl border border-[#E8C5B0]/40 overflow-hidden z-[60] p-4 flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3 pb-3 border-b border-[#E8C5B0]/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-10 h-10 rounded-full overflow-hidden border-2 border-[#D2602D]/80 shadow-sm bg-gradient-to-br from-[#882619] via-[#AA3A1E] to-[#D4612D] text-white flex items-center justify-center shrink-0",
                                            children: avatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: avatar,
                                                alt: userName,
                                                className: "w-full h-full object-cover",
                                                onError: ()=>setAvatar(null)
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                lineNumber: 386,
                                                columnNumber: 41
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold text-sm text-white select-none",
                                                children: userName ? userName.split(' ').map((n)=>n[0]).join('').toUpperCase().slice(0, 2) : 'U'
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                lineNumber: 393,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 384,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[14px] font-bold text-[#8A281A] dark:text-[#F9C8B0] leading-tight truncate",
                                                    children: userName
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 399,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[10px] text-gray-400 leading-tight mt-0.5 truncate",
                                                    children: [
                                                        branchFullName,
                                                        userRole && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                " | ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-bold text-gray-700 dark:text-gray-300",
                                                                    children: userRole
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                    lineNumber: 405,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, void 0, true)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 400,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 398,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 383,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1 py-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "/profile",
                                            className: "flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-[#8A281A]/5 dark:hover:bg-white/5 rounded-lg transition-colors",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "15",
                                                    height: "15",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2.5",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    className: "text-[#8A281A] dark:text-[#F9C8B0]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 419,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                            cx: "12",
                                                            cy: "7",
                                                            r: "4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 420,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 418,
                                                    columnNumber: 37
                                                }, this),
                                                "Admin Profile"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 414,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                localStorage.clear();
                                                document.cookie.split(";").forEach((cookie)=>{
                                                    const name = cookie.split("=")[0].trim();
                                                    document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                                                });
                                                if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
                                                window.location.href = "/login";
                                            },
                                            className: "flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left w-full focus:outline-none cursor-pointer",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    width: "15",
                                                    height: "15",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2.5",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    className: "text-red-500",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 437,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                                            points: "16 17 21 12 16 7"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 438,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                            x1: "21",
                                                            y1: "12",
                                                            x2: "9",
                                                            y2: "12"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 439,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 436,
                                                    columnNumber: 37
                                                }, this),
                                                "Sign Out"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 424,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 413,
                                    columnNumber: 29
                                }, this),
                                currentAssignedCompanies.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-1 lg:hidden",
                                    ref: mobileCompanyDropdownRef,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[9px] font-medium text-gray-400 mb-0.5 leading-none italic",
                                            children: "Select Branch"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 448,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setIsMobileCompanyDropdownOpen(!isMobileCompanyDropdownOpen),
                                                    className: "flex items-center gap-2 px-4 py-[8px] text-white rounded-[9px] text-[12px] font-semibold whitespace-nowrap w-full justify-between cursor-pointer shadow-md focus:outline-none",
                                                    style: {
                                                        background: 'linear-gradient(to right, #8A281A, #C85A2A)'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "truncate max-w-[180px]",
                                                            children: branchButtonLabel
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 455,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            width: "10",
                                                            height: "6",
                                                            viewBox: "0 0 10 6",
                                                            fill: "none",
                                                            className: `shrink-0 transition-transform duration-200 ${isMobileCompanyDropdownOpen ? 'rotate-180' : ''}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                d: "M0 0H10L5 6L0 0Z",
                                                                fill: "white"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                lineNumber: 457,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                            lineNumber: 456,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 450,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                                    children: isMobileCompanyDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        initial: {
                                                            opacity: 0,
                                                            y: 4
                                                        },
                                                        animate: {
                                                            opacity: 1,
                                                            y: 0
                                                        },
                                                        exit: {
                                                            opacity: 0,
                                                            y: 4
                                                        },
                                                        className: "absolute left-0 right-0 mt-1 bg-[#FDF6F2] dark:bg-[#262626] rounded-xl shadow-xl border border-[#E8C5B0]/40 overflow-hidden z-[70] p-1 max-h-48 overflow-y-auto",
                                                        children: currentAssignedCompanies.map((company)=>{
                                                            const companyId = String(company._id?.$oid || company._id);
                                                            const isSelected = selectedCompanyIds.map((id)=>String(id?.$oid || id)).includes(companyId);
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "w-full px-3 py-2 flex items-center justify-between text-xs font-bold rounded-lg transition-all mb-0.5 cursor-pointer hover:bg-muted group",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: `truncate pr-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`,
                                                                        children: company.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                        lineNumber: 477,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: `w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#8A281A] border-[#8A281A] shadow-sm' : 'border-border'}`,
                                                                        children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                            size: 12,
                                                                            className: "text-white",
                                                                            strokeWidth: 3
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                            lineNumber: 479,
                                                                            columnNumber: 84
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                        lineNumber: 478,
                                                                        columnNumber: 65
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        className: "hidden",
                                                                        checked: isSelected,
                                                                        onChange: ()=>toggleCompanyId(company._id)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                        lineNumber: 481,
                                                                        columnNumber: 65
                                                                    }, this)
                                                                ]
                                                            }, company._id, true, {
                                                                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                                lineNumber: 473,
                                                                columnNumber: 61
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                        lineNumber: 463,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 461,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 449,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 447,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-around pt-2 border-t border-[#E8C5B0]/20 lg:hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$components$2f$ThemeToggle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 495,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] text-gray-400 font-bold",
                                                    children: "Theme"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 496,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 494,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: toggleFullScreen,
                                                    className: "w-9 h-9 flex items-center justify-center cursor-pointer rounded-full hover:bg-[#8A281A]/5 dark:hover:bg-white/5 transition-all focus:outline-none",
                                                    title: isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen',
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: "/icons/navbar/full screen.svg",
                                                        alt: "Full Screen",
                                                        className: "w-5 h-5 object-contain"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                        lineNumber: 505,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 500,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] text-gray-400 font-bold",
                                                    children: "Fullscreen"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 507,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 499,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleHardRefresh,
                                                    className: "w-9 h-9 flex items-center justify-center cursor-pointer rounded-full hover:bg-[#8A281A]/5 dark:hover:bg-white/5 transition-all focus:outline-none",
                                                    title: "Hard Refresh",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: "/icons/navbar/hard refresh.svg",
                                                        alt: "Hard Refresh",
                                                        className: "w-5 h-5 object-contain"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                        lineNumber: 516,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 511,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[9px] text-gray-400 font-bold",
                                                    children: "Refresh"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                                    lineNumber: 518,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                            lineNumber: 510,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                                    lineNumber: 493,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                            lineNumber: 374,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                        lineNumber: 372,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
                lineNumber: 195,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js",
        lineNumber: 171,
        columnNumber: 9
    }, this);
}
_s(Navbar, "OTtMQwgL/qxTT4GwoflJ2PkTBoA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$context$2f$CompanyContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCompany"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ClientLayout.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClientLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$components$2f$Sidebar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Sidebar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$components$2f$Navbar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Navbar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ClientLayout({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])(); // Initialize router
    const [showLayout, setShowLayout] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggleSidebar = ()=>setIsSidebarCollapsed(!isSidebarCollapsed);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClientLayout.useEffect": ()=>{
            // Check for authentication
            const checkAuth = {
                "ClientLayout.useEffect.checkAuth": ()=>{
                    const isPublicPage = pathname === '/login' || pathname === '/register';
                    if (isPublicPage) {
                        setShowLayout(false);
                        return;
                    }
                    setShowLayout(true);
                    // Check localStorage
                    const localToken = localStorage.getItem('token');
                    const localExpireToken = localStorage.getItem('expire_token');
                    // Check cookies
                    const getCookie = {
                        "ClientLayout.useEffect.checkAuth.getCookie": (name)=>{
                            const value = `; ${document.cookie}`;
                            const parts = value.split(`; ${name}=`);
                            if (parts.length === 2) return parts.pop().split(';').shift();
                        }
                    }["ClientLayout.useEffect.checkAuth.getCookie"];
                    const cookieToken = getCookie('token');
                    const cookieExpireToken = getCookie('expire_token');
                    if (!localToken && !localExpireToken && !cookieToken && !cookieExpireToken) {
                        router.push('/login');
                    }
                }
            }["ClientLayout.useEffect.checkAuth"];
            checkAuth();
            // Automatic Logout Check
            const checkTimeRestriction = {
                "ClientLayout.useEffect.checkTimeRestriction": ()=>{
                    const loginStartTime = localStorage.getItem('loginStartTime');
                    const loginEndTime = localStorage.getItem('loginEndTime');
                    if (loginStartTime && loginEndTime) {
                        const now = new Date();
                        const formatter = new Intl.DateTimeFormat('en-US', {
                            timeZone: 'Asia/Kolkata',
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        const parts = formatter.formatToParts(now);
                        const hour = parts.find({
                            "ClientLayout.useEffect.checkTimeRestriction": (p)=>p.type === 'hour'
                        }["ClientLayout.useEffect.checkTimeRestriction"])?.value;
                        const minute = parts.find({
                            "ClientLayout.useEffect.checkTimeRestriction": (p)=>p.type === 'minute'
                        }["ClientLayout.useEffect.checkTimeRestriction"])?.value;
                        const currentTime = `${hour}:${minute}`;
                        if (currentTime < loginStartTime || currentTime > loginEndTime) {
                            alert('Login time window expired. You are being logged out.');
                            localStorage.removeItem('token');
                            localStorage.removeItem('role');
                            localStorage.removeItem('companyName');
                            localStorage.removeItem('loginStartTime');
                            localStorage.removeItem('loginEndTime');
                            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                            router.push('/login');
                        }
                    }
                }
            }["ClientLayout.useEffect.checkTimeRestriction"];
            const intervalId = setInterval(checkTimeRestriction, 60000); // Check every minute
            checkTimeRestriction(); // Initial check
            return ({
                "ClientLayout.useEffect": ()=>clearInterval(intervalId)
            })["ClientLayout.useEffect"];
        }
    }["ClientLayout.useEffect"], [
        pathname,
        router
    ]);
    if (!showLayout) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-screen md:h-screen overflow-x-hidden",
        style: {
            backgroundImage: "url('/uploads/VEG%20BG.png')",
            backgroundSize: 'auto',
            backgroundRepeat: 'repeat',
            backgroundAttachment: 'local'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$components$2f$Sidebar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isCollapsed: isSidebarCollapsed,
                toggleSidebar: toggleSidebar
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ClientLayout.js",
                lineNumber: 100,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `main-content-wrapper flex-1 min-w-0 flex flex-col overflow-y-auto transition-all duration-300`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$components$2f$Navbar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        toggleSidebar: toggleSidebar,
                        isSidebarCollapsed: isSidebarCollapsed
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ClientLayout.js",
                        lineNumber: 102,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 min-w-0",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ClientLayout.js",
                        lineNumber: 103,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ClientLayout.js",
                lineNumber: 101,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ClientLayout.js",
        lineNumber: 91,
        columnNumber: 9
    }, this);
}
_s(ClientLayout, "lTNSfr0j0hEckY/RicZ1K9RCI3g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ClientLayout;
var _c;
__turbopack_context__.k.register(_c, "ClientLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/context/PermissionsContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PermissionsProvider",
    ()=>PermissionsProvider,
    "usePermissionsContext",
    ()=>usePermissionsContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const PermissionsContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])();
function PermissionsProvider({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [permissionsByRoute, setPermissionsByRoute] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loadingRoutes, setLoadingRoutes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const fetchingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const fetchPermissions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PermissionsProvider.useCallback[fetchPermissions]": async (route)=>{
            if (fetchingRef.current.has(route)) return;
            fetchingRef.current.add(route);
            setLoadingRoutes({
                "PermissionsProvider.useCallback[fetchPermissions]": (prev)=>({
                        ...prev,
                        [route]: true
                    })
            }["PermissionsProvider.useCallback[fetchPermissions]"]);
            try {
                const res = await fetch(`/api/permissions/check?route=${route}`);
                if (res.ok) {
                    const data = await res.json();
                    setPermissionsByRoute({
                        "PermissionsProvider.useCallback[fetchPermissions]": (prev)=>({
                                ...prev,
                                [route]: data
                            })
                    }["PermissionsProvider.useCallback[fetchPermissions]"]);
                } else {
                    setPermissionsByRoute({
                        "PermissionsProvider.useCallback[fetchPermissions]": (prev)=>({
                                ...prev,
                                [route]: {
                                    read: false,
                                    write: false,
                                    edit: false,
                                    delete: false,
                                    mrp: false,
                                    isSuper: false
                                }
                            })
                    }["PermissionsProvider.useCallback[fetchPermissions]"]);
                }
            } catch (error) {
                console.error(`Error fetching permissions for ${route}:`, error);
                setPermissionsByRoute({
                    "PermissionsProvider.useCallback[fetchPermissions]": (prev)=>({
                            ...prev,
                            [route]: {
                                read: false,
                                write: false,
                                edit: false,
                                delete: false,
                                mrp: false,
                                isSuper: false
                            }
                        })
                }["PermissionsProvider.useCallback[fetchPermissions]"]);
            } finally{
                setLoadingRoutes({
                    "PermissionsProvider.useCallback[fetchPermissions]": (prev)=>({
                            ...prev,
                            [route]: false
                        })
                }["PermissionsProvider.useCallback[fetchPermissions]"]);
                fetchingRef.current.delete(route);
            }
        }
    }["PermissionsProvider.useCallback[fetchPermissions]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PermissionsProvider.useEffect": ()=>{
            const publicRoutes = [
                '/login',
                '/register',
                '/forgot-password'
            ];
            if (pathname && !publicRoutes.includes(pathname) && !permissionsByRoute[pathname]) {
                fetchPermissions(pathname);
            }
        }
    }["PermissionsProvider.useEffect"], [
        pathname,
        fetchPermissions,
        permissionsByRoute
    ]);
    const getPermissionsForRoute = (route)=>{
        return permissionsByRoute[route] || {
            read: false,
            write: false,
            edit: false,
            delete: false,
            mrp: false,
            isSuper: false
        };
    };
    const isRouteLoading = (route)=>{
        return loadingRoutes[route] === true;
    };
    const value = {
        permissions: getPermissionsForRoute(pathname),
        loading: isRouteLoading(pathname),
        hasPermission: (action)=>{
            const perms = getPermissionsForRoute(pathname);
            if (perms.isSuper) return true;
            return !!perms[action];
        },
        refresh: ()=>{
            setPermissionsByRoute((prev)=>{
                const next = {
                    ...prev
                };
                delete next[pathname];
                return next;
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PermissionsContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/context/PermissionsContext.js",
        lineNumber: 84,
        columnNumber: 9
    }, this);
}
_s(PermissionsProvider, "/SLjN24mwlqxy98oVnJatGWWHKE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = PermissionsProvider;
function usePermissionsContext() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissionsContext must be used within a PermissionsProvider');
    }
    return context;
}
_s1(usePermissionsContext, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "PermissionsProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
// --- Context ---
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function ToastProvider({ children }) {
    _s();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const showToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[showToast]": (message, type = 'success', duration = 2800)=>{
            const id = Date.now() + Math.random();
            setToasts({
                "ToastProvider.useCallback[showToast]": (prev)=>[
                        ...prev,
                        {
                            id,
                            message,
                            type
                        }
                    ]
            }["ToastProvider.useCallback[showToast]"]);
            setTimeout({
                "ToastProvider.useCallback[showToast]": ()=>{
                    setToasts({
                        "ToastProvider.useCallback[showToast]": (prev)=>prev.filter({
                                "ToastProvider.useCallback[showToast]": (t)=>t.id !== id
                            }["ToastProvider.useCallback[showToast]"])
                    }["ToastProvider.useCallback[showToast]"]);
                }
            }["ToastProvider.useCallback[showToast]"], duration);
        }
    }["ToastProvider.useCallback[showToast]"], []);
    const dismiss = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[dismiss]": (id)=>{
            setToasts({
                "ToastProvider.useCallback[dismiss]": (prev)=>prev.filter({
                        "ToastProvider.useCallback[dismiss]": (t)=>t.id !== id
                    }["ToastProvider.useCallback[dismiss]"])
            }["ToastProvider.useCallback[dismiss]"]);
        }
    }["ToastProvider.useCallback[dismiss]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: {
            showToast
        },
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none",
                style: {
                    maxWidth: 360
                },
                children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastItem, {
                        toast: toast,
                        onDismiss: dismiss
                    }, toast.id, false, {
                        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                        lineNumber: 31,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 29,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
        lineNumber: 26,
        columnNumber: 9
    }, this);
}
_s(ToastProvider, "J1vTOigx24l+0RqklfII1TfxL2c=");
_c = ToastProvider;
// --- Individual Toast ---
function ToastItem({ toast, onDismiss }) {
    const config = {
        success: {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                size: 16,
                strokeWidth: 2.5
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 42,
                columnNumber: 19
            }, this),
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon_color: 'text-emerald-600',
            text_color: 'text-emerald-800',
            bar: 'bg-emerald-400'
        },
        error: {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                size: 16,
                strokeWidth: 2.5
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 50,
                columnNumber: 19
            }, this),
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon_color: 'text-red-600',
            text_color: 'text-red-800',
            bar: 'bg-red-400'
        },
        warning: {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                size: 16,
                strokeWidth: 2.5
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 58,
                columnNumber: 19
            }, this),
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon_color: 'text-amber-600',
            text_color: 'text-amber-800',
            bar: 'bg-amber-400'
        },
        info: {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                size: 16,
                strokeWidth: 2.5
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 66,
                columnNumber: 19
            }, this),
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon_color: 'text-blue-600',
            text_color: 'text-blue-800',
            bar: 'bg-blue-400'
        }
    };
    const c = config[toast.type] || config.success;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${c.bg} ${c.border} animate-toast-in`,
        style: {
            minWidth: 220
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `mt-0.5 flex-shrink-0 ${c.icon_color}`,
                children: c.icon
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 82,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `text-[12px] font-semibold leading-snug flex-1 ${c.text_color}`,
                children: toast.message
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 83,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onDismiss(toast.id),
                className: "flex-shrink-0 text-muted-foreground hover:text-muted-foreground transition-colors mt-0.5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    size: 13
                }, void 0, false, {
                    fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                    lineNumber: 88,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
                lineNumber: 84,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/Toast.js",
        lineNumber: 78,
        columnNumber: 9
    }, this);
}
_c1 = ToastItem;
function useToast() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!ctx) {
        // Fallback: no-op if used outside provider (avoids crash)
        return {
            showToast: ()=>{}
        };
    }
    return ctx;
}
_s1(useToast, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c, _c1;
__turbopack_context__.k.register(_c, "ToastProvider");
__turbopack_context__.k.register(_c1, "ToastItem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeProvider.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$MS$2d$kitchen$28$01$2d$08$2d$2026$292f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/Downloads/MS-kitchen(01-08-2026)/MS-kitchen(01-08-2026)/components/ThemeProvider.js",
        lineNumber: 7,
        columnNumber: 12
    }, this);
}
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Downloads_MS-kitchen%2801-08-2026%29_MS-kitchen%2801-08-2026%29_16497163._.js.map