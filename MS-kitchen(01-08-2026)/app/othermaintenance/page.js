"use client";
import CustomSelect from '../../components/CustomSelect';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import TableActionButton from "@/components/TableActionButton";
import { useCompany } from "@/context/CompanyContext";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Download,
    ArrowDownToLine,
    Trash2,
    Settings,
    Wrench,
    IndianRupee,
    Tag,
    FileText,
    X,
    CheckCircle2,
    Upload,
    File,
    Edit,
    Check,
    ChevronDown,
    Database
} from 'lucide-react';
import TableColumnFilter from '../../components/TableColumnFilter';
import SearchableSelect from '../../components/SearchableSelect';
import Link from 'next/link';
import Pagination from '../../components/Pagination';
import { formatIndianNumber } from '../../lib/formatters';
import { useToast } from '../../components/Toast';
import { generateStockPDF } from '../../lib/pdfGenerator';
import MasterDataManager from '@/components/MasterDataManager';
import { color } from 'highcharts';

export default function OtherMaintenancePage() {
    const { showToast } = useToast();
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();

    const [searchTerm, setSearchTerm] = useState("");
    const [colFilters, setColFilters] = useState({
        date: [],
        type: [],
        categoryName: [],
        narration: [],
        amount: [],
        time: [],
        event: []
    });
    const [activeFilterCol, setActiveFilterCol] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Purchase',
        categoryId: '',
        categoryName: '',
        narration: '',
        amount: '',
        time: '',
        event: '',
        bill: null
    });

    const [visibleCols, setVisibleCols] = useState({
        date: true,
        type: true,
        categoryName: true,
        narration: true,
        amount: true,
        bill: true
    });
    const [isHideShowDropdownOpen, setIsHideShowDropdownOpen] = useState(false);
    const hideShowDropdownRef = useRef(null);

    const editingRef = useRef(null);
    const handleSaveRef = useRef();
    const editingIdRef = useRef();

    useEffect(() => {
        handleSaveRef.current = handleSave;
        editingIdRef.current = editingId;
    }, [editingId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editingIdRef.current && editingRef.current && !editingRef.current.contains(event.target)) {
                handleSaveRef.current();
            }
            if (hideShowDropdownRef.current && !hideShowDropdownRef.current.contains(event.target)) {
                setIsHideShowDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    const fetchRecords = React.useCallback(async () => {
        const companyId = selectedCompanyIds?.[0];
        if (!companyId) {
            console.log("No companyId selected, skipping fetchRecords");
            setTransactions([]);
            return;
        }
        try {
            const query = `?companyId=${companyId}`;
            const res = await fetch(`/api/maintenance/records${query}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error("Fetch records failed:", error);
            setTransactions([]);
        }
    }, [selectedCompanyIds]);

    const fetchCategories = React.useCallback(async () => {
        try {
            const companyId = selectedCompanyIds?.[0];
            const query = companyId ? `?companyId=${companyId}` : '';
            const res = await fetch(`/api/categories${query}`);
            if (res.ok) {
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Fetch categories failure:", error);
            setCategories([]);
        }
    }, [selectedCompanyIds]);

    const [logCategories, setLogCategories] = useState([]);
    const fetchLogCategories = React.useCallback(async () => {
        try {
            const res = await fetch('/api/log-categories');
            if (res.ok) {
                const data = await res.json();
                setLogCategories(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error(e); }
    }, []);

    const [times, setTimes] = useState([]);
    const [eventOptions, setEventOptions] = useState([]);

    const fetchTimes = React.useCallback(async () => {
        try {
            const res = await fetch('/api/departments');
            if (res.ok) setTimes(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    const fetchEvents = React.useCallback(async () => {
        try {
            const res = await fetch('/api/events');
            if (res.ok) setEventOptions(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        fetchTimes();
        fetchEvents();
    }, [fetchTimes, fetchEvents]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchRecords(), fetchCategories(), fetchLogCategories()]);
            setLoading(false);
        };
        loadData();
    }, [fetchRecords, fetchCategories, fetchLogCategories]);

    const toggleColFilter = (colKey) => {
        setActiveFilterCol(activeFilterCol === colKey ? null : colKey);
    };

    const handleColFilterChange = (colKey, value) => {
        setColFilters(prev => {
            if (value === '') return { ...prev, [colKey]: [] };
            const current = prev[colKey] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [colKey]: updated };
        });
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setColFilters({
            date: [],
            type: [],
            categoryName: [],
            narration: [],
            amount: [],
            time: [],
            event: []
        });
        setActiveFilterCol(null);
    };

    const hasActiveFilters = searchTerm !== "" || Object.values(colFilters).some(v => v.length > 0);

    useEffect(() => {
        const handleFilterOutsideClick = (event) => {
            if (!event.target.closest('[data-col-filter-root="true"]')) {
                setActiveFilterCol(null);
            }
        };
        document.addEventListener('mousedown', handleFilterOutsideClick);
        return () => document.removeEventListener('mousedown', handleFilterOutsideClick);
    }, []);

    const uniqueTypes = useMemo(() => [...new Set(transactions.map(t => t.type?.name || t.type).filter(Boolean))].sort(), [transactions]);
    const uniqueCategories = useMemo(() => [...new Set(transactions.map(t => t.categoryId?.name || t.categoryName).filter(Boolean))].sort(), [transactions]);
    const uniqueDates = useMemo(() => [...new Set(transactions.map(t => new Date(t.date).toLocaleDateString('en-IN')).filter(Boolean))].sort(), [transactions]);
    const uniqueNarrations = useMemo(() => [...new Set(transactions.map(t => t.narration).filter(Boolean))].sort(), [transactions]);
    const uniqueAmounts = useMemo(() => [...new Set(transactions.map(t => String(t.amount)).filter(Boolean))].sort(), [transactions]);
    const uniqueTimes = useMemo(() => [...new Set(transactions.map(t => t.time?.name || t.time).filter(Boolean))].sort(), [transactions]);
    const uniqueEvents = useMemo(() => [...new Set(transactions.map(t => t.event?.name || t.event).filter(Boolean))].sort(), [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const checkTerm = (obj, term) => {
                if (!obj) return false;
                if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
                return String(obj).toLowerCase().includes(term);
            };
            const matchesSearch = !searchTerm || checkTerm(t, searchTerm.toLowerCase());

            const passColFilters = Object.entries(colFilters).every(([key, values]) => {
                if (!values || values.length === 0) return true;
                if (key === 'date') return values.includes(new Date(t.date).toLocaleDateString('en-IN'));
                if (key === 'type') return values.includes(t.type?.name || t.type);
                if (key === 'categoryName') return values.includes(t.categoryId?.name || t.categoryName);
                if (key === 'narration') return values.includes(t.narration);
                if (key === 'amount') return values.includes(String(t.amount));
                if (key === 'time') return values.includes(t.time?.name || t.time);
                if (key === 'event') return values.includes(t.event?.name || t.event);
                return true;
            });

            return matchesSearch && passColFilters;
        });
    }, [transactions, searchTerm, colFilters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, colFilters]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalExpense = useMemo(() => {
        const listToSum = selectedIds.length > 0
            ? transactions.filter(t => selectedIds.includes(t._id))
            : filteredTransactions;
        return listToSum.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    }, [transactions, filteredTransactions, selectedIds]);

    const allSelected = paginatedTransactions.length > 0 && paginatedTransactions.every((e) => selectedIds.includes(e._id));
    const toggleAll = () => allSelected
        ? setSelectedIds((p) => p.filter((id) => !paginatedTransactions.find((e) => e._id === id)))
        : setSelectedIds((p) => [...new Set([...p, ...paginatedTransactions.map((e) => e._id)])]);
    const toggleOne = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return;
        try {
            const companyId = selectedCompanyIds?.[0];
            const results = await Promise.all(selectedIds.map(id =>
                fetch(`/api/maintenance/records?id=${id}&companyId=${companyId}`, { method: 'DELETE' })
            ));

            if (results.every(r => r.ok)) {
                showToast("Records deleted successfully", 'success');
                setSelectedIds([]);
                fetchRecords();
            } else {
                showToast("Some records failed to delete", 'warning');
                fetchRecords();
            }
        } catch (error) {
            console.error(error);
            showToast("Bulk delete failed", 'error');
        }
    };

    const handleBulkDownload = () => {
        const selectedData = transactions.filter(t => selectedIds.includes(t._id));
        const rows = [["Date", "Time", "Event", "Type", "Category", "Narration", "Amount"]];
        selectedData.forEach((t) => {
            rows.push([
                t.date ? new Date(t.date).toLocaleDateString('en-IN') : '',
                t.time?.name || t.time || '',
                t.event?.name || t.event || '',
                t.type?.name || t.type || '',
                t.categoryId?.name || t.categoryName || '',
                (t.narration || '').replace(/,/g, ' '),
                String(t.amount ?? '')
            ]);
        });
        const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `maintenance-selected-${new Date().getTime()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDownload = () => {
        const rows = [["Date", "Time", "Event", "Type", "Category", "Narration", "Amount"]];
        filteredTransactions.forEach((t) => {
            rows.push([
                t.date ? new Date(t.date).toLocaleDateString('en-IN') : '',
                t.time?.name || t.time || '',
                t.event?.name || t.event || '',
                t.type?.name || t.type || '',
                t.categoryId?.name || t.categoryName || '',
                (t.narration || '').replace(/,/g, ' '),
                String(t.amount ?? '')
            ]);
        });
        const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "other-maintenance-records.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleEdit = async (record) => {
        setFormData({
            date: record.date.split('T')[0],
            type: record.type?._id || record.type || '',
            categoryId: record.categoryId?._id || record.categoryId || '',
            categoryName: record.categoryId?.name || record.categoryName || '',
            narration: record.narration || '',
            amount: record.amount || '',
            time: record.time?._id || record.time || '',
            event: record.event?._id || record.event || '',
            bill: null
        });
        setEditingId(record._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            type: '',
            categoryId: '',
            categoryName: '',
            narration: '',
            amount: '',
            time: '',
            event: '',
            bill: null
        });
        setIsEditing(false);
        setEditingId(null);
    };

    async function handleSave() {
        if (isReadOnly) return;
        try {
            const data = new FormData();
            data.append('date', formData.date);
            data.append('type', formData.type);

            // Clean categoryId: send null if empty to avoid Mongoose cast errors
            const finalCategoryId = (formData.categoryId && formData.categoryId !== "null" && formData.categoryId !== "")
                ? formData.categoryId
                : "";

            data.append('categoryId', finalCategoryId);
            data.append('categoryName', formData.categoryName);
            data.append('narration', formData.narration);
            data.append('amount', formData.amount);
            data.append('time', formData.time);
            data.append('event', formData.event);

            if (selectedCompanyIds?.[0]) data.append('companyId', selectedCompanyIds[0]);
            if (formData.bill) data.append('bill', formData.bill);
            if (editingId) data.append('id', editingId);

            const res = await fetch('/api/maintenance/records', {
                method: editingId ? 'PUT' : 'POST',
                body: data
            });

            if (res.ok) {
                showToast(editingId ? "Record updated successfully" : "Record saved successfully", 'success');
                resetForm();
                setIsModalOpen(false);
                fetchRecords();
            } else {
                const errorData = await res.json().catch(() => ({}));
                showToast(errorData.error || "Failed to save record", 'error');
            }
        } catch (error) {
            console.error("Save error:", error);
            showToast("Error saving record", 'error');
        }
    };

    const formLabelClass = "text-[11px] font-bold text-muted-foreground md:text-right pr-2 uppercase leading-snug";
    const inlineFieldClass = "grid grid-cols-1 items-center gap-2 md:grid-cols-[120px_minmax(0,1fr)]";

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        await handleSave();
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this record?")) return;
        try {
            const companyId = selectedCompanyIds?.[0];
            const query = companyId ? `&companyId=${companyId}` : '';
            const res = await fetch(`/api/maintenance/records?id=${id}${query}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Record deleted successfully", 'success');
                fetchRecords();
            } else {
                showToast("Failed to delete record", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("Error deleting record", 'error');
        }
    };



    if (permsLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#ff7d22] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading Maintenance Data...</p>
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
                        You don&apos;t have permission to view Other Maintenance records. Please contact your administrator for access.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6" style={{ fontFamily: 'ITCAvantGardeStd' }}>
            <div className="bg-card rounded-lg shadow-2xl overflow-hidden mx-auto">
                {/* Single Combined Header Container */}
                <div className="bg-white dark:bg-[#252525] shadow-sm">
                    {/* 1. Top Bar */}
                    <div className="bg-white dark:bg-[#252525] rounded-t-lg py-2.5 px-6 md:px-8 border-b border-[#882619] flex justify-end items-center gap-4">
                        {/* Checkmark */}
                        <div className="flex items-center gap-1.5 mr-1">
                            <span className="text-[#15803D] font-black text-base select-none" title="All entries correct">                                                            <Check size={18} className="text-emerald-600 font-bold" strokeWidth={3} />
                            </span>
                        </div>

                        {/* Columns Hide / Unhide Dropdown */}
                        <div ref={hideShowDropdownRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsHideShowDropdownOpen(!isHideShowDropdownOpen)}
                                className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-zinc-300 dark:hover:text-white transition-colors shadow-sm cursor-pointer"
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
                                                { key: 'date', label: 'Date' },
                                                { key: 'type', label: 'Type' },
                                                { key: 'categoryName', label: 'Category' },
                                                { key: 'time', label: 'Time' },
                                                { key: 'event', label: 'Event' },
                                                { key: 'narration', label: 'Narration' },
                                                { key: 'amount', label: 'Amount' }
                                            ].map(col => (
                                                <label key={col.key} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer text-xs font-bold text-slate-700 dark:text-zinc-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleCols[col.key] !== false}
                                                        onChange={() => setVisibleCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
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
                        {!isReadOnly && (
                            <PermissionWrapper action="source">
                                <button
                                    type="button"
                                    onClick={() => setIsMasterModalOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-0 outline-none text-[#882619] dark:text-[#D4612D] font-extrabold text-xs hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <img src="/icons/action/Source.svg" className="w-5 h-5 block dark:hidden" alt="Source" />
                                    <img src="/icons/action/SourceDark.svg" className="w-5 h-5 hidden dark:block" alt="Source" />
                                    <span>Source</span>
                                </button>
                            </PermissionWrapper>
                        )}
                    </div>

                    {/* 2. Main Header Banner Box */}
                    <div className="bg-[#E5E5E5] dark:bg-[#252525] py-4 px-6 md:px-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-[#882619] mb-6">
                        {/* Left: Other EXP. & Subtitle */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-baseline gap-2">
                                <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">Other</span>{' '}
                                <span className="text-[#3A3A3A] dark:text-zinc-200">EXP.</span>
                            </h1>
                        </div>

                        {/* Right: Search & Action Icons */}
                        <div className="flex flex-wrap items-center gap-4 self-end xl:self-auto relative">
                            {/* Quick Search */}
                            <div className="relative group w-full sm:w-64">
                                <div className="gradient-pill-input flex items-center pl-4 pr-3 py-2 shadow-sm">
                                    <div className="text-[#D4612D] shrink-0 mr-2 flex items-center">
                                        <Search size={16} strokeWidth={2} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Quick Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-transparent text-sm font-normal text-slate-800 dark:text-zinc-100 outline-none placeholder:text-[#C2C2C2]"
                                    />
                                </div>
                            </div>

                            {/* Clear Filters (if active) */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-emerald-600 transition-all cursor-pointer bg-transparent border-0 outline-none"
                                    title="Clear Filters"
                                >
                                    <X size={16} className="text-emerald-600" />
                                    <span className="text-[10px] font-bold leading-none text-emerald-600">Clear</span>
                                </button>
                            )}

                            {/* Action Buttons: Add, Delete, Download */}
                            <div className="flex items-center gap-4">
                                {/* Add Button */}
                                {!isReadOnly && (
                                    <PermissionWrapper action="write">
                                        <button
                                            type="button"
                                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                                            className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none mb-3.5"
                                        >
                                            <img src="/icons/action/Add.svg" className="w-9 h-9 block dark:hidden" alt="Add" />
                                            <img src="/icons/action/AddDark.svg" className="w-9 h-9 hidden dark:block" alt="Add" />
                                            <span className="text-[10px] font-bold text-[#882619] dark:text-[#D4612D] leading-none">Add</span>
                                        </button>
                                    </PermissionWrapper>
                                )}

                                {/* Delete Button */}
                                {!isReadOnly && (
                                    <PermissionWrapper action="delete">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (selectedIds.length > 0) {
                                                    handleBulkDelete();
                                                } else {
                                                    showToast("Select items to delete", "info");
                                                }
                                            }}
                                            className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none"
                                            title={selectedIds.length > 0 ? `Delete (${selectedIds.length})` : "Delete"}
                                        >
                                            <img src="/icons/action/Delete.svg" className="w-10 h-10 block" alt="Delete" />
                                        </button>
                                    </PermissionWrapper>
                                )}

                                {/* Download Button */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                                        className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none"
                                        title="Download"
                                    >
                                        <img src="/icons/action/Download.svg" className="w-16 h-16 block dark:hidden" alt="Download" />
                                        <img src="/icons/action/DownloadDark.svg" className="w-16 h-16 hidden dark:block" alt="Download" />
                                    </button>
                                    <AnimatePresence>
                                        {isDownloadOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 top-12 w-56 bg-card rounded-2xl shadow-2xl py-2 z-[100] overflow-hidden border border-border"
                                            >
                                                <button
                                                    onClick={() => { handleDownload(); setIsDownloadOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-foreground/80 hover:bg-muted transition-colors border-b border-border"
                                                >
                                                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                                    </div>
                                                    Export as CSV
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const dataRows = filteredTransactions.map(t => [
                                                            t.date ? new Date(t.date).toLocaleDateString('en-IN') : '',
                                                            t.type?.name || t.type || '',
                                                            t.categoryName || '',
                                                            t.narration || '',
                                                            String(t.amount ?? '')
                                                        ]);
                                                        const headers = ['Date', 'Type', 'Category', 'Narration', 'Amount'];
                                                        const title = "Other Maintenance Records";
                                                        const fileName = `Maintenance_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

                                                        await generateStockPDF({
                                                            title,
                                                            headers,
                                                            data: dataRows,
                                                            fileName,
                                                            companyName,
                                                            companyAddress,
                                                            companyPhone
                                                        });
                                                        setIsDownloadOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-foreground/80 hover:bg-muted transition-colors"
                                                >
                                                    <div className="p-2 bg-red-500/10 text-red-600 rounded-lg">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                                    </div>
                                                    Export as PDF
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                    {selectedCompanyIds.length === 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 text-red-600">
                            <ShieldAlert size={24} />
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest">Action Required</p>
                                <p className="text-xs font-bold mt-1">Please select a Single Company from the global filter to manage maintenance records.</p>
                            </div>
                        </div>
                    )}

                    <div>
                        {loading ? (
                            <div className="bg-card rounded-xl p-12 text-center text-muted-foreground">Loading records...</div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="bg-card rounded-xl p-12 text-center text-muted-foreground">
                                No maintenance records found.
                            </div>
                        ) : (
                            <>
                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-4">
                                    {paginatedTransactions.map((t) => (
                                        <div key={t._id} className="bg-card rounded-xl shadow-sm p-5 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">
                                                        {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="font-black text-foreground mt-0.5">{t.type?.name || t.type}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {t.time && <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">{t.time?.name || t.time}</span>}
                                                        {t.event && <span className="text-[10px] font-bold bg-orange-50 px-2 py-0.5 rounded text-orange-600">{t.event?.name || t.event}</span>}
                                                    </div>
                                                </div>
                                                <p className="font-black text-orange-600">
                                                    ₹ {formatIndianNumber(Number(t.amount))}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-stone-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-stone-100/50">
                                                    <Tag size={12} /> {t.categoryId?.name || t.categoryName || 'Uncategorized'}
                                                </span>
                                                {t.billPath && (
                                                    <Link
                                                        href={t.billPath}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100/50"
                                                    >
                                                        <File size={12} /> Bill
                                                    </Link>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg border border-border italic leading-relaxed">
                                                "{t.narration || <span className="text-muted-foreground/50 italic">No description</span>}"
                                            </p>

                                            <div className="flex justify-end gap-3 pt-2 border-t border-stone-50">
                                                <PermissionWrapper action="edit">
                                                    <button
                                                        onClick={() => handleEdit(t)}
                                                        className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                </PermissionWrapper>
                                                <PermissionWrapper action="delete">
                                                    <button
                                                        onClick={() => handleDelete(t._id)}
                                                        className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </PermissionWrapper>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden md:block bg-card  overflow-hidden  shadow-sm mb-6">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-0">
                                            <thead>
                                                <tr className="bg-[#F8F7F6] dark:bg-zinc-800 text-black dark:text-zinc-200 font-bold text-xs whitespace-nowrap double-header-row">
                                                    <th className="px-4 py-4 text-center border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            onChange={toggleAll}
                                                            className="h-4 w-4 rounded border-slate-400 text-[#882619] focus:ring-[#882619] cursor-pointer"
                                                        />
                                                    </th>
                                                    {visibleCols['date'] !== false && (
                                                        <th className="px-6 py-4 relative border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                            <TableColumnFilter colKey="date" title={<><span className="text-[#882619] dark:text-[#D4612D] mr-1 font-black">*</span>Date</>} options={uniqueDates} showOptionIcon iconSrc="/icons/action/Fillter.svg" colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </th>
                                                    )}
                                                    {visibleCols['type'] !== false && (
                                                        <th className="px-6 py-4 relative border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                            <TableColumnFilter colKey="type" title={<><span className="text-[#882619] dark:text-[#D4612D] mr-1 font-black">*</span>Type</>} options={uniqueTypes} showOptionIcon iconSrc="/icons/action/Fillter.svg" colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </th>
                                                    )}
                                                    {visibleCols['categoryName'] !== false && (
                                                        <th className="px-6 py-4 relative border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                            <TableColumnFilter colKey="categoryName" title={<><span className="text-[#882619] dark:text-[#D4612D] mr-1 font-black">*</span>Category</>} options={uniqueCategories} showOptionIcon iconSrc="/icons/action/Fillter.svg" colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </th>
                                                    )}
                                                    {visibleCols['time'] !== false && (
                                                        <th className="px-6 py-4 relative border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                            <TableColumnFilter colKey="time" title={<><span className="text-[#882619] dark:text-[#D4612D] mr-1 font-black">*</span>Time</>} options={uniqueTimes} showOptionIcon iconSrc="/icons/action/Fillter.svg" colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </th>
                                                    )}
                                                    {visibleCols['event'] !== false && (
                                                        <th className="px-6 py-4 relative border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                            <TableColumnFilter colKey="event" title="Event" options={uniqueEvents} showOptionIcon iconSrc="/icons/action/Fillter.svg" colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </th>
                                                    )}
                                                    {visibleCols['narration'] !== false && (
                                                        <th className="px-6 py-4 relative border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                            <TableColumnFilter colKey="narration" title="Narration" options={uniqueNarrations} showOptionIcon iconSrc="/icons/action/Fillter.svg" colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </th>
                                                    )}
                                                    {visibleCols['amount'] !== false && (
                                                        <th className="px-6 py-4 relative text-right border-r border-[#A4A4A4] border-b-4 border-double border-[#575757]">
                                                            <TableColumnFilter colKey="amount" title="Amount" options={uniqueAmounts} showOptionIcon iconSrc="/icons/action/Fillter.svg" colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </th>
                                                    )}
                                                    <th className="px-6 py-4 text-center border-b-4 border-double border-[#575757]">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#000000] font-medium">
                                                {paginatedTransactions.map((t) => {
                                                    return (
                                                        <tr key={t._id} className={`hover:bg-slate-50/70 dark:hover:bg-zinc-800/60 transition-colors border-b border-[#000000] group ${selectedIds.includes(t._id) ? 'bg-orange-50/40' : ''}`}>
                                                            <td className="px-4 py-4 text-center border-r border-[#A4A4A4]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(t._id)}
                                                                    onChange={() => toggleOne(t._id)}
                                                                    className="h-4 w-4 rounded border-slate-400 text-[#882619] focus:ring-[#882619] cursor-pointer"
                                                                />
                                                            </td>
                                                            {visibleCols['date'] !== false && (
                                                                <td className="px-6 py-4 border-r border-[#A4A4A4]">
                                                                    <span className="text-slate-900 dark:text-zinc-100 text-sm font-extrabold tracking-tight">{new Date(t.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                                                                </td>
                                                            )}
                                                            {visibleCols['type'] !== false && (
                                                                <td className="px-6 py-4 border-r border-[#A4A4A4]">
                                                                    <span className="text-slate-800 dark:text-zinc-200 text-sm font-medium">
                                                                        {t.type?.name || t.type}
                                                                    </span>
                                                                </td>
                                                            )}
                                                            {visibleCols['categoryName'] !== false && (
                                                                <td className="px-6 py-4 border-r border-[#A4A4A4]">
                                                                    <span className="text-slate-900 dark:text-zinc-100 text-sm font-extrabold">
                                                                        {t.categoryId?.name || t.categoryName || '—'}
                                                                    </span>
                                                                </td>
                                                            )}
                                                            {visibleCols['time'] !== false && (
                                                                <td className="px-6 py-4 border-r border-[#A4A4A4]">
                                                                    <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent text-sm font-extrabold">
                                                                        {t.time?.name || t.time || '—'}
                                                                    </span>
                                                                </td>
                                                            )}
                                                            {visibleCols['event'] !== false && (
                                                                <td className="px-6 py-4 border-r border-[#A4A4A4]">
                                                                    <span className="text-slate-900 dark:text-zinc-100 text-sm font-extrabold">{t.event?.name || t.event || '—'}</span>
                                                                </td>
                                                            )}
                                                            {visibleCols['narration'] !== false && (
                                                                <td className="px-6 py-4 max-w-xs border-r border-[#A4A4A4]">
                                                                    <p className="text-sm text-slate-700 dark:text-zinc-300 font-normal line-clamp-1">{t.narration || '—'}</p>
                                                                </td>
                                                            )}
                                                            {visibleCols['amount'] !== false && (
                                                                <td className="px-6 py-4 border-r border-[#A4A4A4]">
                                                                    <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent text-sm font-extrabold">₹ {formatIndianNumber(Number(t.amount || 0))}</span>
                                                                </td>
                                                            )}
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex justify-center items-center gap-3">
                                                                    {!isReadOnly && (
                                                                        <>
                                                                            <PermissionWrapper action="edit">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleEdit(t)}
                                                                                    className="p-1 hover:opacity-80 transition-opacity bg-transparent border-0 outline-none cursor-pointer"
                                                                                    title="Edit"
                                                                                >
                                                                                    <img src="/icons/action/Edit.svg" className="w-5 h-5 block" alt="Edit" />
                                                                                </button>
                                                                            </PermissionWrapper>
                                                                            <PermissionWrapper action="delete">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDelete(t._id)}
                                                                                    className="p-1 hover:opacity-80 transition-opacity bg-transparent border-0 outline-none cursor-pointer"
                                                                                    title="Delete"
                                                                                >
                                                                                    <img src="/icons/action/Delete.svg" className="w-8 h-8 block dark:hidden" alt="Delete" />
                                                                                    <img src="/icons/action/DeleteDark.svg" className="w-8 h-8 hidden dark:block" alt="Delete" />
                                                                                </button>
                                                                            </PermissionWrapper>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={filteredTransactions.length}
                                        itemsPerPage={itemsPerPage}
                                        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                                    />
                                </div>
                            </>
                        )}

                        {/* Float Modal */}
                        <AnimatePresence>
                            {isModalOpen && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-white dark:bg-[#1a1a1a] w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
                                    >
                                        {/* Gradient Header Banner */}
                                        <div className="bg-gradient-to-r from-[#882619] to-[#D4612D] py-7 px-8 text-center relative shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="absolute top-5 right-6 text-white/80 hover:text-white transition-colors bg-transparent border-0 outline-none cursor-pointer"
                                            >
                                                <X size={22} />
                                            </button>
                                            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                                                {isEditing ? 'Edit Record' : 'New Record'}
                                            </h2>
                                            <p className="text-xs italic text-white/90 font-medium mt-1">
                                                Maintenance expenditure log
                                            </p>
                                        </div>

                                        {/* Form Body */}
                                        <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                {/* Date */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-24 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-zinc-200">Date :</label>
                                                    <div className="gradient-pill-input flex-1 flex items-center px-3 py-2 shadow-sm">
                                                        <div className="text-[#D4612D] shrink-0 mr-2 flex items-center">
                                                            <Calendar size={16} />
                                                        </div>
                                                        <input
                                                            type="date"
                                                            required
                                                            value={formData.date}
                                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none placeholder:text-[#C2C2C2]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Time */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-24 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-zinc-200">Time :</label>
                                                    <div className="gradient-pill-input flex-1 flex items-center px-3 py-2 shadow-sm">
                                                        <SearchableSelect
                                                            options={times.map(t => ({ value: t._id, label: t.name }))}
                                                            value={formData.time}
                                                            onChange={(val) => setFormData({ ...formData, time: val })}
                                                            placeholder="Select Time"
                                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none flex items-center justify-between"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Type */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-24 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-zinc-200">Type :</label>
                                                    <div className="gradient-pill-input flex-1 flex items-center px-3 py-2 shadow-sm">
                                                        <SearchableSelect
                                                            options={logCategories.map(l => ({ value: l._id, label: l.name }))}
                                                            value={formData.type}
                                                            onChange={(val) => setFormData({ ...formData, type: val })}
                                                            placeholder="Quick Search"
                                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none flex items-center justify-between"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Event */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-24 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-zinc-200">Event :</label>
                                                    <div className="gradient-pill-input flex-1 flex items-center px-3 py-2 shadow-sm">
                                                        <SearchableSelect
                                                            options={eventOptions.map(e => ({ value: e._id, label: e.name }))}
                                                            value={formData.event}
                                                            onChange={(val) => setFormData({ ...formData, event: val })}
                                                            placeholder="Quick Search"
                                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none flex items-center justify-between"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Category */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 shrink-0 text-right flex flex-col items-end">
                                                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-200">Category :</label>
                                                        {!isReadOnly && (
                                                            <button type="button" onClick={() => setIsMasterModalOpen(true)} className="text-[9px] font-black uppercase text-[#D4612D] hover:underline">+ Manage</button>
                                                        )}
                                                    </div>
                                                    <div className="gradient-pill-input flex-1 flex items-center px-3 py-2 shadow-sm">
                                                        <SearchableSelect
                                                            options={categories.map(c => ({ value: c._id, label: c.name }))}
                                                            value={formData.categoryId}
                                                            onChange={(val) => {
                                                                const cat = categories.find(c => c._id === val);
                                                                setFormData({ ...formData, categoryId: val, categoryName: cat?.name || '' });
                                                            }}
                                                            placeholder="Quick Search"
                                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none flex items-center justify-between"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-24 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-zinc-200">Amount :</label>
                                                    <div className="gradient-pill-input flex-1 flex items-center px-3 py-2 shadow-sm">
                                                        <input
                                                            type="number"
                                                            placeholder="Quick Search"
                                                            required
                                                            value={formData.amount}
                                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none placeholder:text-[#C2C2C2]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Narration */}
                                                <div className="flex items-center gap-3">
                                                    <label className="w-24 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-zinc-200">Narration :</label>
                                                    <div className="gradient-pill-input flex-1 flex items-center px-3 py-2 shadow-sm">
                                                        <input
                                                            type="text"
                                                            placeholder="Quick Search"
                                                            required
                                                            value={formData.narration}
                                                            onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                                                            className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none placeholder:text-[#C2C2C2]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Invoice Upload Area */}
                                                <div className="flex items-start gap-3 pt-1">
                                                    <label className="w-24 shrink-0 text-right text-xs font-bold text-slate-700 dark:text-zinc-200 pt-2">Invoice :</label>
                                                    <div className="flex-1">
                                                        <label className="border-2 border-dashed border-[#882619]/30 hover:border-[#D4612D] dark:border-zinc-700 dark:hover:border-[#D4612D] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-zinc-900/50">
                                                            <input
                                                                type="file"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) => setFormData({ ...formData, bill: e.target.files?.[0] || null })}
                                                                className="hidden"
                                                            />
                                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center mb-1.5 text-[#D4612D]">
                                                                <img src="/icons/action/Image.svg" className="w-5 h-5 block" alt="Browse" />
                                                                <span className="text-[7px] font-bold text-[#D4612D] leading-none mt-0.5">click to browse</span>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                                                                {formData.bill ? formData.bill.name : 'Drag and drop font file to upload'}
                                                            </p>
                                                            <p className="text-[9px] text-slate-400 dark:text-zinc-400 mt-0.5">
                                                                Supports PNG, JPG, PDF, WEBP etc.. up to any size
                                                            </p>
                                                        </label>
                                                        {isEditing && transactions.find(t => t._id === editingId)?.billPath && (
                                                            <div className="mt-2 text-[10px] font-bold text-[#D4612D] flex items-center gap-2">
                                                                <span>Current Bill:</span>
                                                                <a
                                                                    href={transactions.find(t => t._id === editingId).billPath}
                                                                    target="_blank"
                                                                    className="text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full"
                                                                >
                                                                    <File size={10} /> View Current File
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <div className="pt-3">
                                                    <button
                                                        type="submit"
                                                        className="w-full py-3.5 bg-gradient-to-r from-[#882619] to-[#D4612D] text-white font-bold text-sm rounded-xl shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                                                    >
                                                        {isEditing ? 'Update Record' : 'Save New Record'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Master Data Manager */}
                        < MasterDataManager
                            isOpen={isMasterModalOpen}
                            onClose={() => setIsMasterModalOpen(false)}
                            onRefresh={() => { fetchCategories(); fetchLogCategories(); }}
                            allowedTabs={['categories', 'logCategories', 'events', 'departments']}
                        />

                        {/* Image Preview Modal */}
                        <AnimatePresence>
                            {previewImage && (
                                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="relative max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col items-center gap-4"
                                    >
                                        <button
                                            onClick={() => setPreviewImage(null)}
                                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                        <h4 className="text-base font-black text-slate-800 dark:text-zinc-100">Attached Bill / Image</h4>
                                        <div className="max-h-[70vh] overflow-auto flex justify-center items-center w-full bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                                            {previewImage.toLowerCase().endsWith('.pdf') ? (
                                                <iframe src={previewImage} className="w-full h-[60vh] rounded-lg" title="PDF Preview" />
                                            ) : (
                                                <img src={previewImage} alt="Bill Preview" className="max-h-[60vh] object-contain rounded-lg shadow-sm" />
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <a
                                                href={previewImage}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-5 py-2.5 bg-gradient-to-r from-[#882619] to-[#D4612D] text-white rounded-xl font-bold text-xs hover:opacity-90 transition-opacity shadow-md"
                                            >
                                                Open Full File
                                            </a>
                                            <button
                                                onClick={() => setPreviewImage(null)}
                                                className="px-5 py-2.5 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-xs hover:bg-slate-300 transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div >
            </div>
        </div>
    );
}
