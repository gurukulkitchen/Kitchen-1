"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Loader2, Image as ImageIcon, Search, ShieldAlert, Star, Trash2, User, X, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PermissionWrapper from "@/components/PermissionWrapper";
import usePermissions from "@/hooks/usePermissions";
import { generateStockPDF } from "@/lib/pdfGenerator";
import TableColumnFilter from "../../components/TableColumnFilter";
import Pagination from "@/components/Pagination";
import { useFormStore } from "@/lib/store";
import MasterDataManager from "@/components/MasterDataManager";
import MonthYearPicker from "@/components/MonthYearPicker";
import { useCompany } from "@/context/CompanyContext";

const EMPTY_RATINGS = [1, 2, 3, 4, 5].map(id => ({ id, name: `Student ${id}`, rating: 0, narration: "" }));
const MEAL_COLORS = ["bg-orange-50 text-orange-600 border-orange-200", "bg-amber-50 text-amber-600 border-amber-200", "bg-blue-50 text-blue-600 border-blue-200", "bg-emerald-50 text-emerald-600 border-emerald-200"];

const formatDisplayDate = (value) => {
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return value;
    const datePart = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
    }).format(dateObj).replace(/ /g, '-');
    const dayPart = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short'
    }).format(dateObj);
    return `${datePart}, ${dayPart}`;
};

const formatDateParts = (value) => {
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return { dateStr: value, dayStr: '' };
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const dateStr = `${day}-${month}-${year}`;
    const dayStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(dateObj);
    return { dateStr, dayStr };
};

const commentsText = (ratings = []) => ratings.map(item => item.narration?.trim()).filter(Boolean).join(", ");
const ratingsText = (ratings = []) => ratings.map(item => String(item.rating || "-")).join("-");

