"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Download, ArrowUpFromLine, Upload, Plus, Edit3, Edit2, Trash2, X, Search, Save, Calendar, GripVertical, Database, Soup, ArrowDownToLine, Bell, Check } from 'lucide-react';
import { useFormStore } from '@/lib/store';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';
import CompanyFilter from '../../components/CompanyFilter';
import MonthYearPicker from '../../components/MonthYearPicker';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import TableColumnFilter from '../../components/TableColumnFilter';
import TableActionButton from '../../components/TableActionButton';
import Pagination from '../../components/Pagination';
import { useCompany } from '@/context/CompanyContext';
import MasterDataManager from '@/components/MasterDataManager';


const MEAL_COLORS = [
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-pink-100 text-pink-700',
];

export default function MonthlyMenuPage() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    // currentMenu.meals = { mealTypeName: "item string" }
    const [currentMenu, setCurrentMenu] = useState({ date: '', meals: {} });
    const [editingId, setEditingId] = useState(null);

    // Meal Notifications State
    const [mealNotifications, setMealNotifications] = useState({}); // { 'breakfast': { notificationDate: '', text: '' } }
    const [allNotifications, setAllNotifications] = useState([]);
    const [notifModalOpen, setNotifModalOpen] = useState(false);
    const [currentNotifType, setCurrentNotifType] = useState(null);
    const [tempNotif, setTempNotif] = useState({ notificationDate: '', text: '' });

    // Bulk Upload Modal
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkFile, setBulkFile] = useState(null);
    const [bulkDragging, setBulkDragging] = useState(false);
    const [bulkPreviewData, setBulkPreviewData] = useState(null);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    // Meal Types State
    const [mealTypes, setMealTypes] = useState([]);
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [newMealTypeName, setNewMealTypeName] = useState('');
    const [addingMealType, setAddingMealType] = useState(false);
    const [editingMealTypeId, setEditingMealTypeId] = useState(null);
    const [editMealTypeName, setEditMealTypeName] = useState('');
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();
    const [selectedIds, setSelectedIds] = useState([]);
    const [colFilters, setColFilters] = useState({});
    const [activeFilterCol, setActiveFilterCol] = useState(null);
    const [visibleCols, setVisibleCols] = useState({ date: true });
    const [isHideShowDropdownOpen, setIsHideShowDropdownOpen] = useState(false);
    const hideShowDropdownRef = React.useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();
    const companyId = selectedCompanyIds?.[0];

    const searchParams = useSearchParams();
    const urlMonth = searchParams.get('month');
    const urlDate = searchParams.get('date');

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store
    useEffect(() => {
        const persistedData = forms['monthly-menu'];
        if (urlMonth) {
            setSelectedMonth(urlMonth);
        } else if (persistedData && persistedData.selectedMonth) {
            setSelectedMonth(persistedData.selectedMonth);
        }

        if (urlDate) {
            const formatted = formatDisplayDate(urlDate);
            setColFilters({ date: [formatted] });
        } else if (persistedData && persistedData.colFilters) {
            setColFilters(persistedData.colFilters);
        }

        if (persistedData) {
            if (persistedData.searchTerm) setSearchTerm(persistedData.searchTerm);
            if (persistedData.currentMenu) setCurrentMenu(persistedData.currentMenu);
        }
        setIsHydrated(true);
    }, [urlMonth, urlDate]);

    useEffect(() => {
        if (isHydrated) {
            setFormData('monthly-menu', { searchTerm, selectedMonth, colFilters, currentMenu });
        }
    }, [searchTerm, selectedMonth, colFilters, currentMenu, isHydrated]);

    const hasActiveFilters =
        (typeof searchTerm !== 'undefined' && searchTerm !== '') ||
        (typeof colFilters !== 'undefined' && colFilters && Object.values(colFilters).some(v => v && v.length > 0));

    const clearAllFilters = () => {
        setSearchTerm('');
        setColFilters({});
        setActiveFilterCol(null);
    };


    // Expanded rows for "View More / Less"
    const [expandedRows, setExpandedRows] = useState(new Set());
    const toggleRow = (id) => setExpandedRows(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    // Super Admin
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'Super Admin') setIsSuperAdmin(true);
    }, []);

    useEffect(() => {
        const handleFilterOutsideClick = (event) => {
            if (!event.target.closest('[data-col-filter-root="true"]')) {
                setActiveFilterCol(null);
            }
            if (hideShowDropdownRef.current && !hideShowDropdownRef.current.contains(event.target)) {
                setIsHideShowDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleFilterOutsideClick);
        return () => document.removeEventListener('mousedown', handleFilterOutsideClick);
    }, []);

    // ─── Fetch Meal Types ───────────────────────────────────────────────────────
    const fetchMealTypes = async () => {
        try {
            let url = '/api/meal-types';
            if (companyId) url += `?companyId=${companyId}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setMealTypes(data);
            }
        } catch (error) {
            console.error('Failed to fetch meal types', error);
        }
    };

    useEffect(() => {
        fetchMealTypes();
    }, [companyId]);

    // ─── Add Meal Type ──────────────────────────────────────────────────────────
    const handleAddMealType = async () => {
        const trimmed = newMealTypeName.trim().toLowerCase();
        if (!trimmed) return;
        setAddingMealType(true);
        try {
            const payload = { name: trimmed };
            if (companyId) payload.companyId = companyId;
            const res = await fetch('/api/meal-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setNewMealTypeName('');
                fetchMealTypes();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to add meal type');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAddingMealType(false);
        }
    };

    // ─── Delete Meal Type ────────────────────────────────────────────────────────
    const handleDeleteMealType = async (id, name) => {
        if (!confirm(`Delete source "${name}" and ALL its menu data? This action cannot be undone and will wipe all entries for this source from the database.`)) return;
        try {
            const res = await fetch(`/api/meal-types?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchMealTypes();
                fetchMenus(); // Refresh the table to show cleared data
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ─── Edit Meal Type ──────────────────────────────────────────────────────────
    const handleEditMealType = async (id) => {
        const trimmed = editMealTypeName.trim().toLowerCase();
        if (!trimmed) {
            setEditingMealTypeId(null);
            return;
        }
        try {
            const res = await fetch('/api/meal-types', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: trimmed }),
            });
            if (res.ok) {
                setEditingMealTypeId(null);
                fetchMealTypes();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update meal type');
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ─── Fetch Menus ─────────────────────────────────────────────────────────────
    const fetchMenus = async (overrideMonth = null) => {
        setLoading(true);
        try {
            const targetMonth = overrideMonth || selectedMonth;
            let url = `/api/monthly-menu?month=${targetMonth}`;
            if (companyId) url += `&companyId=${companyId}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setMenus(data);
            }
        } catch (error) {
            console.error("Failed to fetch menus", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isHydrated) {
            fetchMenus();
            fetchAllNotifications();
        }
    }, [isHydrated, selectedMonth, companyId]);

    const fetchAllNotifications = async () => {
        try {
            let url = '/api/meal-notifications';
            if (companyId) url += `?companyId=${companyId}`;
            const res = await fetch(url);
            if (res.ok) setAllNotifications(await res.json());
        } catch (e) { console.error(e); }
    };

    // ─── Parse Date (from Excel) ─────────────────────────────────────────────────
    const parseDate = (input) => {
        if (!input) return null;
        if (typeof input === 'number') {
            const date = new Date(Math.round((input - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
        }
        let cleanInput = input.toString().trim();
        if (cleanInput.includes(',')) cleanInput = cleanInput.split(',')[0].trim();
        const ddmmyyyyRegex = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/;
        const match = cleanInput.match(ddmmyyyyRegex);
        if (match) {
            const [_, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        const parts = cleanInput.split(/[\s-]/);
        if (parts.length === 3) {
            const [day, monthStr, yearStr] = parts;
            if (isNaN(monthStr)) {
                const months = {
                    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
                };
                const normalizedMonth = monthStr.substring(0, 3).charAt(0).toUpperCase() + monthStr.substring(0, 3).slice(1).toLowerCase();
                const month = months[normalizedMonth] || months[monthStr.toUpperCase().substring(0, 3)];
                let year = yearStr;
                if (year.length === 2) year = '20' + year;
                if (month && !isNaN(day) && !isNaN(year)) {
                    return `${year}-${month}-${day.padStart(2, '0')}`;
                }
            }
        }
        const d = new Date(cleanInput);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
        return input;
    };

    // ─── Excel Upload (parse file for bulk modal) ─────────────────────────────────
    const parseBulkFile = (file) => {
        if (!file) return;
        setBulkFile(file);
        setBulkPreviewData(null);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws);
            const formattedData = data.map(row => {
                const keys = Object.keys(row);
                const getKey = (k) => keys.find(key => key.toLowerCase() === k.toLowerCase());
                const dateRaw = row[getKey('date')];
                const meals = {};
                mealTypes.forEach(mt => {
                    const val = row[getKey(mt.name)];
                    if (val !== undefined && val !== '') meals[mt.name] = val.toString();
                });
                return { date: parseDate(dateRaw), meals };
            }).filter(item => item.date);
            setBulkPreviewData(formattedData);
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
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            parseBulkFile(file);
        }
    };

    const handleBulkUploadSubmit = async () => {
        if (!bulkPreviewData || bulkPreviewData.length === 0) {
            alert('No valid data to upload.');
            return;
        }
        setBulkUploading(true);
        try {
            const dataToSend = companyId
                ? bulkPreviewData.map(item => ({ ...item, companyId }))
                : bulkPreviewData;
            const res = await fetch('/api/monthly-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            if (res.ok) {
                alert('Menu uploaded successfully!');
                fetchMenus();
                setIsBulkModalOpen(false);
                setBulkFile(null);
                setBulkPreviewData(null);
            } else {
                alert('Failed to upload menu.');
            }
        } catch (error) {
            alert('Error uploading file');
        } finally {
            setBulkUploading(false);
        }
    };

    // ─── Download Sample Excel ────────────────────────────────────────────────────
    const downloadSample = () => {
        const mealHeaders = mealTypes.map(mt =>
            mt.name.charAt(0).toUpperCase() + mt.name.slice(1)
        );
        const sampleRow = { Date: "17/02/2025" };
        mealHeaders.forEach(h => { sampleRow[h] = "Sample Item"; });
        const ws = XLSX.utils.json_to_sheet([sampleRow]);
        ws['!cols'] = [{ wch: 15 }, ...mealHeaders.map(() => ({ wch: 30 }))];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MenuTemplate");
        XLSX.writeFile(wb, "Monthly_Menu_Template.xlsx");
    };

    // ─── Download PDF ─────────────────────────────────────────────────────────────
    const downloadPDF = async () => {
        const doc = new jsPDF({ orientation: 'l' });

        let loadedHindi = false;
        let loadedGujarati = false;

        try {
            const [hindiFont, gujaratiFont] = await Promise.all([
                fetch("/fonts/NotoSansDevanagari-Regular.ttf").then(res => res.arrayBuffer()),
                fetch("/fonts/NotoSansGujarati-Regular.ttf").then(res => res.arrayBuffer()),
            ]);
            const toBinary = (buf) => Array.from(new Uint8Array(buf)).map(b => String.fromCharCode(b)).join('');

            if (hindiFont) {
                doc.addFileToVFS("NotoSansDevanagari.ttf", toBinary(hindiFont));
                doc.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
                loadedHindi = true;
            }
            if (gujaratiFont) {
                doc.addFileToVFS("NotoSansGujarati.ttf", toBinary(gujaratiFont));
                doc.addFont("NotoSansGujarati.ttf", "NotoSansGujarati", "normal");
                loadedGujarati = true;
            }
        } catch (error) {
            console.error("Error loading fonts:", error);
        }

        await addStandardHeader(doc, `Monthly Menu - ${selectedMonth}`, companyName, companyAddress, companyPhone);

        const tableColumn = ["Date", ...mealTypes.map(mt => mt.name.charAt(0).toUpperCase() + mt.name.slice(1))];
        const tableRows = filteredMenus.map(menu => [
            formatDisplayDate(menu.date),
            ...mealTypes.map(mt => (menu.meals && menu.meals[mt.name]) || '-'),
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 23,
            theme: "grid",
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 3,
                textColor: [40, 40, 40],
            },
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [60, 60, 60],
                fontStyle: 'bold',
                halign: 'center',
                font: 'helvetica',
            },
            didParseCell: (data) => {
                if (data.section === 'body') {
                    const text = String(data.cell.raw || '');
                    if (/[\u0A80-\u0AFF]/.test(text) && loadedGujarati) {
                        data.cell.styles.font = 'NotoSansGujarati';
                    } else if (/[\u0900-\u097F]/.test(text) && loadedHindi) {
                        data.cell.styles.font = 'NotoSansDevanagari';
                    } else {
                        data.cell.styles.font = 'helvetica';
                    }
                }
            }
        });
        doc.save(`Menu_${selectedMonth}.pdf`);
    };

    // ─── Save (Add / Edit) ────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!currentMenu.date) return alert("Date is required");
        if (!companyId) return alert("Please select a company first");

        try {
            const payload = {
                id: editingId,
                date: currentMenu.date,
                meals: currentMenu.meals,
                companyId: companyId
            };

            const res = await fetch('/api/monthly-menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // Save notifications
                try {
                    const notifPromises = Object.keys(mealNotifications).map(mealType => {
                        const notif = mealNotifications[mealType];
                        if (notif.notificationDate && notif.text) {
                            return fetch('/api/meal-notifications', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    date: currentMenu.date,
                                    mealType,
                                    notificationDate: notif.notificationDate,
                                    text: notif.text,
                                    companyId
                                }),
                            });
                        }
                        return Promise.resolve();
                    });
                    await Promise.all(notifPromises);
                } catch (notifError) {
                    console.error("Failed to save some notifications", notifError);
                }
                const savedMonth = currentMenu.date.slice(0, 7);
                setSelectedMonth(savedMonth);
                fetchMenus(savedMonth);
                fetchAllNotifications();
                closeModal();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to save menu");
            }
        } catch (error) {
            console.error("Save error", error);
            alert("An error occurred while saving");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this menu?")) return;
        try {
            const res = await fetch(`/api/monthly-menu?id=${id}`, { method: 'DELETE' });
            if (res.ok) setMenus(menus.filter(m => m._id !== id));
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) {
            alert("Please select at least one menu entry to delete.");
            return;
        }
        if (!confirm(`Delete ${selectedIds.length} items?`)) return;
        try {
            const res = await fetch(`/api/monthly-menu`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });
            if (res.ok) {
                setMenus(prev => prev.filter(m => !selectedIds.includes(m._id)));
                setSelectedIds([]);
            } else {
                alert("Bulk delete failed");
            }
        } catch (error) {
            console.error("Bulk delete error", error);
        }
    };

    const openModal = async (menu = null) => {
        setMealNotifications({});
        if (menu) {
            setEditingId(menu._id);
            setCurrentMenu({ date: menu.date, meals: { ...(menu.meals || {}) } });
            // Fetch notifications
            try {
                const res = await fetch(`/api/meal-notifications?date=${menu.date}&companyId=${companyId}`);
                if (res.ok) {
                    const data = await res.json();
                    const notifs = {};
                    data.forEach(n => {
                        notifs[n.mealType] = { notificationDate: n.notificationDate, text: n.text };
                    });
                    setMealNotifications(notifs);
                }
            } catch (e) { console.error(e); }
        } else {
            setEditingId(null);
            setCurrentMenu({ date: '', meals: {} });
        }
        setIsModalOpen(true);
    };

    const openNotifModal = (mealType) => {
        setCurrentNotifType(mealType);
        setTempNotif(mealNotifications[mealType] || { notificationDate: '', text: '' });
        setNotifModalOpen(true);
    };

    const saveNotif = async () => {
        setMealNotifications({ ...mealNotifications, [currentNotifType]: tempNotif });

        if (currentMenu.date && companyId && tempNotif.notificationDate && tempNotif.text) {
            try {
                const res = await fetch('/api/meal-notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: currentMenu.date,
                        mealType: currentNotifType,
                        notificationDate: tempNotif.notificationDate,
                        text: tempNotif.text,
                        companyId
                    }),
                });
                if (res.ok) {
                    fetchAllNotifications();
                }
            } catch (e) {
                console.error("Failed to save notification separately", e);
            }
        }
        setNotifModalOpen(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setCurrentMenu({ date: '', meals: {} });
    };

    const formatTableDate = (value) => {
        const dateObj = new Date(value);
        if (Number.isNaN(dateObj.getTime())) return { dateStr: value, dayStr: '' };
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        const dayStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(dateObj);
        return { dateStr, dayStr };
    };

    const formatDisplayDate = (value) => {
        const dateObj = new Date(value);
        if (Number.isNaN(dateObj.getTime())) return value;
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        const dayStr = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(dateObj);
        return `${dateStr}, ${dayStr}`;
    };

    const toggleColFilter = (col, e) => {
        e.stopPropagation();
        setActiveFilterCol(current => current === col ? null : col);
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
                const nextValues = current.filter(item => item !== val);
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


    const mealColumnOptions = useMemo(() => {
        return mealTypes.reduce((acc, mt) => {
            acc[mt.name] = [...new Set(
                menus
                    .map(menu => menu.meals?.[mt.name])
                    .filter(Boolean)
            )];
            return acc;
        }, {});
    }, [mealTypes, menus]);

    const uniqueDates = useMemo(() => (
        [...new Set(menus.map(menu => formatDisplayDate(menu.date)).filter(Boolean))]
    ), [menus]);

    const filteredMenus = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return menus.filter(menu => {

            const checkTerm = (obj, term) => {
                if (!obj) return false;
                if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
                return String(obj).toLowerCase().includes(term);
            };
            const searchMatch = !searchTerm || checkTerm(menu, term);

            if (!searchMatch) return false;

            if (colFilters.date?.length && !colFilters.date.includes(formatDisplayDate(menu.date))) {
                return false;
            }

            for (const mt of mealTypes) {
                const selected = colFilters[mt.name];
                if (selected?.length && !selected.includes(menu.meals?.[mt.name] || '')) {
                    return false;
                }
            }

            return true;
        });
    }, [colFilters, mealTypes, menus, searchTerm]);

    const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
    const paginatedMenus = filteredMenus.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const allSelected = paginatedMenus.length > 0 && selectedIds.length === paginatedMenus.length;

    if (permsLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading Monthly Menu...</p>
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
                        You don&apos;t have permission to view Monthly Menu. Please contact your administrator for access.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/10"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6" style={{ fontFamily: 'ITCAvantGardeStd' }}>
            <div className="bg-card max-w-[1400px] rounded-lg shadow-2xl overflow-hidden mx-auto">

                {/* 1. Top Right Bar (Checkmark, Columns Hide/Unhide, Source) */}
                <div className="flex justify-end items-center gap-4 px-2 py-2 mb-2 relative">
                    {/* Checkmark */}
                    <div className="flex items-center gap-1.5 mr-1">
                        <span className="text-[#15803D] font-black text-base select-none" title="All entries correct">
                            <Check size={18} className="text-emerald-600 font-bold" strokeWidth={3} />
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
                                        <label className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer text-xs font-bold text-slate-700 dark:text-zinc-200">
                                            <input
                                                type="checkbox"
                                                checked={visibleCols['date'] !== false}
                                                onChange={() => setVisibleCols(prev => ({ ...prev, date: !prev.date }))}
                                                className="rounded border-slate-300 text-[#882619] focus:ring-[#882619] w-4 h-4"
                                            />
                                            <span>Date</span>
                                        </label>
                                        {mealTypes.map(mt => (
                                            <label key={mt._id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 cursor-pointer text-xs font-bold text-slate-700 dark:text-zinc-200">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleCols[mt.name] !== false}
                                                    onChange={() => setVisibleCols(prev => ({ ...prev, [mt.name]: !prev[mt.name] }))}
                                                    className="rounded border-slate-300 text-[#882619] focus:ring-[#882619] w-4 h-4"
                                                />
                                                <span>{mt.name.charAt(0).toUpperCase() + mt.name.slice(1)}</span>
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
                            type="button"
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
                    {/* Left: Monthly MENU & Subtitle */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-baseline gap-2">
                            <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">Monthly</span>{' '}
                            <span className="text-[#3A3A3A] dark:text-zinc-200">MENU</span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 italic mt-0.5 font-medium">
                            Plan daily meals (English / हिंदी / ગુજરાતી supported)
                        </p>
                    </div>

                    {/* Right: Quick Search, Select Month & Action Buttons */}
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
                                    className="w-full bg-transparent text-sm font-normal text-slate-800 dark:text-zinc-100 outline-none placeholder:text-[#D6D6D6]"
                                />
                            </div>
                        </div>

                        {/* Select Month */}
                        <div className="relative">
                            <MonthYearPicker
                                value={selectedMonth}
                                onChange={(val) => setSelectedMonth(val)}
                                placeholder="Select Month"
                                variant="pillGradient"
                            />
                        </div>

                        {/* Clear Filters (if active) */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-emerald-600 transition-all cursor-pointer bg-transparent border-0 outline-none"
                                title="Clear Filters"
                            >
                                <X size={18} strokeWidth={2.5} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Clear</span>
                            </button>
                        )}

                        {/* Action Buttons: Add, Bulk, Divider, Delete, Download */}
                        <div className="flex items-center gap-4">
                            {/* Add Button */}
                            {!isReadOnly && (
                                <PermissionWrapper action="write">
                                    <button
                                        type="button"
                                        onClick={() => openModal()}
                                        className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none mb-2"
                                    >
                                        <img src="/icons/action/Add.svg" className="w-8 h-8 block dark:hidden" alt="Add" />
                                        <img src="/icons/action/AddDark.svg" className="w-8 h-8 hidden dark:block" alt="Add" />
                                        <span className="text-[10px] font-bold text-[#882619] dark:text-[#D4612D] leading-none">Add</span>
                                    </button>
                                </PermissionWrapper>
                            )}

                            {/* Bulk Upload Button */}
                            {!isReadOnly && (
                                <PermissionWrapper action="write">
                                    <button
                                        type="button"
                                        onClick={() => { setIsBulkModalOpen(true); setBulkFile(null); setBulkPreviewData(null); }}
                                        className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                        <img src="/icons/action/Bulkupload.svg" className="h-8 w-auto" alt="Bulk Upload" />
                                    </button>
                                </PermissionWrapper>
                            )}

                            {/* Vertical Line Divider */}
                            <div className="w-[1px] h-8 bg-slate-300 dark:bg-zinc-600 mx-0.5 self-center"></div>

                            {/* Delete Button */}
                            {!isReadOnly && (
                                <PermissionWrapper action="delete">
                                    <button
                                        type="button"
                                        onClick={handleBulkDelete}
                                        className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none"
                                        title="Delete selected items"
                                    >
                                        <img src="/icons/action/Delete.svg" className="h-8 w-8" alt="Delete" />
                                    </button>
                                </PermissionWrapper>
                            )}

                            {/* Download Button */}
                            <PermissionWrapper action="read">
                                <button
                                    type="button"
                                    onClick={downloadPDF}
                                    className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none"
                                >
                                    <img src="/icons/action/Download.svg" className="h-8 w-8 block dark:hidden" alt="Download" />
                                    <img src="/icons/action/DownloadDark.svg" className="h-8 w-8 hidden dark:block" alt="Download" />
                                </button>
                            </PermissionWrapper>
                        </div>
                    </div>
                </div>

                {isMasterModalOpen && (
                    <MasterDataManager
                        isOpen={isMasterModalOpen}
                        onClose={() => {
                            setIsMasterModalOpen(false);
                            fetchMealTypes();
                        }}
                        allowedTabs={['mealTypes']}
                    />
                )}

                {/* ── Table Container ─────────────────────────────────────────────────────────── */}
                <div className="mt-5 bg-card overflow-hidden mb-6 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-collapse text-left">
                            <thead>
                                <tr className="bg-white dark:bg-[#252525] border-b-4 border-double border-b-[#000000] dark:border-b-[#A4A4A4] text-[#3A3A3A] dark:text-zinc-200 font-bold capitalize tracking-normal text-xs md:text-sm">
                                    <th className="py-3.5 px-3.5 w-12 text-center border-r border-[#A4A4A4] dark:border-zinc-700 border-b-4 border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => setSelectedIds(allSelected ? [] : paginatedMenus.map(menu => menu._id))}
                                            className="w-4 h-4 rounded border-slate-300 text-[#882619] focus:ring-[#882619]"
                                        />
                                    </th>
                                    {visibleCols['date'] !== false && (
                                        <th className="py-3.5 px-4 whitespace-nowrap text-left relative border-r border-[#A4A4A4] dark:border-zinc-700 border-b-4 border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                            <TableColumnFilter
                                                colKey="date"
                                                title="Date"
                                                options={uniqueDates}
                                                showOptionIcon
                                                iconSrc="/icons/action/Fillter.svg"
                                                colFilters={colFilters}
                                                activeFilterCol={activeFilterCol}
                                                onToggle={toggleColFilter}
                                                onChange={handleColFilterChange}
                                            />
                                        </th>
                                    )}
                                    {mealTypes.map((mt) => (
                                        visibleCols[mt.name] !== false && (
                                            <th key={mt._id} className="py-3.5 px-4 whitespace-nowrap text-left relative border-r border-[#A4A4A4] dark:border-zinc-700 border-b-4 border-double border-b-[#000000] dark:border-b-[#A4A4A4]">
                                                <TableColumnFilter
                                                    colKey={mt.name}
                                                    title={mt.name.charAt(0).toUpperCase() + mt.name.slice(1)}
                                                    options={mealColumnOptions[mt.name] || []}
                                                    showOptionIcon
                                                    iconSrc="/icons/action/Fillter.svg"
                                                    colFilters={colFilters}
                                                    activeFilterCol={activeFilterCol}
                                                    onToggle={toggleColFilter}
                                                    onChange={handleColFilterChange}
                                                />
                                            </th>
                                        )
                                    ))}
                                    {mealTypes.length === 0 && (
                                        <th className="py-3.5 px-4 border-r border-[#A4A4A4] dark:border-zinc-700 border-b-4 border-double border-b-[#000000] dark:border-b-[#A4A4A4] text-slate-600 italic">
                                            No source added yet
                                        </th>
                                    )}
                                    <th className="px-4 py-3.5 text-[#3A3A3A] dark:text-zinc-200 font-bold capitalize tracking-normal text-xs md:text-sm whitespace-nowrap text-center border-b-4 border-double border-b-[#000000] dark:border-b-[#A4A4A4]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#000000] dark:divide-zinc-700">
                                {loading ? (
                                    <tr><td colSpan={mealTypes.length + 3} className="py-14 text-center text-muted-foreground font-medium">Loading menus...</td></tr>
                                ) : paginatedMenus.length === 0 ? (
                                    <tr><td colSpan={mealTypes.length + 3} className="py-14 text-center text-muted-foreground font-medium">No monthly menu entries found.</td></tr>
                                ) : paginatedMenus.map((menu) => {
                                    const { dateStr, dayStr } = formatTableDate(menu.date);
                                    return (
                                        <tr key={menu._id} className="border-b border-[#000000] dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            {/* Checkbox Cell */}
                                            <td className="py-3.5 px-3.5 text-center align-top border-r border-[#A4A4A4] dark:border-zinc-700">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(menu._id)}
                                                    onChange={() => setSelectedIds(prev => prev.includes(menu._id) ? prev.filter(id => id !== menu._id) : [...prev, menu._id])}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#882619] focus:ring-[#882619]"
                                                />
                                            </td>

                                            {/* Date Cell */}
                                            {visibleCols['date'] !== false && (
                                                <td className="py-3.5 px-4 whitespace-nowrap align-top border-r border-[#A4A4A4] dark:border-zinc-700">
                                                    <div className="flex flex-col">
                                                        <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-bold text-xs md:text-sm whitespace-nowrap">{dateStr}</span>
                                                        <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-bold text-xs whitespace-nowrap">{dayStr}</span>
                                                    </div>
                                                </td>
                                            )}

                                            {/* Meal Cells */}
                                            {mealTypes.map((mt) => {
                                                if (visibleCols[mt.name] === false) return null;
                                                const meals = menu.meals || {};
                                                // ── Smart Mapping Logic ──
                                                let val = meals[mt.name]; // Try exact match first

                                                if (!val) {
                                                    const colName = mt.name.trim().toLowerCase();

                                                    // Map of common variations and synonyms
                                                    const variations = {
                                                        'breakfast': ['breakfast', 'brackfast', 'breackfast', 'breckfast', 'brekfast', 'brakfast'],
                                                        'brackfast': ['breakfast', 'brackfast', 'breackfast', 'breckfast', 'brekfast', 'brakfast'],
                                                        'lunch': ['lunch', 'lunck', 'lunc'],
                                                        'dinner': ['dinner', 'night', 'diner', 'evning', 'evening', 'dinare'],
                                                        'night': ['night', 'dinner', 'diner', 'evning', 'evening', 'dinare'],
                                                        'snack': ['snack', 'snak', 'sweet', 'sweets', 'refreshment'],
                                                        'sweet': ['sweet', 'sweets', 'snack', 'snak', 'dessert']
                                                    };

                                                    // Find if any key in data matches the current column or its synonyms
                                                    const synonyms = variations[colName] || [colName];
                                                    const foundKey = Object.keys(meals).find(k => {
                                                        const cleanKey = k.trim().toLowerCase();
                                                        return synonyms.includes(cleanKey) || cleanKey === colName;
                                                    });

                                                    if (foundKey) val = meals[foundKey];
                                                }

                                                if (!val) {
                                                    // Final fallback: simple case-insensitive check
                                                    const key = Object.keys(meals).find(k => k.trim().toLowerCase() === mt.name.trim().toLowerCase());
                                                    if (key) val = meals[key];
                                                }

                                                const notif = allNotifications.find(n => n.date === menu.date && n.mealType === mt.name);
                                                return (
                                                    <td key={mt._id} className="py-3.5 px-4 text-foreground text-xs md:text-sm font-semibold align-top border-r border-[#A4A4A4] dark:border-zinc-700">
                                                        {notif && (
                                                            <div className="mb-2 text-[10px] font-bold text-orange-600 bg-orange-50/50 px-2 py-1 rounded-lg border border-orange-100 flex items-start gap-2 max-w-[210px]">
                                                                <Bell size={10} className="shrink-0 text-orange-400 mt-1" />
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="whitespace-nowrap opacity-70 text-[9px]">{notif.notificationDate}</span>
                                                                    <span className="break-words leading-normal">{notif.text}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {val ? (
                                                            <div className="max-w-[220px]">
                                                                <span className="block whitespace-pre-wrap break-words leading-relaxed py-0.5 indic-text font-bold text-slate-800 dark:text-zinc-200">
                                                                    {val}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 font-normal">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            {mealTypes.length === 0 && <td className="py-3.5 px-4 border-r border-[#A4A4A4] dark:border-zinc-700" />}

                                            {/* Action Cell */}
                                            <td className="py-3.5 px-4 align-top text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <PermissionWrapper action="edit">
                                                        <button
                                                            type="button"
                                                            // onClick={() => openModal(menu)}
                                                            className="hover:scale-110 transition-transform bg-transparent border-0 outline-none cursor-pointer p-0.5"
                                                            title="Image / Details"
                                                        >
                                                            <img src="/icons/action/Image.svg" className="w-5 h-5" alt="Image" />
                                                        </button>
                                                    </PermissionWrapper>
                                                    <PermissionWrapper action="edit">
                                                        <button
                                                            type="button"
                                                            onClick={() => openModal(menu)}
                                                            className="hover:scale-110 transition-transform bg-transparent border-0 outline-none cursor-pointer p-0.5"
                                                            title="Edit"
                                                        >
                                                            <img src="/icons/action/Edit.svg" className="w-5 h-5" alt="Edit" />
                                                        </button>
                                                    </PermissionWrapper>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredMenus.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </div>

            {/* ── Modal ──────────────────────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-background/60 backdrop-blur-md" onClick={closeModal}></div>
                    <div className="relative w-full max-w-[620px] bg-card rounded-[1.75rem] border border-border shadow-[0_20px_60px_rgba(15,23,42,0.12)] overflow-hidden">
                        <div className="px-7 pt-6 pb-4 bg-muted/20 border-b border-border">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-[2rem] leading-none font-light text-foreground">
                                        {editingId ? "Edit Menu" : "Add New Menu"}
                                    </h2>
                                    <p className="text-[11px] text-muted-foreground mt-1">Plan daily meals (English / Hindi / Gujarati supported)</p>
                                </div>
                                <button onClick={closeModal} className="mt-1 p-2 text-muted-foreground hover:text-muted-foreground rounded-full hover:bg-muted transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="px-7 py-5 max-h-[75vh] overflow-y-auto">
                            <div className="mb-5">
                                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 ml-1">
                                    Date : <span className="text-red-500">*</span>
                                </label>
                                <div className="gradient-pill-input flex items-center px-4 py-2 shadow-sm relative">
                                    <input
                                        type="date"
                                        required
                                        value={currentMenu.date}
                                        onChange={(e) => setCurrentMenu({ ...currentMenu, date: e.target.value })}
                                        className="w-full bg-transparent text-slate-800 dark:text-zinc-100 text-sm font-semibold outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    />
                                    <Calendar size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#D4612D]" />
                                </div>
                            </div>

                            {mealTypes.length === 0 && (
                                <p className="text-sm text-muted-foreground italic text-center py-4">
                                    No source defined. Open Source first and add one before saving a menu.
                                </p>
                            )}

                            <div className="space-y-4">
                                {mealTypes.map((mt, idx) => (
                                    <div key={mt._id}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                                                {mt.name.charAt(0).toUpperCase() + mt.name.slice(1)} :
                                            </label>
                                            <button
                                                onClick={() => openNotifModal(mt.name)}
                                                className={`p-1 rounded-full transition-colors ${mealNotifications[mt.name]?.text ? 'text-[#D4612D] bg-[#D4612D]/10' : 'text-muted-foreground hover:bg-muted'}`}
                                            >
                                                <Bell size={14} />
                                            </button>
                                        </div>
                                        {mealNotifications[mt.name]?.text && (
                                            <div className="mb-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                                                <p className="text-[10px] font-bold text-primary flex items-center gap-2">
                                                    <span className="opacity-70">{mealNotifications[mt.name].notificationDate}</span>
                                                    <span className="w-1 h-1 rounded-full bg-primary/30" />
                                                    <span className="truncate">{mealNotifications[mt.name].text}</span>
                                                </p>
                                            </div>
                                        )}
                                        <div className="gradient-pill-input flex items-center px-4 py-2 shadow-sm">
                                            <input
                                                type="text"
                                                value={currentMenu.meals[mt.name] || ''}
                                                onChange={(e) => setCurrentMenu({
                                                    ...currentMenu,
                                                    meals: { ...currentMenu.meals, [mt.name]: e.target.value }
                                                })}
                                                placeholder={`Enter ${mt.name} items...`}
                                                className="w-full bg-transparent text-slate-800 dark:text-zinc-100 text-sm font-semibold outline-none placeholder:text-[#C2C2C2] indic-text"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-7 pb-6 pt-2 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-6 py-2.5 rounded-full text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                                Cancel
                            </button>
                            <PermissionWrapper action={editingId ? "edit" : "write"}>
                                <button onClick={handleSave} className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#882619] to-[#D4612D] text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md cursor-pointer">
                                    <Save size={15} /> Save Menu
                                </button>
                            </PermissionWrapper>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Bulk Upload Modal ───────────────────────────────────────────── */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsBulkModalOpen(false); setBulkFile(null); setBulkPreviewData(null); }} />
                    <div className="relative w-full max-w-[600px] bg-card rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Upload size={16} className="text-emerald-600" />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Bulk Upload</h2>
                            </div>
                            <button
                                onClick={() => { setIsBulkModalOpen(false); setBulkFile(null); setBulkPreviewData(null); }}
                                className="p-2 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    <span className="text-xs font-black text-blue-700 uppercase tracking-wider">Instructions</span>
                                </div>
                                <ul className="space-y-1">
                                    {['Download the sample template first.', 'Do not change column headers.', 'Date format should be DD/MM/YYYY.', 'Ensure meal items are correctly filled before uploading.'].map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Download Sample Template */}
                            <button
                                onClick={downloadSample}
                                className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full border border-border bg-card text-sm font-semibold text-muted-foreground hover:bg-muted hover:border-border transition-all shadow-sm"
                            >
                                <Download size={15} />
                                Download Sample Template
                            </button>

                            {/* Drop Zone */}
                            <label
                                className={`flex flex-col items-center justify-center gap-3 w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all py-10 ${bulkDragging
                                    ? 'border-emerald-400 bg-emerald-50'
                                    : bulkFile
                                        ? 'border-emerald-300 bg-emerald-50/50'
                                        : 'border-border bg-muted hover:border-emerald-300 hover:bg-emerald-50/30'
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setBulkDragging(true); }}
                                onDragLeave={() => setBulkDragging(false)}
                                onDrop={handleBulkDrop}
                            >
                                <input type="file" hidden accept=".xlsx,.xls" onChange={handleBulkFileInput} />
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${bulkFile ? 'bg-emerald-100' : 'bg-emerald-50'
                                    }`}>
                                    <Upload size={24} className={bulkFile ? 'text-emerald-600' : 'text-emerald-400'} />
                                </div>
                                {bulkFile ? (
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-emerald-700">{bulkFile.name}</p>
                                        <p className="text-xs text-emerald-500 mt-0.5">
                                            {bulkPreviewData ? `${bulkPreviewData.length} valid rows found` : 'Parsing...'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-muted-foreground">Click to select Excel file</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">.xlsx or .xls files only</p>
                                    </div>
                                )}
                            </label>

                            {/* Preview Table (shown after file is parsed) */}
                            {bulkPreviewData && bulkPreviewData.length > 0 && (
                                <div className="rounded-xl border border-border overflow-hidden">
                                    <div className="bg-muted px-4 py-2 border-b border-border">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preview — {bulkPreviewData.length} rows</p>
                                    </div>
                                    <div className="overflow-x-auto overflow-y-auto max-h-96">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-bold text-muted-foreground whitespace-nowrap bg-muted">#</th>
                                                    <th className="px-3 py-2 text-left font-bold text-muted-foreground whitespace-nowrap bg-muted">Date</th>
                                                    {mealTypes.map(mt => (
                                                        <th key={mt._id} className="px-3 py-2 text-left font-bold text-muted-foreground whitespace-nowrap capitalize bg-muted">{mt.name}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {bulkPreviewData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted">
                                                        <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                                                        <td className="px-3 py-2 text-[#f5821f] font-semibold whitespace-nowrap">{row.date}</td>
                                                        {mealTypes.map(mt => (
                                                            <td key={mt._id} className="px-3 py-2 text-foreground max-w-[120px] truncate">{row.meals?.[mt.name] || <span className="text-slate-600">-</span>}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-5 pt-2 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsBulkModalOpen(false); setBulkFile(null); setBulkPreviewData(null); }}
                                className="px-5 py-2.5 rounded-full text-sm font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkUploadSubmit}
                                disabled={!bulkPreviewData || bulkPreviewData.length === 0 || bulkUploading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled: disabled:cursor-not-allowed shadow-md"
                            >
                                <Database size={15} />
                                {bulkUploading ? 'Uploading...' : 'Upload Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Notification Modal ───────────────────────────────────────────── */}
            {notifModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-background/40 backdrop-blur-sm" onClick={() => setNotifModalOpen(false)}></div>
                    <div className="relative w-full max-w-[400px] bg-card rounded-2xl border border-border shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                                {currentNotifType} Notification
                            </h3>
                            <button onClick={() => setNotifModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Notification Date</label>
                                <input
                                    type="date"
                                    value={tempNotif.notificationDate}
                                    onChange={(e) => setTempNotif({ ...tempNotif, notificationDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl outline-none focus:border-primary text-sm font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 ml-1">Message</label>
                                <textarea
                                    value={tempNotif.text}
                                    onChange={(e) => setTempNotif({ ...tempNotif, text: e.target.value })}
                                    placeholder="Enter notification message..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl outline-none focus:border-primary text-sm font-medium resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setNotifModalOpen(false)} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors">
                                Cancel
                            </button>
                            <button onClick={saveNotif} className="flex-1 py-3 rounded-xl bg-[#ff8b2b] text-white text-xs font-black uppercase tracking-widest hover:bg-[#ea7814] transition-colors shadow-lg shadow-orange-500/20">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

