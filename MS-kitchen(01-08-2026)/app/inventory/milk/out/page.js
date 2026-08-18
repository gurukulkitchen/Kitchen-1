"use client";
import { createPortal } from 'react-dom';
import CustomSelect from '../../../../components/CustomSelect';
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../../components/Toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCompany } from '../../../../context/CompanyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStockPDF } from '@/lib/pdfGenerator';
import { formatIndianNumber } from '../../../../lib/formatters';

import {
    PlusCircle,
    ChevronDown,
    Check,
    X,
    Search,
    History,
    Download,
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowUpRight,
    Eye,
    Edit3,
    Save,
    Trash2,
    Settings,
    UploadCloud,
    Database,
    ArrowUpToLine,
    Building2,
    Calendar
} from 'lucide-react';

import Pagination from '../../../../components/Pagination';
import CompanyFilter from '../../../../components/CompanyFilter';
import BulkUploadModal from '../../../../components/BulkUploadModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import usePermissions from '../../../../hooks/usePermissions';
import PermissionWrapper from '../../../../components/PermissionWrapper';
import MasterDataManager from '../../../../components/MasterDataManager';
import TableActionButton from '../../../../components/TableActionButton';
import TableColumnFilter from '../../../../components/TableColumnFilter';
import FilterDropdown from '../../../../components/FilterDropdown';
import SearchableSelect from '../../../../components/SearchableSelect';
import { useFormStore } from '../../../../lib/store';
import DateTimePicker from '../../../../components/DateTimePicker';

