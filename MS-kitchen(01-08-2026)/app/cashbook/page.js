"use client";
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
    Plus, Minus, Download, Search, ChevronDown, ChevronLeft,
    ChevronRight, X, Paperclip, Clock, Calendar, Settings, Loader2,
    FileText, BookOpen, ArrowLeft, User, Phone, Building2,
    Pencil, Trash2, TrendingUp, TrendingDown, Wallet,
    MoreVertical, CheckCircle2, Lock, Unlock, Funnel, ArrowDownToLine,
    ShieldAlert, CirclePlus, Database, CircleMinus, Tag, Upload
} from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from "@/lib/pdfGenerator";
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import TableActionButton from "@/components/TableActionButton";
import { useCompany } from "@/context/CompanyContext";
import Pagination from "@/components/Pagination";
import { useFormStore } from "@/lib/store";
import MasterDataManager from "@/components/MasterDataManager";
import DateTimePicker from "@/components/DateTimePicker";
import { color } from "highcharts";

// ─── Constants ────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = ["All Time", "Today", "This Week", "This Month", "This Year"];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
// const VENDOR_TYPES = ["Vendor", "Supplier", "Customer", "Other"];

// Avatar colours cycling
const AVATAR_COLORS = [
    "bg-primary", "bg-emerald-500", "bg-blue-500",
    "bg-purple-500", "bg-pink-500", "bg-amber-500", "bg-teal-500",
];


const emptyVendorForm = { name: "", phone: "", type: "Vendor", company: "" };
const emptyEntryForm = {
    type: "in", date: "", time: "", amount: "", detail: "",
    modeOfPayment: "", bills: [], category: "", signatureName: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatLedgerDate(dateStr) {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}
function formatCurrency(n) {
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0 }).format(Math.abs(n ?? 0));
}

