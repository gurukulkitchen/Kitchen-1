"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OverallDashboard from '@/components/dashboards/OverallDashboard';
import TodaysDashboard from '@/components/dashboards/TodaysDashboard';
import ProductDashboard from '@/components/dashboards/ProductDashboard';
import EventDashboard from '@/components/dashboards/EventDashboard';
import MilkDashboard from '@/components/dashboards/MilkDashboard';
import VegFruitDashboard from '@/components/dashboards/VegFruitDashboard';
import ToDashboard from '@/components/dashboards/ToDashboard';
import { Database, ShieldAlert } from 'lucide-react';
import MonthYearPicker from '@/components/MonthYearPicker';
import StudentCountManager from '@/components/StudentCountManager';
import PermissionWrapper from '@/components/PermissionWrapper';
import usePermissions from "@/hooks/usePermissions";

const MasterDashboard = () => {
    const searchParams = useSearchParams();
    const companyId = searchParams.get('companyId') || '';

    const [activeTabKey, setActiveTabKey] = useState("overall");
    const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const [periodA, setPeriodA] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [periodB, setPeriodB] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear() - 1
    });

    const { permissions, loading: permsLoading, hasPermission } = usePermissions();

    useEffect(() => {
        const role = localStorage.getItem('role');
        setUserRole(role || "");
        if (role === 'Super Admin') setIsSuperAdmin(true);
    }, []);

    const tabs = useMemo(() => ([
        { key: 'overall', label: 'Overall', render: () => <OverallDashboard companyId={companyId} periodA={periodA} setPeriodA={setPeriodA} periodB={periodB} setPeriodB={setPeriodB} /> },
        { key: 'todays', label: "Today's", render: () => <TodaysDashboard companyId={companyId} /> },
        { key: 'product', label: 'Product', render: () => <ProductDashboard companyId={companyId} /> },
        { key: 'milk', label: 'Milk', render: () => <MilkDashboard companyId={companyId} /> },
        { key: 'vegFruit', label: 'Veg. & Fruit', render: () => <VegFruitDashboard companyId={companyId} /> },
        { key: 'event', label: 'Event', render: () => <EventDashboard companyId={companyId} /> },
        { key: 'to', label: 'To', render: () => <ToDashboard companyId={companyId} /> },
    ]), [companyId, periodA, periodB]);

    const activeTab = tabs.find(t => t.key === activeTabKey) || tabs[0];

    if (permsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#882619] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-stone-500">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!hasPermission('read')) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="max-w-md w-full bg-card rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
                    <p className="text-muted-foreground font-medium mb-8">
                        You don&apos;t have permission to view Dashboard. Please contact your administrator for access.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 font-sans transition-colors duration-300">
            <div className="max-w-[1700px] mx-auto bg-white dark:bg-[#1e1e1e] rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 dark:border-stone-800">
                {/* Top Subtitle matching design image */}
                <div className="px-6 pt-3 pb-1">
                    <span className="text-xs md:text-sm italic font-serif text-stone-400 dark:text-white/80">
                        Comparative Performance Tracking
                    </span>
                </div>

                {/* Master Tab Navigation Header Bar matching design image */}
                <header className="bg-[#E5E5E5] dark:bg-[#252525] border-y border-[#882619]/40 dark:border-[#D4612D]/40">
                    <nav className="flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-2.5 overflow-x-auto no-scrollbar">
                        {/* Tabs with proper gap & shrink prevention */}
                        <div className="flex items-center gap-3 md:gap-5 lg:gap-6 overflow-x-auto no-scrollbar py-0.5 shrink-0">
                            {tabs.map((item) => {
                                const isActive = activeTabKey === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => setActiveTabKey(item.key)}
                                        className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${isActive
                                            ? 'bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] text-white shadow-md'
                                            : 'text-[#882619] dark:text-white hover:opacity-80'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Date Range Selectors & Source Button */}
                        <div className="flex items-center gap-3 shrink-0">
                            <MonthYearPicker
                                variant="headerPill"
                                value={`${periodA.year}-${String(periodA.month).padStart(2, '0')}`}
                                onChange={(val) => {
                                    if (!val) return;
                                    const [y, m] = val.split('-');
                                    setPeriodA({ year: parseInt(y), month: parseInt(m) });
                                }}
                            />

                            <span className="text-xs text-stone-500 dark:text-white font-bold">to</span>

                            <MonthYearPicker
                                variant="headerPill"
                                value={`${periodB.year}-${String(periodB.month).padStart(2, '0')}`}
                                onChange={(val) => {
                                    if (!val) return;
                                    const [y, m] = val.split('-');
                                    setPeriodB({ year: parseInt(y), month: parseInt(m) });
                                }}
                            />

                            {(isSuperAdmin || userRole === 'Branch Admin' || userRole === 'Admin') ? (
                                <button
                                    onClick={() => setIsSourceModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#882619]/10 text-[#882619] dark:text-white dark:bg-white/10 hover:bg-[#882619]/20 rounded-xl transition-colors text-xs font-bold shrink-0 cursor-pointer"
                                >
                                    <img src="/icons/action/Source.svg" className="w-3.5 h-3.5 dark:brightness-0 dark:invert" alt="Source" />
                                    <span>Source</span>
                                </button>
                            ) : (
                                <PermissionWrapper action="source">
                                    <button
                                        onClick={() => setIsSourceModalOpen(true)}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#882619]/10 text-[#882619] dark:text-white dark:bg-white/10 hover:bg-[#882619]/20 rounded-xl transition-colors text-xs font-bold shrink-0 cursor-pointer"
                                    >
                                        <img src="/icons/action/Source.svg" className="w-3.5 h-3.5 dark:brightness-0 dark:invert" alt="Source" />
                                        <span>Source</span>
                                    </button>
                                </PermissionWrapper>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Sub-Dashboard Content */}
                <div className="p-4 md:p-6 animate-in fade-in duration-300">
                    {activeTab.render()}
                </div>
            </div>

            <StudentCountManager
                isOpen={isSourceModalOpen}
                onClose={() => setIsSourceModalOpen(false)}
            />
        </div>
    );
};

export default MasterDashboard;