export default function MilkStockOutPage() {
    const { showToast } = useToast();
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState([]);
    const [items, setItems] = useState([]);
    const [batches, setBatches] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [filterIssue, setFilterIssue] = useState('all');
    const [colFilters, setColFilters] = useState({});
    const [activeFilterCol, setActiveFilterCol] = useState(null);

    const [filterItem, setFilterItem] = useState('');
    const [filterVendor, setFilterVendor] = useState('');
    const [filterQty, setFilterQty] = useState('');
    const [filterTotal, setFilterTotal] = useState('');

    const hasActiveFilters =
        (typeof searchTerm !== 'undefined' && searchTerm !== '') ||
        (typeof filterCategory !== 'undefined' && filterCategory.length > 0) ||
        (typeof filterType !== 'undefined' && filterType !== '') ||
        (typeof filterItem !== 'undefined' && filterItem !== '') ||
        (typeof filterVendor !== 'undefined' && filterVendor !== '') ||
        (typeof filterQty !== 'undefined' && filterQty !== '') ||
        (typeof filterTotal !== 'undefined' && filterTotal !== '') ||
        (typeof colFilters !== 'undefined' && colFilters && Object.values(colFilters).some(v => v && v.length > 0)) || (typeof filterIssue !== 'undefined' && filterIssue !== 'all');

    const clearAllFilters = () => {
        if (typeof setSearchTerm === 'function') setSearchTerm('');
        if (typeof setFilterCategory === 'function') setFilterCategory([]);
        if (typeof setFilterType === 'function') setFilterType('');
        if (typeof setFilterItem === 'function') setFilterItem('');
        if (typeof setFilterVendor === 'function') setFilterVendor('');
        if (typeof setFilterQty === 'function') setFilterQty('');
        if (typeof setFilterTotal === 'function') setFilterTotal('');
        if (typeof setColFilters === 'function') setColFilters({});
        if (typeof setActiveFilterCol === 'function') setActiveFilterCol(null);
        if (typeof setFilterIssue === 'function') setFilterIssue('all');
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
    const toggleColFilter = (col, e) => { e.stopPropagation(); setActiveFilterCol(activeFilterCol === col ? null : col); };

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [isEntrySectionOpen, setIsEntrySectionOpen] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isHideShowDropdownOpen, setIsHideShowDropdownOpen] = useState(false);
    const hideShowDropdownRef = useRef(null);

    const [visibleEntryCols, setVisibleEntryCols] = useState({
        product: true,
        rate: true,
        stock: true,
        qty: true,
        total: true,
        narration: true
    });

    const [visibleHistoryCols, setVisibleHistoryCols] = useState({
        date: true,
        toEvent: true,
        product: true,
        rate: true,
        stock: true,
        qty: true,
        total: true,
        narration: true
    });

    const downloadRef = useRef(null);
    const editingRef = useRef(null);
    const handleUpdateSingleRef = useRef();
    const editingIdRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (hideShowDropdownRef.current && !hideShowDropdownRef.current.contains(event.target)) {
                setIsHideShowDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        handleUpdateSingleRef.current = handleUpdateSingle;
        editingIdRef.current = editingId;
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (downloadRef.current && !downloadRef.current.contains(event.target)) {
                setIsDownloadOpen(false);
            }
            if (editingIdRef.current && editingRef.current && !editingRef.current.contains(event.target)) {
                // Don't save if clicking on a dropdown menu or portal content
                if (event.target.closest('[data-searchselect-id]') ||
                    event.target.closest('[data-col-filter-root="true"]') ||
                    event.target.closest('.rate-dropdown-portal') ||
                    event.target.closest('[data-datetime-picker]') ||
                    event.target.closest('.dropdown-menu') ||
                    event.target.closest('[role="dialog"]')) {
                    return;
                }

                // Check if the click is on a scrollbar
                const target = event.target;
                const rect = target.getBoundingClientRect();
                const isScrollbarClick =
                    (target.offsetWidth > target.clientWidth && event.clientX > rect.left + target.clientWidth) ||
                    (target.offsetHeight > target.clientHeight && event.clientY > rect.top + target.clientHeight);

                if (isScrollbarClick) return;

                setTimeout(() => handleUpdateSingleRef.current?.(), 0);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleFilterOutsideClick = (event) => {
            if (!event.target.closest('[data-col-filter-root="true"]')) {
                setActiveFilterCol(null);
            }
        };
        document.addEventListener('mousedown', handleFilterOutsideClick);
        return () => document.removeEventListener('mousedown', handleFilterOutsideClick);
    }, []);

    const [departments, setDepartments] = useState([]);
    const [events, setEvents] = useState([]);
    const [isMasterManagerOpen, setIsMasterManagerOpen] = useState(false);

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, '0');
        return `${day}-${month}-${year} | ${formattedHours}:${minutes} ${ampm}`;
    };

    // Master Form: Date, To, Event
    const [masterForm, setMasterForm] = useState({
        department: 'All',
        event: 'Regular',
        narration: '',
        date: (() => {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            return new Date(now.getTime() - offset).toISOString().slice(0, 16);
        })()
    });

    const [itemsList, setItemsList] = useState([{
        tempId: Date.now(),
        item: '',
        category: '',
        quantity: '',
        rate: '',
        grandTotal: '',
        narration: '',
        batchId: '',
        availableBatches: []
    }]);

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store
    useEffect(() => {
        const persistedData = forms['milk-out'];
        if (persistedData) {
            if (persistedData.masterForm) setMasterForm(persistedData.masterForm);
            if (persistedData.itemsList) setItemsList(persistedData.itemsList);
            if (persistedData.searchTerm) setSearchTerm(persistedData.searchTerm);
            if (persistedData.filterCategory) setFilterCategory(persistedData.filterCategory);
            if (persistedData.colFilters) setColFilters(persistedData.colFilters);
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setFormData('milk-out', { masterForm, itemsList, searchTerm, filterCategory, colFilters });
        }
    }, [masterForm, itemsList, searchTerm, filterCategory, colFilters, isHydrated]);

    const [currentItem, setCurrentItem] = useState({
        item: '',
        category: '',
        quantity: '',
        rate: '',
        grandTotal: '',
        narration: '',
        batchId: '',
        availableBatches: []
    });

    const fetchTransactions = React.useCallback(async () => {
        try {
            const companyId = isReadOnly ? (searchParams.get('companyId') || undefined) : selectedCompanyIds[0];
            const query = companyId ? `&companyId=${companyId}` : '';
            const res = await fetch(`/api/kitchen/transactions?type=OUT&section=dairy${query}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setTransactions(data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }, [isReadOnly, searchParams, selectedCompanyIds]);

    const loadDepartments = React.useCallback(() => {
        fetch('/api/departments')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDepartments(data);
            })
            .catch(err => console.error('Error fetching departments:', err));
    }, []);

    const loadEvents = React.useCallback(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setEvents(data);
            })
            .catch(err => console.error('Error fetching events:', err));
    }, []);

    useEffect(() => {
        const companyId = searchParams.get('companyId');
        const query = companyId ? `?companyId=${companyId}` : '';

        fetch(`/api/kitchen/items?section=dairy${query.replace('?', '&')}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
                else setItems([]);
            })
            .catch(err => console.error('Error fetching items:', err));

        loadDepartments();
        loadEvents();
        fetchTransactions();
    }, [fetchTransactions, loadDepartments, loadEvents, searchParams]);

    // Reset pagination
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, filterType, searchParams]);

    const handleEdit = async (tx) => {
        if (editingId && editingId !== tx._id) {
            await handleUpdateSingle();
        }
        setEditingId(tx._id);
        const selectedItem = items.find(i => i._id === (tx.item?._id || tx.item));
        setMasterForm({
            department: tx.department || 'All',
            event: tx.event || 'Regular',
            narration: tx.narration || '',
            date: tx.date ? (() => {
                const d = new Date(tx.date);
                const offset = d.getTimezoneOffset() * 60000;
                return new Date(d.getTime() - offset).toISOString().slice(0, 16);
            })() : masterForm.date
        });
        const batchesData = await fetchBatches(tx.item?._id || tx.item);

        setCurrentItem({
            item: tx.item?._id || '',
            category: tx.item?.category || (selectedItem ? selectedItem.category : ''),
            quantity: tx.quantity,
            rate: tx.rate,
            grandTotal: tx.totalAmount,
            narration: tx.narration || '',
            batchId: tx.batchId?._id || tx.batchId || '',
            availableBatches: batchesData || []
        });
    };

    const handleUpdateSingle = async () => {
        if (!editingId) return;
        try {
            const body = {
                id: editingId,
                type: 'OUT',
                ...masterForm,
                ...currentItem,
                totalAmount: Number(currentItem.grandTotal)
            };
            const res = await fetch('/api/kitchen/transactions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                showToast('Stock Updated Successfully', 'success');
                fetchTransactions();
                setEditingId(null);
            } else {
                showToast('Failed to update stock', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBatches = async (itemId) => {
        if (!itemId) {
            setBatches([]);
            return [];
        }
        try {
            const res = await fetch(`/api/kitchen/batches?itemId=${itemId}`);
            const data = await res.json();
            setBatches(data);
            return data;
        } catch (error) {
            console.error("Error fetching batches", error);
            return [];
        }
    };

    const handleMasterChange = (e) => {
        const { name, value } = e.target;
        setMasterForm(prev => ({ ...prev, [name]: value }));
    };

    const handleRowChange = async (tempId, field, value) => {
        if (field === 'item') {
            const selectedItem = items.find(i => i._id === value);
            let firstBatchId = '';
            let rate = 0;

            const batchesData = await fetchBatches(value);
            if (batchesData && batchesData.length > 0) {
                firstBatchId = batchesData[0]._id;
                rate = batchesData[0].rate || 0;
            } else if (selectedItem?.mrp) {
                rate = selectedItem.mrp;
            }

            setItemsList(prev => prev.map(item => {
                if (item.tempId !== tempId) return item;
                return {
                    ...item,
                    item: value,
                    category: selectedItem ? selectedItem.category : '',
                    itemName: selectedItem?.name || '',
                    itemUnit: selectedItem?.unit?.name || selectedItem?.unit || '',
                    currentStock: selectedItem?.currentStock || 0,
                    batchId: firstBatchId,
                    availableBatches: batchesData || [],
                    rate: rate.toString(),
                    quantity: '',
                    grandTotal: '',
                    narration: ''
                };
            }));
            return;
        }

        setItemsList(prev => prev.map(item => {
            if (item.tempId !== tempId) return item;

            let finalVal = value;
            if (field === 'quantity' && finalVal !== '') {
                let num = Number(finalVal);
                if (num < 1) num = 1;
                const selectedObj = items.find(i => i._id === item.item);
                const maxStock = item.batchId
                    ? (item.availableBatches?.find(b => b._id === item.batchId)?.remainingQuantity ?? selectedObj?.currentStock ?? 0)
                    : (item.availableBatches?.length > 0
                        ? item.availableBatches.reduce((acc, b) => acc + (b.remainingQuantity || 0), 0)
                        : (selectedObj?.currentStock ?? 0));
                if (maxStock > 0 && num > maxStock) {
                    num = maxStock;
                }
                finalVal = num.toString();
            }

            const updated = { ...item, [field]: finalVal };

            if (field === 'quantity' || field === 'rate') {
                const q = Number(updated.quantity) || 0;
                const r = Number(updated.rate) || 0;
                updated.grandTotal = (q * r).toFixed(2);
            }

            return updated;
        }));
    };

    const handleAddItem = (e) => {
        if (e) e.preventDefault();
        setItemsList(prev => [...prev, {
            tempId: Date.now(),
            item: '',
            category: '',
            quantity: '',
            rate: '',
            grandTotal: '',
            narration: '',
            batchId: '',
            availableBatches: []
        }]);
    };

    const handleRemoveItem = (tempId) => {
        setItemsList(prev => prev.filter(i => i.tempId !== tempId));
    };

    const handleSubmit = async () => {
        let finalItems = itemsList.filter(i => i.item && i.quantity);

        if (finalItems.length === 0) {
            showToast("Please add at least one complete item (Product and Qty required).", 'warning');
            return;
        }

        try {
            for (const item of finalItems) {
                const targetCompanyId = isReadOnly ? (searchParams.get('companyId') || undefined) : selectedCompanyIds[0];
                const selectedItemObj = items.find(i => i._id === item.item);
                const body = {
                    type: 'OUT',
                    department: masterForm.department,
                    event: masterForm.event,
                    date: masterForm.date,
                    narration: masterForm.narration,
                    item: item.item,
                    category: item.category,
                    quantity: item.quantity,
                    rate: item.rate,
                    totalAmount: item.grandTotal,
                    narration: item.narration || '',
                    batchId: item.batchId,
                    companyId: targetCompanyId
                };

                const res = await fetch('/api/kitchen/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `Failed to save item: ${selectedItemObj?.name || ''}`);
                }
            }

            showToast('Stock Reduced Successfully', 'success');
            fetchTransactions();
            setItemsList([{
                tempId: Date.now(),
                item: '',
                category: '',
                quantity: '',
                rate: '',
                grandTotal: '',
                narration: '',
                batchId: ''
            }]);

            const { clearFormData } = useFormStore.getState();
            clearFormData('milk-out');

        } catch (error) {
            console.error(error);
            showToast("Error: " + error.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            const res = await fetch(`/api/kitchen/transactions?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Transaction deleted', 'success');
                setSelectedIds(prev => prev.filter(item => item !== id));
                fetchTransactions();
            } else {
                showToast('Failed to delete', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedTransactions.map(t => t._id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} select transactions?`)) return;

        try {
            for (const id of selectedIds) {
                await fetch(`/api/kitchen/transactions?id=${id}`, { method: 'DELETE' });
            }
            setSelectedIds([]);
            fetchTransactions();
        } catch (error) {
            console.error(error);
        }
    };

    const handleBulkExport = () => {
        const listToExport = selectedIds.length > 0
            ? transactions.filter(tx => selectedIds.includes(tx._id))
            : filteredTransactions;

        if (listToExport.length === 0) return showToast("No data to export", 'error');

        const dataToExport = listToExport.map(tx => {
            const batchRate = tx.batchId ? (tx.batchId.totalAmount || (tx.batchId.rate * tx.batchId.quantity)) / tx.batchId.quantity : 0;
            const totalAmt = tx.totalAmount || (batchRate * (tx.quantity || 0));
            const ratePerUnit = totalAmt / (tx.quantity || 1);

            return {
                Date: new Date(tx.date).toLocaleDateString('en-IN'),
                Item: tx.item?.name || '-',
                Quantity: tx.quantity,
                Rate: ratePerUnit.toFixed(2),
                TotalAmount: totalAmt.toFixed(2),
                Department: tx.department?.name || tx.department || '-',
                Event: tx.event?.name || tx.event || '-',
                Narration: tx.narration || '-'
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock Out");
        XLSX.writeFile(wb, `Stock_Out_Report.xlsx`);
    };

    const handleBulkExportPDF = async () => {
        const listToExport = selectedIds.length > 0
            ? transactions.filter(tx => selectedIds.includes(tx._id))
            : filteredTransactions;

        if (listToExport.length === 0) return showToast("No data to export", 'error');

        const dataToExport = listToExport.map(tx => {
            const batchRate = tx.batchId ? (tx.batchId.totalAmount || (tx.batchId.rate * tx.batchId.quantity)) / tx.batchId.quantity : 0;
            const totalAmt = tx.totalAmount || (batchRate * (tx.quantity || 0));
            const ratePerUnit = totalAmt / (tx.quantity || 1);

            return [
                new Date(tx.date).toLocaleDateString('en-IN'),
                tx.item?.name || '-',
                `${tx.quantity} ${tx.item?.unit || ''}`,
                ratePerUnit.toFixed(2),
                totalAmt.toFixed(2),
                tx.department?.name || tx.department || '-',
                tx.event?.name || tx.event || '-'
            ];
        });

        const title = selectedIds.length > 0 ? "Selected Stock Out Report" : "Milk & Buttermilk Stock Out Report";
        const headers = ['Date', 'Item', 'Quantity', 'Rate', 'Total', 'To', 'Event'];
        const fileName = `${selectedIds.length > 0 ? 'Selected_' : ''}Milk_Out_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

        await generateStockPDF({
            title,
            headers,
            data: dataToExport,
            fileName,
            companyName,
            companyAddress,
            companyPhone
        });
    };

    const uniqueCategories = [...new Set(transactions.map(t => t.item?.category).filter(Boolean))].sort();

    const isInvalidTransaction = (tx) => {
        const qty = Number(tx.quantity) || 0;
        const totalAmount = Number(tx.totalAmount) || 0;
        const rate = Number(tx.rate ?? (qty > 0 ? totalAmount / qty : 0)) || 0;
        const currentStock = Number(tx.item?.currentStock ?? 0);

        if (!tx.item?.name) return "Product Name missing";
        if (!tx.date) return "Date missing";
        if (!tx.department) return "Department missing";
        if (!tx.event) return "Event missing";
        if (qty <= 0) return "Quantity must be > 0";
        if (totalAmount <= 0) return "Amount must be > 0";
        if (rate <= 0) return "Rate must be > 0";
        if (currentStock < 0) return "Stock is negative";
        if (tx.isBatchDeleted) return "Batch deleted";
        if (tx.isBatchMismatch) return "Item mismatch with batch";
        if (tx.isBatchRateMismatch) return "Rate mismatch with batch";
        if (!tx.item?.category) return "Category missing";
        if (!tx.item?.unit) return "Unit missing";
        return null;
    };

    const hasActiveIssue = transactions.some(t => !!isInvalidTransaction(t));

    const filteredTransactions = transactions.filter(t => {
        const term = searchTerm.toLowerCase();
        const categoryMatch = filterCategory.length === 0 || filterCategory.includes(t.item?.category);

        const checkTerm = (obj, term) => {
            if (!obj) return false;
            if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
            return String(obj).toLowerCase().includes(term);
        };
        const searchMatch = !searchTerm || checkTerm(t, term);

        let colsMatch = true;
        const deptName = typeof t.department === 'object' ? t.department?.name : t.department;
        const eventName = typeof t.event === 'object' ? t.event?.name : t.event;
        if (colFilters.date?.length && !colFilters.date.includes(new Date(t.date).toLocaleDateString('en-GB'))) colsMatch = false;
        if (colFilters.product?.length && !colFilters.product.includes(t.item?.name)) colsMatch = false;
        if (colFilters.event?.length && !colFilters.event.includes(eventName)) colsMatch = false;
        if (colFilters.department?.length && !colFilters.department.includes(deptName)) colsMatch = false;
        if (colFilters.qty?.length && !colFilters.qty.includes(String(t.quantity || 0))) colsMatch = false;
        if (colFilters.rate?.length && !colFilters.rate.includes(String(t.rate || (t.quantity > 0 ? (t.totalAmount / t.quantity).toFixed(2) : '0')))) colsMatch = false;
        if (colFilters.gtotal?.length && !colFilters.gtotal.includes(String(t.totalAmount || 0))) colsMatch = false;
        if (colFilters.stock?.length && !colFilters.stock.includes(String(t.item?.currentStock || 0))) colsMatch = false;
        if (colFilters.narration?.length && !colFilters.narration.includes(t.narration || '-')) colsMatch = false;

        return categoryMatch && searchMatch && colsMatch;
    });

    const displayedGrandTotal = (selectedIds.length > 0 ? transactions.filter(tx => selectedIds.includes(tx._id)) : filteredTransactions)
        .reduce((acc, tx) => acc + (Number(tx.totalAmount) || 0), 0);

    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    if (permsLoading) return <div className="p-8 text-center text-muted-foreground italic tracking-widest uppercase text-xs font-black">Loading...</div>;

    if (!hasPermission('read')) {
        return <div className="p-10 text-center font-bold text-red-500">ACCESS DENIED</div>;
    }

    const uniqueDates = [...new Set(transactions.map(t => new Date(t.date).toLocaleDateString('en-GB')))].sort();
    const uniqueEvents = [...new Set(transactions.map(t => typeof t.event === 'object' ? t.event?.name : t.event).filter(Boolean))].sort();
    const uniqueDepartments = [...new Set(transactions.map(t => typeof t.department === 'object' ? t.department?.name : t.department).filter(Boolean))].sort();
    const uniqueProducts = [...new Set(transactions.map(t => t.item?.name).filter(Boolean))].sort();
    const uniqueRates = [...new Set(transactions.map(t => String(t.rate || (t.quantity > 0 ? (t.totalAmount / t.quantity).toFixed(2) : '0'))))].sort((a, b) => Number(a) - Number(b));
    const uniqueQtys = [...new Set(transactions.map(t => String(t.quantity || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueGrandTotals = [...new Set(transactions.map(t => String(t.totalAmount || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueStocks = [...new Set(transactions.map(t => String(t.item?.currentStock || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueNarrations = [...new Set(transactions.map(t => t.narration || '-'))].sort();

    return (
        <div className="min-h-screen p-4 md:p-8 font-sans dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
            <MasterDataManager
                isOpen={isMasterManagerOpen}
                onClose={() => {
                    setIsMasterManagerOpen(false);
                    loadDepartments();
                    loadEvents();
                }}
                allowedTabs={['departments', 'events']}
            />
            <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} type="OUT" category="DAIRY" onSuccess={fetchTransactions} />

            {/* Top Columns Hide/Unhide & Action Bar */}
            <div className="flex justify-end items-center gap-4 mb-3 pr-1">
                {!isEntrySectionOpen && (
                    <div className="flex items-center gap-1 text-[#882619] font-bold text-xs">
                        <Check size={16} className="text-emerald-600 font-extrabold stroke-[3]" />
                        <span><strong className="text-sm font-black text-slate-800 dark:text-zinc-100">{transactions.length}</strong> Entry</span>
                    </div>
                )}

                <div ref={hideShowDropdownRef} className="relative">
                    <button
                        onClick={() => setIsHideShowDropdownOpen(!isHideShowDropdownOpen)}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-xs font-bold text-slate-700 dark:text-zinc-200 hover:border-[#882619] transition-all shadow-xs cursor-pointer"
                    >
                        <img src="/icons/action/Hide.svg" className="w-4 h-4" alt="Hide" />
                        <span>Columns Hide / Unhide</span>
                        <ChevronDown size={14} className="text-[#D4612D]" />
                    </button>

                    <AnimatePresence>
                        {isHideShowDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-9 w-52 bg-white dark:bg-zinc-850 rounded-2xl shadow-xl py-3 border border-slate-200 dark:border-zinc-700 z-[100] overflow-hidden"
                            >
                                <div className="px-4 pb-2 mb-2 border-b border-slate-100 dark:border-zinc-800">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Toggle Columns</span>
                                </div>
                                <div className="flex flex-col max-h-60 overflow-y-auto">
                                    {isEntrySectionOpen ? (
                                        <>
                                            {[
                                                { key: 'product', label: 'Product Name' },
                                                { key: 'rate', label: 'Rate' },
                                                { key: 'stock', label: 'Current Stock' },
                                                { key: 'qty', label: 'Qty' },
                                                { key: 'total', label: 'Grand Total' },
                                                { key: 'narration', label: 'Narration' },
                                            ].map((col) => (
                                                <label key={col.key} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleEntryCols[col.key]}
                                                        onChange={(e) => setVisibleEntryCols({ ...visibleEntryCols, [col.key]: e.target.checked })}
                                                        className="rounded border-slate-350 dark:border-zinc-750 text-[#D4612D] focus:ring-[#D4612D] accent-[#D4612D] w-4 h-4 cursor-pointer"
                                                    />
                                                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wide">{col.label}</span>
                                                </label>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {[
                                                { key: 'date', label: 'Date' },
                                                { key: 'toEvent', label: 'To / Event' },
                                                { key: 'product', label: 'Product Name' },
                                                { key: 'rate', label: 'Rate' },
                                                { key: 'stock', label: 'Cur. Stock' },
                                                { key: 'qty', label: 'Qty' },
                                                { key: 'total', label: 'Grand Total' },
                                                { key: 'narration', label: 'Narration' },
                                            ].map((col) => (
                                                <label key={col.key} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={visibleHistoryCols[col.key]}
                                                        onChange={(e) => setVisibleHistoryCols({ ...visibleHistoryCols, [col.key]: e.target.checked })}
                                                        className="rounded border-slate-350 dark:border-zinc-750 text-[#D4612D] focus:ring-[#D4612D] accent-[#D4612D] w-4 h-4 cursor-pointer"
                                                    />
                                                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wide">{col.label}</span>
                                                </label>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!isEntrySectionOpen && (
                    <PermissionWrapper action="source">
                        <button
                            onClick={() => setIsMasterManagerOpen(true)}
                            className="flex items-center gap-1.5 group text-slate-600 hover:text-[#882619] transition-all cursor-pointer bg-transparent border-0 outline-none"
                        >
                            <img src="/icons/action/Source.svg" className="w-5 h-5 transition-transform group-hover:scale-105 block dark:hidden" alt="Source" />
                            <img src="/icons/action/SourceDark.svg" className="w-5 h-5 transition-transform group-hover:scale-105 hidden dark:block" alt="Source" />
                            <span className="text-xs font-bold text-[#882619] dark:text-white">Source</span>
                        </button>
                    </PermissionWrapper>
                )}
            </div>

            {/* MAIN WHITE CARD CONTAINER */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-slate-200/80 dark:border-zinc-800">

                {/* 1. ENTRY SECTION VIEW */}
                {isEntrySectionOpen ? (
                    <div className="m-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black tracking-tight uppercase">
                                    <span className="text-[#882619] dark:text-white">Product</span> <span className="text-[#575757] dark:text-zinc-300">OUT ENTRY</span>
                                </h1>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-bold text-sm mr-2">
                                    <span className="text-[#882619] dark:text-white font-black text-lg">{itemsList.length}</span> Entry
                                </div>

                                <PermissionWrapper action="source">
                                    <button
                                        onClick={() => setIsMasterManagerOpen(true)}
                                        className="flex flex-col items-center gap-1 group text-slate-500 hover:text-primary transition-all cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                        <img src="/icons/action/Source.svg" className="w-7 h-7 transition-transform group-hover:scale-105 block dark:hidden" alt="Source" />
                                        <img src="/icons/action/SourceDark.svg" className="w-7 h-7 transition-transform group-hover:scale-105 hidden dark:block" alt="Source" />
                                        <span className="text-[10px] font-bold text-[#575757] dark:text-white">Source</span>
                                    </button>
                                </PermissionWrapper>

                                <div className="w-px h-10 bg-[#B0A9A9] dark:bg-zinc-800" />

                                <button
                                    onClick={() => setIsEntrySectionOpen(false)}
                                    className="flex flex-col items-center gap-1 group text-slate-500 hover:text-primary transition-all cursor-pointer bg-transparent border-0 outline-none"
                                >
                                    <img src="/icons/action/Data.svg" className="w-12 h-12 transition-transform group-hover:scale-105 block dark:hidden" alt="Data" />
                                    <img src="/icons/action/DataDark.svg" className="w-12 h-12 transition-transform group-hover:scale-105 hidden dark:block" alt="Data" />
                                </button>
                            </div>
                        </div>

                        {/* Master Fields Bar */}
                        <div className="flex flex-col md:flex-row gap-6 items-center mb-8 bg-[#EBEBEB]/50 dark:bg-zinc-800/60 rounded-none border-t border-b border-[#A4A4A4] dark:border-zinc-800 py-4 px-6 relative w-full overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />
                            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />

                            <div className="flex-1 w-full">
                                <label className="text-xs font-bold text-[#575757] dark:text-zinc-400 mb-1.5 block text-left tracking-wide">
                                    <span className="text-[#882619] mr-1 font-bold">*</span>Date :
                                </label>
                                <DateTimePicker
                                    required
                                    value={masterForm.date}
                                    onChange={val => setMasterForm(prev => ({ ...prev, date: val }))}
                                    customTrigger={
                                        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-semibold cursor-pointer select-none w-full h-[38px] shadow-xs hover:border-[#882619] transition-all">
                                            <span className="flex-1 text-center font-bold tracking-tight bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                {masterForm.date ? formatDisplayDate(masterForm.date) : 'Select Date & Time'}
                                            </span>
                                            <img src="/icons/action/Calender.svg" className="w-4 h-4 transition-transform group-hover:scale-110 block dark:hidden ml-2 shrink-0" alt="Calendar" />
                                            <img src="/icons/action/CalenderDark.svg" className="w-4 h-4 transition-transform group-hover:scale-110 hidden dark:block ml-2 shrink-0" alt="Calendar" />
                                        </div>
                                    }
                                />
                            </div>

                            <div className="flex-1 w-full">
                                <label className="text-[#575757] text-xs font-bold dark:text-zinc-400 mb-1.5 block text-left tracking-wide">
                                    <span className="text-[#882619] mr-1 font-bold">*</span>To :
                                </label>
                                <SearchableSelect
                                    options={[{ value: 'All', label: 'All' }, ...departments.map(d => ({ value: d.name, label: d.name }))]}
                                    value={masterForm.department}
                                    onChange={val => setMasterForm(prev => ({ ...prev, department: val }))}
                                    placeholder="Select Department"
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold outline-none transition-all text-center cursor-pointer flex items-center justify-between h-[38px] shadow-xs uppercase"
                                />
                            </div>

                            <div className="flex-1 w-full">
                                <label className="text-[#575757] text-xs font-bold dark:text-zinc-400 mb-1.5 block text-left tracking-wide">
                                    <span className="text-[#882619] mr-1 font-bold">*</span>Event Name :
                                </label>
                                <SearchableSelect
                                    options={[{ value: 'Regular', label: 'Regular' }, ...events.map(ev => ({ value: ev.name, label: ev.name }))]}
                                    value={masterForm.event}
                                    onChange={val => setMasterForm(prev => ({ ...prev, event: val }))}
                                    placeholder="Select Event"
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold outline-none transition-all text-center cursor-pointer flex items-center justify-between h-[38px] shadow-xs uppercase"
                                />
                            </div>

                            <div className="flex items-center gap-6 self-end md:self-auto">
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="flex flex-col items-center gap-1 group text-slate-500 hover:text-[#882619] dark:text-white transition-all cursor-pointer bg-transparent border-0 outline-none animate-none"
                                >
                                    <img src="/icons/action/Add.svg" className="w-12 h-12 transition-transform group-hover:scale-105 block dark:hidden" alt="Add Item" />
                                    <img src="/icons/action/AddDark.svg" className="w-12 h-12 transition-transform group-hover:scale-105 hidden dark:block" alt="Add Item" />
                                    <span className="text-[10px] font-bold mt-1 text-[#882619] dark:text-white">Add Item</span>
                                </button>
                            </div>
                        </div>

                        {/* Entry Table Grid */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] scroll-smooth">
                            <table className="w-full text-left border-separate border-spacing-0 min-w-[1100px] inventory-table">
                                <thead>
                                    <tr className="text-[14px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 double-header-row">
                                        {visibleEntryCols.product !== false && (
                                            <th className="py-4 px-3 bg-white dark:bg-zinc-900 border-r-2 border-[#D4612D] gradient-border-r">
                                                <div className="flex items-center justify-center gap-1.5 text-slate-900 dark:text-zinc-100">
                                                    <span>Product Name</span>
                                                    <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                </div>
                                            </th>
                                        )}
                                        {visibleEntryCols.rate !== false && (
                                            <th className="py-4 px-3 text-center bg-white dark:bg-zinc-900 border-r border-[#A4A4A4] dark:border-zinc-800">
                                                <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-zinc-100">
                                                    <span>Rate</span>
                                                    <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                </div>
                                            </th>
                                        )}
                                        {visibleEntryCols.stock !== false && (
                                            <th className="py-4 px-3 text-center bg-white dark:bg-zinc-900 border-r border-[#A4A4A4] dark:border-zinc-800">
                                                <div className="text-slate-900 dark:text-zinc-100">Current Stock</div>
                                            </th>
                                        )}
                                        {visibleEntryCols.qty !== false && (
                                            <th className="py-4 px-3 text-center bg-white dark:bg-zinc-900 border-r border-[#A4A4A4] dark:border-zinc-800">
                                                <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-zinc-100">
                                                    <span>Qty</span>
                                                    <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                </div>
                                            </th>
                                        )}
                                        {visibleEntryCols.total !== false && (
                                            <th className="py-4 px-3 text-center bg-white dark:bg-zinc-900 border-r border-[#A4A4A4] dark:border-zinc-800">
                                                <div className="text-slate-900 dark:text-zinc-100">Grand Total</div>
                                            </th>
                                        )}
                                        {visibleEntryCols.narration !== false && (
                                            <th className="py-4 px-3 text-center bg-white dark:bg-zinc-900 border-r border-[#A4A4A4] dark:border-zinc-800">
                                                <div className="text-slate-900 dark:text-zinc-100">Narration</div>
                                            </th>
                                        )}
                                        <th className="py-4 px-3 text-center bg-white dark:bg-zinc-900"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#A4A4A4]">
                                    {itemsList.map((item, idx) => {
                                        const selectedItem = items.find(i => i._id === item.item);

                                        const allocatedInOtherRowsForBatch = itemsList.reduce((acc, r, i) => {
                                            if (i !== idx && r.batchId && r.batchId === item.batchId) return acc + (Number(r.quantity) || 0);
                                            return acc;
                                        }, 0);

                                        const allocatedInOtherRowsForItem = itemsList.reduce((acc, r, i) => {
                                            if (i !== idx && r.item && r.item === item.item) return acc + (Number(r.quantity) || 0);
                                            return acc;
                                        }, 0);

                                        const currentBatchObj = item.availableBatches?.find(b => b._id === item.batchId);
                                        const rawBatchStock = currentBatchObj ? currentBatchObj.remainingQuantity : (item.item ? (items.find(i => i._id === item.item)?.currentStock || 0) : 0);
                                        const rawTotalStock = item.item ? (items.find(i => i._id === item.item)?.currentStock || 0) : 0;

                                        const availableBatchStock = Math.max(0, rawBatchStock - allocatedInOtherRowsForBatch);
                                        const availableTotalStock = Math.max(0, rawTotalStock - allocatedInOtherRowsForItem);

                                        const isQtyValid = Number(item.quantity) > 0;
                                        const isRateValid = Number(item.rate) > 0;
                                        const isStockValid = Number(item.quantity) <= availableBatchStock;
                                        const isValid = item.item && isQtyValid && isRateValid && isStockValid;

                                        const availableOutOptions = items.filter(i => (i.currentStock || 0) > 0 || String(i._id) === String(item.item)).map(i => ({ value: i._id, label: i.name }));

                                        const availableBatchesForDropdown = (item.availableBatches || []).filter(b => {
                                            const bAllocated = itemsList.reduce((acc, r, i) => {
                                                if (i !== idx && r.batchId === b._id) return acc + (Number(r.quantity) || 0);
                                                return acc;
                                            }, 0);
                                            const effBStock = b.remainingQuantity - bAllocated;
                                            return effBStock > 0 || b._id === item.batchId;
                                        });

                                        return (
                                            <tr key={item.tempId} className="bg-white dark:bg-zinc-900 group hover:bg-muted/30">
                                                {visibleEntryCols.product !== false && (
                                                    <td style={idx === itemsList.length - 1 ? { borderBottom: '5px double #D4612D' } : {}} className={`py-4 px-3 border-r-2 border-[#D4612D] gradient-border-r align-top pl-4 ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-xl border border-[#D4612D]/30 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                                                {selectedItem?.image ? (
                                                                    <img src={selectedItem.image} className="w-full h-full object-cover" alt="product" />
                                                                ) : (
                                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4612D" strokeWidth="1.8">
                                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                                        <path d="M21 15l-5-5L5 21" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col min-w-[220px]">
                                                                <SearchableSelect
                                                                    options={availableOutOptions}
                                                                    value={item.item || ''}
                                                                    onChange={(val) => handleRowChange(item.tempId, 'item', val)}
                                                                    placeholder="Select Product"
                                                                    className="w-full text-sm font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent bg-transparent border-0 outline-none tracking-tight cursor-pointer uppercase py-0.5"
                                                                />
                                                                <div className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wide pl-1">
                                                                    {selectedItem ? `${(typeof selectedItem.category === 'object' ? selectedItem.category?.name : selectedItem.category) || '-'}` : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleEntryCols.rate !== false && (
                                                    <td style={idx === itemsList.length - 1 ? { borderBottom: '5px double #D4612D' } : {}} className={`py-4 px-3 text-center align-middle border-r border-[#A4A4A4] ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                        {availableBatchesForDropdown.length > 0 ? (
                                                            <div className="relative inline-flex items-center justify-center">
                                                                <select
                                                                    value={item.batchId || ''}
                                                                    onChange={(e) => handleRowChange(item.tempId, 'batchId', e.target.value)}
                                                                    className="text-sm font-black text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-[#D4612D]/40 rounded-lg pl-3 pr-7 py-1 outline-none cursor-pointer text-center appearance-none shadow-xs hover:border-[#882619] transition-all"
                                                                >
                                                                    {availableBatchesForDropdown.map((b) => (
                                                                        <option key={b._id} value={b._id} className="text-slate-900 font-bold">
                                                                            ₹ {formatIndianNumber(b.rate)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown size={14} className="text-[#D4612D] absolute right-2 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm font-black text-slate-900 dark:text-zinc-100">
                                                                {item.rate ? `₹ ${formatIndianNumber(item.rate)}` : '₹ 0'}
                                                            </div>
                                                        )}
                                                    </td>
                                                )}

                                                {visibleEntryCols.stock !== false && (
                                                    <td style={idx === itemsList.length - 1 ? { borderBottom: '5px double #D4612D' } : {}} className={`py-4 px-3 text-center align-middle border-r border-[#A4A4A4] ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                        <div className="text-sm font-black text-slate-900 dark:text-zinc-100">
                                                            {item.item ? `${Math.max(0, availableBatchStock - (Number(item.quantity) || 0))} | ${Math.max(0, availableTotalStock - (Number(item.quantity) || 0))} ${typeof selectedItem?.unit === 'object' ? selectedItem.unit?.name : (selectedItem?.unit || '')}` : '0 | 0'}
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleEntryCols.qty !== false && (
                                                    <td style={idx === itemsList.length - 1 ? { borderBottom: '5px double #D4612D' } : {}} className={`py-4 px-3 text-center align-middle border-r border-[#A4A4A4] ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                value={item.quantity || ''}
                                                                onChange={e => handleRowChange(item.tempId, 'quantity', e.target.value)}
                                                                placeholder="Qty"
                                                                className="w-20 text-center text-sm font-bold text-slate-900 bg-white dark:bg-zinc-800 border border-[#D4612D]/40 rounded-lg px-2 py-1 outline-none shadow-xs hover:border-[#882619] transition-all"
                                                            />
                                                            {(() => {
                                                                const uName = typeof selectedItem?.unit === 'object' ? selectedItem.unit?.name : (selectedItem?.unit || item.itemUnit || '');
                                                                return uName ? <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{uName}</span> : null;
                                                            })()}
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleEntryCols.total !== false && (
                                                    <td style={idx === itemsList.length - 1 ? { borderBottom: '5px double #D4612D' } : {}} className={`py-4 px-3 text-center align-middle border-r border-[#A4A4A4] ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                        <div className="text-sm font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                            ₹ {formatIndianNumber(item.grandTotal || 0)}
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleEntryCols.narration !== false && (
                                                    <td style={idx === itemsList.length - 1 ? { borderBottom: '5px double #D4612D' } : {}} className={`py-4 px-3 text-center align-middle border-r border-[#A4A4A4] ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                        <input
                                                            type="text"
                                                            value={item.narration || ''}
                                                            onChange={e => handleRowChange(item.tempId, 'narration', e.target.value)}
                                                            placeholder="Narration"
                                                            className="w-full text-xs font-semibold text-slate-800 bg-white dark:bg-zinc-800 border border-[#D4612D]/40 rounded-lg px-2 py-1 outline-none"
                                                        />
                                                    </td>
                                                )}

                                                <td style={idx === itemsList.length - 1 ? { borderBottom: '5px double #D4612D' } : {}} className={`py-4 px-3 text-center align-middle ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                    <div className="flex justify-center items-center gap-2">
                                                        {isValid ? (
                                                            <Check size={22} className="text-emerald-600 font-bold" strokeWidth={3} />
                                                        ) : (
                                                            <X size={22} className="text-red-500 font-bold" strokeWidth={3} />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.tempId)}
                                                            className="p-1 hover:opacity-80 transition-opacity"
                                                            title="Delete Row"
                                                        >
                                                            <img src="/icons/action/Delete.svg" className="w-8 h-8 dark:hidden" alt="Delete" />
                                                            <img src="/icons/action/DeleteDark.svg" className="w-8 h-8 hidden dark:block" alt="Delete" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Actions & Grand Total */}
                        <div className="flex flex-wrap items-center gap-12 mt-6 pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={itemsList.filter(item => item.item).length === 0}
                                className="px-8 py-2.5 bg-gradient-to-r from-[#882619] to-[#D4612D] text-white font-bold text-sm rounded-xl hover:opacity-95 transition-all shadow-md cursor-pointer disabled:bg-[#D8A99B] disabled:from-transparent disabled:to-transparent disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                                Save Product
                            </button>
                            <div className="text-xl font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent tracking-tight">
                                Grand Total : ₹ {formatIndianNumber(itemsList.reduce((acc, i) => acc + (Number(i.grandTotal) || 0), 0))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 2. DATA HISTORY VIEW */
                    <div>
                        <div>
                            {/* Top Action Bar */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-3.5 bg-[#ECEAE6]/70 dark:bg-zinc-800/80  border-t border-b border-[#D4612D]/40 shadow-xs">
                                <div className="flex flex-col gap-0.5">
                                    <h1 className="text-2xl font-black tracking-tight uppercase leading-tight">
                                        <span className="text-[#882619] font-black">Milk</span> <span className="text-[#575757]">OUT DATA</span>
                                    </h1>
                                    <div className="text-[11px] font-semibold text-[#7E8B9B] italic">
                                        New Product Registration List
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-xl font-black text-[#D4612D]">
                                            ₹ {formatIndianNumber(displayedGrandTotal)}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 italic uppercase tracking-wide">Grand Total</div>
                                    </div>

                                    <div className="relative">
                                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4612D]" />
                                        <input
                                            type="text"
                                            placeholder="Quick Search"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D]/60 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none shadow-xs w-48 focus:border-[#882619] transition-all"
                                        />
                                    </div>

                                    <FilterDropdown
                                        title="Category Filter"
                                        options={uniqueCategories}
                                        value={filterCategory}
                                        onChange={(val) => setFilterCategory(val)}
                                        isMulti={true}
                                        className="flex items-center justify-between gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D]/60 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none shadow-xs h-9 cursor-pointer hover:border-[#882619] transition-all"
                                    />

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={selectedIds.length === 0}
                                            className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer bg-transparent border-0 outline-none disabled:opacity-100"
                                        >
                                            <img src="/icons/action/Delete.svg" className="w-12 h-12 transition-transform group-hover:scale-105 dark:hidden" alt="Delete" />
                                            <img src="/icons/action/DeleteDark.svg" className="w-12 h-12 transition-transform group-hover:scale-105 hidden dark:block" alt="Delete" />
                                        </button>

                                        <div className="relative" ref={downloadRef}>
                                            <button
                                                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                                                className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer bg-transparent border-0 outline-none"
                                            >
                                                <img src="/icons/action/Download.svg" className="w-16 h-16 transition-transform group-hover:scale-105 block dark:hidden" alt="Download" />
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
                                                            onClick={() => { handleBulkExport(); setIsDownloadOpen(false); }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors border-b border-border"
                                                        >
                                                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                                            </div>
                                                            Excel Report {selectedIds.length > 0 ? '(Selected)' : '(Filtered)'}
                                                        </button>
                                                        <button
                                                            onClick={() => { handleBulkExportPDF(); setIsDownloadOpen(false); }}
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

                                        <button
                                            onClick={() => setIsBulkModalOpen(true)}
                                            className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer bg-transparent border-0 outline-none"
                                        >
                                            <img src="/icons/action/Bulkupload.svg" className="w-10 h-10 transition-transform group-hover:scale-105" alt="Bulk Upload" />
                                        </button>

                                        <div className="w-px h-8 bg-[#A4A4A4] dark:bg-zinc-700 mx-1" />

                                        <button
                                            onClick={() => setIsEntrySectionOpen(true)}
                                            className="flex flex-col items-center gap-0.5 group transition-all cursor-pointer bg-transparent border-0 outline-none"
                                        >
                                            <img src="/icons/action/Entry.svg" className="w-11 h-11 transition-transform group-hover:scale-105" alt="Entry" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* History Table Grid */}
                            <div className="overflow-x-auto overflow-y-auto max-h-[72vh] scroll-smooth">
                                <table className="w-full text-left border-separate border-spacing-0 min-w-[1100px] history-grid-table mt-4">
                                    <thead>
                                        <tr className="sticky top-0 z-20 whitespace-nowrap double-header-row">
                                            <th className="py-4 px-3 w-10 text-center bg-muted">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                                                    onChange={toggleSelectAll}
                                                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                />
                                            </th>
                                            {visibleHistoryCols.date !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900">
                                                    <div className="flex items-center gap-1.5 justify-start text-slate-900 dark:text-zinc-100">
                                                        <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                        <span>Date</span>
                                                        <TableColumnFilter colKey="date" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueDates} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            {visibleHistoryCols.toEvent !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 border-r border-[#A4A4A4] dark:border-zinc-800">
                                                    <div className="flex items-center gap-1.5 justify-start text-slate-900 dark:text-zinc-100">
                                                        <span>To</span>
                                                        <TableColumnFilter colKey="department" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueDepartments} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        <span className="text-slate-400 dark:text-zinc-500">/</span>
                                                        <span>Event</span>
                                                        <TableColumnFilter colKey="event" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueEvents} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            {visibleHistoryCols.product !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900">
                                                    <div className="flex items-center gap-1.5 justify-start text-slate-900 dark:text-zinc-100">
                                                        <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                        <span>Product Name</span>
                                                        <TableColumnFilter colKey="product" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueProducts} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            {visibleHistoryCols.rate !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center border-l-2 border-[#882619]">
                                                    <div className="flex items-center gap-1.5 justify-center text-slate-900 dark:text-zinc-100">
                                                        <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                        <span>Rate</span>
                                                        <TableColumnFilter colKey="rate" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueRates} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            {visibleHistoryCols.stock !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center">
                                                    <div className="flex items-center gap-1.5 justify-center text-slate-900 dark:text-zinc-100">
                                                        <span>Cur. Stock</span>
                                                        <TableColumnFilter colKey="stock" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueStocks} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            {visibleHistoryCols.qty !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center">
                                                    <div className="flex items-center gap-1.5 justify-center text-slate-900 dark:text-zinc-100">
                                                        <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                        <span>Qty</span>
                                                        <TableColumnFilter colKey="qty" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueQtys} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            {visibleHistoryCols.total !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center">
                                                    <div className="flex items-center gap-1.5 justify-center text-slate-900 dark:text-zinc-100">
                                                        <span>Grand Total</span>
                                                        <TableColumnFilter colKey="gtotal" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueGrandTotals} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            {visibleHistoryCols.narration !== false && (
                                                <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center border-r-2 border-border">
                                                    <div className="flex items-center gap-1.5 justify-center text-slate-900 dark:text-zinc-100">
                                                        <span>Narration</span>
                                                        <TableColumnFilter colKey="narration" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueNarrations} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                    </div>
                                                </th>
                                            )}
                                            <th className="py-4 px-4 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center text-slate-900 dark:text-zinc-100">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginatedTransactions.length > 0 ? (
                                            paginatedTransactions.map((tx) => {
                                                const isEditing = editingId === tx._id;
                                                const hasEntryIssue = isInvalidTransaction(tx);

                                                return (
                                                    <tr key={tx._id} ref={isEditing ? editingRef : null} className={`hover:bg-muted/40 transition-colors ${selectedIds.includes(tx._id) ? 'bg-primary/5' : ''} ${hasEntryIssue ? 'bg-destructive/5' : ''}`}>
                                                        <td className="py-3.5 px-3 text-center align-middle">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(tx._id)}
                                                                onChange={() => toggleSelectRow(tx._id)}
                                                                className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                            />
                                                        </td>
                                                        {visibleHistoryCols.date !== false && (
                                                            <td className={`py-3.5 px-3 align-middle text-[13px] font-black ${hasEntryIssue ? 'text-destructive' : 'text-foreground'}`}>
                                                                {isEditing ? (
                                                                    <DateTimePicker
                                                                        value={masterForm.date}
                                                                        onChange={val => setMasterForm(prev => ({ ...prev, date: val }))}
                                                                    />
                                                                ) : (
                                                                    <div className="flex flex-col">
                                                                        <span>{new Date(tx.date).toLocaleDateString('en-GB')}</span>
                                                                        <span className="text-[10px] text-muted-foreground font-semibold">{new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleHistoryCols.toEvent !== false && (
                                                            <td className="py-3.5 px-3 align-middle border-r border-[#A4A4A4]">
                                                                {isEditing ? (
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <SearchableSelect
                                                                            options={departments.map(d => ({ value: d.name, label: d.name }))}
                                                                            value={masterForm.department || ''}
                                                                            onChange={val => setMasterForm(prev => ({ ...prev, department: val }))}
                                                                            placeholder="Select Dept"
                                                                        />
                                                                        <SearchableSelect
                                                                            options={events.map(ev => ({ value: ev.name, label: ev.name }))}
                                                                            value={masterForm.event || ''}
                                                                            onChange={val => setMasterForm(prev => ({ ...prev, event: val }))}
                                                                            placeholder="Select Event"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">{tx.department?.name || tx.department || '-'}</span>
                                                                        <span className="text-[11px] font-semibold text-slate-400 italic">{tx.event?.name || tx.event || '-'}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}
                                                        {visibleHistoryCols.product !== false && (
                                                            <td className="py-3.5 px-3 align-middle">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                                                                        {tx.item?.image ? (
                                                                            <img src={tx.item.image} className="w-full h-full object-cover" alt="item" />
                                                                        ) : (
                                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4612D" strokeWidth="1.8">
                                                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                                                <path d="M21 15l-5-5L5 21" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[14px] font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent uppercase tracking-tight">{tx.item?.name}</div>
                                                                        <div className="text-[10px] font-semibold text-slate-400 tracking-wide">{(typeof tx.item?.category === 'object' ? tx.item.category?.name : tx.item?.category) || '-'}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visibleHistoryCols.rate !== false && (
                                                            <td className={`py-4 px-1 text-xs font-black text-center border-l-2 border-[#882619] ${hasEntryIssue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                                {isEditing ? (
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        {currentItem?.availableBatches?.length > 0 ? (
                                                                            <RateDropdown
                                                                                batchId={currentItem?.batchId || ''}
                                                                                availableBatches={currentItem?.availableBatches || []}
                                                                                currentRate={currentItem?.rate || '0'}
                                                                                onSelect={(batch) => {
                                                                                    setCurrentItem(prev => ({
                                                                                        ...prev,
                                                                                        rate: batch.rate.toString(),
                                                                                        batchId: batch._id,
                                                                                        grandTotal: (Number(prev?.quantity || 0) * Number(batch.rate)).toString()
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="relative inline-block w-24">
                                                                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[13px] font-black text-muted-foreground/50 pointer-events-none">₹</span>
                                                                                <input
                                                                                    type="number"
                                                                                    value={currentItem?.rate || ''}
                                                                                    onChange={e => {
                                                                                        const val = e.target.value;
                                                                                        setCurrentItem(prev => ({
                                                                                            ...prev,
                                                                                            rate: val,
                                                                                            grandTotal: (Number(prev?.quantity || 0) * Number(val)).toString()
                                                                                        }));
                                                                                    }}
                                                                                    className="w-full text-center pl-4 pr-1 text-[13px] font-black bg-muted border border-border rounded p-1 focus:border-primary outline-none"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[15px] font-black text-slate-900">₹ {formatIndianNumber(tx.rate)}</span>
                                                                )}
                                                            </td>
                                                        )}

                                                        {visibleHistoryCols.stock !== false && (
                                                            <td className="py-3.5 px-3 align-middle text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-[15px] font-black leading-none">
                                                                        {(() => {
                                                                            const batchStock = isEditing && currentItem?.batchId
                                                                                ? (currentItem?.availableBatches?.find(b => b._id === currentItem.batchId)?.remainingQuantity || 0)
                                                                                : (tx.batchId?.remainingQuantity ?? 0);
                                                                            const totalStock = isEditing
                                                                                ? (currentItem?.availableBatches?.length > 0
                                                                                    ? currentItem.availableBatches.reduce((acc, b) => acc + (b.remainingQuantity || 0), 0)
                                                                                    : (tx.item?.currentStock ?? 0))
                                                                                : (tx.item?.currentStock ?? 0);

                                                                            if (isEditing) {
                                                                                const originalQty = Number(tx.quantity) || 0;
                                                                                const newQty = Number(currentItem?.quantity) || 0;
                                                                                const diff = newQty - originalQty;
                                                                                return `${batchStock - diff} | ${totalStock - diff}`;
                                                                            }
                                                                            return `${batchStock} | ${totalStock}`;
                                                                        })()} {tx.item?.unit?.name || tx.item?.unit}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visibleHistoryCols.qty !== false && (
                                                            <td className={`py-3.5 px-3 align-middle text-[13px] font-black text-center ${hasEntryIssue ? 'text-red-600' : 'text-foreground'}`}>
                                                                {isEditing ? (() => {
                                                                    const originalQty = Number(tx.quantity) || 0;
                                                                    const availStock = currentItem?.batchId
                                                                        ? (currentItem?.availableBatches?.find(b => b._id === currentItem.batchId)?.remainingQuantity || 0)
                                                                        : (currentItem?.availableBatches?.length > 0
                                                                            ? currentItem.availableBatches.reduce((acc, b) => acc + (b.remainingQuantity || 0), 0)
                                                                            : (tx.item?.currentStock ?? 0));
                                                                    const maxAllowed = availStock + originalQty;

                                                                    return (
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max={maxAllowed > 0 ? maxAllowed : undefined}
                                                                            value={currentItem?.quantity || ''}
                                                                            onChange={e => {
                                                                                let val = e.target.value;
                                                                                if (val !== '') {
                                                                                    let num = Number(val);
                                                                                    if (num < 1) num = 1;
                                                                                    if (maxAllowed > 0 && num > maxAllowed) {
                                                                                        num = maxAllowed;
                                                                                    }
                                                                                    val = num.toString();
                                                                                }
                                                                                setCurrentItem(prev => ({
                                                                                    ...prev,
                                                                                    quantity: val,
                                                                                    grandTotal: (Number(val) * Number(prev?.rate || 0)).toString()
                                                                                }));
                                                                            }}
                                                                            className="w-20 text-center text-[13px] font-black bg-muted border border-border rounded p-1 focus:border-primary outline-none"
                                                                        />
                                                                    );
                                                                })() : (
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        <span className="text-[16px] font-black">{tx.quantity}</span>
                                                                        <span className="text-[13px] text-slate-700 font-black">{tx.item?.unit?.name || tx.item?.unit}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}

                                                        {visibleHistoryCols.total !== false && (
                                                            <td className={`py-4 px-1 text-[15px] font-black text-center ${hasEntryIssue ? 'text-destructive' : 'text-primary'}`}>₹ {formatIndianNumber(tx.totalAmount)}</td>
                                                        )}

                                                        {visibleHistoryCols.narration !== false && (
                                                            <td className="py-3.5 px-3 align-middle text-center border-r-2 border-border max-w-[140px] truncate">
                                                                {isEditing ? (
                                                                    <input
                                                                        type="text"
                                                                        value={currentItem?.narration || ''}
                                                                        onChange={e => setCurrentItem(prev => ({ ...prev, narration: e.target.value }))}
                                                                        className="w-full text-center text-[13px] font-black text-foreground bg-muted border border-border rounded p-1 focus:border-primary outline-none"
                                                                        placeholder="Note..."
                                                                    />
                                                                ) : (
                                                                    <span className={`text-[15px] font-black ${hasEntryIssue ? 'text-red-500' : 'text-slate-900'}`}>{tx.narration || '-'}</span>
                                                                )}
                                                            </td>
                                                        )}

                                                        <td className="py-3.5 px-4 align-middle text-center">
                                                            <div className="flex justify-center items-center gap-2.5">
                                                                {isEditing ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleUpdateSingle()}
                                                                            title="Save"
                                                                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-all"
                                                                        >
                                                                            <Check size={18} className="text-emerald-600 font-bold" strokeWidth={3} />

                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingId(null)}
                                                                            title="Cancel"
                                                                            className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-all"
                                                                        >
                                                                            <X size={18} className="text-red-500 font-bold" strokeWidth={3} />

                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => setViewItem(tx)} title="View" className="w-7 h-7 flex items-center justify-center rounded-md text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                                                            <img src="/icons/action/View (1).svg" className="w-5 h-5" alt="View" />
                                                                        </button>
                                                                        {!isReadOnly && (
                                                                            <PermissionWrapper action="edit">
                                                                                <button onClick={() => handleEdit(tx)} title="Edit" className="w-7 h-7 flex items-center justify-center rounded-md text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all">
                                                                                    <img src="/icons/action/Edit.svg" className="w-5 h-5" alt="Edit" />
                                                                                </button>
                                                                            </PermissionWrapper>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="py-12 text-center text-slate-400 font-extrabold text-sm uppercase tracking-wider">
                                                    No Milk & Buttermilk OUT Entry
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <AnimatePresence>
                                {viewItem && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setViewItem(null)}
                                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-border"
                                        >
                                            <div className="p-6 md:p-8">
                                                <div className="flex justify-between items-center mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
                                                            {viewItem.item?.image ? (
                                                                <img src={viewItem.item.image} className="w-full h-full object-cover" alt="item" />
                                                            ) : (
                                                                <img
                                                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${viewItem.item?.name || 'MK'}&backgroundColor=fff&textColor=e86924&fontWeight=800`}
                                                                    className="w-10 h-10 object-contain"
                                                                    alt="placeholder"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{viewItem.item?.name}</h3>
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{viewItem.item?.category?.name || viewItem.item?.category}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setViewItem(null)} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={20} className="text-muted-foreground" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 p-6 bg-muted/30 rounded-[2rem] border border-border mb-8 shadow-inner">
                                                    <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Quantity</p><p className="text-sm font-bold text-foreground">{viewItem.quantity} {viewItem.item?.unit?.name || viewItem.item?.unit}</p></div>
                                                    <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Grand Total</p><p className="text-sm font-black text-primary">₹ {formatIndianNumber(viewItem.totalAmount || 0)}</p></div>
                                                    <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">To / Department</p><p className="text-sm font-bold text-foreground">{viewItem.department?.name || viewItem.department || '-'}</p></div>
                                                    <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Event</p><p className="text-sm font-bold text-foreground">{viewItem.event?.name || viewItem.event || '-'}</p></div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-2">Narration / Notes</p>
                                                    <div className="bg-muted p-4 rounded-2xl text-xs font-medium text-foreground italic border border-border/50">{viewItem.narration || 'No notes available.'}</div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-6">
                                                    <div className="bg-muted/30 p-3 rounded-xl border border-border">
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Created By</p>
                                                        <p className="text-xs font-bold text-foreground truncate">{viewItem.createdByName || viewItem.createdBy?.name || '-'}</p>
                                                        {viewItem.createdAt && <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(viewItem.createdAt).toLocaleString('en-GB')}</p>}
                                                    </div>
                                                    <div className="bg-muted/30 p-3 rounded-xl border border-border">
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Updated By</p>
                                                        <p className="text-xs font-bold text-foreground truncate">{viewItem.updatedByName || viewItem.updatedBy?.name || '-'}</p>
                                                        {viewItem.updatedAt && <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(viewItem.updatedAt).toLocaleString('en-GB')}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-3xl border border-primary/10 mt-6">
                                                    <div className="p-2 bg-card rounded-xl shadow-sm text-primary border border-border">
                                                        <Building2 size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Branch</p>
                                                        <p className="text-xs font-black text-foreground/80 uppercase">{viewItem.companyId?.name || viewItem.companyName || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={filteredTransactions.length}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}



function RateDropdown({ batchId, availableBatches, onSelect, currentRate }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [rect, setRect] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest('.rate-dropdown-portal')) {
                setIsOpen(false);
            }
        };
        const handleScroll = () => setIsOpen(false);

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        if (!isOpen && dropdownRef.current) {
            setRect(dropdownRef.current.getBoundingClientRect());
        }
        setIsOpen(!isOpen);
    };

    const selectedBatch = availableBatches?.find(b => b._id === batchId);
    const displayRate = currentRate != null && currentRate !== '' ? currentRate : selectedBatch?.rate;

    return (
        <div className="relative inline-block w-full min-w-[150px]" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between text-center px-2 text-[10px] font-black text-primary bg-transparent border border-border rounded-lg focus:border-primary py-1.5 outline-none hover:border-border transition-colors cursor-pointer"
            >
                <span className="mx-auto truncate">
                    {selectedBatch
                        ? `₹ ${displayRate} (${selectedBatch.remainingQuantity})`
                        : 'Select Rate'}
                </span>
                <ChevronDown size={12} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        style={{
                            position: 'fixed',
                            top: rect ? rect.bottom + 4 : 0,
                            left: rect ? rect.left : 0,
                            minWidth: rect ? rect.width : 'auto',
                            zIndex: 9999
                        }}
                        className="rate-dropdown-portal w-max bg-card rounded-xl shadow-xl border border-border overflow-hidden p-1"
                    >
                        <div className="max-h-48 overflow-y-auto">
                            {availableBatches?.map(b => {
                                const isSelected = batchId === b._id;
                                return (
                                    <label
                                        key={b._id}
                                        className="w-full px-3 py-2 flex items-center justify-between gap-3 text-xs font-bold rounded-lg transition-all mb-0.5 cursor-pointer hover:bg-muted group"
                                    >
                                        <span className={`truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            ₹ {b.rate} ({b.remainingQuantity}) | {new Date(b.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                        </span>
                                        <div className={`w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary shadow-sm' : 'border-border group-hover:border-border'}`}>
                                            {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isSelected}
                                            onChange={() => {
                                                onSelect(b);
                                                setIsOpen(false);
                                            }}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