function getInitials(name) {
    return name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function getNow() {
    return {
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
}

function to24h(t) {
    if (!t) return "";
    if (!t.includes("AM") && !t.includes("PM")) return t;
    try {
        const [time, period] = t.split(" ");
        let [h, m] = time.split(":");
        h = parseInt(h);
        if (period === "PM" && h !== 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${m}`;
    } catch { return ""; }
}

function to12h(val) {
    if (!val) return "";
    const [h, m] = val.split(":");
    const hr = parseInt(h);
    const period = hr >= 12 ? "PM" : "AM";
    const h12 = hr % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${m} ${period}`;
}

function isWithinDuration(dateStr, duration) {
    if (!dateStr || duration === "All Time") return true;
    const entryDate = new Date(dateStr);
    if (Number.isNaN(entryDate.getTime())) return false;

    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());

    switch (duration) {
        case "Today":
            return target.getTime() === current.getTime();
        case "This Week": {
            const day = current.getDay();
            const diffToMonday = day === 0 ? 6 : day - 1;
            const weekStart = new Date(current);
            weekStart.setDate(current.getDate() - diffToMonday);
            return target >= weekStart && target <= current;
        }
        case "This Month":
            return target.getMonth() === current.getMonth() && target.getFullYear() === current.getFullYear();
        case "This Year":
            return target.getFullYear() === current.getFullYear();
        default:
            return true;
    }
}

// ─── Filter Dropdown ──────────────────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange, compact = false, vertical = false, icon: Icon, isMulti = false, placeholder = "Search items..." }) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, minWidth: 220 });
    const triggerRef = useRef(null);
    const ref = useRef(null);

    const updateMenuPosition = () => {
        if (!triggerRef.current || !open) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuWidth = 220;
        const offsetY = 8;

        let left = rect.left;
        if (left + menuWidth > viewportWidth - 20) {
            left = rect.right - menuWidth;
        }
        left = Math.max(20, left);

        setMenuStyle({
            top: rect.bottom + offsetY + window.scrollY,
            left: left + window.scrollX,
            minWidth: menuWidth
        });
    };

    useLayoutEffect(() => {
        if (open) {
            updateMenuPosition();
            window.addEventListener('resize', updateMenuPosition);
            window.addEventListener('scroll', updateMenuPosition, true);
        }
        return () => {
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [open]);

    useEffect(() => {
        const h = (e) => {
            if (ref.current && !ref.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const filteredOptions = useMemo(() => {
        const uniqueOptions = [...new Set(options)];
        return uniqueOptions.filter(opt =>
            String(opt || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const handleSelect = (opt) => {
        if (isMulti) {
            const newValue = value.includes(opt)
                ? value.filter(v => v !== opt)
                : [...value, opt];
            onChange(newValue);
        } else {
            onChange(opt);
            setOpen(false);
        }
    };

    const isSelected = (opt) => {
        if (isMulti) return value.includes(opt);
        return value === opt;
    };

    const hasValue = isMulti ? value.length > 0 : (value !== "All" && value !== "All Time");

    if (vertical) {
        return (
            <div className="relative">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="group flex flex-col items-center justify-center gap-1 transition-all text-primary hover:text-orange-600"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-primary transition-all group-hover:bg-orange-100 group-hover:border-orange-300 shadow-sm group-hover:shadow-md group-hover:scale-105 active:scale-95">
                        {Icon ? <Icon size={20} strokeWidth={2.5} /> : <img src="/icons/action/Fillter.svg" className="w-4 h-4" alt="Filter" />}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none text-orange-600">{label}</span>
                </button>
                {open && typeof document !== 'undefined' && createPortal(
                    <div
                        ref={ref}
                        style={{
                            position: 'absolute',
                            top: menuStyle.top,
                            left: menuStyle.left,
                            minWidth: menuStyle.minWidth,
                        }}
                        className="bg-card rounded-[1.5rem] shadow-2xl z-[1000] flex flex-col border border-border/80 overflow-hidden"
                    >
                        {/* Search Bar */}
                        <div className="p-3 border-b border-border/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={placeholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-[250px] overflow-y-auto py-1 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">No matches found</div>
                            ) : (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect(opt)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-muted ${isSelected(opt) ? "text-primary font-bold bg-primary/5" : "text-foreground font-medium"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-muted text-muted-foreground/70">
                                                <img src="/icons/action/Fillter.svg" className="w-3.5 h-3.5" alt="Filter" />
                                            </span>
                                            <span className="truncate max-w-[140px]">{opt}</span>
                                        </div>
                                        {isMulti && (
                                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isSelected(opt) ? "bg-primary border-primary" : "border-border"}`}>
                                                {isSelected(opt) && <CheckCircle2 size={10} className="text-white" strokeWidth={4} />}
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Clear Button */}
                        <div className="p-2 border-t border-border/50 bg-muted/20">
                            <button
                                onClick={() => { onChange(isMulti ? [] : "All"); setOpen(false); setSearchTerm(""); }}
                                className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <X size={12} strokeWidth={3} />
                                Clear Column Filter
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(!open)}
                className={compact
                    ? `inline-flex items-center justify-center rounded-md p-0.5 transition-colors ${hasValue ? "text-primary hover:text-orange-600" : "text-muted-foreground hover:text-primary"}`
                    : "flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted whitespace-nowrap"}
            >
                {!compact && <span className="text-muted-foreground">{label}:</span>}
                {compact ? (
                    <img src="/icons/action/Fillter.svg" className="w-3.5 h-3.5 cursor-pointer hover:scale-110 transition-transform" alt="Filter" />
                ) : (
                    <>
                        <span className="font-semibold text-foreground">{isMulti ? (value.length > 0 ? `${value.length} Selected` : "All") : value}</span>
                        <ChevronDown size={13} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </>
                )}
            </button>
            {open && typeof document !== 'undefined' && createPortal(
                <div
                    ref={ref}
                    style={{
                        position: 'absolute',
                        top: menuStyle.top,
                        left: menuStyle.left,
                        minWidth: menuStyle.minWidth,
                    }}
                    className="bg-card rounded-[1.5rem] shadow-2xl z-[1000] flex flex-col border border-border/80 overflow-hidden"
                >
                    {/* Search Bar */}
                    <div className="p-3 border-b border-border/50">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                autoFocus
                                type="text"
                                placeholder={placeholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-[250px] overflow-y-auto py-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">No matches found</div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelect(opt)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-muted ${isSelected(opt) ? "text-primary font-bold bg-primary/5" : "text-foreground font-medium"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-muted text-muted-foreground/70">
                                            <img src="/icons/action/Fillter.svg" className="w-3.5 h-3.5" alt="Filter" />
                                        </span>
                                        <span className="truncate max-w-[140px]">{opt}</span>
                                    </div>
                                    {isMulti && (
                                        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isSelected(opt) ? "bg-primary border-primary" : "border-border"}`}>
                                            {isSelected(opt) && <CheckCircle2 size={10} className="text-white" strokeWidth={4} />}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Clear Button */}
                    <div className="p-2 border-t border-border/50 bg-muted/20">
                        <button
                            onClick={() => { onChange(isMulti ? [] : "All"); setOpen(false); setSearchTerm(""); }}
                            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <X size={12} strokeWidth={3} />
                            Clear Column Filter
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CashbookPage() {
    // ── Data state ──
    const [vendors, setVendors] = useState([]);
    const [entries, setEntries] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [vendorTypes, setVendorTypes] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── View state ──
    const [selectedVendor, setSelectedVendor] = useState(null); // null = list view

    // ── Vendor modal ──
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [vendorForm, setVendorForm] = useState(emptyVendorForm);
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorMenuOpen, setVendorMenuOpen] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeFilterCol, setActiveFilterCol] = useState(null);
    const [selectedVendorIds, setSelectedVendorIds] = useState([]);
    const [vendorPage, setVendorPage] = useState(1);
    const [vendorItemsPerPage, setVendorItemsPerPage] = useState(10);



    // ── Entry modal ──
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [entryForm, setEntryForm] = useState(emptyEntryForm);
    const billInputRef = useRef(null);
    const [uploadingBills, setUploadingBills] = useState(false);
    const [viewBill, setViewBill] = useState(null); // URL of bill to view

    // ── Ledger filters ──
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDate, setFilterDate] = useState([]);
    const [filterDuration, setFilterDuration] = useState("All Time");
    const [filterCompany, setFilterCompany] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const [filterPayment, setFilterPayment] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    // ── Categories ──
    const [categories, setCategories] = useState([]);
    const [showCatPanel, setShowCatPanel] = useState(false);
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterSignature, setFilterSignature] = useState([]);
    const [filterAmount, setFilterAmount] = useState([]);
    const [filterRemark, setFilterRemark] = useState([]);
    const [filterBalance, setFilterBalance] = useState([]);
    const [masterTab, setMasterTab] = useState(null);

    // ── Vendor table filters ──
    const [filterVendorName, setFilterVendorName] = useState([]);
    const [filterVendorIn, setFilterVendorIn] = useState([]);
    const [filterVendorOut, setFilterVendorOut] = useState([]);
    const [filterVendorBalance, setFilterVendorBalance] = useState([]);

    // ── Signatures ──
    const [signatures, setSignatures] = useState([]);
    // ── Payment Modes ──
    const [paymentModes, setPaymentModes] = useState([]);

    // ── Permissions ──
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();
    const { isReadOnly, selectedCompanyIds, companyAddress, companyPhone } = useCompany();

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store
    useEffect(() => {
        const persistedData = forms['cashbook'];
        if (persistedData) {
            if (persistedData.vendorSearch) setVendorSearch(persistedData.vendorSearch);
            if (persistedData.searchQuery) setSearchQuery(persistedData.searchQuery);
            if (persistedData.filterDate) setFilterDate(persistedData.filterDate);
            if (persistedData.filterDuration) setFilterDuration(persistedData.filterDuration);
            if (persistedData.filterCompany) setFilterCompany(persistedData.filterCompany);
            if (persistedData.filterType) setFilterType(persistedData.filterType);
            if (persistedData.filterPayment) setFilterPayment(persistedData.filterPayment);
            if (persistedData.filterCategory) setFilterCategory(persistedData.filterCategory);
            if (persistedData.filterSignature) setFilterSignature(persistedData.filterSignature);
            if (persistedData.filterAmount) setFilterAmount(persistedData.filterAmount);
            if (persistedData.filterRemark) setFilterRemark(persistedData.filterRemark);
            if (persistedData.filterBalance) setFilterBalance(persistedData.filterBalance);
            if (persistedData.vendorForm) setVendorForm(persistedData.vendorForm);
            if (persistedData.entryForm) setEntryForm(persistedData.entryForm);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setFormData('cashbook', {
                vendorSearch, searchQuery, filterDate, filterDuration, filterCompany,
                filterType, filterPayment, filterCategory, filterSignature,
                filterAmount, filterRemark, filterBalance, vendorForm, entryForm
            });
        }
    }, [vendorSearch, searchQuery, filterDate, filterDuration, filterCompany, filterType, filterPayment, filterCategory, filterSignature, filterAmount, filterRemark, filterBalance, vendorForm, entryForm, isHydrated]);

    // ── Toast ──
    const [toast, setToast] = useState("");
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    // ── Column Hide / Unhide State ──
    const [vendorColumns, setVendorColumns] = useState({
        name: true,
        type: true,
        cashIn: true,
        cashOut: true,
        balance: true,
        action: true,
    });
    const [showVendorColumnMenu, setShowVendorColumnMenu] = useState(false);
    const vendorColumnMenuRef = useRef(null);

    const [ledgerColumns, setLedgerColumns] = useState({
        date: true,
        note: true,
        category: true,
        sign: true,
        mode: true,
        amount: true,
        balance: true,
        action: true,
    });
    const [showLedgerColumnMenu, setShowLedgerColumnMenu] = useState(false);
    const ledgerColumnMenuRef = useRef(null);

    // ── Bulk Upload State for Cashbook Entries ──
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkPreviewData, setBulkPreviewData] = useState(null);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkDragging, setBulkDragging] = useState(false);

    const parseBulkFile = (file) => {
        setBulkFile(file);
        setBulkPreviewData(null);
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(ws);

                const formatted = data.map((row) => {
                    const keys = Object.keys(row);
                    const getKey = (name) => keys.find(k => k.trim().toLowerCase() === name.toLowerCase());

                    const dateVal = row[getKey('date')] || row[getKey('entry date')];
                    const timeVal = row[getKey('time')] || '12:00 PM';
                    const detailVal = row[getKey('detail')] || row[getKey('note')] || row[getKey('narration')] || '';
                    const typeVal = row[getKey('type')] || row[getKey('in/out')] || 'out';
                    const amountVal = row[getKey('amount')] || row[getKey('amount (₹)')] || 0;
                    const catVal = row[getKey('category')] || '';
                    const modeVal = row[getKey('payment mode')] || row[getKey('mode')] || '';
                    const sigVal = row[getKey('signature')] || row[getKey('signature name')] || row[getKey('sign')] || '';

                    // Resolve category ID
                    let catObj = null;
                    if (catVal && categories && categories.length > 0) {
                        catObj = categories.find(c => c.name && c.name.toLowerCase() === String(catVal).trim().toLowerCase());
                    }

                    // Resolve payment mode ID
                    let modeObj = null;
                    if (modeVal && paymentModes && paymentModes.length > 0) {
                        modeObj = paymentModes.find(m => m.name && m.name.toLowerCase() === String(modeVal).trim().toLowerCase());
                    }

                    // Determine type (in vs out)
                    const normalizedType = String(typeVal).trim().toLowerCase().includes('in') ? 'in' : 'out';

                    // Parse date into YYYY-MM-DD
                    let formattedDate = new Date().toISOString().split('T')[0];
                    if (dateVal) {
                        if (typeof dateVal === 'number') {
                            const parsedD = XLSX.SSF.parse_date_code(dateVal);
                            if (parsedD) {
                                formattedDate = `${parsedD.y}-${String(parsedD.m).padStart(2, '0')}-${String(parsedD.d).padStart(2, '0')}`;
                            }
                        } else {
                            const str = String(dateVal).trim();
                            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                                formattedDate = str;
                            } else if (str.includes('/')) {
                                const parts = str.split('/');
                                if (parts.length === 3) {
                                    if (parts[0].length === 4) {
                                        formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                                    } else {
                                        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                    }
                                }
                            }
                        }
                    }

                    return {
                        date: formattedDate,
                        time: String(timeVal).trim(),
                        detail: String(detailVal).trim(),
                        type: normalizedType,
                        amount: Number(amountVal) || 0,
                        category: catObj ? catObj._id : null,
                        categoryName: catObj ? catObj.name : (catVal || '-'),
                        modeOfPayment: modeObj ? modeObj._id : null,
                        modeName: modeObj ? modeObj.name : (modeVal || '-'),
                        signatureName: String(sigVal).trim()
                    };
                }).filter(r => r.amount > 0);

                setBulkPreviewData(formatted);
            } catch (err) {
                console.error("Bulk file parse error:", err);
                showToast("Failed to parse file. Please verify file format.", "error");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkFileInput = (e) => {
        const file = e.target.files[0];
        if (file) parseBulkFile(file);
        e.target.value = null;
    };

    const handleBulkDrop = (e) => {
        e.preventDefault();
        setBulkDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
            parseBulkFile(file);
        }
    };

    const handleDownloadBulkSample = () => {
        const sampleRows = [
            {
                "Date": "2026-08-01",
                "Time": "10:30 AM",
                "Detail": "Office Refreshments",
                "Type": "Out",
                "Amount": 500,
                "Category": categories && categories[0] ? categories[0].name : "General",
                "Payment Mode": paymentModes && paymentModes[0] ? paymentModes[0].name : "Cash",
                "Signature": "Manager"
            },
            {
                "Date": "2026-08-01",
                "Time": "02:15 PM",
                "Detail": "Advance Payment",
                "Type": "In",
                "Amount": 2500,
                "Category": categories && categories[0] ? categories[0].name : "General",
                "Payment Mode": paymentModes && paymentModes[0] ? paymentModes[0].name : "UPI",
                "Signature": "Accountant"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(sampleRows);
        ws['!cols'] = [
            { wch: 12 }, { wch: 10 }, { wch: 25 }, { wch: 8 },
            { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 15 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CashbookTemplate");
        XLSX.writeFile(wb, "Cashbook_Entries_Template.xlsx");
    };

    const handleBulkUploadSubmit = async () => {
        if (!selectedVendor) {
            showToast("Please select a vendor first.", "error");
            return;
        }
        if (!bulkPreviewData || bulkPreviewData.length === 0) {
            showToast("No valid entries to upload.", "error");
            return;
        }

        setBulkUploading(true);
        try {
            const vendorCompId = selectedVendor.company?._id || selectedVendor.company;
            const res = await fetch('/api/cashbook/entries/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: selectedVendor._id || selectedVendor.id,
                    companyId: vendorCompId,
                    entries: bulkPreviewData
                })
            });

            if (res.ok) {
                const data = await res.json();
                showToast(`${data.count || bulkPreviewData.length} ledger entries uploaded successfully!`, "success");
                setIsBulkModalOpen(false);
                setBulkFile(null);
                setBulkPreviewData(null);
                fetchData();
                const targetCompId = vendorCompId || user?.companyId;
                if (typeof fetchCategories === 'function') fetchCategories(targetCompId);
                if (typeof fetchSignatures === 'function') fetchSignatures(targetCompId);
                if (typeof fetchPaymentModes === 'function') fetchPaymentModes(targetCompId);
            } else {
                const errData = await res.json();
                showToast(errData.error || "Failed to upload entries.", "error");
            }
        } catch (error) {
            console.error("Bulk upload submit error:", error);
            showToast("An error occurred while uploading file.", "error");
        } finally {
            setBulkUploading(false);
        }
    };

    // ── Load ──
    const fetchData = async () => {
        setLoading(true);
        try {
            const [vRes, eRes, cRes] = await Promise.all([
                fetch('/api/cashbook/vendors'),
                fetch('/api/cashbook/entries'),
                fetch('/api/companies')
            ]);

            if (vRes.ok) {
                const vData = await vRes.json();
                setVendors(vData.map(v => ({ ...v, id: v._id }))); // Map _id to id for frontend compatibility
            }
            if (eRes.ok) {
                const eData = await eRes.json();
                setEntries(eData.map(e => ({ ...e, id: e._id })));
            }
            if (cRes.ok) {
                const cData = await cRes.json();
                setCompanies(cData);
            }

            // Fetch user info
            const uRes = await fetch('/api/auth/me');
            if (uRes.ok) {
                const uData = await uRes.json();
                setUser(uData.user);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            showToast("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchPaymentModes();
        fetchVendorTypes();
    }, []);

    // ── Category helpers ──
    const fetchCategories = async (cid) => {
        try {
            let url = "/api/cashbook/categories";
            if (cid) url += `?companyId=${cid}`;
            const res = await fetch(url);
            if (res.ok) setCategories(await res.json());
        } catch (e) {
            console.error("Failed to fetch categories", e);
        }
    };

    const fetchSignatures = async (cid) => {
        try {
            let url = "/api/cashbook/signatures";
            if (cid) url += `?companyId=${cid}`;
            const res = await fetch(url);
            if (res.ok) setSignatures(await res.json());
        } catch (e) {
            console.error("Failed to fetch signatures", e);
        }
    };

    const fetchPaymentModes = async (cid) => {
        try {
            let url = "/api/payment-modes";
            if (cid) url += `?companyId=${cid}`;
            const res = await fetch(url);
            if (res.ok) setPaymentModes(await res.json());
        } catch (e) {
            console.error("Failed to fetch payment modes", e);
        }
    };

    const fetchVendorTypes = async (cid) => {
        try {
            let url = "/api/cashbook/vendor-types";
            if (cid) url += `?companyId=${cid}`;
            const res = await fetch(url);
            if (res.ok) setVendorTypes(await res.json());
        } catch (e) {
            console.error("Failed to fetch vendor types", e);
        }
    };

    // Fetch categories after user is loaded
    useEffect(() => {
        if (user) {
            fetchCategories(user.companyId);
            fetchSignatures(user.companyId);
            fetchPaymentModes(user.companyId);
            fetchVendorTypes(user.companyId);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
                setShowExportMenu(false);
            }
            if (vendorColumnMenuRef.current && !vendorColumnMenuRef.current.contains(e.target)) {
                setShowVendorColumnMenu(false);
            }
            if (ledgerColumnMenuRef.current && !ledgerColumnMenuRef.current.contains(e.target)) {
                setShowLedgerColumnMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };


    const currentCompanyName = useMemo(() => {
        const activeCompanyId = vendorForm.company || selectedCompanyIds?.[0] || user?.companyId;
        return companies.find((company) => company._id === activeCompanyId)?.name || "Assigned automatically";
    }, [companies, selectedCompanyIds, user, vendorForm.company]);

    const vendorStats = useMemo(() => {
        const map = {};
        vendors.forEach((v) => {
            const ve = entries.filter((e) => {
                const evId = typeof e.vendorId === 'object' ? e.vendorId?._id : e.vendorId;
                return evId === v.id || evId === v._id;
            });
            const totalIn = ve.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
            const totalOut = ve.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
            map[v.id] = { totalIn, totalOut, balance: totalIn - totalOut, count: ve.length };
        });
        return map;
    }, [vendors, entries]);

    // ── Vendor CRUD ──
    const openAddVendor = () => { setEditingVendor(null); setVendorForm(emptyVendorForm); setShowVendorModal(true); };
    const openEditVendor = (v) => { setEditingVendor(v); setVendorForm({ name: v.name, phone: v.phone, type: v.type, company: v.company || "" }); setShowVendorModal(true); setVendorMenuOpen(null); };
    const closeVendorModal = () => { setShowVendorModal(false); setEditingVendor(null); setVendorForm(emptyVendorForm); };

    const saveVendor = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (!vendorForm.name.trim()) return;
        if (vendorForm.phone && vendorForm.phone.length !== 10) {
            showToast("Phone number must be exactly 10 digits");
            return;
        }

        // Validation for Super Admin
        if (user?.role === 'Super Admin' && !vendorForm.company) {
            showToast("Please select a company");
            return;
        }

        try {
            if (editingVendor) {
                const res = await fetch(`/api/cashbook/vendors/${editingVendor.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...vendorForm })
                });
                if (res.ok) {
                    const updated = await res.json();
                    setVendors((prev) => prev.map((v) => v.id === editingVendor.id ? { ...updated, id: updated._id } : v));
                    if (selectedVendor && selectedVendor.id === editingVendor.id) {
                        setSelectedVendor({ ...updated, id: updated._id });
                    }
                    showToast("Vendor updated!");
                }
            } else {
                const color = AVATAR_COLORS[vendors.length % AVATAR_COLORS.length];
                const res = await fetch('/api/cashbook/vendors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...vendorForm,
                        color,
                        company: isReadOnly ? (vendorForm.company || undefined) : selectedCompanyIds[0]
                    })
                });
                if (res.ok) {
                    const newVendor = await res.json();
                    setVendors((prev) => [...prev, { ...newVendor, id: newVendor._id }]);
                    showToast("Vendor added!");
                }
            }
            closeVendorModal();
        } catch (error) {
            console.error("Failed to save vendor", error);
            showToast("Error saving vendor");
        }
    };

    const deleteVendor = async (id) => {
        if (isReadOnly) return;
        if (!confirm("Are you sure? This will delete all entries for this vendor.")) return;
        try {
            const res = await fetch(`/api/cashbook/vendors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setVendors((prev) => prev.filter((v) => v.id !== id));
                setEntries((prev) => prev.filter((e) => e.vendorId !== id));
                setVendorMenuOpen(null);
                if (selectedVendor?.id === id) setSelectedVendor(null);
                showToast("Vendor deleted.");
            }
        } catch (error) {
            console.error("Failed to delete vendor", error);
            showToast("Error deleting vendor");
        }
    };

    // ── Filtered vendors ──
    const vendorNameOptions = useMemo(() => [...new Set(vendors.map(v => v.name).filter(Boolean))].sort(), [vendors]);
    const vendorInOptions = useMemo(() => [...new Set(vendors.map(v => `₹ ${formatCurrency(v.cashIn || 0)}`).filter(Boolean))], [vendors]);
    const vendorOutOptions = useMemo(() => [...new Set(vendors.map(v => `₹ ${formatCurrency(v.cashOut || 0)}`).filter(Boolean))], [vendors]);
    const vendorBalanceOptions = useMemo(() => [...new Set(vendors.map(v => `₹ ${formatCurrency(v.balance || 0)}`).filter(Boolean))], [vendors]);

    const filteredVendors = useMemo(() =>
        vendors.filter((v) => {
            const q = vendorSearch.toLowerCase();
            const matchesSearch = v.name.toLowerCase().includes(q) || v.phone?.includes(q);
            const vendorCompanyName = companies.find(c => c._id === v.company)?.name || "No Company";
            const matchesCompany = filterCompany === "All" || vendorCompanyName === filterCompany;

            const formattedIn = `₹ ${formatCurrency(v.cashIn || 0)}`;
            const formattedOut = `₹ ${formatCurrency(v.cashOut || 0)}`;
            const formattedBalance = `₹ ${formatCurrency(v.balance || 0)}`;

            const matchesName = filterVendorName.length === 0 || filterVendorName.includes(v.name);
            const matchesIn = filterVendorIn.length === 0 || filterVendorIn.includes(formattedIn);
            const matchesOut = filterVendorOut.length === 0 || filterVendorOut.includes(formattedOut);
            const matchesBalance = filterVendorBalance.length === 0 || filterVendorBalance.includes(formattedBalance);

            return matchesSearch && matchesCompany && matchesName && matchesIn && matchesOut && matchesBalance;
        }),
        [vendors, vendorSearch, companies, filterCompany, filterVendorName, filterVendorIn, filterVendorOut, filterVendorBalance]);

    const totalVendorPages = useMemo(() => Math.ceil(filteredVendors.length / vendorItemsPerPage) || 1, [filteredVendors.length, vendorItemsPerPage]);

    const paginatedVendors = useMemo(() => {
        const start = (vendorPage - 1) * vendorItemsPerPage;
        return filteredVendors.slice(start, start + vendorItemsPerPage);
    }, [filteredVendors, vendorPage, vendorItemsPerPage]);

    const toggleSelectAllVendors = () => {
        if (selectedVendorIds.length === paginatedVendors.length) {
            setSelectedVendorIds([]);
        } else {
            setSelectedVendorIds(paginatedVendors.map(v => v.id));
        }
    };

    const toggleSelectVendor = (id) => {
        setSelectedVendorIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkDeleteVendors = async () => {
        if (isReadOnly || selectedVendorIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedVendorIds.length} books and all their entries?`)) return;
        try {
            for (const id of selectedVendorIds) {
                await fetch(`/api/cashbook/vendors/${id}`, { method: 'DELETE' });
            }
            setVendors(prev => prev.filter(v => !selectedVendorIds.includes(v.id)));
            setEntries(prev => prev.filter(e => !selectedVendorIds.includes(e.vendorId)));
            setSelectedVendorIds([]);
            showToast(`${selectedVendorIds.length} books deleted.`);
        } catch (e) {
            console.error("Bulk delete error", e);
            showToast("Error deleting selected books.");
        }
    };

    // ── Ledger data ──
    const visibleEntries = useMemo(() => {
        const visibleVendorIds = new Set(filteredVendors.map(v => v.id));
        return entries.filter(e => {
            const evId = typeof e.vendorId === 'object' ? e.vendorId?._id : e.vendorId;
            return visibleVendorIds.has(evId);
        });
    }, [entries, filteredVendors]);

    // ── Overall summary ──
    const overallStats = useMemo(() => {
        const totalIn = visibleEntries.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
        const totalOut = visibleEntries.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
        return { totalIn, totalOut, balance: totalIn - totalOut };
    }, [visibleEntries]);

    // ── Entry CRUD ──
    const openNewEntry = (type) => {
        setEditingEntry(null);
        setEntryForm({ ...emptyEntryForm, type, ...getNow() });
        setShowEntryModal(true);
    };
    const openEditEntry = (entry) => {
        if (entry.isLocked) {
            showToast("This entry is locked. Please unlock it first to edit.");
            return;
        }
        setEditingEntry(entry);

        const rawDate = entry.date ? (typeof entry.date === 'string' ? entry.date.split('T')[0] : new Date(entry.date).toISOString().split('T')[0]) : "";
        const catName = typeof entry.category === 'object' ? (entry.category?.name || "") : entry.category;
        const modeName = typeof entry.modeOfPayment === 'object' ? (entry.modeOfPayment?.name || "") : entry.modeOfPayment;
        const sigName = typeof entry.signatureName === 'object' ? (entry.signatureName?.name || "") : (entry.signatureName || "");

        setEntryForm({
            ...entry,
            date: rawDate,
            category: catName || "",
            modeOfPayment: modeName || "",
            signatureName: sigName || "",
        });
        setShowEntryModal(true);
    };
    const closeEntryModal = () => { setShowEntryModal(false); setEditingEntry(null); setEntryForm(emptyEntryForm); };

    const saveEntry = async (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (editingEntry?.isLocked) {
            showToast("This entry is locked and cannot be edited.");
            return;
        }

        // Helper to ensure we send an ObjectId, not a name or object
        const resolveId = (val, options) => {
            if (!val) return null;
            const id = val._id || val.id || val;
            if (/^[0-9a-fA-F]{24}$/.test(String(id))) return id;
            // Fallback: If it's a name (like "Cash"), find its ID in the options
            const found = options.find(o => String(o.name || o).toLowerCase() === String(val).toLowerCase());
            return found ? (found._id || found.id) : id;
        };

        const catId = resolveId(entryForm.category, categories);
        const modeId = resolveId(entryForm.modeOfPayment, paymentModes);

        if (!entryForm.amount || !entryForm.date || !modeId) {
            showToast("Please fill all required fields correctly");
            return;
        }

        try {
            const entryData = {
                ...entryForm,
                amount: parseFloat(entryForm.amount),
                vendorId: selectedVendor.id,
                category: catId,
                modeOfPayment: modeId,
                detail: entryForm.detail || "",
                signatureName: entryForm.signatureName || "",
            };

            // Remove internal/immutable fields
            delete entryData._id;
            delete entryData.id;
            delete entryData.createdAt;
            delete entryData.updatedAt;
            delete entryData.createdBy;
            delete entryData.companyId;

            const url = editingEntry ? `/api/cashbook/entries/${editingEntry.id}` : '/api/cashbook/entries';
            const method = editingEntry ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...entryData,
                    companyId: isReadOnly ? undefined : selectedCompanyIds[0]
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (editingEntry) {
                    setEntries((prev) => prev.map((x) => x.id === editingEntry.id ? { ...data, id: data._id } : x));
                    showToast("Entry updated!");
                } else {
                    setEntries((prev) => [{ ...data, id: data._id }, ...prev]);
                    showToast("Entry added!");
                }
                closeEntryModal();
            } else {
                const err = await res.json();
                showToast(err.error || "Error saving entry");
            }
        } catch (error) {
            console.error("Failed to save entry", error);
            showToast("Error saving entry");
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        const lockedSelected = entries.filter(e => selectedIds.includes(e.id) && e.isLocked);
        if (lockedSelected.length > 0) {
            showToast("Some selected entries are locked and cannot be deleted. Please unlock them first.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} entries?`)) return;

        try {
            const res = await fetch(`/api/cashbook/entries?ids=${selectedIds.join(',')}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setEntries(prev => prev.filter(e => !selectedIds.includes(e.id)));
                setSelectedIds([]);
                showToast(`Deleted ${selectedIds.length} entries`);
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to delete entries", "error");
            }
        } catch (error) {
            showToast("Error deleting entries", "error");
        }
    };

    const deleteEntry = async (id) => {
        if (isReadOnly) return;
        const targetEntry = entries.find(e => e.id === id || e._id === id);
        if (targetEntry?.isLocked) {
            showToast("This entry is locked. Please unlock it first to delete.");
            return;
        }
        if (!confirm("Delete this entry?")) return;
        try {
            const res = await fetch(`/api/cashbook/entries/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEntries((prev) => prev.filter((e) => e.id !== id));
                closeEntryModal();
                showToast("Entry deleted.");
            } else {
                const data = await res.json();
                showToast(data.error || "Error deleting entry");
            }
        } catch (error) {
            console.error("Failed to delete entry", error);
            showToast("Error deleting entry");
        }
    };

    const toggleLock = async (entry, e) => {
        e?.stopPropagation();
        if (isReadOnly) return;
        const userId = user?.id || user?.userId || user?._id;
        const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
        const isCreator = String(entry.createdBy) === String(userId);
        if (entry.isLocked && !isAdmin) {
            showToast("Only Admin or Super Admin can unlock this entry");
            return;
        }
        if (!entry.isLocked && !isCreator && !isAdmin) {
            showToast("Only the entry creator or Admin can lock this entry");
            return;
        }
        try {
            const res = await fetch(`/api/cashbook/entries/${entry.id || entry._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLocked: !entry.isLocked }),
            });
            if (res.ok) {
                const updated = await res.json();
                setEntries((prev) => prev.map((x) => (x.id === entry.id || x._id === entry.id) ? { ...updated, id: updated._id } : x));
                showToast(entry.isLocked ? 'Entry unlocked.' : 'Entry locked.');
            } else {
                const data = await res.json();
                showToast(data.error || 'Error updating lock status');
            }
        } catch (err) {
            console.error(err);
            showToast('Error toggling lock');
        }
    };

    const handleBillAttach = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingBills(true);
        const newBills = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'bills');

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    newBills.push(data.path);
                } else {
                    console.error("Failed to upload file", file.name);
                    showToast(`Failed to upload ${file.name}`);
                }
            }

            setEntryForm((prev) => ({
                ...prev,
                bills: [...(prev.bills || []), ...newBills].slice(0, 4)
            }));
        } catch (error) {
            console.error("Upload error", error);
            showToast("Error uploading bills");
        } finally {
            setUploadingBills(false);
            if (billInputRef.current) billInputRef.current.value = "";
        }
    };

    // ── Ledger data ──
    const resolvedEntries = useMemo(() => {
        return entries.map(e => {
            const catId = e.category?._id || e.category?.id || e.category;
            const modeId = e.modeOfPayment?._id || e.modeOfPayment?.id || e.modeOfPayment;

            const cat = categories.find(c => (c._id || c.id) === catId);
            const mode = paymentModes.find(p => (p._id || p.id) === modeId);
            const sig = signatures.find(s => (s._id || s.id) === e.signatureName);

            return {
                ...e,
                displayCategory: cat?.name || e.displayCategory || (typeof catId === 'string' && catId.length !== 24 ? catId : "Uncategorized"),
                displayMode: mode?.name || e.displayMode || (typeof modeId === 'string' && modeId.length !== 24 ? modeId : "N/A"),
                displaySignature: sig?.name || e.signatureName || "—"
            };
        });
    }, [entries, categories, paymentModes, signatures]);

    const vendorEntries = useMemo(() => {
        if (!selectedVendor) return [];
        const vid = selectedVendor.id || selectedVendor._id;
        return resolvedEntries.filter((e) => {
            const evId = e.vendorId?.id || e.vendorId?._id || e.vendorId;
            return String(evId) === String(vid);
        });
    }, [resolvedEntries, selectedVendor]);

    const filtered = useMemo(() => {
        return vendorEntries.filter((e) => {
            const q = searchQuery.toLowerCase().trim();
            const matchSearch = !q ||
                e.detail?.toLowerCase().includes(q) ||
                String(e.amount).includes(q) ||
                e.displayCategory?.toLowerCase().includes(q) ||
                e.displaySignature?.toLowerCase().includes(q);
            const matchDuration = isWithinDuration(e.date, filterDuration);
            const matchSpecificDate = filterDate.length === 0 || filterDate.includes(formatLedgerDate(e.date));
            const matchType = filterType === "All" || (filterType === "Cash In" ? e.type === "in" : e.type === "out");
            const matchPayment = filterPayment.length === 0 || filterPayment.includes(String(e.displayMode).trim());
            const matchCategory = filterCategory.length === 0 || filterCategory.includes(String(e.displayCategory).trim());
            const matchSignature = filterSignature.length === 0 || filterSignature.includes(String(e.displaySignature).trim());
            const matchAmountValue = filterAmount.length === 0 || filterAmount.includes(String(e.amount));
            const matchRemark = filterRemark.length === 0 || filterRemark.includes(String(e.detail).trim());
            return matchSearch && matchDuration && matchSpecificDate && matchType && matchPayment && matchCategory && matchSignature && matchAmountValue && matchRemark;
        });
    }, [vendorEntries, searchQuery, filterDuration, filterDate, filterType, filterPayment, filterCategory, filterSignature, filterAmount, filterRemark]);

    const withBalance = useMemo(() => {
        const sorted = [...filtered].sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));
        let bal = 0;
        return sorted.map((e) => { if (e.type === "in") bal += e.amount; else bal -= e.amount; return { ...e, balance: bal }; }).reverse();
    }, [filtered]);

    const finalFiltered = useMemo(() => {
        if (filterBalance.length === 0) return withBalance;
        return withBalance.filter(e => filterBalance.includes(String(e.balance)));
    }, [withBalance, filterBalance]);

    const totalPages = Math.max(1, Math.ceil(finalFiltered.length / pageSize));
    const paginated = finalFiltered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const vendorLedgerStats = useMemo(() => {
        const totalIn = vendorEntries.filter((e) => e.type === "in").reduce((s, e) => s + e.amount, 0);
        const totalOut = vendorEntries.filter((e) => e.type === "out").reduce((s, e) => s + e.amount, 0);
        return { totalIn, totalOut, balance: totalIn - totalOut };
    }, [vendorEntries]);

    // ── Dynamic Filter Options ──
    const modeOptions = useMemo(() => {
        return [...new Set(vendorEntries.map(e => String(e.displayMode || "").trim()).filter(Boolean))].sort();
    }, [vendorEntries]);

    const categoryOptions = useMemo(() => {
        return [...new Set(vendorEntries.map(e => String(e.displayCategory || "").trim()).filter(Boolean))].sort();
    }, [vendorEntries]);

    const signatureOptions = useMemo(() => {
        return [...new Set(vendorEntries.map(e => String(e.displaySignature || "").trim()).filter(Boolean))].sort();
    }, [vendorEntries]);

    const dateOptions = useMemo(() => {
        const unique = [...new Set(vendorEntries.map(e => formatLedgerDate(e.date)).filter(d => d !== "--"))];
        return unique.sort((a, b) => {
            const da = new Date(a.split('-').reverse().join('-'));
            const db = new Date(b.split('-').reverse().join('-'));
            return db - da;
        });
    }, [vendorEntries]);

    const amountOptions = useMemo(() => {
        const unique = [...new Set(vendorEntries.map(e => e.amount).filter(n => n !== undefined && n !== null))].sort((a, b) => a - b);
        return unique.map(String);
    }, [vendorEntries]);

    const remarkOptions = useMemo(() => {
        const unique = [...new Set(vendorEntries.map(e => e.detail).filter(Boolean))].sort();
        return unique;
    }, [vendorEntries]);

    const balanceOptions = useMemo(() => {
        return [...new Set(withBalance.map(e => String(e.balance)))].sort((a, b) => Number(a) - Number(b));
    }, [withBalance]);

    const allSelected = paginated.length > 0 && paginated.every((e) => selectedIds.includes(e.id));
    const toggleAll = () => allSelected ? setSelectedIds((p) => p.filter((id) => !paginated.find((e) => e.id === id))) : setSelectedIds((p) => [...new Set([...p, ...paginated.map((e) => e.id)])]);
    const toggleOne = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

    const handleExportExcel = () => {
        const rows = [["Date", "Time", "Detail", "Mode", "Type", "Amount", "Balance"]];
        withBalance.forEach((e) => rows.push([formatDate(e.date), e.time, e.detail, e.modeOfPayment, e.type === "in" ? "Cash In" : "Cash Out", e.amount, e.balance]));
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
        a.download = `${selectedVendor?.name}_cashbook.csv`;
        a.click();
    };

    const handleExportPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // Standard Header
        await addStandardHeader(doc, "Cashbook Report", currentCompanyName, companyAddress, companyPhone);

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(`Ledger: ${selectedVendor?.name}`, pageWidth / 2, 28, { align: 'center' });

        doc.setFontSize(8);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, 34, { align: 'center' });

        const tableData = withBalance.map(e => [
            formatDate(e.date),
            e.time,
            e.detail,
            e.modeOfPayment,
            e.type === "in" ? "In" : "Out",
            e.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
            e.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
        ]);

        autoTable(doc, {
            startY: 40,
            head: [["Date", "Time", "Detail", "Mode", "Type", "Amount", "Balance"]],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [230, 112, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { top: 40 },
            styles: { fontSize: 8, cellPadding: 3 }
        });

        doc.save(`${selectedVendor?.name.replace(/\s+/g, '_')}_cashbook.pdf`);
        setShowExportMenu(false);
    };

    // ── Close vendor menu on outside click ──
    useEffect(() => {
        const h = (e) => {
            setVendorMenuOpen(null);
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener("click", h);
        return () => document.removeEventListener("click", h);
    }, []);

    if (permsLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading Cashbook...</p>
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
                        You do not have permission to view the Cash Book. Please contact your administrator for access.
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

    const vendorModal = showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={closeVendorModal} />
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-card shadow-2xl">
                <div className="gradient-header-bg px-6 py-5 text-white">
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                            <h2 className="mt-2 text-2xl font-black text-center" style={{ color: "white" }}>{editingVendor ? "Edit Book" : "Add New Book"}</h2>
                            <p className="mt-1 text-sm font-medium text-white/85 text-center">
                                Cash Book
                            </p>
                        </div>
                        <div className="absolute top-5 right-5">
                            <button onClick={closeVendorModal} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/15 text-white transition hover:bg-card/25">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={saveVendor} className="space-y-5 px-6 py-6"
                    style={{
                        backgroundColor: 'white',
                        backgroundImage: "url('/uploads/VEG%20BG.png')",
                        backgroundSize: 'auto',
                        backgroundRepeat: 'repeat',
                    }}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <label className="text-xs font-black uppercase tracking-[0.22em] text-[#882619]">Vendor Name *</label>
                            <div className="relative">
                                <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Enter vendor name"
                                    value={vendorForm.name}
                                    required
                                    onChange={(e) => setVendorForm((f) => ({ ...f, name: e.target.value }))}
                                    className="gradient-pill-input w-full py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.22em] text-[#882619]">Phone Number</label>
                            <div className="relative">
                                <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="tel"
                                    placeholder="9876543210"
                                    value={vendorForm.phone}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        if (value.length <= 10) {
                                            setVendorForm((f) => ({ ...f, phone: value }));
                                        }
                                    }}
                                    className="gradient-pill-input w-full py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none"
                                />
                            </div>
                            {vendorForm.phone && vendorForm.phone.length !== 10 && (
                                <p className="text-xs font-semibold text-red-500">Phone number must be exactly 10 digits</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.22em] text-[#882619]">Company</label>
                            {user?.role === "Super Admin" ? (
                                <div className="relative">
                                    <Building2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                    <select
                                        value={vendorForm.company}
                                        onChange={(e) => setVendorForm((f) => ({ ...f, company: e.target.value }))}
                                        className="gradient-pill-input w-full appearance-none py-3 pl-11 pr-10 text-sm font-medium text-foreground outline-none"
                                    >
                                        <option value="">Select Branch</option>
                                        {companies.map((c) => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                </div>
                            ) : (
                                <div className="gradient-pill-input flex min-h-[50px] items-center px-4 text-sm font-semibold text-stone-700 dark:text-stone-300">
                                    <Building2 size={16} className="mr-3 text-stone-400" />
                                    {currentCompanyName}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-[0.22em] text-[#882619]">Type</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                                <select
                                    value={vendorForm.type}
                                    onChange={(e) => setVendorForm((f) => ({ ...f, type: e.target.value }))}
                                    className="gradient-pill-input w-full appearance-none py-3 pl-11 pr-10 text-sm font-medium text-foreground outline-none"
                                >
                                    <option value="">Select Type</option>
                                    {vendorTypes.map((t) => (
                                        <option key={t._id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
                            </div>
                            <PermissionWrapper action="source">
                                <button
                                    type="button"
                                    onClick={() => { setMasterTab('cashbookVendorTypes'); setShowCatPanel(true); }}
                                    className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-[#D4612D]/30 bg-orange-50 text-[#882619] transition hover:bg-[#882619] hover:text-white"
                                    title="Add New Type"
                                >
                                    <Plus size={20} />
                                </button>
                            </PermissionWrapper>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-stone-200 dark:border-stone-800 pt-5 sm:flex-row items-center justify-end">
                        <button type="button" onClick={closeVendorModal} className="flex-1 rounded-2xl border border-stone-300 px-4 py-3 text-sm font-bold text-stone-600 transition hover:bg-stone-50">
                            Cancel
                        </button>
                        <PermissionWrapper action={editingVendor ? "edit" : "write"} fallback={
                            <button disabled className="flex-1 cursor-not-allowed rounded-2xl bg-slate-300 px-4 py-3 text-sm font-black text-white">
                                No Permission
                            </button>
                        }>
                            <button type="submit" className="gradient-btn flex-1 py-3 text-sm font-bold cursor-pointer">
                                {editingVendor ? "Update Book" : "Create Book"}
                            </button>
                        </PermissionWrapper>
                    </div>
                </form>
            </div>
        </div>
    );

    // ══════════════════════════════════════════════════════════════════════════════
    // VIEW: VENDOR LIST (Exact match to Image 1)
    // ══════════════════════════════════════════════════════════════════════════════
    if (!selectedVendor) {
        return (
            <div className="min-h-screen px-4 py-6 md:px-8 bg-background">
                {/* Toast */}
                {toast && (
                    <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in slide-in-from-top-3 duration-200">
                        <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
                    </div>
                )}

                {/* Main Outer Card Container */}
                <div className="mx-auto rounded-2xl bg-white dark:bg-[#252525] overflow-hidden shadow-lg border border-stone-200/60 dark:border-stone-800">

                    {/* 1. Top Auxiliary Bar (Inside Container) */}
                    <div className="flex items-center justify-end gap-4 px-6 py-2.5 bg-white dark:bg-[#252525]">
                        {/* Columns Hide / Unhide Button & Dropdown */}
                        <div className="relative" ref={vendorColumnMenuRef}>
                            <button
                                onClick={() => setShowVendorColumnMenu(!showVendorColumnMenu)} className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors shadow-md cursor-pointer"
                            >
                                <img src="/icons/action/Hide.svg" className="w-4 h-4" alt="Hide" />
                                <span>Columns Hide / Unhide</span>
                                <svg className="w-3 h-3 text-[#D4612D]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </button>

                            {showVendorColumnMenu && (
                                <div className="absolute right-0 top-full mt-2 z-50 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-xl dark:bg-[#252525] dark:border-stone-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 border-b border-stone-100 dark:border-stone-700 pb-1">Show / Hide Columns</p>
                                    <div className="space-y-2">
                                        {[
                                            { key: "name", label: "Book Name & Ph." },
                                            { key: "cashIn", label: "In" },
                                            { key: "cashOut", label: "Out" },
                                            { key: "balance", label: "Balance" },
                                            { key: "action", label: "Action" },
                                        ].map((col) => (
                                            <label key={col.key} className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer hover:text-stone-900">
                                                <input
                                                    type="checkbox"
                                                    checked={vendorColumns[col.key]}
                                                    onChange={(e) => setVendorColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))}
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
                        <PermissionWrapper action="source">
                            <button
                                type="button"
                                onClick={() => { setMasterTab('cashbookCategories'); setShowCatPanel(true); }}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-[#882619] hover:text-[#D4612D] transition-colors cursor-pointer outline-none focus:outline-none"
                            >
                                <img src="/icons/action/Source.svg" className="w-5 h-5 block dark:hidden" alt="Source" />
                                <img src="/icons/action/SourceDark.svg" className="w-5 h-5 hidden dark:block" alt="Source" />                                <span>Source</span>
                            </button>
                        </PermissionWrapper>
                    </div>

                    {/* Horizontal Top Divider Line */}
                    <div className="border-t border-[#D4612D]/40"></div>

                    {/* 2. Main Controls Bar (Warm Grey Panel) */}
                    <div className="bg-[#E3E3E3] dark:bg-[#252525] px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        {/* Left: Total Stats Boxes (Cash In, Cash Out, Balance) */}
                        <div className="flex items-center gap-4 divide-x divide-stone-300 dark:divide-stone-700">
                            {/* Cash In */}
                            <div className="pr-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-[#527E00] font-serif">₹</span>
                                    <span className="text-3xl font-black text-[#527E00] font-serif tracking-tight">
                                        {formatCurrency(overallStats.totalIn)}
                                    </span>
                                </div>
                                <p className="text-[11px] font-bold text-[#527E00] italic mt-0.5">
                                    Cash In
                                </p>
                            </div>

                            {/* Cash Out */}
                            <div className="px-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-[#CD0000] font-serif">₹</span>
                                    <span className="text-3xl font-black text-[#CD0000] font-serif tracking-tight">
                                        {formatCurrency(overallStats.totalOut)}
                                    </span>
                                </div>
                                <p className="text-[11px] font-bold text-[#CD0000] italic mt-0.5">
                                    Cash Out
                                </p>
                            </div>

                            {/* Balance */}
                            <div className="pl-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-[#2D241E] dark:text-stone-200 font-serif">₹</span>
                                    <span className="text-3xl font-black text-[#2D241E] dark:text-stone-200 font-serif tracking-tight">
                                        {formatCurrency(overallStats.balance)}
                                    </span>
                                </div>
                                <p className="text-[11px] font-bold text-stone-500 italic mt-0.5">
                                    Balance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-center flex-1">
                            {/* Quick Search Input */}
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4612D]" size={15} />
                                <input
                                    type="text"
                                    placeholder="Quick Search"
                                    value={vendorSearch}
                                    onChange={(e) => { setVendorSearch(e.target.value); setVendorPage(1); }}
                                    className="w-full pl-11 pr-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[#D4612D]/30 transition-all placeholder:text-slate-400 shadow-md"
                                />
                            </div>
                        </div>

                        {/* Center & Right: Search & Action Buttons */}
                        <div className="flex items-center gap-4 justify-end flex-1">
                            {/* Action Icon Buttons */}
                            <div className="flex items-center gap-5 justify-end">
                                {/* Delete Button */}
                                {!isReadOnly && (
                                    <PermissionWrapper action="delete">
                                        <button
                                            type="button"
                                            onClick={selectedVendorIds.length > 0 ? handleBulkDeleteVendors : undefined}
                                            className={`flex flex-col items-center gap-0.5 group transition-all cursor-pointer ${selectedVendorIds.length > 0 ? "opacity-100" : "opacity-80"}`}
                                        >
                                            <img src="/icons/action/Delete.svg" className="w-10 h-10 dark:hidden" alt="Delete" />
                                            <img src="/icons/action/DeleteDark.svg" className="w-10 h-10 hidden dark:block" alt="Delete" />
                                        </button>
                                    </PermissionWrapper>
                                )}

                                {/* Add / New Book Button */}
                                {!isReadOnly && (
                                    <PermissionWrapper action="write">
                                        <button
                                            type="button"
                                            onClick={openAddVendor}
                                            className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer"
                                        >
                                            <img src="/icons/action/NewBook.svg" className="w-17 h-17 block dark:hidden" alt="New Book" />
                                            <img src="/icons/action/NewBookDark.svg" className="w-17 h-17 hidden dark:block" alt="New Book" />                                        </button>
                                    </PermissionWrapper>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Bottom Divider Line */}
                    <div className="border-b border-[#D4612D]/40"></div>

                    {/* 3. Table Data Container */}
                    <div className="relative flex">
                        <div className="overflow-x-auto flex-1 p-6">
                            <table className="w-full border-collapse text-left bg-white dark:bg-[#252525]">
                                <thead>
                                    <tr
                                        style={{ borderBottom: "3px double #78716c" }}
                                        className="text-xs font-semibold text-stone-700 bg-white dark:bg-[#252525]"
                                    >
                                        <th className="w-12 px-3 py-3.5 text-center border-r border-stone-300">
                                            <input
                                                type="checkbox"
                                                checked={paginatedVendors.length > 0 && selectedVendorIds.length === paginatedVendors.length}
                                                onChange={toggleSelectAllVendors}
                                                className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                            />
                                        </th>
                                        {vendorColumns.name && (
                                            <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span>Book Name & Ph.</span>
                                                    <FilterDropdown
                                                        label="Book Name"
                                                        options={vendorNameOptions}
                                                        value={filterVendorName}
                                                        onChange={(v) => { setFilterVendorName(v); setVendorPage(1); }}
                                                        compact
                                                        isMulti
                                                    />
                                                </div>
                                            </th>
                                        )}
                                        {vendorColumns.cashIn && (
                                            <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span>In</span>
                                                    <FilterDropdown
                                                        label="In"
                                                        options={vendorInOptions}
                                                        value={filterVendorIn}
                                                        onChange={(v) => { setFilterVendorIn(v); setVendorPage(1); }}
                                                        compact
                                                        isMulti
                                                    />
                                                </div>
                                            </th>
                                        )}
                                        {vendorColumns.cashOut && (
                                            <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span>Out</span>
                                                    <FilterDropdown
                                                        label="Out"
                                                        options={vendorOutOptions}
                                                        value={filterVendorOut}
                                                        onChange={(v) => { setFilterVendorOut(v); setVendorPage(1); }}
                                                        compact
                                                        isMulti
                                                    />
                                                </div>
                                            </th>
                                        )}
                                        {vendorColumns.balance && (
                                            <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span>Balance</span>
                                                    <FilterDropdown
                                                        label="Balance"
                                                        options={vendorBalanceOptions}
                                                        value={filterVendorBalance}
                                                        onChange={(v) => { setFilterVendorBalance(v); setVendorPage(1); }}
                                                        compact
                                                        isMulti
                                                    />
                                                </div>
                                            </th>
                                        )}
                                        {vendorColumns.action && (
                                            <th className="px-4 py-3.5 text-stone-800 dark:text-stone-200 font-semibold text-xs whitespace-nowrap text-center">
                                                Action
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedVendors.map((vendor) => {
                                        const st = vendorStats[vendor.id] || { totalIn: 0, totalOut: 0, balance: 0 };
                                        return (
                                            <tr key={vendor.id}
                                                style={{ borderBottom: "3px #78716c" }}
                                                className="border-b border-white transition-colors">
                                                <td className="px-3 py-3 text-center border-r">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedVendorIds.includes(vendor.id)}
                                                        onChange={() => toggleSelectVendor(vendor.id)}
                                                        className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                                    />
                                                </td>
                                                {vendorColumns.name && (
                                                    <td className="px-4 py-3 border-r border-stone-300">
                                                        <div className="flex flex-col">
                                                            <span
                                                                onClick={() => { setSelectedVendor(vendor); setCurrentPage(1); setSearchQuery(""); setFilterType("All"); setFilterPayment([]); setFilterDuration("All Time"); setFilterDate([]); setFilterCategory([]); setFilterSignature([]); setFilterAmount([]); setFilterRemark([]); setFilterBalance([]); }}
                                                                className="text-xs font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent cursor-pointer hover:underline"
                                                            >
                                                                {vendor.name}
                                                            </span>
                                                            <span className="mt-0.5 text-[10px] font-medium text-stone-400 italic">
                                                                {vendor.phone ? `${vendor.phone} | ` : ''}{vendor.type}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                                {vendorColumns.cashIn && (
                                                    <td className="px-4 py-3  text-xs font-bold text-[#089334] dark:text-[#089334]">
                                                        ₹ {formatCurrency(st.totalIn)}
                                                    </td>
                                                )}
                                                {vendorColumns.cashOut && (
                                                    <td className="px-4 py-3  text-xs font-bold text-[#CD0000] dark:text-[#CD0000]">
                                                        ₹ {formatCurrency(st.totalOut)}
                                                    </td>
                                                )}
                                                {vendorColumns.balance && (
                                                    <td className="px-4 py-3 border-r border-stone-300 text-xs font-bold text-[#2D241E] dark:text-stone-200">
                                                        ₹ {formatCurrency(st.balance)}
                                                    </td>
                                                )}
                                                {vendorColumns.action && (
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-3">
                                                            {!isReadOnly && (
                                                                <>
                                                                    <PermissionWrapper action="edit">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditVendor(vendor)}
                                                                            className="hover:scale-110 transition-transform cursor-pointer"
                                                                            title="Edit"
                                                                        >
                                                                            <img src="/icons/action/Edit.svg" className="w-5 h-5" alt="Edit" />
                                                                        </button>
                                                                    </PermissionWrapper>
                                                                    <PermissionWrapper action="delete">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => deleteVendor(vendor.id)}
                                                                            className="hover:scale-110 transition-transform cursor-pointer"
                                                                            title="Delete"
                                                                        >
                                                                            <img src="/icons/action/Delete1.svg" className="w-5 h-5 dark:hidden " alt="Delete" />
                                                                            <img src="/icons/action/DeleteDark1.svg" className="w-5 h-5 dark:block hidden" alt="Delete" />                                                                        </button>
                                                                    </PermissionWrapper>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredVendors.length === 0 && (
                                <div className="p-12 text-center text-stone-400 font-bold italic text-xs bg-[#FAF7F6] dark:bg-[#252525]">
                                    No matching books found.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div>
                        <Pagination
                            currentPage={vendorPage}
                            totalPages={totalVendorPages}
                            onPageChange={setVendorPage}
                            itemsPerPage={vendorItemsPerPage}
                            onItemsPerPageChange={setVendorItemsPerPage}
                            totalItems={filteredVendors.length}
                            colorTheme="orange"
                        />
                    </div>
                </div>

                {/* ── Vendor Modal ── */}
                {vendorModal}

                {/* ── Master Data Manager ── */}
                <MasterDataManager
                    isOpen={showCatPanel}
                    onClose={() => setShowCatPanel(false)}
                    onRefresh={() => {
                        fetchCategories(user?.companyId);
                        fetchSignatures(user?.companyId);
                        fetchPaymentModes(user?.companyId);
                        fetchVendorTypes(user?.companyId);
                    }}
                    allowedTabs={['cashbookCategories', 'cashbookSignatures', 'paymentModes', 'cashbookVendorTypes']}
                    initialTab={masterTab}
                    companyId={vendorForm.company || user?.companyId}
                />
            </div>
        );
    }
    return (
        <div className="min-h-screen px-4 py-6 md:px-8 bg-background">
            {/* Toast */}
            {toast && (
                <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold animate-in slide-in-from-top-3 duration-200">
                    <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
                </div>
            )}

            {/* Outer Container Card */}
            <div className="mx-auto max-w-[1320px] rounded-2xl bg-white dark:bg-[#252525] overflow-hidden shadow-lg border border-stone-200/60 dark:border-stone-800">

                {/* 1. Top Auxiliary Control Bar (Inside Container) */}
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#252525]">
                    {/* Left: Vendor Name & Subtitle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedVendor(null)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold leading-none bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                {selectedVendor.name}
                            </h1>
                            <p className="text-sm text-stone-400 font-medium italic mt-1">
                                {selectedVendor.phone ? `${selectedVendor.phone} | ` : ""}{selectedVendor.type}
                            </p>
                        </div>
                    </div>

                    {/* Right: Controls & Action Icons */}
                    <div className="flex items-center gap-4">
                        {/* Columns Hide / Unhide Button & Dropdown */}
                        <div className="relative" ref={ledgerColumnMenuRef}>
                            <button
                                onClick={() => setShowLedgerColumnMenu(!showLedgerColumnMenu)}
                                className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-full text-xs font-bold text-slate-600 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors shadow-md cursor-pointer"
                            >
                                <img src="/icons/action/Hide.svg" className="w-4 h-4" alt="Hide" />
                                <span>Columns Hide / Unhide</span>
                                <svg className="w-3 h-3 text-[#D4612D]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </button>

                            {showLedgerColumnMenu && (
                                <div className="absolute right-0 top-full mt-2 z-50 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-xl dark:bg-[#252525] dark:border-stone-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 border-b border-stone-100 dark:border-stone-700 pb-1">Show / Hide Columns</p>
                                    <div className="space-y-2">
                                        {[
                                            { key: "date", label: "Date" },
                                            { key: "note", label: "Note" },
                                            { key: "category", label: "Category" },
                                            { key: "sign", label: "Sign" },
                                            { key: "mode", label: "Mode & Bill" },
                                            { key: "amount", label: "Amount" },
                                            { key: "balance", label: "Balance" },
                                            { key: "action", label: "Action" },
                                        ].map((col) => (
                                            <label key={col.key} className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer hover:text-stone-900">
                                                <input
                                                    type="checkbox"
                                                    checked={ledgerColumns[col.key]}
                                                    onChange={(e) => setLedgerColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))}
                                                    className="h-3.5 w-3.5 rounded border-[#882619] accent-[#882619] cursor-pointer"
                                                />
                                                <span>{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Download Export Menu */}
                        <div className="relative" ref={exportMenuRef}>
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex flex-col items-center justify-center gap-0.5 group transition-all text-[#882619] cursor-pointer"
                            >
                                <img src="/icons/action/Download.svg" className="w-16 h-16 dark:hidden" alt="Download" />
                                <img src="/icons/action/DownloadDark.svg" className="w-16 h-16 hidden dark:block" alt="Download" />
                            </button>

                            {showExportMenu && (
                                <div className="absolute right-0 top-full mt-2 z-50 w-40 overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => { handleExportExcel(); setShowExportMenu(false); }}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-emerald-50 hover:text-emerald-600"
                                    >
                                        <FileText size={18} className="text-emerald-500" />
                                        Excel (CSV)
                                    </button>
                                    <button
                                        onClick={handleExportPDF}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-red-50 hover:text-red-600 border-t border-border"
                                    >
                                        <FileText size={18} className="text-red-500" />
                                        PDF Report
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bulk Action */}
                        <button
                            type="button"
                            onClick={() => { setIsBulkModalOpen(true); setBulkFile(null); setBulkPreviewData(null); }}
                            className="flex flex-col items-center justify-center gap-0.5 group transition-all text-[#882619] cursor-pointer"
                            title="Bulk Upload Entries"
                        >
                            <img src="/icons/action/Bulk.svg" className="w-12 h-12 dark:hidden" alt="Bulk" />
                            <img src="/icons/action/BulkDark.svg" className="w-12 h-12 dark:block hidden" alt="Bulk" />
                        </button>

                        {/* Source Button */}
                        <PermissionWrapper action="source">
                            <button
                                type="button"
                                onClick={() => { setMasterTab('cashbookCategories'); setShowCatPanel(true); }}
                                className="flex flex-col items-center justify-center gap-0.5 group transition-all text-[#882619] cursor-pointer mt-1"
                            >
                                <img src="/icons/action/Source.svg" className="w-5 h-5 block dark:hidden" alt="Source" />
                                <img src="/icons/action/SourceDark.svg" className="w-5 h-5 hidden dark:block" alt="Source" />                                <span className="text-[10px] font-medium text-[#882619]">Source</span>
                            </button>
                        </PermissionWrapper>
                    </div>
                </div>

                {/* Horizontal Top Divider Line */}
                <div className="border-t border-[#D4612D]/40"></div>

                {/* 2. Main Controls & Stats Bar (Warm Grey Panel) */}
                <div className="bg-[#E3E3E3] dark:bg-[#252525] px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    {/* Left: Stats Boxes (Cash In, Cash Out, Balance) */}
                    <div className="flex items-center gap-4 divide-x divide-stone-300 dark:divide-stone-700">
                        {/* Cash In */}
                        <div className="pr-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-[#527E00] font-serif">₹</span>
                                <span className="text-3xl font-black text-[#527E00] font-serif tracking-tight">
                                    {formatCurrency(vendorLedgerStats.totalIn)}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-[#527E00] italic mt-0.5">
                                Cash In
                            </p>
                        </div>

                        {/* Cash Out */}
                        <div className="px-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-[#CD0000] font-serif">₹</span>
                                <span className="text-3xl font-black text-[#CD0000] font-serif tracking-tight">
                                    {formatCurrency(vendorLedgerStats.totalOut)}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-[#CD0000] italic mt-0.5">
                                Cash Out
                            </p>
                        </div>

                        {/* Balance */}
                        <div className="pl-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-[#2D241E] dark:text-stone-200 font-serif">₹</span>
                                <span className="text-3xl font-black text-[#2D241E] dark:text-stone-200 font-serif tracking-tight">
                                    {formatCurrency(vendorLedgerStats.balance)}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-stone-500 italic mt-0.5">
                                Balance
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 justify-center flex-1">
                        {/* Quick Search Input */}
                        <div className="relative w-full sm:w-64 ">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4612D]" size={15} />
                            <input
                                type="text"
                                placeholder="Quick Search"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-11 pr-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[#D4612D]/30 transition-all placeholder:text-slate-400 shadow-md"
                            />
                        </div>
                    </div>

                    {/* Center & Right: Search & Action Buttons */}
                    <div className="flex items-center gap-4 justify-end flex-1">
                        {/* Action Icon Buttons */}
                        <div className="flex items-center gap-5 justify-end">
                            {/* Delete Button */}
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={selectedIds.length > 0 ? handleBulkDelete : undefined}
                                    className={`flex flex-col items-center gap-0.5 group transition-all cursor-pointer ${selectedIds.length > 0 ? "opacity-100" : "opacity-80"}`}
                                >
                                    <img src="/icons/action/Delete.svg" className="w-10 h-10 dark:hidden " alt="Delete" />
                                    <img src="/icons/action/DeleteDark.svg" className="w-10 h-10 dark:block hidden" alt="Delete" />                                </button>
                            )}

                            {/* In Button */}
                            {!isReadOnly && (
                                <PermissionWrapper action="write">
                                    <button
                                        type="button"
                                        onClick={() => openNewEntry("in")}
                                        className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-full border-2 border-[#527E00]  text-black dark:text-white flex items-center justify-center font-black text-lg">
                                            +
                                        </div>
                                        <span className="text-[10px] font-medium text-[#527E00]">In</span>
                                    </button>
                                </PermissionWrapper>
                            )}

                            {/* Out Button */}
                            {!isReadOnly && (
                                <PermissionWrapper action="write">
                                    <button
                                        type="button"
                                        onClick={() => openNewEntry("out")}
                                        className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-full border-2 border-[#CD0000] text-black dark:text-white  flex items-center justify-center font-black text-lg">
                                            -
                                        </div>
                                        <span className="text-[10px] font-medium text-[#CD0000]">Out</span>
                                    </button>
                                </PermissionWrapper>
                            )}
                        </div>
                    </div>
                </div>

                {/* Horizontal Bottom Divider Line */}
                <div className="border-b border-[#D4612D]/40"></div>

                {/* 3. Table Data Container */}
                <div className="relative flex">
                    <div className="overflow-x-auto flex-1 p-6">
                        <table className="w-full border-collapse text-left bg-white dark:bg-[#252525]">
                            <thead>
                                <tr
                                    style={{ borderBottom: "3px double #78716c" }}
                                    className="text-xs font-semibold text-stone-700 bg-white dark:bg-[#252525]"
                                >
                                    <th className="w-12 px-3 py-3.5 text-center border-r border-stone-300">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                        />
                                    </th>
                                    {ledgerColumns.date && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>Date</span>
                                                <FilterDropdown
                                                    label="Date"
                                                    options={dateOptions}
                                                    value={filterDate}
                                                    onChange={(v) => { setFilterDate(v); setCurrentPage(1); }}
                                                    compact
                                                    isMulti
                                                    placeholder="Search dates..."
                                                />
                                            </div>
                                        </th>
                                    )}
                                    {ledgerColumns.note && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>Note</span>
                                                <FilterDropdown
                                                    label="Remarks"
                                                    options={remarkOptions}
                                                    value={filterRemark}
                                                    onChange={(v) => { setFilterRemark(v); setCurrentPage(1); }}
                                                    compact
                                                    isMulti
                                                />
                                            </div>
                                        </th>
                                    )}
                                    {ledgerColumns.category && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>Category</span>
                                                <FilterDropdown
                                                    label="Category"
                                                    options={categoryOptions.filter(o => o !== "All")}
                                                    value={filterCategory}
                                                    onChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}
                                                    compact
                                                    isMulti
                                                />
                                            </div>
                                        </th>
                                    )}
                                    {ledgerColumns.sign && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>Sign</span>
                                                <FilterDropdown
                                                    label="Signature"
                                                    options={signatureOptions.filter(o => o !== "All")}
                                                    value={filterSignature}
                                                    onChange={(v) => { setFilterSignature(v); setCurrentPage(1); }}
                                                    compact
                                                    isMulti
                                                />
                                            </div>
                                        </th>
                                    )}
                                    {ledgerColumns.mode && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>Mode & Bill</span>
                                                <FilterDropdown
                                                    label="Mode"
                                                    options={modeOptions.filter(o => o !== "All")}
                                                    value={filterPayment}
                                                    onChange={(v) => { setFilterPayment(v); setCurrentPage(1); }}
                                                    compact
                                                    isMulti
                                                />
                                            </div>
                                        </th>
                                    )}
                                    {ledgerColumns.amount && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>Amount</span>
                                                <FilterDropdown
                                                    label="Amount"
                                                    options={amountOptions}
                                                    value={filterAmount}
                                                    onChange={(v) => { setFilterAmount(v); setCurrentPage(1); }}
                                                    compact
                                                    isMulti
                                                />
                                            </div>
                                        </th>
                                    )}
                                    {ledgerColumns.balance && (
                                        <th className="px-4 py-3.5 border-r border-stone-300 text-stone-800 font-semibold text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span>Balance</span>
                                                <FilterDropdown
                                                    label="Balance"
                                                    options={balanceOptions}
                                                    value={filterBalance}
                                                    onChange={(v) => { setFilterBalance(v); setCurrentPage(1); }}
                                                    compact
                                                    isMulti
                                                />
                                            </div>
                                        </th>
                                    )}
                                    {ledgerColumns.action && (
                                        <th className="px-4 py-3.5 text-stone-800 dark:text-stone-200 font-semibold text-xs whitespace-nowrap text-center">
                                            Action
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((entry) => {
                                    const isCreator = String(entry.createdBy) === String(user?.id);
                                    const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
                                    const canEdit = !entry.isLocked;
                                    return (
                                        <tr
                                            key={entry.id}
                                            onClick={() => {
                                                if (isReadOnly) { showToast('Cannot edit in multi-company view (Read Only)'); return; }
                                                if (!hasPermission('edit')) { showToast('You do not have permission to edit entries'); return; }
                                                if (!canEdit) { showToast('This entry is locked. Please unlock it first to edit.'); return; }
                                                openEditEntry(entry);
                                            }}
                                            className={`border-b border-stone-300/80 transition-colors hover:bg-stone-100/50 cursor-pointer ${entry.isLocked ? 'bg-red-50/10' : ''}`}
                                        >
                                            <td className="px-3 py-3 text-center border-r border-stone-300" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(entry.id)}
                                                    onChange={() => toggleOne(entry.id)}
                                                    className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                                />
                                            </td>
                                            {ledgerColumns.date && (
                                                <td className="px-4 py-3 border-r border-stone-300 text-xs font-medium text-stone-700 whitespace-nowrap">
                                                    {formatLedgerDate(entry.date)}
                                                </td>
                                            )}
                                            {ledgerColumns.note && (
                                                <td className="px-4 py-3 ">
                                                    <span className="text-xs font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                        {entry.detail || "—"}
                                                    </span>
                                                </td>
                                            )}
                                            {ledgerColumns.category && (
                                                <td className="px-4 py-3  text-xs font-semibold text-stone-800 dark:text-stone-200">
                                                    {entry.displayCategory || "—"}
                                                </td>
                                            )}
                                            {ledgerColumns.sign && (
                                                <td className="px-4 py-3 border-r border-stone-300 text-xs font-semibold text-stone-800 dark:text-stone-200">
                                                    {entry.displaySignature || "—"}
                                                </td>
                                            )}
                                            {ledgerColumns.mode && (
                                                <td className="px-4 py-3 ">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                                                            {entry.displayMode || "—"}
                                                        </span>
                                                        {entry.bills?.length > 0 && (
                                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                                {entry.bills.map((billUrl, idx) => {
                                                                    const fileName = billUrl ? (billUrl.split('/').pop() || `Bill ${idx + 1}`) : `Bill ${idx + 1}`;
                                                                    return (
                                                                        <span
                                                                            key={idx}
                                                                            onClick={(e) => { e.stopPropagation(); setViewBill(billUrl); }}
                                                                            className="text-[10px] font-medium text-blue-600 italic hover:underline cursor-pointer truncate max-w-[130px]"
                                                                            title={fileName}
                                                                        >
                                                                            {fileName}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            {ledgerColumns.amount && (
                                                <td className={`px-4 py-3  text-xs font-bold ${entry.type === "in" ? "text-[#527E00]" : "text-[#CD0000]"}`}>
                                                    ₹ {formatCurrency(entry.amount)}
                                                </td>
                                            )}
                                            {ledgerColumns.balance && (
                                                <td className="px-4 py-3 border-r border-stone-300 text-xs font-bold text-[#2D241E] dark:text-stone-200">
                                                    ₹ {formatCurrency(entry.balance)}
                                                </td>
                                            )}
                                            {ledgerColumns.action && (
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        {!isReadOnly && (
                                                            <>
                                                                {!entry.isLocked ? (
                                                                    <>
                                                                        <PermissionWrapper action="edit">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); openEditEntry(entry); }}
                                                                                className="hover:scale-110 transition-transform cursor-pointer"
                                                                                title="Edit"
                                                                            >
                                                                                <img src="/icons/action/Edit.svg" className="w-4 h-4" alt="Edit" />
                                                                            </button>
                                                                        </PermissionWrapper>
                                                                        <PermissionWrapper action="delete">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                                                                                className="hover:scale-110 transition-transform cursor-pointer"
                                                                                title="Delete"
                                                                            >
                                                                                <img src="/icons/action/Delete1.svg" className="w-4 h-4 dark:hidden " alt="Delete" />
                                                                                <img src="/icons/action/DeleteDark1.svg" className="w-4 h-4 dark:block hidden" alt="Delete" />                                                                            </button>
                                                                        </PermissionWrapper>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => toggleLock(entry, e)}
                                                                            className="p-1 text-stone-400 hover:text-stone-700 hover:scale-110 transition-all cursor-pointer"
                                                                            title="Click to Lock Entry"
                                                                        >
                                                                            <img src="/icons/action/Unlock.svg" className="w-4 h-4" alt="Unlock" />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => toggleLock(entry, e)}
                                                                        className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md hover:scale-110 transition-all cursor-pointer"
                                                                        title="Click to Unlock Entry"
                                                                    >
                                                                        <img src="/icons/action/Lock.svg" className="w-5 h-5" alt="Lock" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {paginated.length === 0 && (
                            <div className="p-12 text-center text-stone-400 font-bold italic text-xs bg-[#FAF7F6] dark:bg-[#252525]">
                                No entries found for this book.
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                <div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={withBalance.length}
                        itemsPerPage={pageSize}
                        onItemsPerPageChange={(val) => { setPageSize(val); setCurrentPage(1); }}
                        colorTheme="orange"
                    />
                </div>
            </div>

            {/* Master Data Manager was here, moved to end */}


            {/* ── Entry Modal (Exact match to Image 2 spacing) ── */}
            {showEntryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={closeEntryModal} />
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.2rem] bg-white dark:bg-[#252525] shadow-2xl border border-stone-200/60 dark:border-stone-800">
                        {/* Header Banner */}
                        <div className="gradient-header-bg px-8 py-7 md:py-8 text-white text-center">
                            <h2 className="text-3xl md:text-4xl font-normal text-white text-center"
                                style={{ color: "white" }}>
                                {editingEntry ? "Edit Entry" : "Add Entry"}
                            </h2>
                            <p className="mt-2 text-base md:text-lg font-normal text-white/90 text-center">{selectedVendor?.name}</p>
                            <p className="mt-1.5 text-sm font-bold text-white/90 text-center">Balance : ₹ {formatCurrency(vendorLedgerStats?.balance || 0)}</p>
                        </div>

                        <form onSubmit={saveEntry} className="space-y-6 md:space-y-7 px-8 sm:px-12 py-8 md:py-10"
                            style={{
                                backgroundColor: 'white',
                                backgroundImage: "url('/uploads/VEG%20BG.png')",
                                backgroundSize: 'auto',
                                backgroundRepeat: 'repeat',
                            }}>
                            {/* Type Toggle (Cash In / Cash Out) */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="flex items-center justify-between border border-[#D4612D]/40 rounded-xl p-1.5 w-72 bg-white dark:bg-[#252525] shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setEntryForm((f) => ({ ...f, type: "in" }))}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${entryForm.type === "in"
                                            ? "bg-[#527E00] text-white shadow-sm"
                                            : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
                                            }`}
                                    >
                                        Cash In
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEntryForm((f) => ({ ...f, type: "out" }))}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${entryForm.type === "out"
                                            ? "bg-[#CD0000] text-white shadow-sm"
                                            : "text-stone-600 dark:text-stone-300 hover:text-stone-900"
                                            }`}
                                    >
                                        Cash Out
                                    </button>
                                </div>
                            </div>

                            {/* Row 1: Date & Amount */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                {/* Date */}
                                <div className="flex items-center gap-3">
                                    <label className="w-18 sm:w-20 text-right shrink-0 text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                                        <span className="text-[#882619] mr-0.5">*</span> Date :
                                    </label>
                                    <div className="relative flex-1">
                                        <DateTimePicker
                                            required={true}
                                            value={entryForm.date ? (entryForm.time ? `${entryForm.date.split('T')[0]}T${to24h(entryForm.time)}` : entryForm.date.split('T')[0]) : ''}
                                            onChange={(val) => {
                                                if (val) {
                                                    if (val.includes('T')) {
                                                        const [d, t] = val.split('T');
                                                        setEntryForm(f => ({ ...f, date: d, time: to12h(t) }));
                                                    } else {
                                                        setEntryForm(f => ({ ...f, date: val }));
                                                    }
                                                } else {
                                                    setEntryForm(f => ({ ...f, date: '', time: '' }));
                                                }
                                            }}
                                            showTime={true}
                                        />
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center gap-3">
                                    <label className="w-18 sm:w-20 text-right shrink-0 text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                                        <span className="text-[#882619] mr-0.5">*</span> Amount :
                                    </label>
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="₹ 0.00"
                                            value={entryForm.amount}
                                            required
                                            onChange={(e) => setEntryForm((f) => ({ ...f, amount: e.target.value }))}
                                            className="gradient-pill-input w-full py-2.5 px-4 text-xs font-semibold text-stone-800 dark:text-stone-200 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Note */}
                            <div className="flex items-center gap-3">
                                <label className="w-18 sm:w-20 text-right shrink-0 text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                                    <span className="text-[#882619] mr-0.5">*</span> Note :
                                </label>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Note"
                                        value={entryForm.detail}
                                        onChange={(e) => setEntryForm((f) => ({ ...f, detail: e.target.value }))}
                                        className="gradient-pill-input w-full py-2.5 px-4 text-xs font-semibold text-stone-800 dark:text-stone-200 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Category & Sign */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                {/* Category */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-end">
                                        {!isReadOnly && (
                                            <PermissionWrapper action="write">
                                                <button
                                                    type="button"
                                                    onClick={() => { setMasterTab('cashbookCategories'); setShowCatPanel(true); }}
                                                    className="text-[11px] font-bold text-[#882619] hover:underline cursor-pointer"
                                                >
                                                    + Add Category
                                                </button>
                                            </PermissionWrapper>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="w-18 sm:w-20 text-right shrink-0 text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                                            <span className="text-[#882619] mr-0.5">*</span> Category :
                                        </label>
                                        <div className="relative flex-1">
                                            <select
                                                value={entryForm.category}
                                                onChange={(e) => setEntryForm((f) => ({ ...f, category: e.target.value }))}
                                                className="gradient-pill-input w-full appearance-none py-2.5 pl-4 pr-8 text-xs font-semibold text-stone-800 dark:text-stone-200 outline-none cursor-pointer"
                                            >
                                                <option value="">Category</option>
                                                {categories.map((c) => (
                                                    <option key={c._id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Sign */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-end">
                                        {!isReadOnly && (
                                            <PermissionWrapper action="write">
                                                <button
                                                    type="button"
                                                    onClick={() => { setMasterTab('cashbookSignatures'); setShowCatPanel(true); }}
                                                    className="text-[11px] font-bold text-[#882619] hover:underline cursor-pointer"
                                                >
                                                    + Add Sign
                                                </button>
                                            </PermissionWrapper>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="w-18 sm:w-20 text-right shrink-0 text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                                            <span className="text-[#882619] mr-0.5">*</span> Sign :
                                        </label>
                                        <div className="relative flex-1">
                                            <select
                                                value={entryForm.signatureName}
                                                onChange={(e) => setEntryForm((f) => ({ ...f, signatureName: e.target.value }))}
                                                className="gradient-pill-input w-full appearance-none py-2.5 pl-4 pr-8 text-xs font-semibold text-stone-800 dark:text-stone-200 outline-none cursor-pointer"
                                            >
                                                <option value="">Sign</option>
                                                {signatures.map((s) => (
                                                    <option key={s._id} value={s.name}>{s.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Mode & Attach Bill */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
                                {/* Mode */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-end">
                                        {!isReadOnly && (
                                            <PermissionWrapper action="write">
                                                <button
                                                    type="button"
                                                    onClick={() => { setMasterTab('paymentModes'); setShowCatPanel(true); }}
                                                    className="text-[11px] font-bold text-[#882619] hover:underline cursor-pointer"
                                                >
                                                    + Add Mode
                                                </button>
                                            </PermissionWrapper>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="w-18 sm:w-20 text-right shrink-0 text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                                            <span className="text-[#882619] mr-0.5">*</span> Mode :
                                        </label>
                                        <div className="relative flex-1">
                                            <select
                                                value={entryForm.modeOfPayment}
                                                required
                                                onChange={(e) => setEntryForm((f) => ({ ...f, modeOfPayment: e.target.value }))}
                                                className="gradient-pill-input w-full appearance-none py-2.5 pl-4 pr-8 text-xs font-semibold text-stone-800 dark:text-stone-200 outline-none cursor-pointer"
                                            >
                                                <option value="">Mode</option>
                                                {paymentModes.map((o) => (
                                                    <option key={o._id} value={o.name}>{o.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Attach Bill */}
                                <div className="flex flex-col items-center justify-center pt-3">
                                    <input ref={billInputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleBillAttach} />
                                    <button
                                        type="button"
                                        onClick={() => billInputRef.current?.click()}
                                        disabled={(entryForm.bills?.length || 0) >= 4 || uploadingBills}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                    >
                                        {uploadingBills ? (
                                            <Loader2 size={18} className="animate-spin text-blue-600" />
                                        ) : (
                                            <div className="p-1 border border-blue-600 rounded-md">
                                                <Paperclip size={15} className="text-blue-600" />
                                            </div>
                                        )}
                                        <span className="text-xs font-bold italic">Attach Bill</span>
                                    </button>
                                    <p className="text-[10px] text-stone-400 mt-1">Supports PNG, JPG, PDF, WEBP etc..</p>
                                    {entryForm.bills?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {entryForm.bills.map((b, i) => (
                                                <div key={i} className="flex items-center gap-1 px-2 py-0.5 bg-stone-100 rounded text-[10px] text-stone-600">
                                                    <span className="max-w-[70px] truncate">{b.split('/').pop()}</span>
                                                    <button type="button" onClick={() => setEntryForm((f) => ({ ...f, bills: f.bills.filter((_, j) => j !== i) }))} className="text-red-500 hover:text-red-700">
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-6 pt-6 mt-6 border-t border-stone-200/80 dark:border-stone-800">
                                {editingEntry && (
                                    <PermissionWrapper action="delete">
                                        <button
                                            type="button"
                                            onClick={() => deleteEntry(editingEntry.id)}
                                            className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer mr-auto"
                                        >
                                            Delete Entry
                                        </button>
                                    </PermissionWrapper>
                                )}
                                <button
                                    type="button"
                                    onClick={closeEntryModal}
                                    className="text-stone-600 dark:text-stone-300 hover:text-stone-900 font-medium text-base cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <PermissionWrapper action={editingEntry ? "edit" : "write"} fallback={
                                    <button disabled className="px-10 py-3 bg-stone-300 text-white rounded-2xl text-sm font-bold cursor-not-allowed">
                                        No Permission
                                    </button>
                                }>
                                    <button
                                        type="submit"
                                        className="gradient-btn px-12 py-3 text-sm font-bold text-white shadow-lg cursor-pointer"
                                    >
                                        Save
                                    </button>
                                </PermissionWrapper>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ── Vendor Modal (Detail View) ── */}
            {vendorModal}

            {/* ── View Bill Modal ── */}
            {viewBill && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewBill(null)}>
                    <div className="relative bg-card p-2 rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden w-full flex flex-col" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setViewBill(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex-1 overflow-auto flex items-center justify-center bg-muted rounded-xl">
                            {viewBill.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={viewBill} className="w-full h-full min-h-[500px]" title="Bill PDF" />
                            ) : (
                                <img src={viewBill} alt="Bill Preview" className="max-w-full max-h-[85vh] object-contain" />
                            )}
                        </div>
                        <div className="p-4 flex justify-between items-center bg-card mt-2">
                            <span className="text-xs font-bold text-muted-foreground truncate max-w-[200px]">{viewBill.split('/').pop()}</span>
                            <a href={viewBill} download target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                                <Download size={16} /> Download
                            </a>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Bulk Upload Modal ── */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px]">
                    <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white dark:bg-[#1E1E1E] shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="gradient-header-bg relative px-8 py-5 text-center shadow-md">
                            <button
                                onClick={() => { setIsBulkModalOpen(false); setBulkFile(null); setBulkPreviewData(null); }}
                                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:text-white transition-all hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-normal tracking-wide text-white">
                                Bulk Upload Cashbook Entries
                            </h2>
                            <p className="mt-1 text-xs italic text-white/85">
                                Upload Excel (.xlsx, .xls) or CSV file for {selectedVendor?.name || 'Selected Vendor'}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Sample Download Bar */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                                <div>
                                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Need the correct Excel format?</h4>
                                    <p className="text-[11px] text-stone-500">Download sample template with expected column headers</p>
                                </div>
                                <button
                                    onClick={handleDownloadBulkSample}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-full text-xs font-bold text-[#882619] dark:text-[#D4612D] hover:bg-stone-50 transition shadow-sm cursor-pointer"
                                >
                                    <Download size={14} />
                                    Download Template
                                </button>
                            </div>

                            {/* Drop Target File Upload */}
                            <label
                                className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${bulkDragging ? 'border-[#D4612D] bg-[#D4612D]/10' : 'border-stone-300 dark:border-stone-700 hover:border-[#D4612D]'
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setBulkDragging(true); }}
                                onDragLeave={() => setBulkDragging(false)}
                                onDrop={handleBulkDrop}
                            >
                                <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleBulkFileInput} />
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors mb-2 ${bulkFile ? 'bg-emerald-100' : 'bg-stone-100 dark:bg-stone-800'}`}>
                                    <Upload size={24} className={bulkFile ? 'text-emerald-600' : 'text-[#D4612D]'} />
                                </div>
                                {bulkFile ? (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-emerald-600">{bulkFile.name}</p>
                                        <p className="text-xs text-stone-500 mt-0.5">
                                            {bulkPreviewData ? `${bulkPreviewData.length} valid entries parsed` : 'Parsing file...'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-stone-700 dark:text-stone-300">Click to select or drag & drop Excel / CSV file</p>
                                        <p className="text-xs text-stone-400 mt-0.5">Supports .xlsx, .xls, and .csv files</p>
                                    </div>
                                )}
                            </label>

                            {/* Data Preview Table */}
                            {bulkPreviewData && bulkPreviewData.length > 0 && (
                                <div className="rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm">
                                    <div className="bg-stone-100 dark:bg-stone-800 px-4 py-2 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
                                        <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                                            Preview Entries ({bulkPreviewData.length})
                                        </span>
                                        <span className="text-[10px] font-semibold text-stone-400">
                                            Total: ₹ {formatCurrency(bulkPreviewData.reduce((acc, r) => acc + r.amount, 0))}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-60">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-stone-50 dark:bg-stone-800/80 sticky top-0 z-10 border-b border-stone-200 dark:border-stone-700">
                                                <tr>
                                                    <th className="px-3 py-2 font-bold text-stone-600 dark:text-stone-300">#</th>
                                                    <th className="px-3 py-2 font-bold text-stone-600 dark:text-stone-300">Date</th>
                                                    <th className="px-3 py-2 font-bold text-stone-600 dark:text-stone-300">Type</th>
                                                    <th className="px-3 py-2 font-bold text-stone-600 dark:text-stone-300">Detail</th>
                                                    <th className="px-3 py-2 font-bold text-stone-600 dark:text-stone-300 text-right">Amount</th>
                                                    <th className="px-3 py-2 font-bold text-stone-600 dark:text-stone-300">Category</th>
                                                    <th className="px-3 py-2 font-bold text-stone-600 dark:text-stone-300">Payment Mode</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                                                {bulkPreviewData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                                        <td className="px-3 py-2 font-semibold text-stone-400">{i + 1}</td>
                                                        <td className="px-3 py-2 font-bold text-stone-800 dark:text-stone-200 whitespace-nowrap">{row.date}</td>
                                                        <td className="px-3 py-2 font-bold whitespace-nowrap">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${row.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {row.type === 'in' ? 'Cash In' : 'Cash Out'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-stone-700 dark:text-stone-300 max-w-[180px] truncate">{row.detail || '-'}</td>
                                                        <td className="px-3 py-2 font-bold text-stone-800 dark:text-stone-200 text-right whitespace-nowrap">₹ {formatCurrency(row.amount)}</td>
                                                        <td className="px-3 py-2 text-stone-600 dark:text-stone-400">{row.categoryName}</td>
                                                        <td className="px-3 py-2 text-stone-600 dark:text-stone-400">{row.modeName}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 pb-6 pt-2 flex justify-end gap-3 border-t border-stone-100 dark:border-stone-800">
                            <button
                                onClick={() => { setIsBulkModalOpen(false); setBulkFile(null); setBulkPreviewData(null); }}
                                className="px-5 py-2.5 rounded-full text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkUploadSubmit}
                                disabled={!bulkPreviewData || bulkPreviewData.length === 0 || bulkUploading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#882619] to-[#D4612D] text-white text-xs font-bold hover:opacity-90 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Database size={15} />
                                {bulkUploading ? 'Uploading...' : 'Upload Entries'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Master Data Manager */}
            <MasterDataManager
                isOpen={showCatPanel}
                onClose={() => setShowCatPanel(false)}
                onRefresh={() => {
                    fetchCategories(user?.companyId);
                    fetchSignatures(user?.companyId);
                    fetchPaymentModes(user?.companyId);
                    fetchVendorTypes(user?.companyId);
                }}
                allowedTabs={['cashbookCategories', 'cashbookSignatures', 'paymentModes', 'cashbookVendorTypes']}
                initialTab={masterTab}
                companyId={vendorForm.company || user?.companyId}
            />
        </div>
    );
}