function DailyMenuContent() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [mealTypes, setMealTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
    const [selectedIds, setSelectedIds] = useState([]);
    const [colFilters, setColFilters] = useState({});
    const [activeFilterCol, setActiveFilterCol] = useState(null);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const downloadRef = React.useRef(null);

    // Column Hide/Unhide State
    const [visibleCols, setVisibleCols] = useState({
        date: true,
        meal: true,
        students: true,
        menu: true,
        ratings: true,
        average: true,
        narration: true,
    });
    const [isHideShowDropdownOpen, setIsHideShowDropdownOpen] = useState(false);
    const hideShowDropdownRef = React.useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const hasActiveFilters =
        (typeof searchTerm !== 'undefined' && searchTerm !== '') ||
        (typeof colFilters !== 'undefined' && colFilters && Object.values(colFilters).some(v => v && v.length > 0));

    const clearAllFilters = () => {
        if (typeof setSearchTerm === 'function') setSearchTerm('');
        if (typeof setColFilters === 'function') setColFilters({});
        if (typeof setActiveFilterCol === 'function') setActiveFilterCol(null);
    };

    const [companyId, setCompanyId] = useState(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [mealType, setMealType] = useState("breakfast");
    const [studentCount, setStudentCount] = useState("");
    const [menuName, setMenuName] = useState("Not Set");
    const [ratings, setRatings] = useState(EMPTY_RATINGS);
    const [averageRating, setAverageRating] = useState(0);
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [narration, setNarration] = useState("");

    const { companyName, isReadOnly, companyAddress, companyPhone } = useCompany();

    const searchParams = useSearchParams();
    const urlCompanyId = searchParams.get("companyId");
    const { loading: permsLoading, hasPermission } = usePermissions();

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store
    useEffect(() => {
        const persistedData = forms['daily-menu'];
        if (persistedData) {
            if (persistedData.searchTerm) setSearchTerm(persistedData.searchTerm);
            if (persistedData.monthFilter) setMonthFilter(persistedData.monthFilter);
            if (persistedData.date) setDate(persistedData.date);
            if (persistedData.mealType) setMealType(persistedData.mealType);
            if (persistedData.studentCount) setStudentCount(persistedData.studentCount);
            if (persistedData.menuName) setMenuName(persistedData.menuName);
            if (persistedData.ratings) setRatings(persistedData.ratings);
            if (persistedData.averageRating) setAverageRating(persistedData.averageRating);
            if (persistedData.image) setImage(persistedData.image);
            if (persistedData.narration) setNarration(persistedData.narration);
            if (persistedData.colFilters) setColFilters(persistedData.colFilters);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setFormData('daily-menu', {
                searchTerm, monthFilter, date, mealType, studentCount, menuName,
                ratings, averageRating, image, narration, colFilters
            });
        }
    }, [searchTerm, monthFilter, date, mealType, studentCount, menuName, ratings, averageRating, image, narration, colFilters, isHydrated]);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const storedCompanyId = localStorage.getItem("companyId");
        if (role === "Super Admin") {
            setIsSuperAdmin(true);
            setCompanyId(urlCompanyId);
        } else {
            setCompanyId(storedCompanyId);
        }
    }, [urlCompanyId]);

    useEffect(() => {
        const total = ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0);
        const count = ratings.filter(item => Number(item.rating) > 0).length;
        setAverageRating(count > 0 ? Number((total / count).toFixed(1)) : 0);
    }, [ratings]);

    useEffect(() => {
        const handleFilterOutsideClick = (event) => {
            if (!event.target.closest('[data-col-filter-root="true"]')) {
                setActiveFilterCol(null);
            }
            if (downloadRef.current && !downloadRef.current.contains(event.target)) {
                setIsDownloadOpen(false);
            }
            if (hideShowDropdownRef.current && !hideShowDropdownRef.current.contains(event.target)) {
                setIsHideShowDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleFilterOutsideClick);
        return () => document.removeEventListener("mousedown", handleFilterOutsideClick);
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!companyId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                let fbUrl = '/api/daily-feedback';
                let mtUrl = '/api/meal-types';
                if (companyId) {
                    fbUrl += `?companyId=${companyId}`;
                    mtUrl += `?companyId=${companyId}`;
                }
                const [feedbackRes, mealTypeRes] = await Promise.all([
                    fetch(fbUrl),
                    fetch(mtUrl)
                ]);
                if (feedbackRes.ok) setFeedbacks(await feedbackRes.json());
                if (mealTypeRes.ok) {
                    const data = await mealTypeRes.json();
                    setMealTypes(data);
                    if (!isEditing && data[0]?.name) setMealType(data[0].name);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [companyId, isEditing]);

    useEffect(() => {
        if (!isModalOpen || isEditing || !companyId) return;
        const loadMenu = async () => {
            try {
                let menuUrl = `/api/monthly-menu?month=${date.slice(0, 7)}`;
                if (companyId) menuUrl += `&companyId=${companyId}`;
                const res = await fetch(menuUrl);
                if (!res.ok) return;
                const menus = await res.json();
                const menu = menus.find(item => item.date === date);
                setMenuName(menu?.meals?.[mealType] || "Not Set");
            } catch {
                setMenuName("Not Set");
            }
        };
        loadMenu();
    }, [companyId, date, isEditing, isModalOpen, mealType]);

    const displayedFeedbacks = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return feedbacks.filter(item => {
            const monthMatch = !monthFilter || item.date?.startsWith(monthFilter);

            const checkTerm = (obj, term) => {
                if (!obj) return false;
                if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
                return String(obj).toLowerCase().includes(term);
            };
            const searchMatch = !searchTerm || checkTerm(item, term);
            let colsMatch = true;
            if (colFilters.date?.length && !colFilters.date.includes(formatDisplayDate(item.date))) colsMatch = false;
            if (colFilters.meal?.length && !colFilters.meal.includes(item.mealType)) colsMatch = false;
            if (colFilters.students?.length && !colFilters.students.includes(String(item.studentCount))) colsMatch = false;
            if (colFilters.menu?.length && !colFilters.menu.includes(item.menuName)) colsMatch = false;
            if (colFilters.ratings?.length && !colFilters.ratings.includes(ratingsText(item.ratings))) colsMatch = false;
            if (colFilters.average?.length && !colFilters.average.includes(String(item.averageRating))) colsMatch = false;
            if (colFilters.narration?.length && !colFilters.narration.includes(item.narration || "-")) colsMatch = false;
            return monthMatch && searchMatch && colsMatch;
        });
    }, [colFilters, feedbacks, monthFilter, searchTerm]);

    const totalPages = Math.ceil(displayedFeedbacks.length / itemsPerPage);
    const paginatedFeedbacks = displayedFeedbacks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const allSelected = paginatedFeedbacks.length > 0 && selectedIds.length === paginatedFeedbacks.length;

    const uniqueDates = useMemo(() => [...new Set(feedbacks.map(item => formatDisplayDate(item.date)).filter(Boolean))], [feedbacks]);
    const uniqueMeals = useMemo(() => [...new Set(feedbacks.map(item => item.mealType).filter(Boolean))], [feedbacks]);
    const uniqueStudents = useMemo(() => [...new Set(feedbacks.map(item => String(item.studentCount)).filter(Boolean))], [feedbacks]);
    const uniqueMenus = useMemo(() => [...new Set(feedbacks.map(item => item.menuName).filter(Boolean))], [feedbacks]);
    const uniqueRatings = useMemo(() => [...new Set(feedbacks.map(item => ratingsText(item.ratings)).filter(Boolean))], [feedbacks]);
    const uniqueAverages = useMemo(() => [...new Set(feedbacks.map(item => String(item.averageRating)).filter(Boolean))], [feedbacks]);
    const uniqueNarrations = useMemo(() => [...new Set(feedbacks.map(item => item.narration || "-").filter(Boolean))], [feedbacks]);

    const toggleColFilter = (col, e) => {
        e.stopPropagation();
        setActiveFilterCol(activeFilterCol === col ? null : col);
    };

    const handleColFilterChange = (col, val) => {
        setColFilters(prev => {
            if (val === '') {
                const next = { ...prev };
                delete next[col];
                return next;
            }
            const current = prev[col] || [];
            if (current.includes(val)) {
                const nextValues = current.filter(entry => entry !== val);
                if (nextValues.length === 0) {
                    const next = { ...prev };
                    delete next[col];
                    return next;
                }
                return { ...prev, [col]: nextValues };
            }
            return { ...prev, [col]: [...current, val] };
        });
    };

    const openModal = (item = null) => {
        if (item) {
            setIsEditing(true);
            setDate(item.date);
            setMealType(item.mealType);
            setStudentCount(String(item.studentCount));
            setMenuName(item.menuName);
            setRatings(item.ratings?.length ? item.ratings : EMPTY_RATINGS);
            setImage(item.image || null);
            setNarration(item.narration || "");
        } else {
            setIsEditing(false);
            setDate(new Date().toISOString().slice(0, 10));
            setMealType(mealTypes[0]?.name || "breakfast");
            setStudentCount("");
            setMenuName("Not Set");
            setRatings(EMPTY_RATINGS);
            setImage(null);
            setNarration("");
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const res = await fetch("/api/daily-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, mealType, studentCount: Number(studentCount), menuName, ratings, averageRating, image, companyId, narration })
        });
        if (!res.ok) return alert("Failed to save");
        setIsModalOpen(false);
        setIsEditing(false);
        setSelectedIds([]);

        // Clear Form Data
        setDate(new Date().toISOString().slice(0, 10));
        setMealType(mealTypes[0]?.name || "breakfast");
        setStudentCount("");
        setMenuName("Not Set");
        setRatings(EMPTY_RATINGS);
        setImage(null);
        setNarration("");

        let fbUrl = '/api/daily-feedback';
        if (companyId) fbUrl += `?companyId=${companyId}`;
        const refreshed = await fetch(fbUrl);
        if (refreshed.ok) setFeedbacks(await refreshed.json());
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this daily feedback record?")) return;
        let deleteUrl = `/api/daily-feedback?id=${id}`;
        if (companyId) deleteUrl += `&companyId=${companyId}`;
        const res = await fetch(deleteUrl, { method: "DELETE" });
        if (!res.ok) return alert("Failed to delete");
        setFeedbacks(prev => prev.filter(item => item._id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length || !confirm(`Delete ${selectedIds.length} items?`)) return;
        try {
            const res = await fetch(`/api/daily-feedback`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });
            if (res.ok) {
                setFeedbacks(prev => prev.filter(item => !selectedIds.includes(item._id)));
                setSelectedIds([]);
            } else {
                alert('Bulk delete failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error in bulk delete');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "dishes");
        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.path) setImage(data.path);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = () => {
        const itemsToExport = selectedIds.length ? feedbacks.filter(item => selectedIds.includes(item._id)) : displayedFeedbacks;
        const rows = itemsToExport.map(item => [item.date, item.mealType, item.studentCount, item.menuName, item.averageRating, item.narration]);
        const csv = [["Date", "Meal", "Students", "Menu", "Average", "Narration"], ...rows]
            .map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `daily-feedback-${monthFilter || "all"}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleDownloadPDF = async () => {
        const itemsToExport = selectedIds.length ? feedbacks.filter(item => selectedIds.includes(item._id)) : displayedFeedbacks;
        const headers = ["Date", "Type", "Stu.", "Menu", "AVG", "Narration"];
        const data = itemsToExport.map(item => [
            formatDisplayDate(item.date),
            item.mealType,
            String(item.studentCount),
            item.menuName,
            String(item.averageRating),
            item.narration || '-'
        ]);

        await generateStockPDF({
            title: "Daily Feedback Report",
            headers,
            data,
            fileName: `Daily_Feedback_${monthFilter || 'Report'}.pdf`,
            companyName,
            companyAddress,
            companyPhone
        });
    };

    const handleShareMenu = async (item) => {
        const shareText = [
            `Date: ${formatDisplayDate(item.date)}`,
            `Time: ${item.mealType}`,
            `Students: ${item.studentCount}`,
            `Menu: ${item.menuName}`,
            `Average Rating: ${item.averageRating}`,
            `Comments: ${commentsText(item.ratings) || "-"}`
        ].join("\n");

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Daily Menu - ${item.mealType}`,
                    text: shareText
                });
                return;
            }
        } catch (error) {
            if (error?.name === "AbortError") return;
        }

        try {
            await navigator.clipboard.writeText(shareText);
            alert("Menu details copied for sharing");
        } catch {
            alert("Unable to share menu");
        }
    };

    if (permsLoading || loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-bold bg-background">Loading Daily Feedback...</div>;

    if (!hasPermission("read")) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                <div className="max-w-md w-full bg-card rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldAlert size={40} className="text-red-500" /></div>
                    <h1 className="text-2xl font-black text-foreground mb-2">Access Denied</h1>
                    <p className="text-muted-foreground font-medium">You do not have permission to view Daily Menu Feedback.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6" style={{ fontFamily: 'ITCAvantGardeStd' }}>
            {/* SINGLE DIV CONTAINER without outer background or side/top borders */}
            <div className="bg-card  rounded-lg shadow-2xl overflow-hidden mx-auto">

                {/* 1. Top Right Bar (Checkmark, Columns Hide/Unhide, Source) */}
                <div className="flex justify-end items-center gap-4 px-2 py-2 mb-2 relative">
                    <div className="flex items-center gap-1.5 mr-1">
                        <span className="text-[#15803D] font-black text-base">                                                            <Check size={18} className="text-emerald-600 font-bold" strokeWidth={3} />
                        </span>
                    </div>

                    {/* Columns Hide / Unhide Dropdown */}
                    <div ref={hideShowDropdownRef} className="relative">
                        <button
                            onClick={() => setIsHideShowDropdownOpen(!isHideShowDropdownOpen)}
                            className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors shadow-md cursor-pointer"
                        >
                            <img src="/icons/action/Hide.svg" className="w-4 h-4" alt="Hide" />
                            <span>Columns Hide / Unhide</span>
                            <svg className="w-3 h-3 text-[#D4612D]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 10l5 5 5-5z" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {isHideShowDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-9 w-52 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl py-3 border border-slate-200 dark:border-zinc-700 z-[100] overflow-hidden"
                                >
                                    <div className="px-4 pb-2 mb-2 border-b border-slate-100 dark:border-zinc-700">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Toggle Columns</span>
                                    </div>
                                    <div className="flex flex-col max-h-60 overflow-y-auto">
                                        {[
                                            { id: 'date', label: 'Date' },
                                            { id: 'meal', label: 'Time' },
                                            { id: 'students', label: 'Stu.' },
                                            { id: 'menu', label: 'Menu' },
                                            { id: 'ratings', label: 'Rating' },
                                            { id: 'average', label: 'AVG' },
                                            { id: 'narration', label: 'Narration' }
                                        ].map(col => (
                                            <label key={col.id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer text-xs font-bold text-slate-700 dark:text-zinc-200">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleCols[col.id] !== false}
                                                    onChange={() => setVisibleCols(prev => ({ ...prev, [col.id]: !prev[col.id] }))}
                                                    className="rounded border-slate-300 text-[#882619] focus:ring-[#882619] w-4 h-4"
                                                />
                                                <span>{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Source Button */}
                    <PermissionWrapper action="source">
                        <button
                            onClick={() => setIsMasterModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 outline-none text-[#882619] dark:text-[#D4612D] font-extrabold text-xs hover:opacity-80 transition-opacity cursor-pointer"
                        >
                            <img src="/icons/action/Source.svg" className="w-5 h-5 block dark:hidden" alt="Source" />
                            <img src="/icons/action/SourceDark.svg" className="w-5 h-5 hidden dark:block" alt="Source" />
                            <span>Source</span>
                        </button>
                    </PermissionWrapper>
                </div>

                {/* 2. Main Header Banner Box */}
                <div className="py-4 px-6 md:px-8 border-b border-[#882619] bg-[#E3E3E3] dark:bg-[#252525] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                    {/* Left: Reviews REPORT & Subtitle */}
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-baseline gap-2">
                            <span className="text-[#882619] dark:text-[#D4612D]">Reviews</span>{' '}
                            <span className="text-[#3A3A3A] dark:text-zinc-200">REPORT</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 italic mt-0.5 font-medium">
                            Plan daily meals (English / हिंदी / ગુજરાતી supported)
                        </p>
                    </div>

                    {/* Middle: Quick Search Input Pill */}
                    <div className="relative group w-full sm:w-72">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4612D]">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Quick Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[#D4612D]/30 transition-all placeholder:text-slate-400 shadow-md"
                        />
                    </div>

                    {/* Right: Select Month & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-6 self-end xl:self-auto relative">
                        <div className="relative border border-[#D4612D] rounded-xl bg-white dark:bg-zinc-800 shadow-md">
                            <MonthYearPicker
                                value={monthFilter}
                                onChange={(val) => setMonthFilter(val)}
                                placeholder="Select Month"
                                variant="ghost"
                            />
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="flex flex-col items-center gap-0.5 group text-slate-500 hover:text-emerald-600 transition-all cursor-pointer bg-transparent border-0 outline-none"
                                title="Clear Filters"
                            >
                                <div className="w-7 h-7 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                                    <X size={15} strokeWidth={2.5} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600">Clear</span>
                            </button>
                        )}

                        {!isReadOnly && (
                            <PermissionWrapper action="write">
                                <button
                                    onClick={() => openModal()}
                                    className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer bg-transparent border-0 outline-none mb-2"
                                >
                                    <img src="/icons/action/Add.svg" className="w-8 h-8 transition-transform group-hover:scale-105 block dark:hidden" alt="Add" />
                                    <img src="/icons/action/AddDark.svg" className="w-8 h-8 transition-transform group-hover:scale-105 hidden dark:block" alt="Add" />
                                    <span className="text-[10px] font-bold text-[#882619] dark:text-white">Add</span>
                                </button>
                            </PermissionWrapper>
                        )}

                        {!isReadOnly && (
                            <PermissionWrapper action="delete">
                                <button
                                    onClick={() => {
                                        if (selectedIds.length === 0) {
                                            alert("Please select at least one entry from the table to delete.");
                                        } else {
                                            handleBulkDelete();
                                        }
                                    }}
                                    className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer bg-transparent border-0 outline-none"
                                    title={selectedIds.length > 0 ? `Delete (${selectedIds.length}) Selected` : "Bulk Delete"}
                                >
                                    <img src="/icons/action/Delete.svg" className="w-10 h-10 transition-transform group-hover:scale-105 dark:hidden" alt="Delete" />
                                    <img src="/icons/action/DeleteDark.svg" className="w-10 h-10 transition-transform group-hover:scale-105 hidden dark:block" alt="Delete" />
                                </button>
                            </PermissionWrapper>
                        )}

                        <div className="relative" ref={downloadRef}>
                            <button
                                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                                className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer bg-transparent border-0 outline-none"
                            >
                                <img src="/icons/action/Download.svg" className="w-16 h-16 transition-transform group-hover:scale-105 dark:hidden" alt="Download" />
                                <img src="/icons/action/DownloadDark.svg" className="w-16 h-16 transition-transform group-hover:scale-105 hidden dark:block" alt="Download" />
                            </button>
                            <AnimatePresence>
                                {isDownloadOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-64 bg-card rounded-2xl shadow-xl py-2 z-50 overflow-hidden border border-border"
                                    >
                                        <button
                                            onClick={() => { handleDownload(); setIsDownloadOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors border-b border-border"
                                        >
                                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                            </div>
                                            CSV Report {selectedIds.length > 0 ? '(Selected)' : '(Filtered)'}
                                        </button>
                                        <button
                                            onClick={() => { handleDownloadPDF(); setIsDownloadOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors"
                                        >
                                            <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                            </div>
                                            PDF Report {selectedIds.length > 0 ? '(Selected)' : '(Filtered)'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* 3. Table Box - Transparent Background, No Upper/Side Borders */}
                <div className="bg-transparent overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1150px] border-separate border-spacing-0 text-left">
                            <thead>
                                <tr className="bg-transparent sticky top-0 z-20 whitespace-nowrap text-slate-700 dark:text-zinc-300 font-bold capitalize text-xs">
                                    <th className="py-3.5 px-3 w-10 text-center border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => setSelectedIds(allSelected ? [] : paginatedFeedbacks.map(item => item._id))}
                                            className="w-4 h-4 rounded border-slate-300 text-[#882619] focus:ring-[#882619] cursor-pointer"
                                        />
                                    </th>
                                    {visibleCols.date !== false && (
                                        <th className="py-3.5 px-3 text-left relative whitespace-nowrap border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="date"
                                                title={<><span className="text-[#882619] dark:text-[#D4612D] font-extrabold mr-0.5">*</span> Date</>}
                                                options={uniqueDates}
                                                showOptionIcon
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.meal !== false && (
                                        <th className="py-3.5 px-3 text-left relative whitespace-nowrap border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="meal"
                                                title={<><span className="text-[#882619] dark:text-[#D4612D] font-extrabold mr-0.5">*</span> Time</>}
                                                options={uniqueMeals}
                                                showOptionIcon
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.students !== false && (
                                        <th className="py-3.5 px-3 text-center relative whitespace-nowrap border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="students"
                                                title={<><span className="text-[#882619] dark:text-[#D4612D] font-extrabold mr-0.5">*</span> Stu.</>}
                                                options={uniqueStudents}
                                                align="center"
                                                showOptionIcon
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.menu !== false && (
                                        <th className="py-3.5 px-3 text-left relative whitespace-nowrap border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="menu"
                                                title={<><span className="text-[#882619] dark:text-[#D4612D] font-extrabold mr-0.5">*</span> Menu</>}
                                                options={uniqueMenus}
                                                showOptionIcon
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.ratings !== false && (
                                        <th className="py-3.5 px-3 text-center relative whitespace-nowrap border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="ratings"
                                                title="Rating"
                                                options={uniqueRatings}
                                                align="center"
                                                showOptionIcon
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.average !== false && (
                                        <th className="py-3.5 px-3 text-center relative whitespace-nowrap border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="average"
                                                title="AVG"
                                                options={uniqueAverages}
                                                align="center"
                                                showOptionIcon
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.narration !== false && (
                                        <th className="py-3.5 px-3 text-left relative whitespace-nowrap border-r border-[#A4A4A4] border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="narration"
                                                title="Narration"
                                                options={uniqueNarrations}
                                                showOptionIcon
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    <th className="px-4 py-3.5 text-center whitespace-nowrap font-bold border-b-[4px] border-double border-b-[#000000] dark:border-b-[#A4A4A4]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#000000] dark:divide-[#000000]">
                                {paginatedFeedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-14 text-center text-muted-foreground font-medium border-b border-[#000000] dark:border-[#000000]">
                                            No daily feedback entries found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedFeedbacks.map((item) => {
                                        const { dateStr, dayStr } = formatDateParts(item.date);
                                        return (
                                            <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-[#000000] dark:border-[#000000]">
                                                <td className="py-3.5 px-3 text-center border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000]">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item._id)}
                                                        onChange={() => setSelectedIds(prev => prev.includes(item._id) ? prev.filter(id => id !== item._id) : [...prev, item._id])}
                                                        className="w-4 h-4 rounded border-slate-300 text-[#882619] focus:ring-[#882619] cursor-pointer"
                                                    />
                                                </td>
                                                {visibleCols.date !== false && (
                                                    <td className="py-3.5 px-3 whitespace-nowrap border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000]">
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-extrabold text-slate-800 dark:text-zinc-200 text-xs">{dateStr}</span>
                                                            {dayStr && <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{dayStr}</span>}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleCols.meal !== false && (
                                                    <td className="py-3.5 px-3 whitespace-nowrap border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000]">
                                                        <span className="font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent text-sm capitalize">
                                                            {item.mealType}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleCols.students !== false && (
                                                    <td className="py-3.5 px-3 text-center border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000] font-extrabold text-slate-800 dark:text-zinc-200 text-sm">
                                                        {Number(item.studentCount || 0).toLocaleString('en-IN')}
                                                    </td>
                                                )}
                                                {visibleCols.menu !== false && (
                                                    <td className="py-3.5 px-3 text-left max-w-[280px] truncate border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000]">
                                                        <span className="font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent text-sm indic-text">
                                                            {item.menuName}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleCols.ratings !== false && (
                                                    <td className="py-3.5 px-3 text-center border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000]">
                                                        <span className="font-extrabold text-slate-800 dark:text-zinc-200 text-sm tracking-wider">
                                                            {(item.ratings || []).map(r => r.rating || '-').join('-')}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleCols.average !== false && (
                                                    <td className="py-3.5 px-3 text-center border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000]">
                                                        <span className="font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent text-sm">
                                                            {item.averageRating}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleCols.narration !== false && (
                                                    <td className="py-3.5 px-3 text-left max-w-[220px] truncate border-r border-b border-[#A4A4A4] border-b-[#000000] dark:border-[#A4A4A4] dark:border-b-[#000000]">
                                                        <span className="text-slate-600 dark:text-zinc-400 font-medium text-xs indic-text">
                                                            {item.narration || "-"}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="py-3.5 px-3 text-center border-b border-[#000000] dark:border-[#000000]">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* Image Icon - Click opens dish image in modal preview */}
                                                        <button
                                                            onClick={() => {
                                                                setPreviewImage(item.image || "/icons/action/Image.svg");
                                                                setIsPreviewOpen(true);
                                                            }}
                                                            className="p-1 group transition-transform hover:scale-110 cursor-pointer bg-transparent border-0 outline-none"
                                                            title="View Dish Image"
                                                        >
                                                            <img src="/icons/action/Image.svg" className="w-5 h-5 transition-transform group-hover:scale-110" alt="View Image" />
                                                        </button>

                                                        {!isReadOnly && (
                                                            <PermissionWrapper action="edit">
                                                                <button
                                                                    onClick={() => openModal(item)}
                                                                    className="p-1 group transition-transform hover:scale-110 cursor-pointer bg-transparent border-0 outline-none"
                                                                    title="Edit Entry"
                                                                >
                                                                    <img src="/icons/action/Edit.svg" className="w-5 h-5 transition-transform group-hover:scale-110" alt="Edit" />
                                                                </button>
                                                            </PermissionWrapper>
                                                        )}

                                                        <button
                                                            onClick={() => handleShareMenu(item)}
                                                            className="p-1 group transition-transform hover:scale-110 cursor-pointer bg-transparent border-0 outline-none"
                                                            title="Share Menu"
                                                        >
                                                            <img src="/icons/action/Share.svg" className="w-5 h-5 transition-transform group-hover:scale-110" alt="Share" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. Bottom Pagination Component */}
                <div className="pt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={displayedFeedbacks.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="entries"
                    />
                </div>

            </div>

            {/* Modal for Recording / Updating Daily Feedback */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-4xl bg-card rounded-[2rem] shadow-2xl overflow-hidden border border-border">
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold text-foreground tracking-tight">{isEditing ? "Update Daily Feedback" : "Record Daily Feedback"}</h2>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">Meal report, ratings, comments and dish image</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 max-h-[80vh] overflow-y-auto no-scrollbar">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-2xl bg-muted/50 border border-border text-foreground outline-none focus:border-primary transition-all font-semibold"
                                    />
                                    <div className="relative">
                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                                        <input
                                            type="number"
                                            value={studentCount}
                                            onChange={(e) => setStudentCount(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-muted/50 border border-border text-foreground outline-none focus:border-primary transition-all font-bold"
                                            placeholder="Students Present"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 rounded-[2rem] bg-muted/30 border border-border">
                                    {mealTypes.map((item, index) => (
                                        <button
                                            key={item._id}
                                            onClick={() => setMealType(item.name)}
                                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${mealType === item.name
                                                ? `${MEAL_COLORS[index % MEAL_COLORS.length]} bg-card shadow-md border-border/50 scale-105 z-10`
                                                : "border-transparent text-muted-foreground hover:bg-card/50"
                                                }`}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={menuName}
                                    onChange={(e) => setMenuName(e.target.value)}
                                    className="w-full h-11 px-5 bg-muted/50 border border-border rounded-2xl outline-none focus:border-primary transition-all font-bold text-sm text-foreground indic-text"
                                    placeholder="Menu Name"
                                />
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">General Narration / Summary</label>
                                    <textarea
                                        value={narration}
                                        onChange={(e) => setNarration(e.target.value)}
                                        className="w-full px-5 py-4 bg-muted/50 border border-border rounded-[1.5rem] outline-none focus:border-primary transition-all text-sm text-foreground font-medium min-h-[140px] resize-none indic-text"
                                        placeholder="Add overall meal feedback summary..."
                                    />
                                </div>
                                <div className="rounded-[2.5rem] border border-border bg-muted/30 p-6 shadow-inner">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Calculated Average</p>
                                            <p className="text-4xl font-black text-primary drop-shadow-sm">{averageRating}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((item) => (
                                                <Star key={item} size={22} fill={averageRating >= item ? "currentColor" : "none"} className={averageRating >= item ? "text-primary transition-all scale-110" : "text-muted-foreground/20"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2 mb-3">Dish Image</label>
                                    <div className="flex items-center gap-3">
                                        <label className={`flex-1 group ${uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                            <div className="rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/20 group-hover:bg-muted/40 group-hover:border-primary/50 transition-all p-5 min-h-[180px] flex items-center justify-center">
                                                {image ? (
                                                    <img src={image} alt="Dish" className="w-full h-40 object-cover rounded-[2rem] shadow-lg border border-border/50" />
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="w-14 h-14 rounded-3xl bg-card shadow-sm border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors">
                                                            {uploading ? <Loader2 size={24} className="animate-spin text-primary" /> : <ImageIcon size={24} />}
                                                        </div>
                                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{uploading ? 'Uploading Image...' : 'Click to upload dish image'}</p>
                                                    </div>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                            </div>
                                        </label>
                                        {image && (
                                            <button onClick={() => setImage(null)} className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 shadow-sm transition-all active:scale-95">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {ratings.map((item) => (
                                    <div key={item.id} className="rounded-[2rem] border border-border bg-muted/20 p-5 hover:bg-muted/30 transition-all shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Person {item.id}</span>
                                            <div className="flex gap-1.5 bg-card/50 p-1.5 rounded-2xl border border-border/50">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setRatings(prev => prev.map(entry => entry.id === item.id ? { ...entry, rating: star } : entry))}
                                                        className={`${item.rating >= star ? "text-amber-400 drop-shadow-sm scale-110" : "text-muted-foreground/20 hover:text-muted-foreground/40"} transition-all`}
                                                    >
                                                        <Star size={18} fill={item.rating >= star ? "currentColor" : "none"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={item.narration}
                                            onChange={(e) => setRatings(prev => prev.map(entry => entry.id === item.id ? { ...entry, narration: e.target.value } : entry))}
                                            placeholder="Add narration/comments..."
                                            className="w-full px-5 py-3.5 rounded-2xl bg-card border border-border text-foreground/80 outline-none focus:border-primary transition-all text-xs font-semibold placeholder:text-muted-foreground/30 indic-text"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-6 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground font-bold transition-all text-xs uppercase tracking-widest">Cancel</button>
                            <button onClick={handleSubmit} className="px-8 py-3.5 rounded-[1.25rem] bg-gradient-to-r from-[#882619] to-[#D4612D] text-white font-black uppercase tracking-widest text-[11px] hover:opacity-90 shadow-lg shadow-[#882619]/20 flex items-center gap-2 group transition-all active:scale-95">
                                Save Daily Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dish Image Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} />
                    <div className="relative max-w-4xl w-full">
                        <button onClick={() => setIsPreviewOpen(false)} className="absolute -top-12 right-0 p-3 rounded-full bg-card/10 border border-white/10 text-white hover:bg-card/20">
                            <X size={22} />
                        </button>
                        <img src={previewImage} alt="Dish Preview" className="w-full max-h-[80vh] object-contain rounded-[2rem] border border-white/10 shadow-2xl" />
                    </div>
                </div>
            )}

            {/* Master Data Manager (Source) */}
            <MasterDataManager
                isOpen={isMasterModalOpen}
                onClose={() => setIsMasterModalOpen(false)}
                onRefresh={async () => {
                    const mtUrl = companyId ? `/api/meal-types?companyId=${companyId}` : '/api/meal-types';
                    const mtRes = await fetch(mtUrl);
                    if (mtRes.ok) setMealTypes(await mtRes.json());
                }}
            />
        </div>
    );
}

export default function DailyMenuPage() {
    return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground font-bold bg-background">Loading...</div>}><DailyMenuContent /></Suspense>;
}
