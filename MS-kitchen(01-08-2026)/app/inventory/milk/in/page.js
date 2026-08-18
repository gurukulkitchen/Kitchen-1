"use client";
import CustomSelect from '../../../../components/CustomSelect';
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../../components/Toast';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCompany } from '../../../../context/CompanyContext';

import { motion, AnimatePresence } from 'framer-motion';

import { formatIndianNumber } from '../../../../lib/formatters';

import {

    PlusCircle,

    User,

    ReceiptText,

    ChevronDown,

    Check,
    Download,

    X,

    Search,

    History,

    ArrowDownToLine,

    Eye,

    Edit3,

    Save,

    Trash2,

    Plus,
    Edit2,


    Database,

    ArrowUpFromLine,
    Building2,
    Loader2,
    Calendar

} from 'lucide-react';

import Pagination from '../../../../components/Pagination';

import CompanyFilter from '../../../../components/CompanyFilter';

import BulkUploadModal from '../../../../components/BulkUploadModal';

import * as XLSX from 'xlsx';

import { generateStockPDF } from '@/lib/pdfGenerator';

import usePermissions from '../../../../hooks/usePermissions';

import PermissionWrapper from '../../../../components/PermissionWrapper';

import MasterDataManager from '../../../../components/MasterDataManager';
import TableActionButton from '../../../../components/TableActionButton';
import TableColumnFilter from '../../../../components/TableColumnFilter';
import FilterDropdown from '../../../../components/FilterDropdown';
import SearchableSelect from '../../../../components/SearchableSelect';
import DateTimePicker from '../../../../components/DateTimePicker';

import { Settings } from 'lucide-react';



