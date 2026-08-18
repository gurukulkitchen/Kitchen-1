"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    PlusCircle,
    Trash2,
    Edit3,
    Check,
    X,
    ChevronDown,
    Search,
    Settings,
    Download,
    Eye,
    ArrowDownToLine,
    ArrowUpFromLine,
    Database,
    Loader2,
    ReceiptText,
    History,
    Building2,
    Save
} from 'lucide-react';
import { formatIndianNumber } from '../../lib/formatters';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateStockPDF } from '../../lib/pdfGenerator';
import Pagination from '../../components/Pagination';
import usePermissions from '../../hooks/usePermissions';
import PermissionWrapper from '../../components/PermissionWrapper';
import MasterDataManager from '../../components/MasterDataManager';
import BulkUploadModal from '../../components/BulkUploadModal';
import TableActionButton from '../../components/TableActionButton';
import TableColumnFilter from '../../components/TableColumnFilter';
import FilterDropdown from '../../components/FilterDropdown';
import CustomSelect from '../../components/CustomSelect';
import SearchableSelect from '../../components/SearchableSelect';


// Categories and units are now fetched dynamically


import { useCompany } from '../../context/CompanyContext';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFormStore } from '@/lib/store';

export default function InventoryPage() {
    const { showToast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();
    const searchParams = useSearchParams();
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [events, setEvents] = useState([]);
    const [logCategories, setLogCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
    const [isMasterManagerOpen, setIsMasterManagerOpen] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        category: '',
        unit: '',
        currentStock: '',
        low: '',
        critical: '',
        image: '',
        note: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [viewImage, setViewImage] = useState(null);
    const [isEntrySectionOpen, setIsEntrySectionOpen] = useState(true);

    const [activeTab, setActiveTab] = useState('Entry');
    const [visibleCols, setVisibleCols] = useState({
        image: true,
        product: true,
        stockIn: true,
        stockOut: true,
        currentStock: true,
        alert: true,
        note: true
    });
    const [isHideShowDropdownOpen, setIsHideShowDropdownOpen] = useState(false);
    const fileInputRef = useRef(null);
    const hideShowDropdownRef = useRef(null);

    useEffect(() => {
        if (!permsLoading) {
            setActiveTab(hasPermission('write') && !isReadOnly ? 'Entry' : 'Data');
        }
    }, [permsLoading, permissions, isReadOnly]);

    const [itemsList, setItemsList] = useState([{
        tempId: Date.now(),
        name: '',
        category: '',
        unit: '',
        currentStock: 0,
        alertLow: 0,
        alertCritical: 0,
        image: '',
        note: ''
    }]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
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
        (typeof colFilters !== 'undefined' && colFilters && Object.values(colFilters).some(v => v && v.length > 0));

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
    };

    const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const [viewItem, setViewItem] = useState(null);

    // Super Admin State
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const downloadRef = useRef(null);
    const editingRef = useRef(null);
    const isSavingRef = useRef(false);

    const handleSaveRef = useRef();
    const editingIdRef = useRef();

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store (Hydration)
    useEffect(() => {
        const persistedData = forms['inventory'];
        if (persistedData) {
            if (persistedData.searchTerm !== undefined) setSearchTerm(persistedData.searchTerm);
            if (persistedData.selectedCategories !== undefined) setSelectedCategories(persistedData.selectedCategories);
            if (persistedData.colFilters !== undefined) setColFilters(persistedData.colFilters);
            if (persistedData.itemsPerPage !== undefined) setItemsPerPage(persistedData.itemsPerPage);
            if (persistedData.currentPage !== undefined) setCurrentPage(persistedData.currentPage);
            if (persistedData.itemsList !== undefined) setItemsList(persistedData.itemsList);
            if (persistedData.newItem !== undefined) setNewItem(persistedData.newItem);
        }
        setIsHydrated(true);
    }, []);

    // Sync to persistent store
    useEffect(() => {
        if (isHydrated) {
            setFormData('inventory', {
                searchTerm,
                selectedCategories,
                colFilters,
                itemsPerPage,
                currentPage,
                itemsList,
                newItem
            });
        }
    }, [searchTerm, selectedCategories, colFilters, itemsPerPage, currentPage, itemsList, newItem, isHydrated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle Download Popup
            if (downloadRef.current && !downloadRef.current.contains(event.target)) {
                setIsDownloadOpen(false);
            }
            // Handle Hide/Unhide columns dropdown
            if (hideShowDropdownRef.current && !hideShowDropdownRef.current.contains(event.target)) {
                setIsHideShowDropdownOpen(false);
            }
            // Handle Auto-save for Inline Editing
            if (editingIdRef.current && editingRef.current && !editingRef.current.contains(event.target)) {
                // Don't save if clicking on a dropdown menu or portal content
                if (event.target.closest('[data-searchselect-id="searchable-select-menu"]') ||
                    event.target.closest('[data-col-filter-root="true"]') ||
                    event.target.closest('[data-dropdown-id]')) {
                    return;
                }

                // Check if the click is on a scrollbar
                const target = event.target;
                const rect = target.getBoundingClientRect();
                const isScrollbarClick =
                    (target.offsetWidth > target.clientWidth && event.clientX > rect.left + target.clientWidth) ||
                    (target.offsetHeight > target.clientHeight && event.clientY > rect.top + target.clientHeight);

                if (isScrollbarClick) return;

                setTimeout(() => handleSaveRef.current?.(), 100);
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

    const loadCategories = React.useCallback(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(err => console.error('Error fetching categories:', err));
    }, []);

    const loadUnits = React.useCallback(() => {
        fetch('/api/units')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUnits(data);
            })
    }, []);

    const loadCompanies = React.useCallback(() => {
        fetch('/api/companies')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCompanies(data.filter(c => c.status !== 'inactive'));
                }
            })
            .catch(err => console.error('Error fetching companies:', err));
    }, []);

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

    const loadLogCategories = React.useCallback(() => {
        fetch('/api/log-categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLogCategories(data);
            })
            .catch(err => console.error('Error fetching log categories:', err));
    }, []);

    const fetchItems = React.useCallback(async () => {
        try {
            const companyId = searchParams.get('companyId');
            let url = '/api/kitchen/items';
            let summaryUrl = '/api/dashboard/products?limit=all';
            if (companyId) url += `?companyId=${companyId}`;
            if (companyId) summaryUrl += `&companyId=${companyId}`;

            const [itemsRes, summaryRes] = await Promise.all([
                fetch(url),
                fetch(summaryUrl)
            ]);

            const data = await itemsRes.json();
            const summaryData = await summaryRes.json().catch(() => ({}));

            if (itemsRes.ok && Array.isArray(data)) {
                const summaryMap = new Map(
                    Array.isArray(summaryData?.items)
                        ? summaryData.items.map((entry) => [String(entry.id), entry.summary || {}])
                        : []
                );

                const enrichedItems = data.map((item) => {
                    const summary = summaryMap.get(String(item._id)) || {};
                    return {
                        ...item,
                        stockInQty: Number(summary.inQty || 0),
                        stockInAmount: Number(summary.inAmount || 0),
                        stockOutQty: Number(summary.outQty || 0),
                        stockOutAmount: Number(summary.outAmount || 0),
                        currentStockMRPValue: Number(summary.currentStockMRPValue || 0)
                    };
                });

                setItems(enrichedItems);
            } else {
                const errorMsg = data.error || data.message || (typeof data === 'string' ? data : 'Unknown error');
                console.error('Failed to fetch items:', {
                    status: itemsRes.status,
                    statusText: itemsRes.statusText,
                    data: data
                });
                showToast(`Failed to fetch inventory: ${errorMsg}`, 'error');
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching items', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'Super Admin') {
            setIsSuperAdmin(true);
        }
        fetchItems();

        loadCategories();
        loadUnits();
        loadCompanies();
        loadDepartments();
        loadEvents();
        loadLogCategories();
    }, [fetchItems, loadCategories, loadUnits, loadCompanies, loadDepartments, loadEvents, loadLogCategories]);

    // Reset pagination when search or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategories]);

    // Removed handleMasterChange

    const handleAddItem = () => {
        const firstCat = categories[0];
        setItemsList(prev => [...prev, {
            tempId: Date.now(),
            name: '',
            category: firstCat?._id || '',
            unit: units[0]?._id || '',
            currentStock: '',
            alertLow: 0,
            alertCritical: 0,
            image: '',
            note: ''
        }]);
    };

    const handleRemoveItem = (tempId) => {
        if (itemsList.length > 1) {
            setItemsList(prev => prev.filter(i => i.tempId !== tempId));
        }
    };

    const handleRowChange = (tempId, field, value) => {
        setItemsList(prev => prev.map(item => {
            if (item.tempId === tempId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
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
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRowImageUpload = async (tempId, file) => {
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
                handleRowChange(tempId, 'image', data.path);
            }
        } catch (error) {
            console.error('Row image upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleBulkSubmit = async () => {
        const validItems = itemsList.filter(i => i.name && i.category);
        if (validItems.length === 0) {
            showToast('Please add at least one valid product', 'warning');
            return;
        }

        setLoading(true);
        try {
            for (const item of validItems) {
                const res = await fetch('/api/kitchen/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: item.name.trim(),
                        category: item.category,
                        unit: item.unit,
                        alertLow: Number(item.alertLow) || 0,
                        alertCritical: Number(item.alertCritical) || 0,
                        currentStock: Number(item.currentStock) || 0,
                        image: item.image,
                        note: (item.note || '').trim(),
                        companyId: isReadOnly ? (searchParams.get('companyId') || undefined) : selectedCompanyIds[0]
                    })
                });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed to save ${item.name}`);
                }
            }
            showToast('Products registered successfully!', 'success');
            setItemsList([{
                tempId: Date.now(),
                name: '',
                category: categories[0]?._id || '',
                unit: units[0]?._id || '',
                currentStock: 0,
                alertLow: 0,
                alertCritical: 0,
                image: '',
                note: ''
            }]);
            fetchItems();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'items');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setNewItem(prev => ({ ...prev, image: data.path }));
            } else {
                showToast('Image upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Upload error', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (isSavingRef.current) return;

        const method = editingId ? 'PUT' : 'POST';
        const body = {
            name: newItem.name.trim(),
            category: newItem.category,
            unit: newItem.unit,
            currentStock: newItem.currentStock === '' ? 0 : Number(newItem.currentStock),
            alertLow: newItem.low === '' ? 0 : Number(newItem.low),
            alertCritical: newItem.critical === '' ? 0 : Number(newItem.critical),
            image: newItem.image,
            note: (newItem.note || '').trim(),
            companyId: isReadOnly ? (searchParams.get('companyId') || undefined) : selectedCompanyIds[0]
        };
        if (editingId) body._id = editingId;

        isSavingRef.current = true;

        try {
            const res = await fetch('/api/kitchen/items', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                showToast(editingId ? 'Item Updated Successfully' : 'Item Added Successfully', 'success');
                fetchItems();
                resetForm();
                setIsMobileFormOpen(false);
            } else {
                const errorData = await res.json().catch(() => ({}));
                showToast(errorData.error || 'Failed to save item', 'error');
            }
        } catch (error) {
            console.error(error);
        } finally {
            isSavingRef.current = false;
        }
    };

    handleSaveRef.current = handleSave;
    editingIdRef.current = editingId;

    const handleDelete = async (id) => {
        if (!confirm('Delete item?')) return;
        try {
            await fetch(`/api/kitchen/items?id=${id}`, { method: 'DELETE' });
            fetchItems();
        } catch (error) {
            console.error(error);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!confirm(`Delete ${selectedIds.length} selected items?`)) return;

        setLoading(true);
        try {
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/kitchen/items?id=${id}`, { method: 'DELETE' })
            ));
            setSelectedIds([]);
            fetchItems();
            showToast('Selected items deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting items:', error);
            showToast('Failed to delete some items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (item) => {
        if (editingId && editingId !== item._id) {
            await handleSave();
        }
        setNewItem({
            name: item.name,
            category: item.category?._id || item.category,
            unit: item.unit?._id || item.unit,
            currentStock: item.currentStock ?? '',
            low: item.alertLow,
            critical: item.alertCritical,
            image: item.image || '', // Populate image
            note: item.note || '' // Populate note
        });
        setEditingId(item._id);
    };

    const handleInlineEditBlur = (e) => {
        const target = e.relatedTarget || document.activeElement;
        setTimeout(() => {
            const currentActive = document.activeElement;
            const finalTarget = e.relatedTarget || currentActive;

            if (editingRef.current && finalTarget && (
                editingRef.current.contains(finalTarget) ||
                finalTarget.closest?.('[data-searchselect-id="searchable-select-menu"]') ||
                finalTarget.closest?.('[data-col-filter-root="true"]') ||
                finalTarget.closest?.('[data-dropdown-id]')
            )) {
                return;
            }

            handleSaveRef.current?.();
        }, 100);
    };

    const resetForm = () => {
        setNewItem({
            name: '',
            category: '',
            unit: '',
            currentStock: '',
            low: '',
            critical: '',
            image: '', // Reset image
            note: ''
        });
        setEditingId(null);
    };

    const uniqueProducts = [...new Set(items.map(item => item.name).filter(Boolean))].sort();
    const uniqueCompanies = [...new Set(items.map(item => item.companyId?.name || '-').filter(Boolean))].sort();
    const uniqueQtys = [...new Set(items.map(item => String(item.currentStock || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueCategories = [...new Set(items.map(item => item.category?.name || '-').filter(Boolean))].sort();
    const uniqueUnits = [...new Set(items.map(item => item.unit?.name || '-').filter(Boolean))].sort();
    const uniqueStockInQtys = [...new Set(items.map(item => String(item.stockInQty || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueStockOutQtys = [...new Set(items.map(item => String(item.stockOutQty || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueStatuses = ['Healthy', 'Low', 'Critical'];
    const uniqueUsers = [...new Set(items.map(item => item.createdBy?.name || item.updatedBy?.name || '-').filter(Boolean))].sort();
    const uniqueNotes = [...new Set(items.map(item => item.note || '-'))].sort();

    const filteredItems = items.filter(item => {
        const checkTerm = (obj, term) => {
            if (!obj) return false;
            if (typeof obj === 'object') return Object.values(obj).some(val => checkTerm(val, term));
            return String(obj).toLowerCase().includes(term);
        };
        const matchesSearch = !searchTerm || checkTerm(item, searchTerm.toLowerCase());

        const itemCategoryName = item.category?.name || item.category;
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(itemCategoryName);

        const itemStatus = item.currentStock <= item.alertCritical
            ? 'Critical'
            : item.currentStock <= item.alertLow
                ? 'Low'
                : 'Healthy';

        let colsMatch = true;
        if (colFilters.product?.length && !colFilters.product.includes(item.name)) colsMatch = false;
        if (colFilters.company?.length && !colFilters.company.includes(item.companyId?.name || '-')) colsMatch = false;
        if (colFilters.qty?.length && !colFilters.qty.includes(String(item.currentStock))) colsMatch = false;
        if (colFilters.category?.length && !colFilters.category.includes(itemCategoryName)) colsMatch = false;
        if (colFilters.unit?.length && !colFilters.unit.includes(item.unit?.name || item.unit)) colsMatch = false;
        if (colFilters.stockIn?.length && !colFilters.stockIn.includes(String(item.stockInQty || 0))) colsMatch = false;
        if (colFilters.stockOut?.length && !colFilters.stockOut.includes(String(item.stockOutQty || 0))) colsMatch = false;
        if (colFilters.status?.length && !colFilters.status.includes(itemStatus)) colsMatch = false;
        if (colFilters.note?.length && !colFilters.note.includes(item.note || '-')) colsMatch = false;
        if (colFilters.user?.length && !colFilters.user.includes(item.createdBy?.name || item.updatedBy?.name || '-')) colsMatch = false;

        return matchesSearch && matchesCategory && colsMatch;
    });

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedItems.map(item => item._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const categoryOptions = categories.map(c => ({ value: c._id, label: c.name }));
    const unitOptions = units.map(u => ({ value: u._id, label: u.name }));
    const categoryNames = categories.map(c => c.name);
    const unitNames = units.map(u => u.name);
    // const uniqueProducts = [...new Set(items.map(item => item.name).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    // const uniqueCompanies = [...new Set(items.map(item => item.companyId?.name || '-'))].sort((a, b) => a.localeCompare(b));
    // const uniqueQtys = [...new Set(items.map(item => String(item.currentStock || 0)))].sort((a, b) => Number(a) - Number(b));
    // const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    // const uniqueUnits = [...new Set(items.map(item => item.unit).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const uniqueInQtys = [...new Set(items.map(item => String(item.stockInQty || 0)))].sort((a, b) => Number(a) - Number(b));
    const uniqueOutQtys = [...new Set(items.map(item => String(item.stockOutQty || 0)))].sort((a, b) => Number(a) - Number(b));
    // const uniqueStatuses = ['Healthy', 'Low', 'Critical'];
    // const uniqueUsers = [...new Set(items.map(item => item.createdBy?.name || item.updatedBy?.name || '-'))].sort((a, b) => a.localeCompare(b));

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

    if (loading || permsLoading) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>;

    if (!hasPermission('read')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center p-10 bg-card rounded-[2rem] shadow-xl border border-border">
                    <h1 className="text-4xl font-black text-foreground mb-4">ACCESS DENIED</h1>
                    <p className="text-muted-foreground    font-black tracking-widest text-xs">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <MasterDataManager
                isOpen={isMasterManagerOpen}
                onClose={() => setIsMasterManagerOpen(false)}
                onRefresh={() => {
                    loadCategories();
                    loadUnits();
                    loadDepartments();
                    loadEvents();
                    loadLogCategories();
                }}
            />
            <BulkUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                type="REGISTER"
                category="GROCERY"
                onSuccess={fetchItems}
            />
            <main className="p-4 md:p-8">
                {/* Top header options above card */}
                <div className="flex justify-end items-center gap-4 mb-4 pr-1">
                    {/* Green checkmark tick */}
                    {activeTab === 'Data' && (
                        <div className="flex items-center">
                            {filteredItems.length > 0 && filteredItems.every(item => item.name && item.category && (item.unit?.name || item.unit)) ? (
                                <span className="text-[#38A169] text-2xl font-bold select-none" title="All entries correct">✔</span>
                            ) : (
                                <span className="text-[#E53E3E] text-2xl font-bold select-none" title="Some entries incomplete">✘</span>
                            )}
                        </div>
                    )}

                    {/* Columns Hide / Unhide Dropdown */}
                    {activeTab === 'Data' && (
                        <div className="relative" ref={hideShowDropdownRef}>
                            <button
                                onClick={() => setIsHideShowDropdownOpen(!isHideShowDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors shadow-sm cursor-pointer"
                            >
                                <img src="/icons/action/Hide.svg" alt="Hide" className="w-4 h-4" />
                                <span>Columns Hide / Unhide</span>
                                <span className="text-[10px] opacity-70">▼</span>
                            </button>

                            {isHideShowDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-3 px-4 z-50 space-y-2">
                                    {Object.keys(visibleCols).map((col) => (
                                        <label key={col} className="flex items-center gap-2.5 cursor-pointer text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white    select-none">
                                            <input
                                                type="checkbox"
                                                checked={visibleCols[col]}
                                                onChange={() => setVisibleCols(prev => ({ ...prev, [col]: !prev[col] }))}
                                                className="rounded border-slate-300 dark:border-slate-600 text-[#8B2611] focus:ring-[#8B2611] w-4 h-4 cursor-pointer"
                                            />
                                            {col === 'stockIn' ? 'S. In' : col === 'stockOut' ? 'S. Out' : col === 'currentStock' ? 'Cur. Stock' : col}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Source Tab Button */}
                    {activeTab === 'Data' && (
                        <PermissionWrapper action="source">
                            <button
                                onClick={() => setIsMasterManagerOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#8B2611] transition-colors shadow-sm cursor-pointer"
                            >
                                <img src="/icons/action/Source.svg" alt="Source" className="w-4 h-4 block dark:hidden" style={{ filter: 'invert(19%) sepia(85%) saturate(3030%) hue-rotate(349deg) brightness(85%) contrast(92%)' }} />
                                <img src="/icons/action/SourceDark.svg" alt="Source" className="w-4 h-4 hidden dark:block" />
                                Source
                            </button>
                        </PermissionWrapper>
                    )}
                </div>

                {/* Main Card Container */}
                <div className={`w-full bg-white/90 dark:bg-[#1c1c1c] backdrop-blur-md ${activeTab === 'Entry' ? 'rounded-xl' : 'rounded-none'} shadow-2xl border border-slate-200/40 dark:border-zinc-800/80 transition-all duration-300 ${activeTab === 'Entry' ? 'max-w-4xl' : 'max-w-7xl'} mx-auto`}>
                    {/* View 1: Entry Tab (Registration Form) */}
                    {activeTab === 'Entry' && (
                        <div className='p-6'>
                            {/* Card Header for Form */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-[#F2E6E1] dark:border-zinc-800 mb-8 gap-4 font-family: 'Inter', sans-serif">
                                <div>
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                        <h1 className="text-3xl font-extrabold tracking-tight">
                                            <span className="text-[#8B2611] dark:text-[#FFB593]">Product</span>{' '}
                                            <span className="text-slate-800 dark:text-white">Registration</span>
                                        </h1>
                                        <div className="flex items-baseline gap-1 ml-0 sm:ml-4">
                                            <span className="text-2xl font-light text-[#8B2611] dark:text-slate-400">{items.length}</span>
                                            <span className="text-xl font-light text-slate-400 dark:text-slate-500">Product</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 italic mt-1.5 font-medium">
                                        New Product Registration First Time
                                    </p>
                                </div>

                                {/* Tabs Navigation - Source and Data button inside Form view */}
                                <div className="flex items-center gap-6 self-end md:self-auto">
                                    <PermissionWrapper action="source">
                                        <button
                                            onClick={() => setIsMasterManagerOpen(true)}
                                            className="flex flex-col items-center gap-1 group text-[#8B2611] dark:text-white transition-all cursor-pointer bg-transparent border-0 outline-none"
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 transition-transform group-hover:scale-105">
                                                    <defs>
                                                        <linearGradient id="sourceIconGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#882619" />
                                                            <stop offset="100%" stopColor="#D4612D" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M3.7181 5.58491H13.0133V3.72327H3.7181V5.58491ZM3.7181 9.30818H8.13334C8.44318 8.93585 8.78029 8.59082 9.14467 8.27311C9.50904 7.95539 9.90781 7.67987 10.341 7.44654H3.7181V9.30818ZM3.7181 13.0314H6.55315C6.58413 12.7057 6.64238 12.3876 6.7279 12.0774C6.81342 11.7671 6.91783 11.4646 7.04115 11.1698H3.7181V13.0314ZM1.85905 16.7547C1.34781 16.7547 0.910315 16.5726 0.546561 16.2083C0.182807 15.8441 0.000619683 15.4057 0 14.8931V1.86164C0 1.34969 0.182187 0.911581 0.546561 0.547321C0.910934 0.183061 1.34843 0.000620545 1.85905 0H14.8724C15.3836 0 15.8214 0.18244 16.1858 0.547321C16.5502 0.912201 16.7321 1.35031 16.7314 1.86164V7.05094C16.4371 6.92683 16.135 6.82227 15.8252 6.73726C15.5153 6.65224 15.1977 6.59391 14.8724 6.56226V1.86164H1.85905V14.8931H6.55315C6.58413 15.2189 6.64238 15.5369 6.7279 15.8472C6.81342 16.1574 6.91783 16.46 7.04115 16.7547H1.85905Z" fill="currentColor" className="source-icon-path text-[#8B2611] dark:text-white" />
                                                    <path d="M10.9806 17.558C11.8246 18.2636 12.8121 18.6163 13.943 18.6163C15.2289 18.6176 16.3248 18.164 17.2308 17.2555C18.1367 16.347 18.59 15.2493 18.5907 13.9623C18.5913 12.6752 18.1383 11.5778 17.2317 10.67C16.3251 9.7621 15.2289 9.30817 13.943 9.30817C13.3079 9.30879 12.7114 9.42917 12.1537 9.66932C11.596 9.90947 11.108 10.2312 10.6897 10.6346V9.30817H9.29541V13.0314H13.0135V11.6352H11.6657C11.96 11.3411 12.3009 11.1124 12.6882 10.9492C13.0755 10.786 13.4938 10.7044 13.943 10.7044C14.8416 10.7044 15.6084 11.0224 16.2436 11.6585C16.8788 12.2945 17.1964 13.0625 17.1964 13.9623C17.1964 14.862 16.8788 15.63 16.2436 16.266C15.6084 16.9021 14.8416 17.2201 13.943 17.2201C13.2 17.2201 12.5456 17.0029 11.9799 16.5685C11.4141 16.1342 11.0305 15.5757 10.8291 14.8931H9.38836C9.60587 15.9641 10.1366 16.8524 10.9806 17.558Z" fill="currentColor" className="text-black dark:text-[#D4612D]" />
                                                </svg>
                                                <span className="text-xs font-bold mt-1">Source</span>
                                            </div>
                                        </button>
                                    </PermissionWrapper>

                                    <button
                                        onClick={() => setActiveTab('Data')}
                                        className="flex flex-col items-center gap-1 group text-slate-500 hover:text-[#8B2611] dark:text-white transition-all cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg width="40" height="38" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-auto transition-transform group-hover:scale-105">
                                                <path d="M7.31738 37.6783V28.5758H9.94531C13.3011 28.5758 14.979 30.0548 14.979 33.0128C14.979 34.4178 14.5135 35.5476 13.5825 36.4025C12.6515 37.2531 11.4032 37.6783 9.8374 37.6783H7.31738ZM8.82178 29.858V36.4025H10.0278C11.09 36.4025 11.9152 36.1105 12.5034 35.5265C13.0959 34.9425 13.3921 34.1173 13.3921 33.0509C13.3921 30.9223 12.2897 29.858 10.085 29.858H8.82178ZM21.4727 37.6783H20.0444V36.6627H20.019C19.5705 37.4414 18.9124 37.8307 18.0449 37.8307C17.4059 37.8307 16.9045 37.6572 16.5405 37.3102C16.1808 36.9632 16.001 36.504 16.001 35.9327C16.001 34.7055 16.7077 33.9904 18.1211 33.7872L20.0508 33.5143C20.0508 32.5875 19.6107 32.1241 18.7305 32.1241C17.9561 32.1241 17.2578 32.3907 16.6357 32.924V31.6354C17.3213 31.2291 18.1126 31.026 19.0098 31.026C20.6517 31.026 21.4727 31.8343 21.4727 33.4508V37.6783ZM20.0508 34.4855L18.686 34.6759C18.2629 34.7309 17.9434 34.8346 17.7275 34.9869C17.516 35.1351 17.4102 35.3974 17.4102 35.774C17.4102 36.0491 17.5075 36.2755 17.7021 36.4532C17.901 36.6267 18.1655 36.7135 18.4956 36.7135C18.9442 36.7135 19.3145 36.5569 19.6064 36.2438C19.9027 35.9264 20.0508 35.5286 20.0508 35.0504V34.4855ZM26.7031 37.6085C26.4154 37.7524 26.0366 37.8243 25.5669 37.8243C24.3058 37.8243 23.6753 37.2192 23.6753 36.0089V32.3336H22.5898V31.1783H23.6753V29.674L25.1479 29.255V31.1783H26.7031V32.3336H25.1479V35.5836C25.1479 35.9687 25.2178 36.2438 25.3574 36.4088C25.4971 36.5739 25.7298 36.6564 26.0557 36.6564C26.3053 36.6564 26.5212 36.5844 26.7031 36.4406V37.6085ZM32.9619 37.6783H31.5337V36.6627H31.5083C31.0597 37.4414 30.4017 37.8307 29.5342 37.8307C28.8952 37.8307 28.3937 37.6572 28.0298 37.3102C27.6701 36.9632 27.4902 36.504 27.4902 35.9327C27.4902 34.7055 28.1969 33.9904 29.6104 33.7872L31.54 33.5143C31.54 32.5875 31.0999 32.1241 30.2197 32.1241C29.4453 32.1241 28.7471 32.3907 28.125 32.924V31.6354C28.8105 31.2291 29.6019 31.026 30.499 31.026C32.141 31.026 32.9619 31.8343 32.9619 33.4508V37.6783ZM31.54 34.4855L30.1753 34.6759C29.7521 34.7309 29.4326 34.8346 29.2168 34.9869C29.0052 35.1351 28.8994 35.3974 28.8994 35.774C28.8994 36.0491 28.9967 36.2755 29.1914 36.4532C29.3903 36.6267 29.6548 36.7135 29.9849 36.7135C30.4334 36.7135 30.8037 36.5569 31.0957 36.2438C31.3919 35.9264 31.54 35.5286 31.54 35.0504V34.4855ZM27.2326 13.5633C27.6164 13.5633 27.9403 13.4311 28.2044 13.1666C28.4685 12.9021 28.6006 12.5781 28.6006 12.1946V1.3699C28.6006 0.985603 28.4685 0.661213 28.2044 0.396728C27.9403 0.132243 27.6167 0 27.2337 0H11.907C11.524 0 11.2004 0.132243 10.9363 0.396728C10.6722 0.661213 10.5401 0.985226 10.5401 1.36877V12.1946C10.5401 12.5781 10.6722 12.9021 10.9363 13.1666C11.2004 13.4311 11.524 13.5633 11.907 13.5633H27.2326ZM26.3432 5.65139H20.6996V2.26056H25.8217C25.9669 2.26056 26.09 2.31142 26.1908 2.41314C26.2924 2.51412 26.3432 2.63732 26.3432 2.78275V5.65139ZM18.4422 5.65139H12.7987V2.78275C12.7987 2.63732 12.8491 2.51412 12.9499 2.41314C13.0522 2.31142 13.1753 2.26056 13.319 2.26056H18.4422V5.65139ZM20.6996 11.3028V7.91195H26.3432V10.7817C26.3432 10.9264 26.2924 11.0496 26.1908 11.1513C26.09 11.2523 25.9669 11.3028 25.8217 11.3028H20.6996ZM18.4422 11.3028H13.319C13.1745 11.3028 13.0519 11.2523 12.951 11.1513C12.8495 11.0496 12.7987 10.9264 12.7987 10.7817V7.91195H18.4422V11.3028Z" fill="currentColor" className="text-[#575757] dark:text-white" />
                                                <path d="M29.7295 19.2147L25.2147 23.7358L23.6345 22.1535L25.4122 20.345H10.5414V18.0845H25.4122L23.6345 16.276L25.2147 14.6936L29.7295 19.2147Z" fill="currentColor" className="text-[#575757] dark:text-[#D4612D]" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                                {/* Left side form fields (3/5 width) */}
                                <div className="lg:col-span-3 space-y-6">
                                    {/* Product Name */}
                                    <div className="flex flex-col">
                                        <label className="text-xs font-bold text-slate-500 dark:text-zinc-400    tracking-wider mb-1">
                                            Product Name : <span className="text-[#8B2611] dark:text-[#fb923c]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newItem.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Basmati Rice"
                                            className="w-full bg-transparent border-b-2 border-dotted border-slate-300 dark:border-zinc-700 focus:border-[#8B2611] dark:focus:border-[#fb923c] outline-none text-[#B04A26] dark:text-[#fb923c] font-semibold text-lg py-1.5 transition-colors placeholder:text-slate-300 dark:placeholder:text-zinc-650"
                                        />
                                    </div>

                                    {/* Category & Unit */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col relative">
                                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400   tracking-wider mb-1">
                                                Category : <span className="text-[#8B2611] dark:text-[#fb923c]">*</span>
                                            </label>
                                            <div className="relative border-b-2 border-dotted border-slate-300 dark:border-zinc-700 py-1.5 flex items-center justify-between">
                                                <SearchableSelect
                                                    value={newItem.category}
                                                    onChange={(val) => setNewItem(prev => ({ ...prev, category: val }))}
                                                    options={categories.map(c => ({ value: c._id, label: c.name }))}
                                                    placeholder="Select Category"
                                                    className="w-full text-[#B04A26] dark:text-[#fb923c] font-semibold text-base bg-transparent border-0 py-0.5 outline-none normal-case tracking-normal"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col relative">
                                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400   tracking-wider mb-1">
                                                Unit : <span className="text-[#8B2611] dark:text-[#fb923c]">*</span>
                                            </label>
                                            <div className="relative border-b-2 border-dotted border-slate-300 dark:border-zinc-700 py-1.5 flex items-center justify-between">
                                                <SearchableSelect
                                                    value={newItem.unit}
                                                    onChange={(val) => setNewItem(prev => ({ ...prev, unit: val }))}
                                                    options={units.map(u => ({ value: u._id, label: u.name }))}
                                                    placeholder="Select Unit"
                                                    className="w-full text-[#B04A26] dark:text-[#fb923c] font-semibold text-base bg-transparent border-0 py-0.5 outline-none normal-case tracking-normal"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alert Min & Alert Mix */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400   tracking-wider mb-1">
                                                Alert Min : <span className="text-[#8B2611] dark:text-[#fb923c]">*</span>
                                            </label>
                                            <div className="relative border-b-2 border-dotted border-slate-300 dark:border-zinc-700 py-1 flex items-center">
                                                <input
                                                    type="number"
                                                    name="low"
                                                    value={newItem.low}
                                                    onChange={handleInputChange}
                                                    placeholder="0"
                                                    className="w-full bg-transparent outline-none text-[#B04A26] dark:text-[#fb923c] font-semibold text-base border-0 focus:ring-0"
                                                />
                                                <div className="flex flex-col text-[8px] text-[#B04A26] dark:text-[#fb923c] select-none gap-0.5 ml-2 cursor-pointer pr-1">
                                                    <span onClick={() => handleInputChange({ target: { name: 'low', value: String(Number(newItem.low || 0) + 1) } })}>▲</span>
                                                    <span onClick={() => handleInputChange({ target: { name: 'low', value: String(Math.max(0, Number(newItem.low || 0) - 1)) } })}>▼</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-slate-500 dark:text-zinc-400   tracking-wider mb-1">
                                                Alert Mix : <span className="text-[#8B2611] dark:text-[#fb923c]">*</span>
                                            </label>
                                            <div className="relative border-b-2 border-dotted border-slate-300 dark:border-zinc-700 py-1 flex items-center">
                                                <input
                                                    type="number"
                                                    name="critical"
                                                    value={newItem.critical}
                                                    onChange={handleInputChange}
                                                    placeholder="0"
                                                    className="w-full bg-transparent outline-none text-[#B04A26] dark:text-[#fb923c] font-semibold text-base border-0 focus:ring-0"
                                                />
                                                <div className="flex flex-col text-[8px] text-[#B04A26] dark:text-[#fb923c] select-none gap-0.5 ml-2 cursor-pointer pr-1">
                                                    <span onClick={() => handleInputChange({ target: { name: 'critical', value: String(Number(newItem.critical || 0) + 1) } })}>▲</span>
                                                    <span onClick={() => handleInputChange({ target: { name: 'critical', value: String(Math.max(0, Number(newItem.critical || 0) - 1)) } })}>▼</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div className="flex flex-col">
                                        <label className="text-xs font-bold text-slate-500 dark:text-zinc-400   tracking-wider mb-1">
                                            Note :
                                        </label>
                                        <input
                                            type="text"
                                            name="note"
                                            value={newItem.note}
                                            onChange={handleInputChange}
                                            placeholder="Jay Swaminarayan"
                                            className="w-full bg-transparent border-b-2 border-dotted border-slate-300 dark:border-zinc-700 focus:border-[#8B2611] dark:focus:border-[#fb923c] outline-none text-[#B04A26]/80 dark:text-[#fb923c]/80 font-medium text-base py-1.5 transition-colors placeholder:text-slate-300/80 dark:placeholder:text-zinc-700"
                                        />
                                    </div>

                                    {/* Actions Row */}
                                    <div className="flex items-center gap-6 pt-4 ">
                                        {!isReadOnly && (hasPermission('write') || editingId) && (
                                            <button
                                                onClick={handleSave}
                                                className="gradient-btn"
                                            >
                                                {editingId ? 'Save Changes' : 'Registed'}
                                            </button>
                                        )}

                                        <div className="flex items-center gap-4">
                                            {!isReadOnly && (hasPermission('write') || editingId) && (
                                                <button
                                                    onClick={handleSave}
                                                    title="Save Entry"
                                                    className="text-[#38A169] dark:text-[#38A169] hover:scale-110 transition-transform active:scale-95 text-2xl font-bold cursor-pointer bg-transparent border-0"
                                                >
                                                    ✔
                                                </button>
                                            )}
                                            <button
                                                onClick={resetForm}
                                                title="Cancel / Reset"
                                                className="text-[#E53E3E] dark:text-[#E53E3E] hover:scale-110 transition-transform active:scale-95 text-2xl font-bold cursor-pointer bg-transparent border-0"
                                            >
                                                ✘
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right side drag and drop (2/5 width) */}
                                <div className="lg:col-span-2">
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                handleImageUpload({ target: { files: e.dataTransfer.files } });
                                            }
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-[#C85B32]/40 dark:border-zinc-700/60 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-[#FDFBF9] dark:bg-[#1a1a1a]/40 hover:bg-[#FAF6F0] dark:hover:bg-[#1a1a1a]/80 transition-all cursor-pointer min-h-[220px] shadow-inner text-center group"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            disabled={uploading}
                                        />
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-10 h-10 text-[#C85B32] dark:text-[#fb923c] animate-spin" />
                                                <span className="text-xs font-bold text-[#C85B32] dark:text-[#fb923c]">Uploading image...</span>
                                            </div>
                                        ) : newItem.image ? (
                                            <div className="relative w-full h-full min-h-[160px] flex items-center justify-center rounded-2xl overflow-hidden">
                                                <img src={newItem.image} className="max-h-[160px] object-contain rounded-xl shadow-sm" alt="Product" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                                    Change Image
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="bg-white dark:bg-zinc-900 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col items-center gap-1.5 mb-4 group-hover:scale-105 transition-transform">
                                                    <img src="/icons/action/Image.svg" className="w-5 h-5 transition-transform group-hover:scale-110" alt="View Image" />

                                                    <span className="text-[11px] text-[#C85B32] dark:text-[#A4A4A4] font-extrabold    tracking-wide">click to browse</span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-zinc-400 font-bold">Drag and drop font file to upload</div>
                                                <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-1">Supports PNG, JPG & WEBP up to any size</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View 2: Data Tab (Table List View) */}
                    {activeTab === 'Data' && (
                        <div>
                            {/* Card Header for Table */}
                            <div className="relative w-full">

                                {/* Top Gradient Border */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />

                                {/* Bottom Gradient Border */}
                                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />

                                {/* Content */}
                                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#EBEBEB] dark:bg-[#1c1c1c] p-6 gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 flex-nowrap whitespace-nowrap">
                                            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-1.5 shrink-0">
                                                <span className="text-[#882619] dark:text-white">Product</span>{' '}
                                                <span className="text-[#2D3748] dark:text-white">Data</span>
                                            </h1>
                                            <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                                <span className="text-xl md:text-2xl font-bold text-[#882619] dark:text-[#D4612D]">{filteredItems.length}</span>
                                                <span className="text-lg md:text-xl font-normal text-[#2D3748] dark:text-zinc-300">Product</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-zinc-500 italic mt-1 font-medium">
                                            New Product Registration List
                                        </p>
                                    </div>

                                    {/* Table Actions / Search / Filters Row */}
                                    <div className="flex flex-wrap items-center gap-2 xl:gap-3 justify-end w-full xl:w-auto">
                                        {/* Quick Search */}
                                        <div className="relative group min-w-[100px]">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4612D]">
                                                <Search size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Quick Search"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 bg-white dark:bg-zinc-800 border border-[#D4612D] rounded-xl text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-[#D4612D]/30 transition-all placeholder:text-slate-400 shadow-md"
                                            />
                                        </div>

                                        {/* Category Filter */}
                                        <div className="relative">
                                            <FilterDropdown
                                                title="Category Filter"
                                                options={categoryNames.sort()}
                                                value={selectedCategories}
                                                onChange={(val) => setSelectedCategories(val)}
                                                isMulti={true}
                                                className="flex items-center justify-between gap-3 cursor-pointer transition-all focus:outline-none px-4 py-2 bg-white dark:bg-zinc-800 !border !border-[#D4612D] rounded-xl text-xs font-bold !text-slate-700 dark:!text-zinc-200 shadow-md h-9"
                                                icon={
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="#D4612D" className="shrink-0">
                                                        <path d="M5 8L0 0H10L5 8Z" />
                                                    </svg>
                                                }
                                            />
                                        </div>

                                        {/* Delete Button */}
                                        {!isReadOnly && (
                                            <button
                                                onClick={handleBulkDelete}
                                                disabled={selectedIds.length === 0}
                                                className="flex flex-col items-center group text-slate-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                            >
                                                <img src="/icons/action/Delete.svg" alt="Delete" className="w-12 h-12 dark:hidden" />
                                                <img src="/icons/action/DeleteDark.svg" alt="Delete" className="w-12 h-12 hidden dark:block" />
                                            </button>
                                        )}

                                        {/* Download Button */}
                                        <div className="relative" ref={downloadRef}>
                                            <button
                                                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                                                className="flex flex-col items-center group text-slate-500 hover:text-[#8B2611] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                            >
                                                <img src="/icons/action/Download.svg" alt="Download" className="w-16 h-16 block dark:hidden" />
                                                <img src="/icons/action/DownloadDark.svg" alt="Download" className="w-16 h-16 hidden dark:block" />
                                            </button>

                                            <AnimatePresence>
                                                {isDownloadOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute right-0 top-14 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl py-2 z-[100] overflow-hidden border border-slate-200 dark:border-slate-700"
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                const data = filteredItems.map(item => ({
                                                                    Name: item.name,
                                                                    Category: item.category?.name || item.category || '-',
                                                                    'Current Stock': item.currentStock,
                                                                    Unit: item.unit?.name || item.unit || '-',
                                                                    'Alert Low': item.alertLow,
                                                                    'Alert Critical': item.alertCritical,
                                                                    Company: item.companyId?.name || '-'
                                                                }));
                                                                const ws = XLSX.utils.json_to_sheet(data);
                                                                const wb = XLSX.utils.book_new();
                                                                XLSX.utils.book_append_sheet(wb, ws, "Current Stock");
                                                                XLSX.writeFile(wb, `Stock_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
                                                                setIsDownloadOpen(false);
                                                            }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 cursor-pointer bg-transparent border-0"
                                                        >
                                                            Export as Excel
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const dataRows = filteredItems.map(item => [
                                                                    item.name,
                                                                    item.category?.name || item.category || '-',
                                                                    `${item.currentStock} ${item.unit?.name || item.unit || '-'}`,
                                                                    item.alertLow,
                                                                    item.alertCritical,
                                                                    item.companyId?.name || '-',
                                                                    item.note || ''
                                                                ]);
                                                                const headers = ['Item Name', 'Category', 'Stock', 'Low', 'Crit', 'Company', 'Note'];
                                                                const title = "Inventory Master";
                                                                const fileName = `Stock_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
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
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer bg-transparent border-0"
                                                        >
                                                            Export as PDF
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Bulk Upload Button */}
                                        {!isReadOnly && (
                                            <button
                                                onClick={() => setIsBulkModalOpen(true)}
                                                className="flex flex-col items-center group text-slate-500 hover:text-[#8B2611] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                            >
                                                <img src="/icons/action/Bulkupload.svg" alt="Bulk" className="w-10 h-10" />
                                            </button>
                                        )}

                                        {/* Vertical line divider */}
                                        <div className="w-px h-16 bg-slate-200 dark:bg-zinc-800 border border-[#B0A9A9] dark:border-zinc-850" />

                                        {/* Entry View Button */}
                                        {hasPermission('write') && !isReadOnly && (
                                            <button
                                                onClick={() => setActiveTab('Entry')}
                                                className="flex flex-col items-center gap-1 group text-slate-500 hover:text-[#8B2611] dark:text-white transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <img src="/icons/action/Entry.svg" alt="Entry" className="w-10 h-10" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Selected Categories Tags */}
                            {selectedCategories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedCategories.map(cat => (
                                        <span key={cat} className="flex items-center gap-1 bg-[#8B2611]/10 text-[#8B2611] px-4 py-1.5 rounded-full text-[10px] font-bold    border border-[#8B2611]/10">
                                            {cat}
                                            <button onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))} className="cursor-pointer bg-transparent border-0">
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </span>
                                    ))}
                                    <button
                                        onClick={() => setSelectedCategories([])}
                                        className="text-[10px] font-bold text-slate-500 hover:text-red-500 ml-2 cursor-pointer bg-transparent border-0"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}

                            {/* Mobile list view */}
                            <div className="md:hidden space-y-6 px-1 pb-10">
                                <AnimatePresence>
                                    {paginatedItems.map((item) => {
                                        const isCritical = item.alertCritical > 0 && item.currentStock <= item.alertCritical;
                                        const isLow = item.alertLow > 0 && item.currentStock <= item.alertLow;
                                        const statusColor = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-[#8B2611]';

                                        return (
                                            <motion.div
                                                key={item._id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="bg-card p-6 rounded-[2rem] shadow-sm relative overflow-hidden border border-border"
                                            >
                                                <div className={`absolute top-0 left-0 w-2 h-full ${statusColor} opacity-20`} />
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-16 h-16 rounded-[1.25rem] bg-[#8B2611]/10 flex items-center justify-center shrink-0 border border-[#8B2611]/10 shadow-sm overflow-hidden">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl">📦</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-black text-foreground leading-tight truncate    tracking-tight">{item.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full    tracking-widest ${(item.category?.name || categoryNames.includes(item.category)) ? 'bg-muted text-muted-foreground' : 'bg-red-500 text-white animate-pulse'}`}>
                                                                {item.category?.name || item.category || "Category Not Selected"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-2xl mb-6">
                                                    <div className="text-center border-r border-border/50">
                                                        <div className="text-[9px] font-black text-muted-foreground    tracking-widest mb-1">Available</div>
                                                        <div className="text-lg font-black text-foreground">{item.currentStock} <span className="text-[10px] text-muted-foreground   ">{item.unit?.name || item.unit}</span></div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[9px] font-black text-muted-foreground    tracking-widest mb-1">Status</div>
                                                        <div className={`text-[10px] font-black px-3 py-1 rounded-full ${statusColor} text-white    w-full`}>
                                                            {isCritical ? 'Critical' : isLow ? 'Low' : 'Healthy'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pt-2">
                                                    <div className="flex items-center gap-3">
                                                        <PermissionWrapper action="edit">
                                                            <button onClick={() => handleEdit(item)} className="p-3 bg-primary/10 text-primary rounded-2xl transition-all active:scale-95 shadow-sm bg-transparent border-0">
                                                                <Edit3 size={18} strokeWidth={2.5} />
                                                            </button>
                                                        </PermissionWrapper>
                                                        <PermissionWrapper action="delete">
                                                            <button
                                                                onClick={() => handleDelete(item._id)}
                                                                className="p-3 bg-red-500/10 text-red-500 rounded-2xl transition-all active:scale-95 shadow-sm bg-transparent border-0"
                                                            >
                                                                <Trash2 size={18} strokeWidth={2.5} />
                                                            </button>
                                                        </PermissionWrapper>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Desktop Table view */}
                            <div className="inventory-table-container hidden md:block overflow-x-auto rounded-none border border-slate-200/60 dark:border-slate-700/60 mb-6 bg-white dark:bg-slate-900">
                                <table className="inventory-table w-full text-left border-separate border-spacing-0 bg-white">
                                    <thead className="inventory-table sticky top-0 z-[50]">
                                        <tr className="bg-white dark:bg-slate-850">
                                            <th className="py-4 px-3 w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-[#8B2611] focus:ring-[#8B2611] w-4 h-4 cursor-pointer"
                                                    checked={paginatedItems.length > 0 && selectedIds.length === paginatedItems.length}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>

                                            {visibleCols.image && (
                                                <th className="py-4 px-3 text-center w-[80px] text-xs font-bold text-slate-500    tracking-wider ">
                                                </th>
                                            )}

                                            {visibleCols.product && (
                                                <th className="py-4 px-4 text-xs font-bold text-slate-500    tracking-wider gradient-border-r"
                                                    style={{
                                                        borderRight: "1px solid #8B2611",
                                                    }}                                                >
                                                    Product Name
                                                </th>
                                            )}

                                            {visibleCols.stockIn && (
                                                <th className="py-4 px-3 text-center text-xs font-bold text-slate-500    tracking-wider">
                                                    <TableColumnFilter
                                                        colKey="stockIn"
                                                        title="S. In"
                                                        options={uniqueStockInQtys}
                                                        align="center"
                                                        colFilters={colFilters}
                                                        activeFilterCol={activeFilterCol}
                                                        onToggle={toggleColFilter}
                                                        onChange={handleColFilterChange}
                                                        iconSrc="/icons/action/Fillter.svg"
                                                    />
                                                </th>
                                            )}

                                            {visibleCols.stockOut && (
                                                <th className="py-4 px-3 text-center text-xs font-bold text-slate-500    tracking-wider">
                                                    <TableColumnFilter
                                                        colKey="stockOut"
                                                        title="S. Out"
                                                        options={uniqueStockOutQtys}
                                                        align="center"
                                                        colFilters={colFilters}
                                                        activeFilterCol={activeFilterCol}
                                                        onToggle={toggleColFilter}
                                                        onChange={handleColFilterChange}
                                                        iconSrc="/icons/action/Fillter.svg"
                                                    />
                                                </th>
                                            )}

                                            {visibleCols.currentStock && (
                                                <th className="py-4 px-3 text-center text-xs font-bold text-slate-500    tracking-wider border-r">
                                                    <TableColumnFilter
                                                        colKey="qty"
                                                        title="Cur. Stock"
                                                        options={uniqueQtys}
                                                        align="center"
                                                        colFilters={colFilters}
                                                        activeFilterCol={activeFilterCol}
                                                        onToggle={toggleColFilter}
                                                        onChange={handleColFilterChange}
                                                        iconSrc="/icons/action/Fillter.svg"
                                                    />
                                                </th>
                                            )}

                                            {visibleCols.alert && (
                                                <th className="py-4 px-3 text-center text-xs font-bold text-slate-500    tracking-wider border-r">
                                                    <TableColumnFilter
                                                        colKey="status"
                                                        title="Alert"
                                                        options={uniqueStatuses}
                                                        align="center"
                                                        colFilters={colFilters}
                                                        activeFilterCol={activeFilterCol}
                                                        onToggle={toggleColFilter}
                                                        onChange={handleColFilterChange}
                                                        iconSrc="/icons/action/Fillter.svg"
                                                    />
                                                </th>
                                            )}

                                            {visibleCols.note && (
                                                <th className="py-4 px-4 text-xs font-bold text-slate-500    tracking-wider border-r">
                                                    Note
                                                </th>
                                            )}

                                            <th className="py-4 px-4 text-center text-xs font-bold text-slate-500    tracking-wider w-24 min-w-[96px] max-w-[96px]">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 inventory-table">
                                        <AnimatePresence>
                                            {paginatedItems.map((item) => {
                                                const isEditing = editingId === item._id;
                                                const isCritical = item.alertCritical > 0 && item.currentStock <= item.alertCritical;
                                                const isLow = item.alertLow > 0 && item.currentStock <= item.alertLow;
                                                const isWrongEntry = !item.category;
                                                const rowClass = isWrongEntry
                                                    ? "bg-[#FFF5F5] dark:bg-red-950/20 hover:bg-[#FEE2E2] dark:hover:bg-red-900/30"
                                                    : isCritical
                                                        ? "bg-[#FFF5F5] dark:bg-red-950/20 hover:bg-[#FEE2E2] dark:hover:bg-red-900/30"
                                                        : isLow
                                                            ? "bg-[#FEF3C7] dark:bg-amber-950/10 hover:bg-[#FDE68A] dark:hover:bg-amber-900/20"
                                                            : "hover:bg-[#E8E8E8] dark:hover:bg-slate-800/50";

                                                const totalValue = item.currentStockMRPValue !== undefined ? item.currentStockMRPValue : ((item.stockInAmount || 0) - (item.stockOutAmount || 0));
                                                const formattedUnit = typeof item.unit === 'object' ? item.unit?.name : item.unit || 'kg';

                                                return (
                                                    <motion.tr
                                                        key={item._id}
                                                        layout
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        className={`${rowClass} transition-colors bg-card`}
                                                    >
                                                        <td className="py-4 px-3 w-12 text-center border-b border-slate-100 dark:border-slate-800">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-slate-300 text-[#8B2611] focus:ring-[#8B2611] w-4 h-4 cursor-pointer"
                                                                checked={selectedIds.includes(item._id)}
                                                                onChange={(e) => handleSelectOne(e, item._id)}
                                                            />
                                                        </td>

                                                        {visibleCols.image && (
                                                            <td className="py-4 px-3 text-center w-[80px] border-b border-slate-100 dark:border-slate-800">
                                                                <div className="flex justify-center">
                                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#1c1c1c] shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-sm relative group/cell-img">
                                                                        {(isEditing ? newItem.image : item.image) ? (
                                                                            <img
                                                                                src={isEditing ? newItem.image : item.image}
                                                                                alt={item.name}
                                                                                onClick={() => setViewImage(isEditing ? newItem.image : item.image)}
                                                                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-lg text-slate-400 font-bold select-none">+</span>
                                                                        )}
                                                                        {isEditing && (
                                                                            <label className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity rounded-xl mx-auto w-12 ${uploading ? 'opacity-100 cursor-not-allowed' : 'opacity-0 group-hover/cell-img:opacity-100 cursor-pointer'}`}>
                                                                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                                                                                {uploading ? <Loader2 size={16} className="text-white animate-spin" /> : <img src="/icons/action/Edit.svg" className="w-4 h-4 invert" alt="edit" />}
                                                                            </label>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visibleCols.product && (
                                                            <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 gradient-border-r">
                                                                {isEditing ? (
                                                                    <div className="flex flex-col gap-2 min-w-[180px]">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[9px] font-bold text-slate-400    tracking-wider">Product Name</span>
                                                                            <input
                                                                                type="text"
                                                                                name="name"
                                                                                value={newItem.name}
                                                                                onChange={handleInputChange}
                                                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-350 rounded-lg text-sm font-bold text-slate-800 focus:border-[#8B2611] outline-none   "
                                                                                placeholder="Product Name"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[9px] font-bold text-slate-400    tracking-wider">Category</span>
                                                                            <SearchableSelect
                                                                                value={newItem.category}
                                                                                onChange={(val) => setNewItem(prev => ({ ...prev, category: val }))}
                                                                                options={categories.map(c => ({ value: c._id, label: c.name }))}
                                                                                placeholder="Select Category"
                                                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-350 rounded-lg text-xs font-bold text-[#8B2611] outline-none cursor-pointer h-9 normal-case tracking-normal"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[9px] font-bold text-slate-400    tracking-wider">Unit</span>
                                                                            <SearchableSelect
                                                                                value={newItem.unit}
                                                                                onChange={(val) => setNewItem(prev => ({ ...prev, unit: val }))}
                                                                                options={units.map(u => ({ value: u._id, label: u.name }))}
                                                                                placeholder="Select Unit"
                                                                                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-350 rounded-lg text-xs font-bold text-[#8B2611] outline-none cursor-pointer h-9 normal-case tracking-normal"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col">
                                                                        <span
                                                                            className="font-bold text-base    leading-tight bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent"
                                                                        >
                                                                            {item.name}
                                                                        </span>
                                                                        <span className="text-xs text-slate-400 font-medium    mt-0.5">
                                                                            {(typeof item.category === 'object' ? item.category?.name : item.category || "Category Not Selected")} | {formattedUnit}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}

                                                        {visibleCols.stockIn && (
                                                            <td className="py-4 px-3 text-center">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatIndianNumber(item.stockInQty || 0)} {formattedUnit}</span>
                                                                    <span className="text-xs text-slate-400">₹ {formatIndianNumber(item.stockInAmount || 0)}</span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visibleCols.stockOut && (
                                                            <td className="py-4 px-3 text-center">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatIndianNumber(item.stockOutQty || 0)} {formattedUnit}</span>
                                                                    <span className="text-xs text-slate-400">₹ {formatIndianNumber(item.stockOutAmount || 0)}</span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visibleCols.currentStock && (
                                                            <td className="py-4 px-3 text-center border-b border-slate-100 dark:border-slate-800 border-r">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatIndianNumber(item.currentStock || 0)} {formattedUnit}</span>
                                                                    <span className="text-xs text-slate-400">₹ {formatIndianNumber(totalValue.toFixed(2))}</span>
                                                                </div>
                                                            </td>
                                                        )}

                                                        {visibleCols.alert && (
                                                            <td className="py-4 px-3 text-center border-b border-slate-100 dark:border-slate-800 border-r">
                                                                {isEditing ? (
                                                                    <div className="flex flex-col gap-1 items-center">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[9px] font-bold text-slate-400   ">Max</span>
                                                                            <input
                                                                                type="number"
                                                                                name="low"
                                                                                value={newItem.low}
                                                                                onChange={handleInputChange}
                                                                                className="w-14 px-1.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 rounded text-center text-xs font-bold text-slate-800 focus:border-[#8B2611] outline-none"
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[9px] font-bold text-slate-400   ">Min</span>
                                                                            <input
                                                                                type="number"
                                                                                name="critical"
                                                                                value={newItem.critical}
                                                                                onChange={handleInputChange}
                                                                                className="w-14 px-1.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 rounded text-center text-xs font-bold text-slate-800 focus:border-[#8B2611] outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-center gap-3">
                                                                        <div className="text-center">
                                                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.alertLow}</span>
                                                                            <span className="block text-[8px] text-slate-400    tracking-wider">Max</span>
                                                                        </div>
                                                                        <div className="w-px h-6 bg-[#A4A4A4] dark:bg-slate-700"></div>
                                                                        <div className="text-center">
                                                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.alertCritical}</span>
                                                                            <span className="block text-[8px] text-slate-400    tracking-wider">Min</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}

                                                        {visibleCols.note && (
                                                            <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 border-r">
                                                                {isEditing ? (
                                                                    <textarea
                                                                        name="note"
                                                                        value={newItem.note}
                                                                        onChange={handleInputChange}
                                                                        rows={2}
                                                                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:border-[#8B2611] outline-none min-w-[120px]"
                                                                        placeholder="Note"
                                                                    />
                                                                ) : (
                                                                    <div className="text-xs font-medium text-slate-500 max-w-[200px] truncate" title={item.note}>
                                                                        {item.note || <span className="opacity-30 italic">No notes</span>}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}

                                                        <td className="py-4 px-4 text-center border-b border-slate-100 dark:border-slate-800">
                                                            {isEditing ? (
                                                                <div className="flex justify-center items-center gap-3">
                                                                    <button
                                                                        onClick={() => handleSave()}
                                                                        title="Save Changes"
                                                                        className="hover:scale-110 transition-transform active:scale-95 cursor-pointer bg-transparent border-0 outline-none text-[#38A169] text-xl font-bold"
                                                                    >
                                                                        ✔
                                                                    </button>
                                                                    <button
                                                                        onClick={() => resetForm()}
                                                                        title="Cancel"
                                                                        className="hover:scale-110 transition-transform active:scale-95 cursor-pointer bg-transparent border-0 outline-none text-[#E53E3E] text-xl font-bold"
                                                                    >
                                                                        ✘
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-center items-center gap-3">
                                                                    <button
                                                                        onClick={() => setViewItem(item)}
                                                                        title="View Details"
                                                                        className="hover:scale-110 transition-transform active:scale-95 cursor-pointer bg-transparent border-0 outline-none"
                                                                    >
                                                                        <img src="/icons/action/View (1).svg" alt="View" className="w-5 h-5" />
                                                                    </button>

                                                                    {!isReadOnly && (
                                                                        <PermissionWrapper action="edit">
                                                                            <button
                                                                                onClick={() => handleEdit(item)}
                                                                                title="Edit Product"
                                                                                className="hover:scale-110 transition-transform active:scale-95 cursor-pointer bg-transparent border-0 outline-none"
                                                                            >
                                                                                <img src="/icons/action/Edit.svg" alt="Edit" className="w-5 h-5" />
                                                                            </button>
                                                                        </PermissionWrapper>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                        {filteredItems.length === 0 && (
                                            <tr>
                                                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 italic">
                                                    No items found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={filteredItems.length}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                            />
                        </div>
                    )}
                </div>

                {/* Mobile Floating Action Button */}
                <PermissionWrapper action="write">
                    <div className="md:hidden fixed bottom-24 right-6 z-[40]">
                        <button
                            onClick={() => { resetForm(); setIsMobileFormOpen(true); }}
                            className="w-16 h-16 bg-[#8B2611] text-white rounded-2xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer border-0 shadow-lg"
                        >
                            <Plus size={32} strokeWidth={3} />
                        </button>
                    </div>
                </PermissionWrapper>

                {/* Mobile Add Bottom Sheet */}
                <AnimatePresence>
                    {isMobileFormOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFormOpen(false)}
                                className="md:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[80]"
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="md:hidden fixed bottom-0 left-0 right-0 bg-card rounded-t-[3rem] z-[81] p-8 pb-12 shadow-2xl overflow-y-auto max-h-[90vh]"
                            >
                                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-black text-foreground tracking-tight   ">Quick Add</h2>
                                    <button onClick={() => setIsMobileFormOpen(false)} className="p-3 bg-muted rounded-full text-muted-foreground border-0 cursor-pointer">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <InputField label="Item Name" name="name" value={newItem.name} onChange={handleInputChange} placeholder="e.g. Rice" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField label="Category" name="category" value={newItem.category} onChange={handleInputChange} options={categoryOptions} />
                                        <SelectField label="Unit" name="unit" value={newItem.unit} onChange={handleInputChange} options={unitOptions} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Low" name="low" value={newItem.low} onChange={handleInputChange} type="number" />
                                        <InputField label="Crit" name="critical" value={newItem.critical} onChange={handleInputChange} type="number" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <InputField label="Note" name="note" value={newItem.note || ''} onChange={handleInputChange} placeholder="Any note..." />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground ml-1 block mb-2">Item Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className={`block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-55 file:text-blue-700 hover:file:bg-blue-100 ${uploading ? 'opacity-55 cursor-not-allowed' : 'cursor-pointer'}`}
                                        />
                                        {uploading && <div className="flex items-center gap-2 mt-2 text-blue-500 font-bold text-xs"><Loader2 size={14} className="animate-spin" /> Uploading...</div>}
                                        {newItem.image && (
                                            <div className="mt-2 w-full h-32 bg-stone-100 rounded-xl overflow-hidden">
                                                <img src={newItem.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        className="w-full bg-[#8B2611] text-white py-5 rounded-3xl font-black    tracking-widest mt-4 active:scale-95 shadow-lg shadow-[#8B2611]/30 cursor-pointer border-0"
                                    >
                                        Save Product
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Image View Modal */}
                <AnimatePresence>
                    {viewImage && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setViewImage(null)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative bg-card p-2 rounded-2xl max-w-3xl max-h-[80vh] overflow-hidden border border-border"
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setViewImage(null)}
                                    className="absolute top-4 right-4 p-2 bg-background/50 text-foreground rounded-full hover:bg-background/70 transition-colors z-10 border-0 cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                                <img src={viewImage} alt="Item Preview" className="w-full h-full object-contain rounded-xl" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* View Details Modal */}
                <AnimatePresence>
                    {viewItem && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm" onClick={() => setViewItem(null)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-card rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative border border-border"
                                onClick={e => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setViewItem(null)}
                                    className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors z-10 border-0 cursor-pointer bg-transparent"
                                >
                                    <X size={20} className="text-muted-foreground" />
                                </button>

                                <div className="p-8">
                                    <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8">
                                        <div className="w-24 h-24 rounded-[2rem] bg-[#8B2611]/10 flex items-center justify-center shrink-0 border border-[#8B2611]/10 shadow-sm overflow-hidden">
                                            {viewItem.image ? (
                                                <img src={viewItem.image} alt={viewItem.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl">📦</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-foreground leading-tight    tracking-tight">{viewItem.name}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="bg-muted text-muted-foreground text-[10px] font-black px-4 py-1.5 rounded-full    tracking-widest border border-slate-200">
                                                    {typeof viewItem.category === 'object' ? viewItem.category?.name : viewItem.category || "Category Not Selected"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-muted/50 p-6 rounded-[2rem] mb-8 border border-border">
                                        <div className="text-center border-r border-border/50">
                                            <div className="text-[10px] font-black text-muted-foreground    tracking-widest mb-1.5">Stock Available</div>
                                            <div className="text-2xl font-black text-foreground">{viewItem.currentStock} <span className="text-xs text-muted-foreground   ">{typeof viewItem.unit === 'object' ? viewItem.unit?.name : viewItem.unit || 'kg'}</span></div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-[10px] font-black text-muted-foreground    tracking-widest mb-1.5">Alert Thresholds</div>
                                            <div className="flex gap-4">
                                                <div className="text-center">
                                                    <div className="text-[8px] font-black text-amber-500   ">Max</div>
                                                    <div className="text-sm font-black text-foreground/80">{viewItem.alertLow}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[8px] font-black text-red-500   ">Min</div>
                                                    <div className="text-sm font-black text-foreground/80">{viewItem.alertCritical}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground    tracking-widest mb-3 ml-2">Internal Note</p>
                                            <div className="bg-muted/70 p-5 rounded-3xl text-xs font-bold text-muted-foreground border border-border italic leading-relaxed">
                                                {viewItem.note || 'No notes added for this product.'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-5 bg-[#8B2611]/5 rounded-3xl border border-[#8B2611]/10">
                                            <div className="p-2 bg-card rounded-xl shadow-sm text-[#8B2611] border border-border">
                                                <Database size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-muted-foreground    tracking-widest">Company / Source</p>
                                                <p className="text-xs font-black text-foreground/80   ">{viewItem.companyId?.name || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {isMasterManagerOpen && (
                    <MasterDataManager
                        isOpen={isMasterManagerOpen}
                        onClose={() => {
                            setIsMasterManagerOpen(false);
                            loadCategories();
                            loadUnits();
                        }}
                        allowedTabs={['categories', 'units']}
                    />
                )}
            </main>
        </div >
    );
}

function InputField({ label, ...props }) {
    return (
        <div className="flex-1 w-full relative">
            <label className="text-[10px] font-bold text-muted-foreground mb-2 block    text-center w-full absolute -top-4 tracking-widest">{label} : <span className="text-red-500 font-black">*</span></label>
            <input
                {...props}
                className="w-full px-5 py-3 bg-muted border border-border rounded-[2rem] text-xs font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-center placeholder:text-muted-foreground/30 shadow-sm"
            />
        </div>
    );
}

function SelectField({ label, options, value, onChange, name }) {
    return (
        <div className="flex-1 w-full relative">
            <label className="text-[10px] font-bold text-muted-foreground mb-2 block    text-center w-full absolute -top-4 tracking-widest">{label} : <span className="text-red-500 font-black">*</span></label>
            <FilterDropdown
                options={options}
                value={value}
                onChange={(val) => onChange({ target: { name, value: val } })}
                title={`Select ${label}`}
                isMulti={false}
                className="w-full flex items-center justify-between cursor-pointer shadow-sm transition-all focus:outline-none px-5 py-3 bg-muted border border-border rounded-[2rem] text-xs font-bold outline-none h-11"
            />
        </div>
    );
}
