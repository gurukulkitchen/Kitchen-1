"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Edit3, ShieldAlert, Plus, Edit2, Trash2, X, Search, IndianRupee, Calendar, User, Phone, MapPin, Mail, Hash, CreditCard, FileText, Check, Settings, Download, ChevronDown, Database, ArrowDownToLine } from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import Pagination from '../../components/Pagination';
import { formatIndianNumber } from '../../lib/formatters';
import MasterDataManager from '@/components/MasterDataManager';
import TableColumnFilter from '@/components/TableColumnFilter';
import TableActionButton from '@/components/TableActionButton';
import SearchableSelect from '@/components/SearchableSelect';
import MonthYearPicker from '@/components/MonthYearPicker';
import { useToast } from '@/components/Toast';
import { useFormStore } from '@/lib/store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';
import { color } from 'highcharts';
import DateTimePicker from '@/components/DateTimePicker';

export default function DonationPage() {
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();
    const [eventTypes, setEventTypes] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [filterMode, setFilterMode] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const [colFilters, setColFilters] = useState({});
    const [activeFilterCol, setActiveFilterCol] = useState(null);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [visibleCols, setVisibleCols] = useState({
        receiptNo: true,
        date: true,
        donor: true,
        city: true,
        amount: true,
        action: true,
    });
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const hasActiveFilters = useMemo(() => {
        const now = new Date();
        const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        return (searchTerm !== '') ||
            (filterMode !== 'All') ||
            (filterType !== 'All') ||
            (selectedMonth !== defaultMonth && selectedMonth !== '') ||
            (colFilters && Object.values(colFilters).some(v => v && v.length > 0));
    }, [searchTerm, filterMode, filterType, selectedMonth, colFilters]);

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilterMode('All');
        setFilterType('All');
        const now = new Date();
        setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        setColFilters({});
        setActiveFilterCol(null);
    };


    const initialEntry = {
        receiptNo: '',
        date: new Date().toISOString().split('T')[0],
        phone: '',
        name: '',
        address: '',
        city: '',
        pincode: '',
        panNo: '',
        aadharNo: '',
        email: '',
        amount: '',
        donationMode: '',
        chequeNo: '',
        bankName: '',
        notes: '',
        eventType: ''
    };

    const [currentEntry, setCurrentEntry] = useState(initialEntry);
    const [editingId, setEditingId] = useState(null);
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store

    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const scrollRef = useRef(null);
    const [showScrollHint, setShowScrollHint] = useState(true);

    const handleFormScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
        setShowScrollHint(!atBottom);
    }, []);

    const generatePDF = async (entry) => {
        const element = document.getElementById(`receipt-template-${entry._id}`);
        const canvas = await html2canvas(element, {
            scale: 4,
            useCORS: true,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const receiptWidth = pageWidth - 40;
        const receiptHeight = (canvas.height * receiptWidth) / canvas.width;

        const xCentered = (pageWidth - receiptWidth) / 2;
        const yCentered = (pageHeight - receiptHeight) / 2;

        pdf.addImage(imgData, 'PNG', xCentered, yCentered, receiptWidth, receiptHeight);
        pdf.save(`Receipt_${entry.receiptNo}.pdf`);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState(new Set());

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedRows(new Set());
    }, [searchTerm, selectedMonth, filterMode, filterType, colFilters]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!event.target.closest('[data-col-filter-root="true"]')) {
                setActiveFilterCol(null);
            }
            if (!event.target.closest('[data-download-menu="true"]')) {
                setShowDownloadMenu(false);
            }
            if (!event.target.closest('[data-column-menu="true"]')) {
                setShowColumnMenu(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    useEffect(() => {
        if (selectedCompanyIds.length > 0) {
            fetchEntries();
        }
        fetchEventTypes();
        fetchPaymentModes();
    }, [selectedCompanyIds]);

    async function fetchEntries() {
        try {
            const query = selectedCompanyIds.length > 0 ? `?companyId=${selectedCompanyIds.join(',')}` : '';
            const res = await fetch(`/api/donation${query}`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    async function fetchEventTypes() {
        if (selectedCompanyIds.length === 0) {
            setEventTypes([]);
            return;
        }
        try {
            const query = `?companyId=${selectedCompanyIds[0]}`;
            const res = await fetch(`/api/donation-event-types${query}`);
            if (res.ok) {
                const data = await res.json();
                setEventTypes(data);
            }
        } catch (error) {
            console.error("Fetch event types error:", error);
        }
    };

    async function fetchPaymentModes() {
        if (selectedCompanyIds.length === 0) {
            setPaymentModes([]);
            return;
        }
        try {
            const query = `?companyId=${selectedCompanyIds[0]}`;
            const res = await fetch(`/api/payment-modes${query}`);
            if (res.ok) {
                const data = await res.json();
                setPaymentModes(data);
            }
        } catch (error) {
            console.error("Fetch payment modes error:", error);
        }
    };

    const handlePhoneChange = (phone) => {
        setCurrentEntry(prev => ({ ...prev, phone }));
        setIsAutoFilled(false);

        // Once 10 digits are entered, look up a previous donor
        if (/^\d{10}$/.test(phone)) {
            const match = entries.find(e => String(e.phone).trim() === phone.trim() && e._id !== editingId);
            if (match) {
                setCurrentEntry(prev => ({
                    ...prev,
                    phone,
                    name: match.name || prev.name || '',
                    email: match.email || prev.email || '',
                    address: match.address || prev.address || '',
                    city: match.city || prev.city || '',
                    pincode: match.pincode || prev.pincode || '',
                    panNo: match.panNo || prev.panNo || '',
                    aadharNo: match.aadharNo || prev.aadharNo || '',
                }));
                setIsAutoFilled(true);
                showToast(`Donor details auto-filled from Receipt #${match.receiptNo}.`, "success", 3500);
            }
        }
    };
    useEffect(() => {
        const persistedData = forms['donation'];
        if (persistedData) {
            if (persistedData.searchTerm) setSearchTerm(persistedData.searchTerm);
            if (persistedData.selectedMonth) setSelectedMonth(persistedData.selectedMonth);
            if (persistedData.filterMode) setFilterMode(persistedData.filterMode);
            if (persistedData.filterType) setFilterType(persistedData.filterType);
            if (persistedData.currentEntry) setCurrentEntry(persistedData.currentEntry);
            if (persistedData.colFilters) setColFilters(persistedData.colFilters);
            if (persistedData.visibleCols) setVisibleCols(persistedData.visibleCols);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setFormData('donation', {
                searchTerm, selectedMonth, filterMode, filterType, currentEntry, colFilters, visibleCols
            });
        }
    }, [searchTerm, selectedMonth, filterMode, filterType, currentEntry, colFilters, visibleCols, isHydrated]);

    const handleSave = async () => {
        if (isReadOnly) return;

        if (!currentEntry.phone?.trim() || !/^\d{10}$/.test(currentEntry.phone.trim())) {
            return showToast("Please enter a valid 10-digit phone number.", "error", 3500);
        }

        if (!currentEntry.receiptNo?.trim()) {
            return showToast("Receipt No is required.", "error", 3500);
        }

        const isEditing = !!editingId;
        const duplicateReceipt = entries.find((e) => String(e.receiptNo).trim() === String(currentEntry.receiptNo).trim() && e._id !== editingId);

        if (duplicateReceipt) {
            return showToast(`Receipt No "${currentEntry.receiptNo}" already exists. Please use a unique Receipt No.`, "error", 4000);
        }

        if (!currentEntry.date) {
            return showToast("Date is required.", "error", 3500);
        }

        if (!currentEntry.name?.trim()) {
            return showToast("Full Name is required.", "error", 3500);
        }

        if (currentEntry.email && currentEntry.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEntry.email.trim())) {
            return showToast("Please enter a valid email address.", "error", 3500);
        }

        if (!currentEntry.amount || Number(currentEntry.amount) <= 0) {
            return showToast("Please enter a valid amount greater than 0.", "error", 3500);
        }

        if (!currentEntry.donationMode) {
            return showToast("Payment Mode is required.", "error", 3500);
        }

        if (currentEntry.panNo && currentEntry.panNo.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(currentEntry.panNo.trim())) {
            return showToast("Please enter a valid PAN number (e.g. ABCDE1234F).", "error", 3500);
        }

        if (currentEntry.aadharNo && currentEntry.aadharNo.trim() && !/^\d{12}$/.test(currentEntry.aadharNo.replace(/\s/g, ''))) {
            return showToast("Please enter a valid 12-digit Aadhar number.", "error", 3500);
        }

        try {
            const url = isEditing ? `/api/donation/${editingId}` : '/api/donation';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...currentEntry,
                    companyId: isReadOnly ? undefined : selectedCompanyIds[0]
                })
            });

            if (res.ok) {
                await fetchEntries();
                closeModal();
                showToast(isEditing ? "Receipt updated successfully!" : "Donation saved successfully!", "success", 3000);
            } else {
                const err = await res.json();
                showToast(`Failed to save: ${err.message || 'Unknown error'}`, "error", 4000);
            }
        } catch (error) {
            console.error("Save error:", error);
            showToast("An error occurred while saving.", "error", 3500);
        }
    };

    const openEdit = (entry) => {
        setEditingId(entry._id);
        setCurrentEntry({
            ...initialEntry,
            ...entry,
            donationMode: entry.donationMode?._id || entry.donationMode || '',
            eventType: entry.eventType?._id || entry.eventType || '',
            date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : ''
        });
        setShowScrollHint(true);
        setIsModalOpen(true);
    };

    const deleteEntry = async (id) => {
        if (isReadOnly) return;
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            const res = await fetch(`/api/donation/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchEntries();
                showToast("Entry deleted successfully.", "success", 3000);
            } else {
                showToast("Failed to delete entry.", "error", 3500);
            }
        } catch (error) {
            console.error("Delete error:", error);
            showToast("An error occurred while deleting.", "error", 3500);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setCurrentEntry(initialEntry);
        setIsAutoFilled(false);
    };

    const uniqueReceipts = useMemo(
        () => [...new Set(entries.map((entry) => entry.receiptNo).filter(Boolean))]
            .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })),
        [entries]
    );

    const uniqueDates = useMemo(
        () => [...new Set(entries
            .map((entry) => entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : '')
            .filter(Boolean))]
            .sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'))),
        [entries]
    );

    const uniqueDonors = useMemo(
        () => [...new Set(entries.map((entry) => entry.name).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [entries]
    );

    const uniqueCities = useMemo(
        () => [...new Set(entries.map((entry) => entry.city || entry.address).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [entries]
    );

    const uniqueAmounts = useMemo(
        () => [...new Set(entries.map((entry) => String(entry.amount || "")).filter(Boolean))]
            .sort((a, b) => Number(b) - Number(a))
            .map((amount) => `₹ ${formatIndianNumber(amount)}`),
        [entries]
    );

    const toggleColFilter = (col, e) => {
        e.stopPropagation();
        setActiveFilterCol(activeFilterCol === col ? null : col);
    };

    const handleColFilterChange = (col, val) => {
        setColFilters((prev) => {
            if (val === '') {
                const newFilters = { ...prev };
                delete newFilters[col];
                return newFilters;
            }
            const current = prev[col] || [];
            if (current.includes(val)) {
                return { ...prev, [col]: current.filter((item) => item !== val) };
            }
            return { ...prev, [col]: [...current, val] };
        });
    };

    const filteredEntries = entries.filter(entry => {
        // 0. Filter by selected company
        if (selectedCompanyIds.length > 0) {
            const entryCompanyId = String(entry.companyId?._id || entry.companyId || "");
            const isMatch = selectedCompanyIds.some(id => String(id) === entryCompanyId);
            if (!isMatch) return false;
        }

        if (!entry.date) return false;

        // 1. Calculate the entry's month string
        const entryDate = new Date(entry.date);
        const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

        // 2. UPDATED LOGIC: If selectedMonth is empty (cleared), matchesMonth is always true
        const matchesMonth = !selectedMonth || entryMonth === selectedMonth;

        const searchLower = searchTerm.toLowerCase();

        const checkTerm = (obj, term) => {
            if (!obj) return false;
            if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
            return String(obj).toLowerCase().includes(term);
        };

        const matchesSearch = !searchTerm || checkTerm(entry, searchLower);
        const matchesMode = filterMode === "All" || (entry.donationMode?.name || entry.donationMode) === filterMode;
        const matchesType = filterType === "All" || (entry.eventType?.name || entry.eventType) === filterType;

        const formattedDate = new Date(entry.date).toLocaleDateString('en-IN');
        const formattedAmount = `₹ ${formatIndianNumber(entry.amount || 0)}`;

        const matchesReceipt = !colFilters.receiptNo?.length || colFilters.receiptNo.some(f => String(f) === String(entry.receiptNo));
        const matchesDate = !colFilters.date?.length || colFilters.date.includes(formattedDate);
        const matchesDonor = !colFilters.donor?.length || colFilters.donor.includes(entry.name);
        const matchesCity = !colFilters.city?.length || colFilters.city.includes(entry.city || entry.address);
        const matchesModeColumn = !colFilters.mode?.length || colFilters.mode.includes(entry.donationMode?.name || entry.donationMode);
        const matchesAmount = !colFilters.amount?.length || colFilters.amount.includes(formattedAmount);

        return matchesMonth && matchesSearch && matchesMode && matchesType && matchesReceipt && matchesDate && matchesDonor && matchesCity && matchesModeColumn && matchesAmount;
    });

    const totalAmount = filteredEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const paginatedEntries = filteredEntries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(new Set(paginatedEntries.map(entry => entry._id)));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (id) => {
        const newSet = new Set(selectedRows);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedRows(newSet);
    };

    const handleBulkDelete = async () => {
        if (selectedRows.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedRows.size} entries?`)) return;

        try {
            const idsToDelete = Array.from(selectedRows);
            const res = await fetch('/api/donation/bulk-delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToDelete })
            });

            if (res.ok) {
                showToast(`${selectedRows.size} entries deleted successfully.`, "success", 3000);
                setSelectedRows(new Set());
                fetchEntries();
            } else {
                showToast("Failed to delete entries.", "error", 3500);
            }
        } catch (error) {
            console.error("Bulk delete error:", error);
            showToast("Failed to delete entries.", "error", 3500);
        }
    };
    const formLabelClass = "text-[11px] font-bold text-muted-foreground md:text-right pr-2 uppercase leading-snug";
    const pillInputClass = "h-11 w-full rounded-full border border-stone-300 bg-card px-4 text-sm font-bold text-foreground outline-none transition focus:border-primary/50";
    const pillInputWithIconClass = "h-11 w-full rounded-full border border-stone-300 bg-card pl-10 pr-4 text-sm font-bold text-foreground outline-none transition focus:border-primary/50";
    const pillTextareaClass = "min-h-11 w-full rounded-full border border-stone-300 bg-card px-4 py-3 text-sm font-bold text-foreground outline-none transition focus:border-primary/50";
    const inlineFieldClass = "grid grid-cols-1 items-center gap-2 md:grid-cols-[120px_minmax(0,1fr)]";
    const inlineFieldWideClass = "grid grid-cols-1 items-center gap-2 md:grid-cols-[120px_minmax(0,1fr)]";

    const handleDownload = () => {
        const rows = [["Receipt No", "Date", "Name", "Phone", "Mode", "Amount"]];
        filteredEntries.forEach((entry) => {
            rows.push([
                entry.receiptNo || '',
                entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : '',
                entry.name || '',
                entry.phone || '',
                entry.donationMode || '',
                String(entry.amount ?? '')
            ]);
        });
        const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "donations.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();

        // Add Standard Header
        await addStandardHeader(doc, "Donation Report", companyName, companyAddress, companyPhone);

        // Prepare Table Data
        const tableColumn = ["Receipt No", "Date", "Name", "Phone", "Mode", "Amount"];
        const tableRows = [];

        filteredEntries.forEach(entry => {
            const entryData = [
                entry.receiptNo || '',
                entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : '',
                entry.name || '',
                entry.phone || '',
                entry.donationMode || '',
                `Rs. ${formatIndianNumber(entry.amount || 0)}`
            ];
            tableRows.push(entryData);
        });

        // Add Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'striped',
            headStyles: { fillColor: [239, 123, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 9 },
            columnStyles: {
                6: { halign: 'right' } // Amount column
            }
        });

        // Add Summary
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text(`Total Amount: Rs. ${formatIndianNumber(totalAmount)}`, 14, finalY);

        doc.save(`Donation_Report_${selectedMonth || 'All'}.pdf`);
    };

    return (
        <div className="min-h-screen px-4 py-6 md:px-8">
            {/* Main Outer Card Container */}
            <div className="mx-auto rounded-2xl bg-white dark:bg-[#252525] overflow-hidden">
                {/* 1. Top Auxiliary Bar (Inside Container) */}
                <div className="flex items-center justify-end gap-4 px-6 py-2.5 bg-white dark:bg-[#252525]">
                    {/* Green Checkmark */}
                    <div className="flex items-center text-emerald-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    {/* Columns Hide / Unhide Button & Dropdown */}
                    <div className="relative" data-column-menu="true">
                        <button
                            onClick={() => setShowColumnMenu(!showColumnMenu)}
                            className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors shadow-md cursor-pointer"
                        >
                            <img src="/icons/action/Hide.svg" className="w-4 h-4" alt="Hide" />
                            <span>Columns Hide / Unhide</span>
                            <svg className="w-3 h-3 text-[#D4612D]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 10l5 5 5-5z" />
                            </svg>
                        </button>

                        {showColumnMenu && (
                            <div className="absolute right-0 top-full mt-2 z-50 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-xl dark:bg-[#252525] dark:border-stone-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 border-b border-stone-100 dark:border-stone-700 pb-1">Show / Hide Columns</p>
                                <div className="space-y-2">
                                    {[
                                        { key: "receiptNo", label: "Rec. No" },
                                        { key: "date", label: "Date" },
                                        { key: "donor", label: "Name & Ph." },
                                        { key: "city", label: "City" },
                                        { key: "amount", label: "Amount & Modes" },
                                        { key: "action", label: "Action" },
                                    ].map((col) => (
                                        <label key={col.key} className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer hover:text-stone-900">
                                            <input
                                                type="checkbox"
                                                checked={visibleCols[col.key] !== false}
                                                onChange={(e) => setVisibleCols((prev) => ({ ...prev, [col.key]: e.target.checked }))}
                                                className="h-3.5 w-3.5 rounded border-[#882619] accent-[#882619] cursor-pointer"
                                            />
                                            <span>{col.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Source Button */}
                    {!isReadOnly && (
                        <PermissionWrapper action="source">
                            <button
                                type="button"
                                onClick={() => setIsMasterModalOpen(true)}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-[#882619] hover:text-[#D4612D] transition-colors cursor-pointer"
                            >
                                <img src="/icons/action/Source.svg" className="w-4 h-4 dark:hidden" alt="Source" />
                                <img src="/icons/action/SourceDark.svg" className="w-4 h-4 hidden dark:block" alt="Source" />
                                <span>Source</span>
                            </button>
                        </PermissionWrapper>
                    )}
                </div>

                {/* Horizontal Top Divider Line */}
                <div className="border-t border-[#D4612D]/40"></div>

                {/* 2. Main Controls Bar (Warm Grey Panel) */}
                <div className="bg-[#E5E5E5] dark:bg-[#252525] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    {/* Left: Total Donations Box */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-serif">₹</span>
                                <span className="text-3xl font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-serif tracking-tight">
                                    {formatIndianNumber(totalAmount)}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-stone-500 italic mt-0.5">
                                Total Donations ({selectedMonth})
                            </p>
                        </div>
                    </div>

                    {/* Center: Search & Filter Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                        {/* Quick Search Input */}
                        <div className="relative w-full sm:w-48 md:w-52 shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4612D]" size={15} />
                            <input
                                type="text"
                                placeholder="Quick Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[#D4612D]/30 transition-all placeholder:text-slate-400 shadow-md"
                            />
                        </div>

                        {/* All Events Filter Dropdown using SearchableSelect */}
                        <div className="relative w-full sm:w-40 md:w-44 shrink-0">
                            <div className="relative p-1 border border-[#D4612D] rounded-xl bg-white dark:bg-zinc-800 shadow-md">
                                <SearchableSelect
                                    options={[
                                        { value: 'All', label: 'All Events' },
                                        ...eventTypes.map(t => ({ value: t.name, label: t.name }))
                                    ]}
                                    value={filterType}
                                    onChange={(val) => setFilterType(val || 'All')}
                                    placeholder="All Events"
                                />
                            </div>
                        </div>

                        {/* Month Filter Picker using MonthYearPicker */}
                        <div className="relative w-full sm:w-44 md:w-48 shrink-0">
                            <div className="relative border border-[#D4612D] rounded-xl bg-white dark:bg-zinc-800 shadow-md">
                                <MonthYearPicker
                                    value={selectedMonth}
                                    onChange={setSelectedMonth}
                                    placeholder="Select Month"
                                    variant="ghost"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Icon Buttons */}
                    <div className="flex items-center gap-3 sm:gap-5 flex-wrap shrink-0 justify-end">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="flex flex-col items-center gap-1 group text-stone-500 hover:text-[#882619] transition-all cursor-pointer shrink-0"
                                title="Clear Filters"
                            >
                                <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center border border-stone-200 group-hover:border-[#D4612D] shrink-0">
                                    <X size={14} />
                                </div>
                                <span className="text-[9px] font-bold">Clear</span>
                            </button>
                        )}

                        {!isReadOnly && (
                            <PermissionWrapper action="delete">
                                <button
                                    type="button"
                                    onClick={selectedRows.size > 0 ? handleBulkDelete : undefined}
                                    className={`flex flex-col items-center gap-0.5 group transition-all cursor-pointer shrink-0 ${selectedRows.size > 0 ? "opacity-100" : "opacity-90"
                                        }`}
                                    title="Delete selected"
                                >
                                    <img src="/icons/action/Delete.svg" className="w-10 h-10 shrink-0 block dark:hidden" alt="Delete" />
                                    <img src="/icons/action/DeleteDark.svg" className="w-10 h-10 shrink-0 hidden dark:block" alt="Delete" />
                                </button>
                            </PermissionWrapper>
                        )}

                        {!isReadOnly && (
                            <PermissionWrapper action="write">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setCurrentEntry(initialEntry);
                                        setIsModalOpen(true);
                                    }}
                                    className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer shrink-0"
                                    title="New Donation"
                                >
                                    <img src="/icons/action/NewDonation.svg" className="w-16 h-16 shrink-0 block dark:hidden" alt="New Donation" />
                                    <img src="/icons/action/NewDonationDark.svg" className="w-16 h-16 shrink-0 hidden dark:block" alt="New Donation" />
                                </button>
                            </PermissionWrapper>
                        )}

                        {/* Download CSV / PDF Menu */}
                        <div className="relative shrink-0" data-download-menu="true">
                            <button
                                type="button"
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer shrink-0"
                                title="Download"
                            >
                                <img src="/icons/action/Download.svg" className="w-14 h-14 shrink-0 block dark:hidden" alt="Download" />
                                <img src="/icons/action/DownloadDark.svg" className="w-14 h-14 shrink-0 hidden dark:block" alt="Download" />
                            </button>

                            {showDownloadMenu && (
                                <div className="absolute right-0 top-full z-[100] mt-2 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => { handleDownload(); setShowDownloadMenu(false); }}
                                        className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-xs font-bold text-stone-800 transition hover:bg-stone-50"
                                    >
                                        <Download size={16} className="text-emerald-600" />
                                        Download CSV
                                    </button>
                                    <button
                                        onClick={() => { handleDownloadPDF(); setShowDownloadMenu(false); }}
                                        className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-xs font-bold text-stone-800 transition hover:bg-stone-50 border-t border-stone-100"
                                    >
                                        <FileText size={16} className="text-blue-600" />
                                        Download PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Horizontal Bottom Divider Line */}
                <div className="border-b border-[#D4612D]/40"></div>

                {/* Table Data Container */}
                <div className="relative flex">
                    <div className="overflow-x-auto flex-1 p-6">
                        <table className="w-full p-6 border-collapse text-left bg-white dark:bg-[#252525]">
                            <thead>
                                <tr
                                    style={{ borderBottom: "3px double #78716c" }}
                                    className="text-xs font-semibold text-stone-700 bg-white dark:bg-[#252525]"
                                >
                                    <th className="w-12 px-3 py-3.5 text-center border-r border-stone-300">
                                        <input
                                            type="checkbox"
                                            checked={paginatedEntries.length > 0 && selectedRows.size === paginatedEntries.length}
                                            onChange={handleSelectAll}
                                            className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                        />
                                    </th>
                                    {visibleCols.receiptNo && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <TableColumnFilter
                                                colKey="receiptNo"
                                                title="Rec. No"
                                                options={uniqueReceipts}
                                                iconSrc="/icons/action/Fillter.svg"
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.date && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <TableColumnFilter
                                                colKey="date"
                                                title="Date"
                                                options={uniqueDates}
                                                iconSrc="/icons/action/Fillter.svg"
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.donor && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <TableColumnFilter
                                                colKey="donor"
                                                title="Name & Ph."
                                                options={uniqueDonors}
                                                iconSrc="/icons/action/Fillter.svg"
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.city && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <TableColumnFilter
                                                colKey="city"
                                                title="City"
                                                options={uniqueCities}
                                                iconSrc="/icons/action/Fillter.svg"
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.amount && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <TableColumnFilter
                                                colKey="amount"
                                                title="Amount & Modes"
                                                options={uniqueAmounts}
                                                iconSrc="/icons/action/Fillter.svg"
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {visibleCols.action && (
                                        <th className="px-4 py-3.5 text-stone-800 dark:text-stone-200 font-semibold text-xs whitespace-nowrap text-center">
                                            Action
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEntries.map((entry) => (
                                    <tr key={entry._id} className="border-b border-stone-300/80 transition-colors hover:bg-stone-100/50">
                                        <td className="px-3 py-3 text-center border-r border-stone-300">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(entry._id)}
                                                onChange={() => handleSelectRow(entry._id)}
                                                className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                            />
                                        </td>
                                        {visibleCols.receiptNo && (
                                            <td className="px-4 py-3 border-r border-stone-300 text-xs font-bold text-stone-800 text-center">
                                                {entry.receiptNo}
                                            </td>
                                        )}
                                        {visibleCols.date && (
                                            <td className="px-4 py-3 border-r border-stone-300 text-xs font-bold text-stone-800 whitespace-nowrap">
                                                {entry.date ? new Date(entry.date).toLocaleDateString('en-GB').replace(/\//g, '-') : '-'}
                                            </td>
                                        )}
                                        {visibleCols.donor && (
                                            <td className="px-4 py-3 border-r border-stone-300">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                        {entry.name}
                                                    </span>
                                                    <span className="mt-0.5 text-[10px] font-medium text-stone-400 italic">
                                                        {entry.phone}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        {visibleCols.city && (
                                            <td className="px-4 py-3 border-r border-stone-300 text-xs font-bold text-stone-800">
                                                {entry.city || entry.address || '-'}
                                            </td>
                                        )}
                                        {visibleCols.amount && (
                                            <td className="px-4 py-3 border-r border-stone-300">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                        ₹ {formatIndianNumber(entry.amount)}
                                                    </span>
                                                    <span className="mt-0.5 text-[10px] font-medium text-stone-400 italic">
                                                        {entry.donationMode?.name || entry.donationMode}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        {visibleCols.action && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-3">
                                                    {!isReadOnly && (
                                                        <>
                                                            <PermissionWrapper action="edit">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEdit(entry)}
                                                                    className="hover:scale-110 transition-transform cursor-pointer"
                                                                    title="Edit"
                                                                >
                                                                    <img src="/icons/action/Edit.svg" className="w-6 h-6" alt="Edit" />
                                                                </button>
                                                            </PermissionWrapper>
                                                            <PermissionWrapper action="delete">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteEntry(entry._id)}
                                                                    className="hover:scale-110 transition-transform cursor-pointer"
                                                                    title="Delete"
                                                                >
                                                                    <img src="/icons/action/Delete.svg" className="w-9 h-9 dark:hidden " alt="Delete" />
                                                                    <img src="/icons/action/DeleteDark.svg" className="w-9 h-9 hidden dark:block " alt="Delete" />                                                                </button>
                                                            </PermissionWrapper>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => generatePDF(entry)}
                                                        className="hover:scale-110 transition-transform cursor-pointer"
                                                        title="Receipt PDF"
                                                    >
                                                        <img src="/icons/action/Download.svg" className="w-14 h-14 block dark:hidden" alt="Download Receipt" />
                                                        <img src="/icons/action/DownloadDark.svg" className="w-14 h-14 hidden dark:block" alt="Download Receipt" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredEntries.length === 0 && (
                            <div className="p-12 text-center text-stone-400 font-bold italic text-xs bg-[#FAF7F6] dark:bg-[#252525]">
                                No matching donation entries found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        totalItems={filteredEntries.length}
                        colorTheme="orange"
                    />
                </div>
            </div>
            {/* Donation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
                    <div className="my-6 w-full max-w-4xl  overflow-hidden rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-200"
                        style={{
                            backgroundColor: 'white',
                            backgroundImage: "url('/uploads/VEG%20BG.png')",
                            backgroundSize: 'auto',
                            backgroundRepeat: 'repeat',
                        }}
                    >

                        {/* Header Banner - Centered Gradient Header */}
                        <div className="gradient-header-bg relative px-8 py-5 text-center shadow-md">
                            <button
                                onClick={closeModal}
                                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:text-white transition-all hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl md:text-3xl font-normal tracking-wide text-white font-sans"
                                style={{ color: "white" }}
                            >
                                {editingId ? "Edit Donation Receipt" : "New Donation Receipt"}
                            </h2>
                            <p className="mt-1 text-xs italic text-white/85">
                                Fields marked are required
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="relative">
                            <div
                                ref={scrollRef}
                                onScroll={handleFormScroll}
                                className="max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6"
                            >
                                {/* Section 1: Basic Information */}
                                <div className="bg-[#EDEDED] dark:bg-[#252525] px-8 py-3">
                                    <h3 className="section-title-italic mb-3">
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 items-center">
                                        {/* Phone No */}
                                        <div className="flex items-center gap-2">
                                            <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[80px] text-right">
                                                <span className="text-[#882619] font-bold mr-1">*</span>Phone No. :
                                            </label>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={currentEntry.phone}
                                                    onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, ''))}
                                                    className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                    placeholder="1234567890"
                                                    maxLength={10}
                                                    inputMode="numeric"
                                                />
                                            </div>
                                        </div>

                                        {/* Rec. No */}
                                        <div className="flex items-center gap-2">
                                            <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[80px] text-right">
                                                <span className="text-[#882619] font-bold mr-1">*</span>Rec. No. :
                                            </label>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={currentEntry.receiptNo}
                                                    onChange={(e) => setCurrentEntry({ ...currentEntry, receiptNo: e.target.value })}
                                                    className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                    placeholder="Rec. No."
                                                />
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-2">
                                            <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[60px] text-right">
                                                <span className="text-[#882619] font-bold mr-1">*</span>Date :
                                            </label>
                                            <div className="flex-1">
                                                <DateTimePicker
                                                    showTime={false}
                                                    value={currentEntry.date}
                                                    onChange={(val) => setCurrentEntry({ ...currentEntry, date: val })}
                                                    customTrigger={
                                                        <div className="gradient-pill-input relative h-9 w-full px-3 flex items-center justify-between cursor-pointer select-none text-xs font-semibold text-stone-800 dark:text-stone-100">
                                                            <div className="flex items-center gap-2">
                                                                <img src="/icons/action/Calender.svg" className="w-4 h-4 dark:hidden" alt="Calendar" />
                                                                <img src="/icons/action/CalenderDark.svg" className="w-4 h-4 hidden dark:block" alt="Calendar" />                                                                <span className="placeholder:text-stone-300">
                                                                    {currentEntry.date ? (() => {
                                                                        const [y, m, d] = currentEntry.date.split('-').map(Number);
                                                                        const dateObj = new Date(y, m - 1, d);
                                                                        return dateObj.toLocaleDateString('en-GB').replace(/\//g, '-');
                                                                    })() : 'DD-MM-YYYY'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Donor Details */}
                                <div className="px-8 py-3">
                                    <h3 className="section-title-italic mb-3">
                                        Donor Details
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Row 1: Full Name & City */}
                                        <div className="grid grid-cols-5 gap-x-6 gap-y-3">
                                            {/* Full Name - 3/5 */}
                                            <div className="col-span-3 flex items-center gap-2">
                                                <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[80px] text-right">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Full Name :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={currentEntry.name}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, name: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="Name"
                                                    />
                                                </div>
                                            </div>

                                            {/* City - 2/5 */}
                                            <div className="col-span-2 flex items-center gap-2">
                                                <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[60px] text-right">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>City :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={currentEntry.city}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, city: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="City"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Pincode & Email Id */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                            <div className="flex items-center gap-2">
                                                <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[80px] text-right">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Pincode :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={currentEntry.pincode}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, pincode: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="123456"
                                                        maxLength={6}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[60px] text-right">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Email Id :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="email"
                                                        value={currentEntry.email}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, email: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="email@gmail.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 3: Full Add. */}
                                        <div className="flex items-center gap-2">
                                            <label className="whitespace-nowrap text-xs font-medium text-stone-700 dark:text-stone-300 min-w-[80px] text-right">
                                                <span className="text-[#882619] font-bold mr-1">*</span>Full Add. :
                                            </label>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={currentEntry.address}
                                                    onChange={(e) => setCurrentEntry({ ...currentEntry, address: e.target.value })}
                                                    className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                    placeholder=""
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="gradient-line-divider" />

                                {/* Section 3: Donation, Payment, KYC Details */}
                                <div className="px-8 py-3">
                                    <h3 className="section-title-italic mb-3">
                                        Donation, Payment, KYC Details
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Row 1: Pay Mode & Amount */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                            <div className="flex items-center gap-2">
                                                <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Pay Mode :
                                                </label>
                                                <div className="flex-1">
                                                    <SearchableSelect
                                                        options={paymentModes.map(m => ({ value: m._id, label: m.name }))}
                                                        value={currentEntry.donationMode}
                                                        onChange={(val) => setCurrentEntry({ ...currentEntry, donationMode: val })}
                                                        placeholder="Mode"
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center justify-between"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Amount :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        value={currentEntry.amount}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, amount: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="₹ 0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Reference & Donor Bank Name */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                            <div className="flex items-center gap-2">
                                                <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Reference :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={currentEntry.chequeNo}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, chequeNo: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="123456"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Donor Bank Name :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={currentEntry.bankName}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, bankName: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="Bank Name"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 3: PAN Number & Aadhar Number */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                            <div className="flex items-center gap-2">
                                                <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>PAN Number :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={currentEntry.panNo}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, panNo: e.target.value.toUpperCase() })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500 uppercase"
                                                        placeholder="123456"
                                                        maxLength={10}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                    <span className="text-[#882619] font-bold mr-1">*</span>Aadhar Number :
                                                </label>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={currentEntry.aadharNo}
                                                        onChange={(e) => setCurrentEntry({ ...currentEntry, aadharNo: e.target.value })}
                                                        className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                        placeholder="Bank Name"
                                                        maxLength={12}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="gradient-line-divider" />

                                {/* Section 4: Event & Note */}
                                <div className="px-8 py-3">
                                    <h3 className="section-title-italic mb-3">
                                        Event & Note
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                        <div className="flex items-center gap-2">
                                            <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                <span className="text-[#882619] font-bold mr-1">*</span>Events Name :
                                            </label>
                                            <div className="flex-1">
                                                <SearchableSelect
                                                    options={eventTypes.map(e => ({ value: e._id, label: e.name }))}
                                                    value={currentEntry.eventType}
                                                    onChange={(val) => setCurrentEntry({ ...currentEntry, eventType: val })}
                                                    placeholder="123456"
                                                    className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 flex items-center justify-between"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="w-[130px] shrink-0 text-right text-xs font-medium text-stone-700 dark:text-stone-300">
                                                <span className="text-[#882619] font-bold mr-1">*</span>Note :
                                            </label>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={currentEntry.notes}
                                                    onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                                                    className="gradient-pill-input h-9 w-full px-3 text-xs font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-500"
                                                    placeholder="Bank Name"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-6 px-8 py-5 border-t border-stone-200/50">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-medium text-sm transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            {!isReadOnly && (
                                <PermissionWrapper action={editingId ? "edit" : "write"}>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="gradient-btn text-sm font-semibold tracking-wide cursor-pointer"
                                    >
                                        {editingId ? "Update Receipt" : "Save Staff Profile"}
                                    </button>
                                </PermissionWrapper>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isMasterModalOpen && (
                <MasterDataManager
                    isOpen={isMasterModalOpen}
                    onClose={() => {
                        setIsMasterModalOpen(false);
                        fetchEventTypes();
                        fetchPaymentModes();
                    }}
                    allowedTabs={['donationTypes', 'paymentModes']}
                />
            )}

            {/* --- UPDATED SAME-TO-SAME TEMPLATE --- */}
            <style jsx global>{`
                @font-face {
                    font-family: 'ZapfHumnst-BT-Bold';
                    src: url('/fonts/ZapfHumnst BT Bold.ttf') format('truetype');
                    font-weight: bold;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'ZapfHumnst-BT-Roman';
                    src: url('/fonts/ZapfHumnst BT Roman.ttf') format('truetype');
                    font-weight: normal;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'ITCAvantGardeStd-Bk';
                    src: url('/fonts/ITCAvantGardeStd-Bk.otf') format('opentype');
                    font-weight: normal;
                    font-style: normal;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--muted-foreground);
                }
                input::placeholder, textarea::placeholder {
                    color: #a8a29e !important;
                    opacity: 0.4 !important;
                    font-weight: 500 !important;
                }
            `}</style>
            {/* --- UPDATED SAME-TO-SAME TEMPLATE --- */}
            {/* ─── HIDDEN RECEIPT PRINT TEMPLATES ─── */}
            <div style={{ position: 'absolute', top: '-20000px', left: '-10000px' }}>
                {paginatedEntries.map((entry) => (
                    <div
                        key={`template-${entry._id}`}
                        id={`receipt-template-${entry._id}`}
                        style={{
                            width: '960px',
                            backgroundColor: '#ffffff',
                            fontFamily: 'ZapfHumnst-BT-Roman, "Helvetica Neue", Helvetica, Arial, sans-serif',
                            borderRadius: '48px',
                            border: '1.5px solid #9ca3af',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* ── 1. HEADER ── */}
                        <div style={{
                            padding: '28px 48px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <img
                                src="/pdflogo.png"
                                crossOrigin="anonymous"
                                style={{ height: '96px', width: 'auto', flexShrink: 0, marginRight: '22px' }}
                            />
                            <div style={{
                                borderLeft: '2px solid #374151',
                                paddingLeft: '22px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                minHeight: '90px',
                            }}>
                                <p style={{ color: '#b91c1c', fontSize: '13px', fontWeight: '700', margin: '0', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'ZapfHumnst-BT-Bold' }}>
                                    Shree Swaminarayan Gurukul Rajkot Sansthan
                                </p>
                                <h1 style={{ color: '#b91c1c', fontSize: '28px', fontWeight: '800', margin: '2px 0 0 0', lineHeight: '1.25', fontFamily: 'ZapfHumnst-BT-Bold, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                                    {companyName}
                                </h1>
                                <p style={{ margin: '4px 0 0 0', color: '#374151', fontSize: '13.5px', fontWeight: 'normal', fontFamily: 'ZapfHumnst-BT-Roman' }}>
                                    {companyAddress}{companyPhone ? ` | Ph: ${companyPhone}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* ── 2. TRUST INFO BAR ── */}
                        <div style={{
                            padding: '9px 56px',
                            borderTop: '3px double #374151',
                            borderBottom: '3px double #374151',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            color: '#374151',
                        }}>
                            <span style={{ fontFamily: 'ITCAvantGardeStd-Bk' }}>Trust Reg.No. : E-45/RAJKOT</span>
                            <span style={{ fontFamily: 'ITCAvantGardeStd-Bk' }}>Trust Pan No. : AAATS8923L</span>
                        </div>

                        {/* ── 3. BODY ROWS ── */}
                        <div style={{ padding: '8px 56px 8px', flex: 1 }}>

                            {/* Row 1 — Receipt No / Date */}
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #374151', padding: '12px 0' }}>
                                <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Receipt No :</span>
                                    <span style={{ fontWeight: '800', color: '#92400e', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.receiptNo}</span>
                                </div>
                                <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Receipt Date :</span>
                                    <span style={{ fontWeight: '800', color: '#92400e', fontFamily: 'ITCAvantGardeStd-Bk' }}>
                                        {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Row 2 — Name / Amount */}
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #374151', padding: '12px 0' }}>
                                <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Name :</span>
                                    <span style={{ fontWeight: '800', color: '#92400e', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.name}</span>
                                </div>
                                <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Amount :</span>
                                    <span style={{ fontWeight: '800', fontSize: '22px', color: '#92400e', fontFamily: 'ITCAvantGardeStd-Bk' }}>₹ {formatIndianNumber(entry.amount)}</span>
                                </div>
                            </div>

                            {/* Row 3 — Address / Donation Mode + For */}
                            <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1.5px solid #374151', padding: '12px 0' }}>
                                <div style={{ flex: 1, fontSize: '17px', display: 'flex', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Address :</span>
                                    <span style={{ fontWeight: '800', color: '#92400e', lineHeight: '1.5', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.address || '-'}</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #374151', paddingBottom: '8px' }}>
                                        <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '17px', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Donation Mode :</span>
                                        <span style={{ fontWeight: '800', color: '#92400e', fontSize: '17px', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.donationMode?.name || entry.donationMode}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '17px', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Donation For :</span>
                                        <span style={{ fontWeight: '800', color: '#92400e', fontSize: '17px', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.eventType?.name || entry.eventType || 'Donation'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4 — Phone / PAN */}
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #374151', padding: '12px 0' }}>
                                <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Ph. No :</span>
                                    <span style={{ fontWeight: '800', color: '#92400e', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.phone}</span>
                                </div>
                                <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Donors's Pan :</span>
                                    <span style={{ fontWeight: '800', color: '#92400e', textTransform: 'uppercase', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.panNo || '-'}</span>
                                </div>
                            </div>

                            {/* Row 5 — Bank (only when not Cash) */}
                            {(entry.donationMode?.name !== 'Cash' && entry.donationMode !== 'Cash') && (
                                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #374151', padding: '12px 0' }}>
                                    <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Bank Name :</span>
                                        <span style={{ fontWeight: '800', color: '#92400e', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.bankName || '-'}</span>
                                    </div>
                                    <div style={{ flex: 1, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontFamily: 'ITCAvantGardeStd-Bk' }}>Chq./bank/qr/link :</span>
                                        <span style={{ fontWeight: '800', color: '#92400e', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.chequeNo || '-'}</span>
                                    </div>
                                </div>
                            )}

                            {/* Note */}
                            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0' }}>
                                <span style={{ fontWeight: '700', color: '#1f2937', width: '180px', textAlign: 'right', paddingRight: '15px', flexShrink: 0, fontSize: '18px', fontFamily: 'ITCAvantGardeStd-Bk' }}>Note :</span>
                                <span style={{ fontWeight: '800', color: '#92400e', fontSize: '18px', fontFamily: 'ITCAvantGardeStd-Bk' }}>{entry.notes || 'Jay Swaminarayan'}</span>
                            </div>

                        </div>

                        {/* ── 4. FOOTER ── */}
                        <div style={{ padding: '24px 56px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#000000', letterSpacing: '0.01em', fontFamily: 'ITCAvantGardeStd-Bk' }}>
                                80 (G) EXMP. NO. : AAATS8923LF20098
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderBottom: '2px solid #374151', width: '190px', marginBottom: '6px' }}></div>
                                <p style={{ margin: '0', fontSize: '12.5px', fontWeight: '700', color: '#374151', fontFamily: 'ITCAvantGardeStd-Bk' }}>Received By</p>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}