export default function MilkStockInPage() {
    const { showToast } = useToast();

    const { permissions, loading: permsLoading, hasPermission } = usePermissions();

    const router = useRouter();

    const searchParams = useSearchParams();
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();

    const [items, setItems] = useState([]);

    const [transactions, setTransactions] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const [filterItem, setFilterItem] = useState('');

    const [filterCategory, setFilterCategory] = useState('');
    const [departments, setDepartments] = useState([]);
    const [events, setEvents] = useState([]);

    const [filterQty, setFilterQty] = useState('');

    const [filterTotal, setFilterTotal] = useState('');

    const [filterVendor, setFilterVendor] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterIssue, setFilterIssue] = useState('all');
    const [colFilters, setColFilters] = useState({});
    const [activeFilterCol, setActiveFilterCol] = useState(null);

    const hasActiveFilters =
        (typeof searchTerm !== 'undefined' && searchTerm !== '') ||
        (typeof filterCategory !== 'undefined' && filterCategory !== '') ||
        (typeof filterType !== 'undefined' && filterType !== '') ||
        (typeof filterItem !== 'undefined' && filterItem !== '') ||
        (typeof filterVendor !== 'undefined' && filterVendor !== '') ||
        (typeof filterQty !== 'undefined' && filterQty !== '') ||
        (typeof filterTotal !== 'undefined' && filterTotal !== '') ||
        (typeof colFilters !== 'undefined' && colFilters && Object.values(colFilters).some(v => v && v.length > 0)) || (typeof filterIssue !== 'undefined' && filterIssue !== 'all');

    const clearAllFilters = () => {
        if (typeof setSearchTerm === 'function') setSearchTerm('');
        if (typeof setFilterCategory === 'function') setFilterCategory('');
        if (typeof setFilterType === 'function') setFilterType('');
        if (typeof setFilterItem === 'function') setFilterItem('');
        if (typeof setFilterVendor === 'function') setFilterVendor('');
        if (typeof setFilterQty === 'function') setFilterQty('');
        if (typeof setFilterTotal === 'function') setFilterTotal('');
        if (typeof setColFilters === 'function') setColFilters({});
        if (typeof setActiveFilterCol === 'function') setActiveFilterCol(null);
        if (typeof setFilterIssue === 'function') setFilterIssue('all');
    };

    const uploadingState = useState(false);
    const [uploading, setUploading] = uploadingState;
    const [inlineBillUploading, setInlineBillUploading] = useState(false);

    const handleInlineBillUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setInlineBillUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                setMasterForm(prev => ({ ...prev, billPath: data.path }));
                showToast('Bill uploaded', 'success');
            } else {
                showToast('Upload failed', 'error');
            }
        } catch {
            showToast('Upload error', 'error');
        } finally {
            setInlineBillUploading(false);
        }
    };

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const [logCategories, setLogCategories] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const [selectedIds, setSelectedIds] = useState([]);

    const [isDownloadOpen, setIsDownloadOpen] = useState(false);

    const [isEntrySectionOpen, setIsEntrySectionOpen] = useState(true);
    const [viewItem, setViewItem] = useState(null);
    const [isEditingVendor, setIsEditingVendor] = useState(false);
    const [tempVendor, setTempVendor] = useState('');
    const [isMasterManagerOpen, setIsMasterManagerOpen] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [visibleEntryCols, setVisibleEntryCols] = useState({
        qty: true,
        gst: true,
        total: true,
        discount: true,
        grandTotal: true,
        mrp: true,
        rate: true,
        stockOut: true,
    });
    const [visibleHistoryCols, setVisibleHistoryCols] = useState({
        date: true,
        type: true,
        product: true,
        qty: true,
        total: true,
        discount: true,
        grandTotal: true,
        rate: true,
        note: true,
    });
    const [isHideShowDropdownOpen, setIsHideShowDropdownOpen] = useState(false);
    const hideShowDropdownRef = useRef(null);

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

    // Master Form: Vendor, Bill, etc.

    const [masterForm, setMasterForm] = useState({

        vendor: '',

        subType: 'PURCHASE',

        narration: '',

        billPath: '',

        billName: '',

        date: (() => {

            const now = new Date();

            const offset = now.getTimezoneOffset() * 60000;

            return new Date(now.getTime() - offset).toISOString().slice(0, 16);

        })()

    });



    // List of items to be submitted

    const getEmptyRow = () => ({
        tempId: Date.now() + Math.random(),
        item: '', itemName: '', itemUnit: '', category: '', quantity: '', mrp: '', isMrpLinked: true, rate: '', gstRate: '',
        gstAmount: '', discount: '', totalAmt: '', grandTotal: '',
        isDirectOut: false, outQty: '', outDept: '', outEvent: '', outNarration: ''
    });

    const [itemsList, setItemsList] = useState([getEmptyRow()]);



    const types = logCategories.map(c => c.name);

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

    const fetchTransactions = React.useCallback(async () => {
        try {
            const companyId = isReadOnly ? (searchParams.get('companyId') || undefined) : selectedCompanyIds[0];
            const query = companyId ? `&companyId=${companyId}` : '';
            const res = await fetch(`/api/kitchen/transactions?type=IN&section=dairy${query}`);
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }, [isReadOnly, searchParams, selectedCompanyIds]);



    // Reset pagination when search term or company changes

    useEffect(() => {

        setCurrentPage(1);

    }, [searchTerm, filterItem, filterCategory, filterQty, filterTotal, filterVendor, filterType, searchParams]);



    useEffect(() => {

        const companyId = searchParams.get('companyId');

        const query = companyId ? `?companyId=${companyId}` : '';

        fetch(`/api/kitchen/items?section=dairy${query ? query.replace('?', '&') : ''}`).then(res => res.json()).then(setItems);

        fetch('/api/log-categories')

            .then(res => res.json())

            .then(data => {

                if (Array.isArray(data)) {

                    setLogCategories(data);

                    // Set default subType if available

                    if (data.length > 0) {

                        const defaultCat = data.find(c => c.name === 'PURCHASE') || data[0];

                        setMasterForm(prev => ({ ...prev, subType: defaultCat.name }));

                    }

                }

            })

            .catch(err => console.error('Error fetching log categories:', err));

        // populate departments/events for direct out

        fetch('/api/departments')

            .then(r => r.json())

            .then(d => Array.isArray(d) && setDepartments(d))

            .catch(() => { });

        fetch('/api/events')

            .then(r => r.json())

            .then(e => Array.isArray(e) && setEvents(e))

            .catch(() => { });

        fetchTransactions();

    }, [fetchTransactions, searchParams]);

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
                if (
                    event.target.closest('.dropdown-menu') ||
                    event.target.closest('[role="dialog"]') ||
                    event.target.closest('[data-dropdown-id]') ||
                    event.target.closest('[data-searchselect-id]') ||
                    event.target.closest('[data-datetime-picker]') ||
                    event.target.closest('[data-col-filter-root="true"]')
                ) {
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



    // Handle Master Form Changes

    const handleMasterChange = (e) => {

        const { name, value } = e.target;

        setMasterForm(prev => ({ ...prev, [name]: value }));

    };



    // Handle Item Selection

    const calculateValues = (totalAmt, gstAmount, qty, discount) => {

        const base = parseFloat(totalAmt) || 0;

        const gst = parseFloat(gstAmount) || 0;

        const disc = parseFloat(discount) || 0;

        const q = parseFloat(qty) || 0;



        const effectiveBase = base - disc;

        const gTotal = effectiveBase + gst;

        const rate = q > 0 ? (effectiveBase / q).toFixed(2) : '';



        return {

            grandTotal: gTotal.toString(),

            rate: rate

        };

    };

    const formatMoneyValue = (value) => {
        if (!value || Number(value) === 0) return '';
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue.toFixed(2) : '';
    };
    const recalculateRow = (row, field) => {
        const updated = { ...row };
        const qty = Number(updated.quantity) || 0;
        const discount = Number(updated.discount) || 0;
        const gstRate = Number(updated.gstRate) || 0;
        const isMrpLinked = updated.isMrpLinked !== false;

        const currentMrp = Number(updated.mrp) || 0;
        const currentTotalAmt = Number(updated.totalAmt) || 0;
        const currentGrandTotal = Number(updated.grandTotal) || 0;

        if (field === 'mrp') {
            const grandTotal = currentMrp * qty;
            updated.grandTotal = formatMoneyValue(grandTotal);
            const totalAmt = (grandTotal + discount) / (1 + gstRate / 100);
            updated.totalAmt = formatMoneyValue(totalAmt);
            updated.gstAmount = formatMoneyValue(totalAmt * gstRate / 100);
            if (isMrpLinked) updated.rate = updated.mrp;
        } else if (field === 'grandTotal') {
            if (qty > 0) {
                updated.mrp = formatMoneyValue(currentGrandTotal / qty);
                if (isMrpLinked) updated.rate = updated.mrp;
            }
            const totalAmt = (currentGrandTotal + discount) / (1 + gstRate / 100);
            updated.totalAmt = formatMoneyValue(totalAmt);
            updated.gstAmount = formatMoneyValue(totalAmt * gstRate / 100);
        } else if (field === 'totalAmt') {
            const gstAmount = (currentTotalAmt * gstRate) / 100;
            updated.gstAmount = formatMoneyValue(gstAmount);
            const grandTotal = currentTotalAmt + gstAmount - discount;
            updated.grandTotal = formatMoneyValue(grandTotal);
            if (qty > 0) {
                updated.mrp = formatMoneyValue(grandTotal / qty);
                if (isMrpLinked) updated.rate = updated.mrp;
            }
        } else if (['gstRate', 'discount'].includes(field)) {
            const gstAmount = (currentTotalAmt * gstRate) / 100;
            updated.gstAmount = formatMoneyValue(gstAmount);
            const grandTotal = currentTotalAmt + gstAmount - discount;
            updated.grandTotal = formatMoneyValue(grandTotal);
            if (qty > 0) {
                updated.mrp = formatMoneyValue(grandTotal / qty);
                if (isMrpLinked) updated.rate = updated.mrp;
            }
        } else if (['quantity', 'isMrpLinked'].includes(field)) {
            const grandTotal = currentMrp * qty;
            updated.grandTotal = formatMoneyValue(grandTotal);
            const totalAmt = (grandTotal + discount) / (1 + gstRate / 100);
            updated.totalAmt = formatMoneyValue(totalAmt);
            updated.gstAmount = formatMoneyValue(totalAmt * gstRate / 100);
            if (isMrpLinked) updated.rate = updated.mrp;
        }

        return updated;
    };


    const handleRowChange = (tempId, field, value) => {
        setItemsList(prevList => prevList.map(row => {
            if (row.tempId !== tempId) return row;
            const updated = { ...row, [field]: value };

            if (field === 'item') {
                const selectedItem = items.find(i => i._id === value);
                updated.itemName = selectedItem ? selectedItem.name : '';
                updated.itemUnit = selectedItem ? (selectedItem.unit?.name || selectedItem.unit) : '';
                updated.category = selectedItem ? selectedItem.category : '';
                if (editingId) {
                    if (!updated.gstRate && selectedItem) {
                        updated.gstRate = selectedItem.gst || '';
                    }
                    if (!updated.mrp && selectedItem?.mrp) {
                        updated.mrp = formatMoneyValue(selectedItem.mrp);
                    }
                    if (!updated.rate && updated.isMrpLinked !== false && selectedItem?.mrp) {
                        updated.rate = formatMoneyValue(selectedItem.mrp);
                    }
                } else {
                    updated.gstRate = selectedItem ? (selectedItem.gst || '') : '';
                    updated.mrp = selectedItem?.mrp ? formatMoneyValue(selectedItem.mrp) : '';
                    updated.rate = updated.isMrpLinked !== false && selectedItem?.mrp ? formatMoneyValue(selectedItem.mrp) : '';
                    updated.totalAmt = '';
                    updated.grandTotal = '';
                    updated.gstAmount = '';
                }
            }

            if (field === 'isMrpLinked') {
                updated.isMrpLinked = Boolean(value);
            }
            return recalculateRow(updated, field);
        }));
    };

    const getItemDetails = (itemId) => items.find(i => i._id === itemId);

    const handleAddItem = (e) => {
        if (e) e.preventDefault();
        setItemsList(prev => [...prev, getEmptyRow()]);
    };

    const handleRemoveItem = (tempId) => {
        setItemsList(prev => prev.filter(i => i.tempId !== tempId));
    };



    const handleFileUpload = async (e) => {

        const file = e.target.files[0];

        if (!file) return;



        setUploading(true);

        const formData = new FormData();

        formData.append('file', file);



        try {

            const res = await fetch('/api/upload', {

                method: 'POST',

                body: formData

            });

            const data = await res.json();

            if (res.ok) {

                setMasterForm(prev => ({ ...prev, billPath: data.path }));

            } else {

                showToast('File upload failed', 'error');

            }

        } catch (error) {

            console.error('Upload error:', error);

            showToast('Upload error', 'error');

        } finally {

            setUploading(false);

        }

    };


    const handleBulkSubmit = async () => {
        let finalItems = itemsList.filter(item => item.item && item.quantity && item.totalAmt);
        if (finalItems.length === 0) {
            showToast("Please add at least one item or complete the current item form.", 'warning');
            return;
        }


        // Validate Direct Out fields if requested
        for (const item of finalItems) {
            if (item.isDirectOut) {
                if (!item.outQty || Number(item.outQty) <= 0) {
                    showToast(`Please enter a valid Out Quantity for ${item.itemName}`, 'warning');
                    return;
                }
                if (!item.outDept) {
                    showToast(`Please select a Department for ${item.itemName}`, 'warning');
                    return;
                }
                if (!item.outEvent) {
                    showToast(`Please select an Event for ${item.itemName}`, 'warning');
                    return;
                }
                if (Number(item.outQty) > Number(item.quantity)) {
                    showToast(`Out Quantity cannot exceed In Quantity for ${item.itemName}`, 'warning');
                    return;
                }
            }
        }

        try {
            const targetCompanyId = isReadOnly ? (searchParams.get('companyId') || undefined) : selectedCompanyIds[0];

            // Using sequential loop
            for (const item of finalItems) {
                const body = {
                    type: 'IN',
                    ...masterForm,
                    ...item,
                    totalAmount: Number(item.totalAmt) - Number(item.discount || 0),
                    companyId: targetCompanyId
                };
                delete body.tempId;
                delete body.itemName;
                delete body.itemUnit;
                delete body.isMrpLinked;
                delete body.isDirectOut;
                delete body.outQty;
                delete body.outDept;
                delete body.outEvent;
                delete body.outNarration;

                const res = await fetch('/api/kitchen/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(`Failed to save item ${item.itemName}: ${errorData.error || 'Unknown error'}`);
                }

                const data = await res.json();
                const newBatchId = data._id;

                // if auto direct out requested, fire an OUT transaction linked to this IN
                if (item.isDirectOut && newBatchId) {
                    const outBody = {
                        type: 'OUT',
                        item: item.item,
                        category: item.category,
                        quantity: item.outQty,
                        rate: item.rate,
                        gstRate: 0,
                        gstAmount: 0,
                        discount: 0,
                        grandTotal: '',
                        batchId: newBatchId,
                        department: item.outDept,
                        event: item.outEvent,
                        vendor: '',
                        billPath: '',
                        narration: item.outNarration || `Direct Out from Stock In`,
                        date: masterForm.date,
                        companyId: targetCompanyId // FIXED: Added missing companyId
                    };

                    const resOut = await fetch('/api/kitchen/transactions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(outBody),
                    });

                    if (!resOut.ok) {
                        const outError = await resOut.json();
                        console.error("Failed to auto-stock out item", item.itemName, outError.error);
                        showToast(`Auto-stock out failed for ${item.itemName}: ${outError.error}`, 'error');
                    }
                }
            }

            showToast('All items added successfully', 'success');
            fetchTransactions();
            setEditingId(null);
            setItemsList([getEmptyRow()]);
            setMasterForm(prev => ({ ...prev, vendor: '', narration: '', billPath: '' }));

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    };



    // Edit (Legacy Single Item Edit)

    const cancelInlineEdit = () => {
        setEditingId(null);
        setItemsList([getEmptyRow()]);
        setIsModalOpen(false);
        setMasterForm(prev => ({ ...prev, billName: '' }));
    };

    const handleEdit = (tx) => {
        if (editingId && editingId !== tx._id) {
            const ok = confirm('You have unsaved changes. Discard them and edit another row?');
            if (!ok) return;
            cancelInlineEdit();
        }

        setEditingId(tx._id);

        const selectedItem = items.find(i => i._id === (tx.item?._id || tx.item));



        setMasterForm({

            vendor: tx.vendor || '',

            subType: tx.subType?.name || tx.subType || 'PURCHASE',

            narration: tx.narration || '',

            billPath: tx.billPath || '',

            billName: tx.billName || (tx.billPath ? tx.billPath.split('/').pop() : ''),

            date: tx.date ? (() => {

                const d = new Date(tx.date);

                const offset = d.getTimezoneOffset() * 60000;

                return new Date(d.getTime() - offset).toISOString().slice(0, 16);

            })() : (() => {

                const now = new Date();

                const offset = now.getTimezoneOffset() * 60000;

                return new Date(now.getTime() - offset).toISOString().slice(0, 16);

            })()

        });

        const baseRow = {
            tempId: Date.now(),
            item: tx.item?._id || '',
            itemName: selectedItem ? selectedItem.name : '',
            itemUnit: selectedItem ? (selectedItem.unit?.name || selectedItem.unit) : '',
            category: tx.item?.category || (selectedItem ? selectedItem.category : ''),
            quantity: tx.quantity,
            mrp: tx.mrp ? formatMoneyValue(tx.mrp) : (selectedItem?.mrp ? formatMoneyValue(selectedItem.mrp) : ''),
            isMrpLinked: Number(tx.mrp || selectedItem?.mrp || 0) > 0 && Number(tx.rate || 0) === Number(tx.mrp || selectedItem?.mrp || 0),
            rate: tx.rate ? formatMoneyValue(tx.rate) : '',
            gstRate: tx.gstRate || (selectedItem ? selectedItem.gst : 0),
            gstAmount: tx.gstAmount || '',
            totalAmt: tx.totalAmount ? (Number(tx.totalAmount) + Number(tx.discount || 0)).toString() : '',
            grandTotal: tx.grandTotal || (tx.totalAmount ? (Number(tx.totalAmount) + Number(tx.discount || 0) + Number(tx.gstAmount || 0)).toString() : ''),
            discount: tx.discount || '',
            isDirectOut: false,
            outQty: '',
            outDept: '',
            outEvent: '',
            outNarration: ''
        };

        setItemsList([baseRow]);
        setIsModalOpen(false);

    };



    const handleUpdateSingle = async () => {

        try {

            const companyId = searchParams.get('companyId');
            let resolvedSubType = masterForm.subType;
            const subTypeObj = logCategories.find(c => c.name === masterForm.subType || String(c._id) === String(masterForm.subType));
            if (subTypeObj) {
                resolvedSubType = subTypeObj._id;
            } else if (resolvedSubType && String(resolvedSubType).length !== 24) {
                resolvedSubType = undefined;
            }

            const body = {

                id: editingId,

                type: 'IN',

                ...masterForm,
                subType: resolvedSubType,

                ...itemsList[0],
                totalAmount: Number(itemsList[0].totalAmt) - Number(itemsList[0].discount || 0)

            };

            if (companyId) body.companyId = companyId;

            // strip any direct-out helpers just in case
            delete body.isMrpLinked;

            delete body.isDirectOut;

            delete body.outQty;

            delete body.outDept;

            delete body.outEvent;

            delete body.outNarration;



            const res = await fetch('/api/kitchen/transactions', {

                method: 'PUT',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify(body),

            });

            if (res.ok) {

                showToast('Stock Updated Successfully', 'success');

                fetchTransactions();

                setIsModalOpen(false);

                setEditingId(null);

                setItemsList([getEmptyRow()]);

            } else {

                showToast('Failed to update', 'error');

            }

        } catch (error) {

            console.error(error);

        }

    };



    const handleDelete = async (id) => {

        if (!confirm('Are you sure you want to delete this transaction? This will revert stock changes.')) return;

        try {

            const res = await fetch(`/api/kitchen/transactions?id=${id}`, {

                method: 'DELETE'

            });

            if (res.ok) {

                showToast('Transaction deleted successfully', 'success');

                setSelectedIds(prev => prev.filter(item => item !== id));

                fetchTransactions();

            } else {

                showToast('Failed to delete transaction', 'error');

            }

        } catch (error) {

            console.error('Delete error:', error);

        }

    };



    const handleBulkDelete = async () => {

        if (!selectedIds.length) return;

        if (!confirm(`Are you sure you want to delete ${selectedIds.length} select transactions? This will revert stock changes for all.`)) return;



        try {

            let successCount = 0;

            for (const id of selectedIds) {

                const res = await fetch(`/api/kitchen/transactions?id=${id}`, {

                    method: 'DELETE'

                });

                if (res.ok) successCount++;

            }

            showToast(`Successfully deleted ${successCount} transactions`, 'success');

            setSelectedIds([]);

            fetchTransactions();

        } catch (error) {

            console.error('Bulk delete error:', error);

            showToast('Error during bulk deletion', 'error');

        }

    };



    const handleBulkExport = () => {

        const listToExport = selectedIds.length > 0

            ? transactions.filter(tx => selectedIds.includes(tx._id))

            : filteredTransactions;



        if (listToExport.length === 0) return showToast("No data to export", 'error');



        const dataToExport = listToExport.map(tx => ({

            Date: new Date(tx.date).toLocaleDateString('en-IN'),

            Time: new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),

            Item: tx.item?.name || '-',

            Category: tx.item?.category || '-',

            Quantity: tx.quantity,

            Unit: tx.item?.unit?.name || tx.item?.unit || '-',

            Rate: tx.rate,

            TotalAmount: tx.totalAmount,

            Vendor: tx.vendor || '-',

            User: tx.createdByName || '-',

            Narration: tx.narration || '-'

        }));



        const ws = XLSX.utils.json_to_sheet(dataToExport);

        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Stock In");

        XLSX.writeFile(wb, `${selectedIds.length > 0 ? 'Selected_' : ''}Milk_In_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);

    };




    const handleBulkExportPDF = async () => {
        const listToExport = selectedIds.length > 0
            ? transactions.filter(tx => selectedIds.includes(tx._id))
            : filteredTransactions;

        if (listToExport.length === 0) return showToast("No data to export", 'error');

        const dataToExport = listToExport.map(tx => [
            new Date(tx.date).toLocaleDateString('en-IN'),
            tx.item?.name || '-',
            tx.item?.category || '-',
            `${tx.quantity} ${tx.item?.unit?.name || tx.item?.unit || ''}`,
            tx.rate,
            Math.round(tx.grandTotal || (Number(tx.totalAmount) + Number(tx.gstAmount || 0))),
            tx.narration || '-'
        ]);

        const title = selectedIds.length > 0 ? "Selected Stock In Report" : "Milk & Dairy Inflow Report";
        const headers = ['Date', 'Item', 'Category', 'Quantity', 'Rate', 'Grand Total', 'Narration'];
        const fileName = `${selectedIds.length > 0 ? 'Selected_' : ''}Milk_In_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

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







    const isInvalidTransaction = (tx) => {
        const qty = Number(tx.quantity) || 0;
        const totalAmount = Number(tx.totalAmount) || 0;
        const mrp = Number(tx.mrp) || 0;
        const gstAmount = Number(tx.gstAmount) || 0;
        const rate = Number(tx.rate) || 0;

        const basicInvalid = !tx.item?.name || !tx.date || qty <= 0 || totalAmount <= 0 || !tx.item?.category || !tx.item?.unit;
        if (basicInvalid) return true;

        // Rate is ignored for validity according to user ("rate is not connected")
        // We only check if MRP * Qty matches the Total (Grand Total)
        if (mrp > 0) {
            const expectedGrandTotal = (mrp * qty);
            const actualGrandTotal = totalAmount + gstAmount;
            // Allow 1 rupee difference for rounding
            if (Math.abs(expectedGrandTotal - actualGrandTotal) > 1) return true;
        }
        return false;
    };

    const uniqueDates = [...new Set(transactions.map(t => new Date(t.date).toLocaleDateString('en-GB')))].sort((a, b) => b.split('/').reverse().join().localeCompare(a.split('/').reverse().join()));
    const uniqueProducts = [...new Set(transactions.map(t => t.item?.name).filter(Boolean))].sort();
    const uniqueVendors = [...new Set(transactions.map(t => t.vendor).filter(Boolean))].sort();
    const uniqueQtys = [...new Set(transactions.map(t => String(t.quantity || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueGstRates = [...new Set(transactions.map(t => String(t.gstRate || t.gstPercent || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueTotals = [...new Set(transactions.map(t => String(t.totalAmount || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueDiscounts = [...new Set(transactions.map(t => String(t.discount || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueGrandTotals = [...new Set(transactions.map(t => String(Math.round((Number(t.totalAmount) || 0) + (Number(t.gstAmount) || 0)))))].sort((a, b) => Number(a) - Number(b));
    const uniqueRates = [...new Set(transactions.map(t => String(t.rate || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueMrps = [...new Set(transactions.map(t => String(t.mrp || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueNarrations = [...new Set(transactions.map(t => t.narration || '-'))].sort();
    const uniqueSameOptions = ['Yes', 'No'];
    const uniqueCategories = [...new Set(transactions.map(t => typeof t.item?.category === 'object' ? t.item?.category?.name : t.item?.category).filter(Boolean))].sort();
    const uniqueTypes = [...new Set(transactions.map(t => typeof t.subType === 'object' ? t.subType?.name : (t.subType || t.type)).filter(Boolean))].sort();

    const filteredTransactions = transactions.filter(t => {
        const issueMatch = filterIssue === 'all' || isInvalidTransaction(t);


        const term = searchTerm.toLowerCase();

        const itemMatch = !filterItem || t.item?.name === filterItem;

        const categoryMatch = !filterCategory || t.item?.category === filterCategory;

        const vendorMatch = !filterVendor || t.vendor === filterVendor;

        const qtyMatch = !filterQty || t.quantity?.toString() === filterQty;

        const totalMatch = !filterTotal || t.totalAmount?.toString() === filterTotal;

        const typeMatch = !filterType || t.type === filterType || t.subType === filterType;




        const checkTerm = (obj, term) => {
            if (!obj) return false;
            if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
            return String(obj).toLowerCase().includes(term);
        };
        const searchMatch = !searchTerm || checkTerm(t, term);


        let colsMatch = true;
        if (colFilters.date?.length && !colFilters.date.includes(new Date(t.date).toLocaleDateString('en-GB'))) colsMatch = false;
        if (colFilters.product?.length && !colFilters.product.includes(t.item?.name)) colsMatch = false;
        if (colFilters.category?.length && !colFilters.category.includes(typeof t.item?.category === 'object' ? t.item?.category?.name : t.item?.category)) colsMatch = false;
        if (colFilters.type?.length && !colFilters.type.includes(typeof t.subType === 'object' ? t.subType?.name : (t.subType || t.type))) colsMatch = false;
        if (colFilters.qty?.length && !colFilters.qty.includes(String(t.quantity || 0))) colsMatch = false;
        if (colFilters.gst?.length && !colFilters.gst.includes(String(t.gstRate || t.gstPercent || 0))) colsMatch = false;
        if (colFilters.total?.length && !colFilters.total.includes(String(t.totalAmount || 0))) colsMatch = false;
        if (colFilters.discount?.length && !colFilters.discount.includes(String(t.discount || 0))) colsMatch = false;
        if (colFilters.gtotal?.length && !colFilters.gtotal.includes(String(Math.round((Number(t.totalAmount) || 0) + (Number(t.gstAmount) || 0))))) colsMatch = false;
        if (colFilters.same?.length && !colFilters.same.includes(t.isSameProduct ? 'Yes' : 'No')) colsMatch = false;
        if (colFilters.rate?.length && !colFilters.rate.includes(String(t.rate || 0))) colsMatch = false;
        if (colFilters.mrp?.length && !colFilters.mrp.includes(String(t.mrp || 0))) colsMatch = false;
        if (colFilters.vendor?.length && !colFilters.vendor.includes(t.vendor)) colsMatch = false;
        if (colFilters.narration?.length && !colFilters.narration.includes(t.narration || '-')) colsMatch = false;
        if (colFilters.vendor?.length && !colFilters.vendor.includes(t.vendor)) colsMatch = false;

        return issueMatch && itemMatch && categoryMatch && vendorMatch && qtyMatch && totalMatch && typeMatch && searchMatch && colsMatch;

    });



    const hasActiveIssue = (transactions || []).some(isInvalidTransaction);

    const displayedGrandTotal = (selectedIds.length > 0 ? transactions.filter(tx => selectedIds.includes(tx._id)) : filteredTransactions)
        .reduce((acc, tx) => acc + (Number(tx.totalAmount) || 0) + (Number(tx.gstAmount) || 0), 0);

    const displayedGstTotal = (selectedIds.length > 0 ? transactions.filter(tx => selectedIds.includes(tx._id)) : filteredTransactions)
        .reduce((acc, tx) => acc + (Number(tx.gstAmount) || 0), 0);



    const paginatedTransactions = filteredTransactions.slice(

        (currentPage - 1) * itemsPerPage,

        currentPage * itemsPerPage

    );



    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);



    if (permsLoading) return <div className="p-8 text-center text-muted-foreground italic tracking-widest uppercase text-xs font-black">Loading permissions...</div>;



    if (!hasPermission('read')) {

        return (

            <div className="min-h-screen flex items-center justify-center bg-background">

                <div className="text-center p-10 bg-card rounded-[2rem] shadow-xl border border-border">
                    <h1 className="text-4xl font-black text-foreground mb-4">ACCESS DENIED</h1>
                    <p className="text-muted-foreground uppercase font-black tracking-widest text-xs">You do not have permission to view this page.</p>
                </div>

            </div>

        );

    }



    return (
        <div className="min-h-screen text-foreground">
            <MasterDataManager
                isOpen={isMasterManagerOpen}
                onClose={() => {
                    setIsMasterManagerOpen(false);
                    fetchTransactions();
                }}
                allowedTabs={['logCategories', 'departments', 'events']}
            />
            <main className="p-4 md:p-10 mb-20 md:mb-0 ">

                {/* Columns Hide / Unhide Dropdown & Top Bar */}
                <div className="flex justify-end items-center gap-4 mb-4 relative">
                    {!isEntrySectionOpen && (
                        <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-emerald-600 font-black text-base">                                                            <Check size={18} className="text-emerald-600 font-bold" strokeWidth={3} />
                            </span>
                            <span className="text-sm font-black text-[#882619]">{filteredTransactions.length}</span>
                            <span className="text-sm text-slate-700 font-bold">Entry</span>
                        </div>
                    )}

                    <div ref={hideShowDropdownRef} className="relative">
                        <button
                            onClick={() => setIsHideShowDropdownOpen(!isHideShowDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-xs font-bold text-slate-700 dark:text-zinc-200 hover:border-[#882619] transition-all shadow-xs cursor-pointer"
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
                                                    { key: 'qty', label: 'Qty' },
                                                    { key: 'gst', label: 'GST%' },
                                                    { key: 'total', label: 'Total' },
                                                    { key: 'discount', label: 'Discount' },
                                                    { key: 'grandTotal', label: 'Grand Total' },
                                                    { key: 'mrp', label: 'MRP' },
                                                    { key: 'rate', label: 'Rate' },
                                                    { key: 'stockOut', label: 'Stock Out' },
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
                                                    { key: 'type', label: 'Type' },
                                                    { key: 'product', label: 'Product Name' },
                                                    { key: 'qty', label: 'Qty' },
                                                    { key: 'total', label: 'Total' },
                                                    { key: 'discount', label: 'Discount' },
                                                    { key: 'grandTotal', label: 'Grand Total' },
                                                    { key: 'rate', label: 'MRP / Rate' },
                                                    { key: 'note', label: 'Note' },
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
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-xs font-bold transition-colors shadow-sm cursor-pointer ml-1"
                            >
                                <img src="/icons/action/Source.svg" className="w-5 h-5 block dark:hidden" alt="Source" />
                                <img src="/icons/action/SourceDark.svg" className="w-5 h-5 hidden dark:block" alt="Source" />
                                <span className="text-[#882619] dark:text-white font-black">Source</span>
                            </button>
                        </PermissionWrapper>
                    )}
                </div>

                <BulkUploadModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    type="IN"
                    category="DAIRY"
                    onSuccess={fetchTransactions}
                />
                <AnimatePresence>
                    <PermissionWrapper action="write">
                        {!isReadOnly && isEntrySectionOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-card rounded-lg shadow-xl shadow-2xl mb-8 overflow-hidden">
                                    <div className="p-8">
                                        {/* Header Part - Styled Tabs Navigation */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#F2E6E1] dark:border-zinc-800 gap-4 mb-6 pb-4">
                                            <div>
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <h1 className="text-3xl font-extrabold tracking-tight">
                                                        <span className="text-[#882619] dark:text-white">Milk & Buttermilk</span>{' '}
                                                        <span className="text-slate-800 dark:text-zinc-300">IN ENTRY</span>
                                                    </h1>
                                                    <div className="flex items-baseline gap-1 ml-0 sm:ml-4">
                                                        <span className="text-2xl font-light text-[#882619] dark:text-slate-400">{itemsList.length}</span>
                                                        <span className="text-xl font-light text-slate-400 dark:text-slate-500">Entry</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 self-end md:self-auto">
                                                <button
                                                    onClick={handleAddItem}
                                                    className="flex flex-col items-center gap-1 group text-slate-500 hover:text-[#882619] dark:text-white transition-all cursor-pointer bg-transparent border-0 outline-none animate-none mb-2"
                                                >
                                                    <img src="/icons/action/Add.svg" className="w-10 h-10 transition-transform group-hover:scale-105 block dark:hidden" alt="Add Item" />
                                                    <img src="/icons/action/AddDark.svg" className="w-10 h-10 transition-transform group-hover:scale-105 hidden dark:block" alt="Add Item" />
                                                    <span className="text-[10px] font-bold mt-1 text-[#882619] dark:text-white">Add Item</span>
                                                </button>

                                                <PermissionWrapper action="source">
                                                    <button
                                                        onClick={() => setIsMasterManagerOpen(true)}
                                                        className="flex flex-col items-center gap-1 group mt-2 text-slate-500 hover:text-[#882619] dark:text-white transition-all cursor-pointer bg-transparent border-0 outline-none animate-none"
                                                    >
                                                        <img src="/icons/action/Source.svg" className="w-7 h-7 transition-transform group-hover:scale-105 block dark:hidden" alt="Source" />
                                                        <img src="/icons/action/SourceDark.svg" className="w-7 h-7 transition-transform group-hover:scale-105 hidden dark:block" alt="Source" />
                                                        <span className="text-[10px] font-bold mt-1 text-[#575757] dark:text-white">Source</span>
                                                    </button>
                                                </PermissionWrapper>

                                                <div className="w-px h-10 bg-slate-200 dark:bg-zinc-800" />

                                                <button
                                                    onClick={() => setIsEntrySectionOpen(false)}
                                                    className="flex flex-col items-center gap-1 group text-slate-500 hover:text-[#882619] dark:text-white transition-all cursor-pointer bg-transparent border-0 outline-none animate-none"
                                                >
                                                    <img src="/icons/action/Data.svg" className="w-12 h-12 transition-transform group-hover:scale-105 block dark:hidden" alt="Data" />
                                                    <img src="/icons/action/DataDark.svg" className="w-12 h-12 transition-transform group-hover:scale-105 hidden dark:block" alt="Data" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-6 items-center mb-8 bg-[#EBEBEB]/40 dark:bg-zinc-800/60 rounded-none border-t border-b border-[#A4A4A4] dark:border-zinc-800 py-4 px-6 relative w-full overflow-hidden" style={{ '--primary': '#882619' }}>
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
                                                        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D]/40 dark:border-zinc-700 rounded-xl text-xs font-semibold text-[#882619] cursor-pointer select-none w-full h-[38px] shadow-sm hover:border-[#882619] transition-all">
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
                                                <label className="text-xs font-bold text-[#575757] dark:text-zinc-400 mb-1.5 block text-left tracking-wide">
                                                    <span className="text-[#882619] mr-1 font-bold">*</span>Type :
                                                </label>
                                                <SearchableSelect
                                                    options={types.map(t => ({ value: t, label: t }))}
                                                    value={masterForm.subType}
                                                    onChange={val => setMasterForm(prev => ({ ...prev, subType: val }))}
                                                    placeholder="Select Type"
                                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D]/40 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none transition-all text-center cursor-pointer flex items-center justify-between h-[38px] shadow-sm uppercase"
                                                />
                                            </div>

                                            <div className="flex-[2] w-full">
                                                <label className="text-xs font-bold text-[#575757] dark:text-zinc-400 mb-1.5 block text-left tracking-wide">
                                                    <span className="text-[#882619] mr-1 font-bold">*</span>Narration / Bill No :
                                                </label>
                                                <input type="text" name="narration" value={masterForm.narration} onChange={handleMasterChange} placeholder="Narration / Bill No" className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D]/40 dark:border-zinc-700 rounded-xl text-xs font-bold text-[#882619] outline-none focus:border-[#882619] focus:ring-1 focus:ring-[#882619]/25 transition-all placeholder:text-slate-400 h-[38px] shadow-sm" />
                                            </div>

                                            <div className="relative shrink-0 flex items-center justify-center pt-5">
                                                <label className={`w-[68px] h-[68px] bg-white dark:bg-zinc-800 border border-[#D4612D]/40 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center p-2 text-center group cursor-pointer transition-all hover:border-[#882619] shrink-0 shadow-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" disabled={uploading} />
                                                    {uploading ? (
                                                        <Loader2 size={16} className="animate-spin text-[#882619]" />
                                                    ) : masterForm.billPath ? (
                                                        <div className="flex flex-col items-center justify-center min-w-0 w-full h-full">
                                                            <ReceiptText size={16} className="text-emerald-500" />
                                                            <span className="text-[8px] font-semibold text-emerald-500 truncate w-full mt-0.5">{masterForm.billName || 'Uploaded'}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4612D" strokeWidth="2.2" className="mb-0.5 transition-transform group-hover:scale-105">
                                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                                <path d="M21 15l-5-5L5 21" />
                                                            </svg>
                                                            <span className="text-[8px] font-bold text-slate-400 group-hover:text-[#882619] leading-tight">click to browse</span>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Data Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left whitespace-nowrap border-separate border-spacing-0 min-w-[1250px] bg-white dark:bg-zinc-900">
                                                <thead>
                                                    <tr className="sticky top-0 z-20 whitespace-nowrap bg-white dark:bg-zinc-900">
                                                        <th className="py-3 px-3 w-12 text-center bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-zinc-100 border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">No.</th>
                                                        <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[22%] min-w-[260px] border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 gradient-border-r pl-4">Product Name <span className="text-[#882619] dark:text-[#D4612D] font-bold">*</span></th>
                                                        {visibleEntryCols.qty && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[8%] min-w-[100px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">Qty <span className="text-[#882619] dark:text-[#D4612D] font-bold">*</span></th>}
                                                        {visibleEntryCols.gst && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[6%] min-w-[80px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">GST%</th>}
                                                        {visibleEntryCols.total && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[8%] min-w-[100px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">Total <span className="text-[#882619] dark:text-[#D4612D] font-bold">*</span></th>}
                                                        {visibleEntryCols.discount && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[8%] min-w-[100px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">Dis.</th>}
                                                        {visibleEntryCols.grandTotal && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[10%] min-w-[120px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">Grand Total</th>}
                                                        {visibleEntryCols.mrp && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[9%] min-w-[120px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">MRP</th>}
                                                        {visibleEntryCols.rate && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[9%] min-w-[110px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">Rate</th>}
                                                        {visibleEntryCols.stockOut && <th className="py-3 px-3 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[6%] min-w-[80px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700 border-r border-[#A4A4A4] dark:border-zinc-800">Stock Out</th>}
                                                        <th className="py-3 px-4 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 w-[6%] min-w-[100px] text-center border-b-4 border-double border-[#B0A9A9] dark:border-zinc-700"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-xs font-bold text-foreground">
                                                    {itemsList.map((item, idx) => {
                                                        const selectedItem = getItemDetails(item.item);
                                                        return (
                                                            <tr key={item.tempId} className="bg-white dark:bg-zinc-900 group hover:bg-muted/30">
                                                                {/* Column 1: No. */}
                                                                <td className={`py-4 px-3 text-center text-slate-500 font-bold w-12 border-r border-[#A4A4A4] align-middle ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                    <div className="text-sm font-semibold">{idx + 1}</div>
                                                                    {item.isDirectOut && (
                                                                        <div className="text-[10px] text-slate-400 font-bold mt-2 leading-tight uppercase">Auto<br />Out</div>
                                                                    )}
                                                                </td>

                                                                {/* Column 2: Product Name */}
                                                                <td className={`py-4 px-3 border-r-2 border-[#D4612D] gradient-border-r align-top pl-4 ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                    <div className="flex flex-col min-w-[220px]">
                                                                        <div className="w-full">
                                                                            <SearchableSelect
                                                                                options={items.map(i => ({ value: i._id, label: i.name }))}
                                                                                value={item.item || ''}
                                                                                onChange={(val) => handleRowChange(item.tempId, 'item', val)}
                                                                                placeholder="Select Product"
                                                                                className="w-full text-sm font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent bg-transparent border-0 outline-none tracking-tight cursor-pointer uppercase py-0.5"
                                                                            />
                                                                            <div className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wide pl-1">
                                                                                {selectedItem ? `${(typeof selectedItem.category === 'object' ? selectedItem.category?.name : selectedItem.category) || '-'}` : ''}
                                                                            </div>
                                                                        </div>

                                                                        {item.isDirectOut && (
                                                                            <div className="flex flex-col gap-1.5 mt-3 w-full pl-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] font-bold text-slate-500 min-w-[40px] text-right">To :</span>
                                                                                    <div className="flex-1">
                                                                                        <SearchableSelect
                                                                                            options={departments.map(d => ({ value: d.name, label: d.name }))}
                                                                                            value={item.outDept || ''}
                                                                                            onChange={(val) => handleRowChange(item.tempId, 'outDept', val)}
                                                                                            placeholder="Select Dept"
                                                                                            className="w-full text-[11px] font-bold text-[#882619] bg-[#E5E3E0]/70 dark:bg-zinc-800 border-0 rounded-lg py-1 px-2.5 outline-none cursor-pointer uppercase h-[28px]"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] font-bold text-slate-500 min-w-[40px] text-right">Event :</span>
                                                                                    <div className="flex-1">
                                                                                        <SearchableSelect
                                                                                            options={events.map(ev => ({ value: ev.name, label: ev.name }))}
                                                                                            value={item.outEvent || ''}
                                                                                            onChange={(val) => handleRowChange(item.tempId, 'outEvent', val)}
                                                                                            placeholder="Select Event"
                                                                                            className="w-full text-[11px] font-bold text-[#882619] bg-[#E5E3E0]/70 dark:bg-zinc-800 border-0 rounded-lg py-1 px-2.5 outline-none cursor-pointer uppercase h-[28px]"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>

                                                                {/* Column 3: Qty */}
                                                                {visibleEntryCols.qty && (
                                                                    <td className={`py-4 px-1 border-r border-[#A4A4A4] align-top ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <div className="flex flex-col gap-1.5 justify-center">
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.quantity}
                                                                                    onChange={e => handleRowChange(item.tempId, 'quantity', e.target.value)}
                                                                                    placeholder="0"
                                                                                    className="w-12 text-right text-xs font-bold text-slate-800 dark:text-zinc-100 bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners"
                                                                                />
                                                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight shrink-0">
                                                                                    {selectedItem?.unit ? (typeof selectedItem.unit === 'object' ? selectedItem.unit?.name : selectedItem.unit) : ''}
                                                                                </span>
                                                                            </div>

                                                                            {item.isDirectOut && (
                                                                                <div className="flex flex-col gap-1.5 mt-2 pt-1.5 border-t border-dashed border-[#A4A4A4]">
                                                                                    <div className="flex items-center justify-center gap-1">
                                                                                        <input
                                                                                            type="number"
                                                                                            value={item.outQty}
                                                                                            onChange={e => handleRowChange(item.tempId, 'outQty', e.target.value)}
                                                                                            placeholder="Out Qty"
                                                                                            className="w-12 text-right text-xs font-bold text-slate-800 dark:text-zinc-100 bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners"
                                                                                        />
                                                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight shrink-0">
                                                                                            {selectedItem?.unit ? (typeof selectedItem.unit === 'object' ? selectedItem.unit?.name : selectedItem.unit) : ''}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="w-full border-t border-[#A4A4A4] my-1" />
                                                                                    <div className="flex flex-col items-center justify-center leading-tight">
                                                                                        <span className="text-[11px] font-bold text-slate-800">
                                                                                            {formatIndianNumber(selectedItem?.currentStock || 0)} {selectedItem?.unit ? (typeof selectedItem.unit === 'object' ? selectedItem.unit?.name : selectedItem.unit) : ''}
                                                                                        </span>
                                                                                        <span className="text-[9px] text-slate-400 font-semibold leading-none">Current Stock</span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {/* Column 4: GST% */}
                                                                {visibleEntryCols.gst && (
                                                                    <td className={`py-4 px-1 border-r border-[#A4A4A4] align-middle text-center ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <div className="flex items-center justify-center gap-0.5">
                                                                            <input
                                                                                type="number"
                                                                                value={item.gstRate}
                                                                                onChange={e => handleRowChange(item.tempId, 'gstRate', e.target.value)}
                                                                                placeholder="0"
                                                                                className="w-8 text-right text-xs font-bold text-slate-800 dark:text-zinc-100 bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners"
                                                                            />
                                                                            <span className="text-xs font-bold text-slate-500">%</span>
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {/* Column 5: Total */}
                                                                {visibleEntryCols.total && (
                                                                    <td className={`py-4 px-1 border-r border-[#A4A4A4] align-middle text-center ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <div className="flex items-center justify-center gap-0.5">
                                                                            <span className="text-xs font-bold text-slate-500">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={item.totalAmt}
                                                                                onChange={e => handleRowChange(item.tempId, 'totalAmt', e.target.value)}
                                                                                placeholder="0.00"
                                                                                className="w-16 text-left text-xs font-bold text-slate-800 dark:text-zinc-100 bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {/* Column 6: Dis. */}
                                                                {visibleEntryCols.discount && (
                                                                    <td className={`py-4 px-1 border-r border-[#A4A4A4] align-middle text-center ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <div className="flex items-center justify-center gap-0.5">
                                                                            <span className="text-xs font-bold text-slate-500">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={item.discount}
                                                                                onChange={e => handleRowChange(item.tempId, 'discount', e.target.value)}
                                                                                placeholder="0.00"
                                                                                className="w-12 text-left text-xs font-bold text-slate-800 dark:text-zinc-100 bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {/* Column 7: Grand Total */}
                                                                {visibleEntryCols.grandTotal && (
                                                                    <td className={`py-4 px-1 border-r border-[#A4A4A4] align-top text-center ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <div className="flex flex-col justify-center items-center">
                                                                            <div className="flex items-center justify-center gap-0.5">
                                                                                <span className="text-xs font-bold text-[#882619]">₹</span>
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.grandTotal}
                                                                                    onChange={e => handleRowChange(item.tempId, 'grandTotal', e.target.value)}
                                                                                    placeholder="0.00"
                                                                                    className="w-18 text-left text-xs font-black text-[#882619] dark:text-white bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners"
                                                                                />
                                                                            </div>
                                                                            {item.isDirectOut && (
                                                                                <div className="flex flex-col items-center justify-center mt-6 text-[#882619] font-bold text-xs">
                                                                                    <span>₹ {formatIndianNumber(Math.round((Number(item.outQty) || 0) * (Number(item.rate) || 0)))}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {/* Column 8: MRP */}
                                                                {visibleEntryCols.mrp && (
                                                                    <td className={`py-4 px-1 border-r border-[#A4A4A4] align-middle text-center ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <div className="flex items-center justify-center gap-0.5">
                                                                            <span className="text-xs font-bold text-slate-500">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={item.mrp}
                                                                                onChange={e => handleRowChange(item.tempId, 'mrp', e.target.value)}
                                                                                placeholder="0.00"
                                                                                className="w-12 text-left text-xs font-bold text-slate-800 dark:text-zinc-100 bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners"
                                                                            />
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={item.isMrpLinked !== false}
                                                                                onChange={e => handleRowChange(item.tempId, 'isMrpLinked', e.target.checked)}
                                                                                title="Link Rate to MRP"
                                                                                className="rounded-sm border-[#D4612D]/40 w-3 h-3 text-[#D4612D] focus:ring-[#D4612D] cursor-pointer shrink-0 ml-1"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {/* Column 9: Rate */}
                                                                {visibleEntryCols.rate && (
                                                                    <td className={`py-4 px-1 border-r border-[#A4A4A4] align-middle text-center ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <div className="flex items-center justify-center gap-0.5">
                                                                            <span className="text-xs font-bold text-slate-500">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={item.rate}
                                                                                onChange={e => handleRowChange(item.tempId, 'rate', e.target.value)}
                                                                                readOnly={item.isMrpLinked !== false}
                                                                                placeholder="0.00"
                                                                                className={`w-12 text-left text-xs font-bold bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-[#D4612D]/40 focus:rounded-md py-1 no-spinners ${item.isMrpLinked !== false ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800 dark:text-zinc-100'}`}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {/* Column 10: Stock Out checkbox */}
                                                                {visibleEntryCols.stockOut && (
                                                                    <td className={`py-4 px-3 text-center border-r border-[#A4A4A4] align-middle ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={item.isDirectOut}
                                                                            onChange={e => handleRowChange(item.tempId, 'isDirectOut', e.target.checked)}
                                                                            className="rounded-md border-[#D4612D] w-4 h-4 text-[#D4612D] focus:ring-[#D4612D] cursor-pointer shadow-sm focus:ring-offset-0 accent-[#D4612D]"
                                                                        />
                                                                    </td>
                                                                )}

                                                                {/* Column 11: Actions */}
                                                                <td className={`py-4 px-3 text-center align-middle ${idx === itemsList.length - 1 ? 'last-row-double-border' : 'border-b border-[#A4A4A4]'}`}>
                                                                    <div className="flex justify-center items-center gap-3">
                                                                        {item.item ? (
                                                                            <span className="text-emerald-600 font-extrabold text-sm" title="Valid Entry">                                                            <Check size={18} className="text-emerald-600 font-bold" strokeWidth={3} />
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-red-500 font-extrabold text-sm" title="Invalid Entry: Check required fields">                                                            <X size={18} className="text-red-500 font-bold" strokeWidth={3} />
                                                                            </span>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => itemsList.length > 1 ? handleRemoveItem(item.tempId) : handleRowChange(item.tempId, 'item', '')}
                                                                            className="hover:scale-110 active:scale-95 transition-transform"
                                                                            title="Remove Item"
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

                                        {/* Footer Summary Section matching image 1 */}
                                        <div className="gradient-border bg-[#F2F2F2] dark:bg-zinc-800/30 py-6 mt-4 flex flex-col items-center justify-center gap-3">
                                            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[17px] font-bold text-[#7C7470] dark:text-slate-400">
                                                <span>
                                                    Total :{' '}
                                                    <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-extrabold">
                                                        ₹ {formatIndianNumber(itemsList.reduce((acc, i) => acc + (Number(i.totalAmt) || 0), 0))}
                                                    </span>
                                                </span>
                                                <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-black text-xl px-1">+</span>
                                                <span>
                                                    Total GST :{' '}
                                                    <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-extrabold">
                                                        ₹ {formatIndianNumber(itemsList.reduce((acc, i) => acc + (Number(i.gstAmount) || 0), 0))}
                                                    </span>
                                                </span>
                                                <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-black text-xl px-1">-</span>
                                                <span>
                                                    Discount :{' '}
                                                    <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-extrabold">
                                                        ₹ {formatIndianNumber(itemsList.reduce((acc, i) => acc + (Number(i.discount) || 0), 0))}
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="w-[85%] max-w-4xl border-t border-dashed border-[#A4A4A4] my-1" />

                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent tracking-wide">
                                                    Grand Total : ₹ {formatIndianNumber(itemsList.reduce((acc, i) => acc + (Number(i.grandTotal) || 0), 0))}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-start px-4">
                                            <button
                                                onClick={handleBulkSubmit}
                                                disabled={uploading || itemsList.filter(item => item.item).length === 0}
                                                className="gradient-btn"
                                            >
                                                Save Product
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        )}
                    </PermissionWrapper>
                </AnimatePresence>



                {!isEntrySectionOpen && (
                    <div className="bg-card rounded-xl shadow-2xl shadow-primary/5 overflow-hidden">
                        {/* Header for Table Area - Styled Tabs Navigation */}
                        <div className="p-6 md:p-8 border-t border-[#D4612D] border-b border-[#D4612D] bg-[#ECEAE6]/70 dark:bg-[#222222] dark:border-zinc-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex items-center gap-6 flex-wrap">
                                <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight">
                                        <span className="text-[#882619] dark:text-white">Milk & Buttermilk</span>{' '}
                                        <span className="text-slate-800 dark:text-zinc-300">IN DATA</span>
                                    </h1>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 italic mt-1.5 font-medium">
                                        New Product Registration List
                                    </p>
                                </div>
                                <div className="flex flex-col items-start justify-center pl-6 border-l border-slate-200 dark:border-zinc-800">
                                    <span className="text-xl font-black text-[#D4612D]">
                                        ₹ {formatIndianNumber(displayedGrandTotal)}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Grand Total
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                {/* Search Input */}
                                <div className="relative group w-48 sm:w-64">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-[#D4612D] transition-colors">
                                        <Search size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Quick Search"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D]/60 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none shadow-xs focus:border-[#882619] transition-all"
                                    />
                                </div>

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
                        <div className="">
                            <div className="bg-card overflow-hidden mb-8 shadow-sm">
                                <div className="overflow-x-auto overflow-y-auto max-h-[72vh] scroll-smooth">
                                    <table className="w-full text-left border-separate border-spacing-0 min-w-[1100px] history-grid-table-in mt-6">
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
                                                {visibleHistoryCols.date && (
                                                    <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900">
                                                        <div className="flex items-center gap-1.5 justify-start text-slate-900 dark:text-zinc-100">
                                                            <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                            <span>Date</span>
                                                            <TableColumnFilter colKey="date" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueDates} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </div>
                                                    </th>
                                                )}
                                                {visibleHistoryCols.product && (
                                                    <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 border-r-2 border-[#882619]">
                                                        <div className="flex items-center gap-1.5 justify-start text-slate-900 dark:text-zinc-100">
                                                            <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                            <span>Product Name</span>
                                                            <TableColumnFilter colKey="product" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueProducts} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                            <TableColumnFilter colKey="category" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueCategories} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                            <TableColumnFilter colKey="type" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueTypes} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </div>
                                                    </th>
                                                )}
                                                {visibleHistoryCols.qty && (
                                                    <th className="py-4 px-6 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center">
                                                        <div className="flex items-center gap-1.5 justify-center text-slate-900 dark:text-zinc-100">
                                                            <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                            <span>Qty.</span>
                                                            <TableColumnFilter colKey="qty" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueQtys} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </div>
                                                    </th>
                                                )}
                                                {visibleHistoryCols.total && (
                                                    <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="flex items-center gap-1 justify-center text-slate-900 dark:text-zinc-100">
                                                                <span className="text-[#882619] dark:text-[#D4612D] font-black">*</span>
                                                                <span>Total</span>
                                                                <TableColumnFilter colKey="total" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueTotals} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                                <TableColumnFilter colKey="gst" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueGstRates} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">GST%</span>
                                                        </div>
                                                    </th>
                                                )}
                                                {(visibleHistoryCols.grandTotal || visibleHistoryCols.discount) && (
                                                    <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="flex items-center gap-1 justify-center text-slate-900 dark:text-zinc-100">
                                                                <span>Grand Total</span>
                                                                <TableColumnFilter colKey="gtotal" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueGrandTotals} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                                <TableColumnFilter colKey="discount" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueDiscounts} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Discount</span>
                                                        </div>
                                                    </th>
                                                )}
                                                {visibleHistoryCols.rate && (
                                                    <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <div className="flex items-center gap-0.5 text-slate-900 dark:text-zinc-100">
                                                                <span className="text-[#922E1C] dark:text-[#D4612D] font-black">*</span>
                                                                <span>MRP</span>
                                                                <TableColumnFilter colKey="mrp" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueMrps} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                            </div>
                                                            <span className="text-slate-400 dark:text-zinc-500">|</span>
                                                            <div className="flex items-center gap-0.5 text-slate-900 dark:text-zinc-100">
                                                                <span>Rate</span>
                                                                <TableColumnFilter colKey="rate" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueRates} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                            </div>
                                                        </div>
                                                    </th>
                                                )}
                                                {visibleHistoryCols.note && (
                                                    <th className="py-4 px-3 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900">
                                                        <div className="flex items-center gap-1.5 justify-start text-slate-900 dark:text-zinc-100">
                                                            <span>Note</span>
                                                            <TableColumnFilter colKey="narration" title="" iconSrc="/icons/action/Fillter.svg" options={uniqueNarrations} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                                        </div>
                                                    </th>
                                                )}
                                                <th className="py-4 px-4 text-[14px] font-black text-muted-foreground uppercase bg-muted dark:bg-zinc-900 text-center whitespace-nowrap text-slate-900 dark:text-zinc-100">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {paginatedTransactions.length > 0 ? (
                                                paginatedTransactions.map((tx, idx) => {
                                                    const hasEntryIssue = isInvalidTransaction(tx);
                                                    const isEditing = editingId === tx._id;
                                                    const editingRow = isEditing ? itemsList[0] : null;

                                                    return (
                                                        <tr
                                                            key={tx._id}
                                                            ref={isEditing ? editingRef : null}
                                                            className={`transition-colors ${isEditing
                                                                ? 'bg-orange-50 ring-2 ring-inset ring-primary/40 relative z-10'
                                                                : hasEntryIssue
                                                                    ? 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100/60'
                                                                    : 'hover:bg-amber-50/40'
                                                                }`}
                                                        >
                                                            {/* Checkbox */}
                                                            <td className={`py-3.5 px-3 w-10 text-center align-middle ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(tx._id)}
                                                                    onChange={() => toggleSelectRow(tx._id)}
                                                                    className="rounded border border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                                                />
                                                            </td>

                                                            {/* Date & Time */}
                                                            {visibleHistoryCols.date && (
                                                                <td className={`py-3.5 px-3 align-middle min-w-[120px] ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                    {isEditing ? (
                                                                        <DateTimePicker
                                                                            isInline
                                                                            value={masterForm.date}
                                                                            onChange={val => setMasterForm({ ...masterForm, date: val })}
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            <div className={`text-[15px] font-black leading-tight ${hasEntryIssue ? 'text-red-650' : 'text-slate-900 dark:text-zinc-200'}`}>
                                                                                {new Date(tx.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                                                            </div>
                                                                            <div className={`text-[12px] font-bold mt-0.5 lowercase ${hasEntryIssue ? 'text-red-400' : 'text-slate-400'}`}>
                                                                                {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </td>
                                                            )}

                                                            {/* Product Name (Includes Image and Info) */}
                                                            {visibleHistoryCols.product && (
                                                                <td className={`py-3.5 px-3 align-middle min-w-[220px] border-r-2 border-[#882619] ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-zinc-700 shadow-sm">
                                                                            {tx.item?.image ? (
                                                                                <img
                                                                                    src={tx.item.image}
                                                                                    alt={tx.item.name || 'Product'}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-[20px] font-bold text-slate-400">
                                                                                    +
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {isEditing ? (
                                                                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                                                                                <SearchableSelect
                                                                                    options={items.map(i => ({ value: i._id, label: i.name }))}
                                                                                    value={editingRow?.item || ''}
                                                                                    onChange={val => handleRowChange(editingRow.tempId, 'item', val)}
                                                                                    placeholder="Select Product"
                                                                                    className="text-[14px] font-black bg-muted border border-border rounded-lg px-2 py-1.5 focus:border-primary outline-none cursor-pointer w-full uppercase"
                                                                                />
                                                                                {visibleHistoryCols.type && (
                                                                                    <div className="text-[13px] text-slate-700 font-black mt-0.5 tracking-wide">
                                                                                        {(() => {
                                                                                            const cat = editingRow?.category;
                                                                                            if (typeof cat === 'object') return cat?.name || '-';
                                                                                            const found = categories.find(c => c._id === cat);
                                                                                            return found ? found.name : cat || '-';
                                                                                        })()} | {masterForm.subType ? (types.find(t => t === masterForm.subType) || 'Purchase') : 'Purchase'}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex items-center flex-wrap">
                                                                                    <span className={`text-[16px] font-black leading-tight ${hasEntryIssue ? 'text-red-650' : 'bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent'} tracking-tight`}>
                                                                                        {tx.item?.name}
                                                                                    </span>
                                                                                    {tx.billPath && (
                                                                                        <a
                                                                                            href={tx.billPath}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="ml-2 inline-flex items-center justify-center p-1 bg-blue-50 dark:bg-blue-950 text-blue-500 hover:text-blue-600 rounded-md border border-blue-200 dark:border-blue-900 shadow-sm transition-all"
                                                                                            title={tx.billName || "View Bill"}
                                                                                        >
                                                                                            <ReceiptText size={12} strokeWidth={2.5} />
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                                {visibleHistoryCols.type && (
                                                                                    <div className="text-[11px] text-slate-400 font-bold mt-1.5 tracking-wide uppercase">
                                                                                        {(typeof tx.item?.category === 'object' ? tx.item?.category?.name : tx.item?.category)}{tx.item?.category && ' | '}{(typeof tx.subType === 'object' ? tx.subType?.name : tx.subType) || tx.type || 'Purchase'}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}

                                                            {/* Qty */}
                                                            {visibleHistoryCols.qty && (
                                                                <td className={`py-3.5 px-3 align-middle text-center ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        {isEditing ? (
                                                                            <input
                                                                                type="number"
                                                                                value={editingRow?.quantity ?? ''}
                                                                                onChange={(e) => editingRow && handleRowChange(editingRow.tempId, 'quantity', e.target.value)}
                                                                                className="text-[13px] font-black text-foreground bg-card border border-primary/40 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-20 text-center"
                                                                            />
                                                                        ) : (
                                                                            <span className={`text-[15px] font-black leading-tight ${hasEntryIssue ? 'text-red-650' : 'text-slate-900 dark:text-zinc-200'}`}>
                                                                                {tx.quantity} {(typeof tx.item?.unit === 'object' ? tx.item?.unit?.name : tx.item?.unit)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )}

                                                            {/* Total & GST% */}
                                                            {visibleHistoryCols.total && (
                                                                <td className={`py-3.5 px-3 align-middle text-center ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                    {isEditing ? (
                                                                        <div className="flex flex-col gap-1 items-center">
                                                                            <div className="relative inline-block w-24">
                                                                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[11px] font-black text-muted-foreground/50 pointer-events-none">₹</span>
                                                                                <input
                                                                                    type="number"
                                                                                    value={editingRow?.totalAmt ?? ''}
                                                                                    onChange={(e) => editingRow && handleRowChange(editingRow.tempId, 'totalAmt', e.target.value)}
                                                                                    className="text-[13px] font-black text-foreground bg-card border border-primary/40 rounded-lg pl-4 pr-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full text-center"
                                                                                />
                                                                            </div>
                                                                            <div className="relative inline-block w-16 mt-1">
                                                                                <input
                                                                                    type="number"
                                                                                    value={editingRow?.gstRate ?? ''}
                                                                                    onChange={(e) => editingRow && handleRowChange(editingRow.tempId, 'gstRate', e.target.value)}
                                                                                    className="text-[13px] font-black text-foreground bg-card border border-primary/40 rounded-lg pr-4 pl-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full text-center text-xs"
                                                                                />
                                                                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/50 pointer-events-none">%</span>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`text-[15px] font-black ${hasEntryIssue ? 'text-red-500' : 'text-slate-900 dark:text-zinc-200'}`}>
                                                                                ₹ {formatIndianNumber((tx.totalAmount || 0) + (tx.discount || 0))}
                                                                            </span>
                                                                            <span className="text-[11px] font-bold text-slate-400 leading-none mt-1">
                                                                                {(tx.gstRate || tx.gstPercent || 0)}%
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            )}

                                                            {/* Grand Total & Discount */}
                                                            {(visibleHistoryCols.grandTotal || visibleHistoryCols.discount) && (
                                                                <td className={`py-3.5 px-3 align-middle text-center ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                    {isEditing ? (
                                                                        <div className="flex flex-col gap-1 items-center">
                                                                            {visibleHistoryCols.grandTotal && (
                                                                                <div className="relative inline-block w-24">
                                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[11px] font-black text-muted-foreground/50 pointer-events-none">₹</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={editingRow?.grandTotal ?? ''}
                                                                                        onChange={(e) => editingRow && handleRowChange(editingRow.tempId, 'grandTotal', e.target.value)}
                                                                                        className="text-[13px] font-black text-foreground bg-card border border-primary/40 rounded-lg pl-4 pr-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full text-center"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            {visibleHistoryCols.discount && (
                                                                                <div className="relative inline-block w-20 mt-1">
                                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/50 pointer-events-none">₹</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={editingRow?.discount ?? ''}
                                                                                        onChange={(e) => editingRow && handleRowChange(editingRow.tempId, 'discount', e.target.value)}
                                                                                        className="text-[11px] font-black text-foreground bg-card border border-primary/40 rounded-lg pl-4 pr-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full text-center text-xs"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center">
                                                                            {visibleHistoryCols.grandTotal && (
                                                                                <span className={`text-[15px] font-black leading-tight ${hasEntryIssue ? 'text-red-600' : 'text-[#D05E2C] dark:text-zinc-200'}`}>
                                                                                    ₹ {formatIndianNumber(Number(tx.grandTotal) || (Number(tx.totalAmount) || 0) + (Number(tx.gstAmount) || 0))}
                                                                                </span>
                                                                            )}
                                                                            {visibleHistoryCols.discount && (
                                                                                <span className="text-[11px] font-bold text-slate-400 leading-none mt-1">
                                                                                    ₹ {formatIndianNumber(tx.discount || 0)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            )}

                                                            {/* MRP | Rate */}
                                                            {visibleHistoryCols.rate && (
                                                                <td className={`py-3.5 px-3 align-middle text-center ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                    {isEditing ? (
                                                                        <div className="flex flex-col gap-1 items-center">
                                                                            <div className="relative inline-block w-24 flex items-center gap-1">
                                                                                <div className="relative flex-1">
                                                                                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/50 pointer-events-none">₹</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={editingRow?.mrp ?? ''}
                                                                                        onChange={(e) => editingRow && handleRowChange(editingRow.tempId, 'mrp', e.target.value)}
                                                                                        className="text-[12px] font-black text-foreground bg-card border border-primary/40 rounded-lg pl-3.5 pr-1.5 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full text-center"
                                                                                    />
                                                                                </div>
                                                                                <input type="checkbox" checked={editingRow?.isMrpLinked !== false} onChange={e => handleRowChange(editingRow.tempId, 'isMrpLinked', e.target.checked)} className="rounded-sm border-border w-3 h-3 text-primary cursor-pointer shrink-0" />
                                                                            </div>
                                                                            <div className="relative inline-block w-24 mt-1">
                                                                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/50 pointer-events-none">₹</span>
                                                                                <input
                                                                                    type="number"
                                                                                    value={editingRow?.rate ?? ''}
                                                                                    readOnly={editingRow?.isMrpLinked !== false}
                                                                                    onChange={(e) => editingRow && editingRow.isMrpLinked === false && handleRowChange(editingRow.tempId, 'rate', e.target.value)}
                                                                                    className={`text-[12px] font-black bg-card border border-primary/40 rounded-lg pl-3.5 pr-1.5 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full text-center ${editingRow?.isMrpLinked !== false ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`text-[15px] font-bold text-slate-500 dark:text-zinc-400`}>
                                                                            ₹ {formatIndianNumber(tx.mrp)} <span className="text-slate-300">|</span> ₹ {formatIndianNumber(tx.rate)}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            )}

                                                            {/* Note */}
                                                            {visibleHistoryCols.note && (
                                                                <td className={`py-3.5 px-3 align-middle min-w-[160px] ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                    {isEditing ? (
                                                                        <div className="flex flex-col gap-1.5 w-full">
                                                                            <input
                                                                                type="text"
                                                                                value={masterForm.narration}
                                                                                onChange={(e) => setMasterForm({ ...masterForm, narration: e.target.value })}
                                                                                placeholder="Narration"
                                                                                className="text-xs font-bold text-foreground bg-card border border-primary/40 rounded-lg px-2 py-1 outline-none w-full"
                                                                            />
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <input
                                                                                    type="text"
                                                                                    value={masterForm.billName ?? ''}
                                                                                    onChange={(e) => setMasterForm({ ...masterForm, billName: e.target.value })}
                                                                                    placeholder="Doc name..."
                                                                                    className="text-[9px] font-bold text-foreground bg-card border border-primary/40 rounded-lg px-2 py-1 outline-none w-20"
                                                                                />
                                                                                <label className="cursor-pointer inline-flex items-center gap-1 group">
                                                                                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleInlineBillUpload} disabled={inlineBillUploading} />
                                                                                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 border border-orange-200 text-[8px] font-black uppercase text-orange-500 hover:bg-orange-100">
                                                                                        {inlineBillUploading ? '...' : <ReceiptText size={10} />}
                                                                                        <span>Bill</span>
                                                                                    </div>
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className={`text-[14px] font-semibold text-slate-800 dark:text-zinc-350 max-w-[200px] truncate block`}>
                                                                            {tx.narration || '-'}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            )}

                                                            {/* Actions */}
                                                            <td className={`py-3.5 px-4 align-middle text-center min-w-[80px] ${idx === paginatedTransactions.length - 1 ? 'history-last-row-double-border' : ''}`}>
                                                                <div className="flex justify-center items-center gap-2">
                                                                    {isEditing ? (
                                                                        <>
                                                                            <button
                                                                                onClick={handleUpdateSingle}
                                                                                disabled={uploading}
                                                                                title="Save"
                                                                                className="w-7 h-7 flex items-center justify-center text-emerald-600 font-extrabold text-sm hover:scale-110 active:scale-95 transition-transform"
                                                                            >
                                                                                <Check size={18} className="text-emerald-600 font-bold" strokeWidth={3} />

                                                                            </button>
                                                                            <button
                                                                                onClick={cancelInlineEdit}
                                                                                title="Cancel"
                                                                                className="w-7 h-7 flex items-center justify-center text-slate-500 font-extrabold text-sm hover:scale-110 active:scale-95 transition-transform"
                                                                            >
                                                                                <X size={18} className="text-red-500 font-bold" strokeWidth={3} />

                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => setViewItem(tx)}
                                                                                title="View"
                                                                                className="w-7 h-7 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                                                                            >
                                                                                <img src="/icons/action/View (1).svg" className="w-5 h-5" alt="View" />
                                                                            </button>
                                                                            {!isReadOnly && (
                                                                                <PermissionWrapper action="edit">
                                                                                    <button
                                                                                        onClick={() => handleEdit(tx)}
                                                                                        title="Edit"
                                                                                        className="w-7 h-7 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                                                                                    >
                                                                                        <img src="/icons/action/Edit.svg" className="w-5 h-5" alt="Edit" />
                                                                                    </button>
                                                                                </PermissionWrapper>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={10} className="py-12 text-center text-slate-400 font-extrabold text-sm uppercase tracking-wider">
                                                        No Milk & Buttermilk IN Entry
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                                totalItems={filteredTransactions.length}
                                colorTheme="orange"
                            />
                        </div>
                    </div>
                )}


                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-card rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-lg md:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-border"
                            >
                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    <div className="p-6 md:p-8 bg-muted border-b border-border">
                                        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight uppercase mb-6 md:mb-8">Edit Purchase</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                            <CustomSelect
                                                label="Log Category"
                                                value={masterForm.subType}
                                                onChange={e => setMasterForm({ ...masterForm, subType: e.target.value })}
                                                options={types}
                                            />
                                            <DateTimePicker
                                                label="Date"
                                                required
                                                value={masterForm.date}
                                                onChange={val => setMasterForm(prev => ({ ...prev, date: val }))}
                                            />

                                            <CustomInput
                                                label="Narration / Bill No."
                                                name="narration"
                                                value={masterForm.narration}
                                                onChange={handleMasterChange}
                                            />
                                            <div className="relative">
                                                <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-1 block">Upload Bill</label>
                                                <input
                                                    type="file"
                                                    className="w-full p-2 rounded text-sm"
                                                    onChange={handleFileUpload}
                                                    accept="image/*,.pdf"
                                                />
                                                {uploading && <p className="text-blue-500 text-xs font-bold absolute -bottom-4">Uploading...</p>}
                                                {masterForm.billPath && <p className="text-green-500 text-xs font-bold absolute -bottom-4">Uploaded</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                                            <div className="md:col-span-2 space-y-1.5 md:space-y-2">
                                                <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Item</label>
                                                <div className="relative">
                                                    <CustomSelect
                                                        className="w-full appearance-none px-4 md:px-5 py-2.5 md:py-3.5 bg-muted border border-border rounded-xl focus:border-primary outline-none transition-all font-bold text-foreground cursor-pointer text-sm"
                                                        value={itemsList[0]?.item}
                                                        onChange={e => handleRowChange(itemsList[0]?.tempId, 'item', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Select Item --</option>
                                                        {items.map(item => (
                                                            <option key={item._id} value={item._id}>
                                                                {item.name} ({item.unit?.name || item.unit}) {item.companyId?.name ? `- ${item.companyId.name}` : ''} - GST: {item.gst || 0}%
                                                            </option>
                                                        ))}
                                                    </CustomSelect>
                                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <CustomInput
                                                    label="Quantity"
                                                    type="number"
                                                    value={itemsList[0]?.quantity}
                                                    onChange={e => handleRowChange(itemsList[0]?.tempId, 'quantity', e.target.value)}
                                                    required
                                                />
                                                <CustomInput
                                                    label="Total Amt"
                                                    type="number"
                                                    value={itemsList[0]?.totalAmt}
                                                    onChange={e => handleRowChange(itemsList[0]?.tempId, 'totalAmt', e.target.value)}
                                                    required
                                                    iconPrefix="₹"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <CustomInput
                                                    label="GST"
                                                    type="number"
                                                    value={itemsList[0]?.gstAmount}
                                                    onChange={e => handleRowChange(itemsList[0]?.tempId, 'gstAmount', e.target.value)}
                                                    iconPrefix="₹"
                                                />
                                                <CustomInput
                                                    label="Rate"
                                                    value={itemsList[0]?.rate}
                                                    readOnly
                                                    className="bg-muted"
                                                    iconPrefix="₹"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <CustomInput
                                                    label="Grand Total"
                                                    value={itemsList[0]?.grandTotal}
                                                    readOnly
                                                    className="bg-muted"
                                                    iconPrefix="₹"
                                                />
                                                <CustomInput
                                                    label="Discount"
                                                    type="number"
                                                    value={itemsList[0]?.discount}
                                                    onChange={e => handleRowChange(itemsList[0]?.tempId, 'discount', e.target.value)}
                                                    placeholder="0"
                                                    iconPrefix="₹"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUpdateSingle}
                                            disabled={uploading}
                                            className={`w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95`}
                                        >
                                            <Edit3 size={18} /> Update Transaction
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 z-[110] text-muted-foreground hover:text-foreground transition-colors p-2 bg-card/50 backdrop-blur rounded-full"
                                >
                                    <X size={24} />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {viewItem && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-card rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
                            >
                                <button
                                    onClick={() => { setViewItem(null); setIsEditingVendor(false); }}
                                    className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors z-10"
                                >
                                    <X size={20} className="text-muted-foreground" />
                                </button>

                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 rounded-3xl overflow-hidden border border-primary/20 bg-primary/5 flex items-center justify-center text-2xl shadow-sm font-bold text-primary">
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
                                            <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight uppercase">{viewItem.item?.name}</h3>
                                            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1 opacity-80">{viewItem.item?.category?.name || viewItem.item?.category}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-muted/50 border border-border p-6 rounded-[2rem] mb-8 shadow-inner">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Quantity</p>
                                            <p className="text-sm font-bold text-foreground tracking-tight">{viewItem.quantity} {viewItem.item?.unit?.name || viewItem.item?.unit}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Total Amount</p>
                                            <p className="text-sm font-black text-blue-600">₹ {formatIndianNumber(viewItem.totalAmount || 0)}</p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Transaction Date</p>
                                            <p className="text-sm font-bold text-foreground tracking-tight">{new Date(viewItem.date).toLocaleDateString('en-GB')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Created By</p>
                                            <p className="text-sm font-bold text-foreground tracking-tight">{viewItem.createdByName || '-'}</p>
                                            {viewItem.createdAt && <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(viewItem.createdAt).toLocaleString('en-GB')}</p>}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Updated By</p>
                                            <p className="text-sm font-bold text-foreground tracking-tight">{viewItem.updatedByName || '-'}</p>
                                            {viewItem.updatedAt && <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(viewItem.updatedAt).toLocaleString('en-GB')}</p>}
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-3xl border border-primary/10 mt-4">
                                                <div className="p-2 bg-card rounded-xl shadow-sm text-primary border border-border">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Branch</p>
                                                    <p className="text-xs font-black text-foreground/80 uppercase">{viewItem.companyId?.name || viewItem.companyName || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Narration / Bill No.</p>
                                            <div className="bg-muted/70 p-4 rounded-2xl text-xs font-bold text-muted-foreground border border-border italic leading-relaxed">
                                                {viewItem.narration || 'No narration provided.'}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Digital Bill / Receipt</p>
                                            {viewItem.billPath ? (
                                                <a
                                                    href={viewItem.billPath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-5 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all group border border-blue-100/50 shadow-sm"
                                                >
                                                    <div className="p-2 bg-card rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                                                        <ReceiptText size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-black uppercase tracking-widest group-hover:underline block">View Attached Bill</span>
                                                        <span className="text-[10px] font-bold text-blue-400 lowercase mt-0.5 block  truncate max-w-[200px]">{viewItem.billPath.split('/').pop()}</span>
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-4 p-5 bg-muted text-slate-600 rounded-2xl border border-border grayscale italic border-dashed">
                                                    <ReceiptText size={20} className="" />
                                                    <span className="text-xs font-bold uppercase tracking-widest ">No digital bill attached</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>

    );

}





function CustomInput({ label, className = "", iconPrefix, iconSuffix, ...props }) {
    return (
        <div className="space-y-1 md:space-y-1">
            <label className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                {iconPrefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xs font-black">{iconPrefix}</span>}
                <input
                    {...props}
                    className={`w-full ${iconPrefix ? 'pl-8' : 'px-4 md:px-5'} ${iconSuffix ? 'pr-8' : ''} py-2.5 md:py-3.5 bg-muted rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-foreground text-sm ${className}`}
                />
                {iconSuffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xs font-black">{iconSuffix}</span>}
            </div>
        </div>
    );
}


