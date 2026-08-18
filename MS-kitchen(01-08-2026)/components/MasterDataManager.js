import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2 } from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';
import FilterDropdown from './FilterDropdown';

export default function MasterDataManager({ isOpen, onClose, onRefresh, allowedTabs = null, initialTab = null, companyId: propsCompanyId = null }) {
    const { isReadOnly } = useCompany();
    const [role, setRole] = React.useState('');

    React.useEffect(() => {
        setRole(localStorage.getItem('role') || '');
    }, []);

    const ALL_TABS = [
        { id: 'categories', label: 'Categories' },
        { id: 'units', label: 'Units' },
        { id: 'departments', label: 'Time' },
        { id: 'mealTypes', label: 'Meal Types' },
        { id: 'events', label: 'Events' },
        { id: 'logCategories', label: 'Types' },
        { id: 'donationTypes', label: 'Donation Types' },
        { id: 'paymentModes', label: 'Payment Modes' },
        { id: 'recipientCategories', label: 'Signature' },
        { id: 'roles', label: 'Role' },
        { id: 'positions', label: 'Position' },
        { id: 'cleaningAreas', label: 'Cleaning Areas' },
        { id: 'peopleCategories', label: 'People Type' },
        { id: 'cashbookCategories', label: 'Cashbook Category' },
        { id: 'cashbookSignatures', label: 'Cashbook Signature' },
        { id: 'cashbookVendorTypes', label: 'Cashbook Vendor Type' }
    ];

    const visibleTabs = allowedTabs
        ? ALL_TABS.filter(tab => allowedTabs.includes(tab.id))
        : ALL_TABS;

    const [activeTab, setActiveTab] = useState(initialTab || visibleTabs[0]?.id || 'categories');
    const [editingItem, setEditingItem] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [newItemSection, setNewItemSection] = useState(['general']);

    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [events, setEvents] = useState([]);
    const [logCategories, setLogCategories] = useState([]);
    const [donationTypes, setDonationTypes] = useState([]);
    const [paymentModes, setPaymentModes] = useState([]);
    const [recipientCategories, setRecipientCategories] = useState([]);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [cleaningAreas, setCleaningAreas] = useState([]);
    const [peopleCategories, setPeopleCategories] = useState([]);
    const [cashbookCategories, setCashbookCategories] = useState([]);
    const [cashbookSignatures, setCashbookSignatures] = useState([]);
    const [cashbookVendorTypes, setCashbookVendorTypes] = useState([]);
    const [mealTypes, setMealTypes] = useState([]);
    const { selectedCompanyIds } = useCompany();
    const companyId = propsCompanyId || selectedCompanyIds?.[0];

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const loadData = async () => {
        try {
            const fetchPromises = [];
            const labels = [];
            const query = companyId ? `?companyId=${companyId}` : '';

            if (!allowedTabs || allowedTabs.includes('categories')) { fetchPromises.push(fetch(`/api/categories${query}`).then(r => r.json())); labels.push('categories'); }
            if (!allowedTabs || allowedTabs.includes('units')) { fetchPromises.push(fetch('/api/units').then(r => r.json())); labels.push('units'); }
            if (!allowedTabs || allowedTabs.includes('departments')) { fetchPromises.push(fetch(`/api/departments${query}`).then(r => r.json())); labels.push('departments'); }
            if (!allowedTabs || allowedTabs.includes('events')) { fetchPromises.push(fetch(`/api/events${query}`).then(r => r.json())); labels.push('events'); }
            if (!allowedTabs || allowedTabs.includes('logCategories')) { fetchPromises.push(fetch(`/api/log-categories${query}`).then(r => r.json())); labels.push('logCategories'); }
            if (!allowedTabs || allowedTabs.includes('donationTypes')) { fetchPromises.push(fetch(`/api/donation-event-types${query}`).then(r => r.json())); labels.push('donationTypes'); }
            if (!allowedTabs || allowedTabs.includes('paymentModes')) { fetchPromises.push(fetch(`/api/payment-modes${query}`).then(r => r.json())); labels.push('paymentModes'); }
            if (!allowedTabs || allowedTabs.includes('recipientCategories')) { fetchPromises.push(fetch(`/api/recipient-categories${query}`).then(r => r.json())); labels.push('recipientCategories'); }
            if (!allowedTabs || allowedTabs.includes('roles')) { fetchPromises.push(fetch('/api/roles').then(r => r.json())); labels.push('roles'); }
            if (!allowedTabs || allowedTabs.includes('positions')) { fetchPromises.push(fetch('/api/positions').then(r => r.json())); labels.push('positions'); }
            if (!allowedTabs || allowedTabs.includes('cleaningAreas')) { fetchPromises.push(fetch(`/api/cleaning/areas${query}`).then(r => r.json())); labels.push('cleaningAreas'); }
            if (!allowedTabs || allowedTabs.includes('peopleCategories')) { fetchPromises.push(fetch(`/api/people-categories${query}`).then(r => r.json())); labels.push('peopleCategories'); }
            if (!allowedTabs || allowedTabs.includes('cashbookCategories')) { fetchPromises.push(fetch(`/api/cashbook/categories${query}`).then(r => r.json())); labels.push('cashbookCategories'); }
            if (!allowedTabs || allowedTabs.includes('cashbookSignatures')) { fetchPromises.push(fetch(`/api/cashbook/signatures${query}`).then(r => r.json())); labels.push('cashbookSignatures'); }
            if (!allowedTabs || allowedTabs.includes('cashbookVendorTypes')) { fetchPromises.push(fetch(`/api/cashbook/vendor-types${query}`).then(r => r.json())); labels.push('cashbookVendorTypes'); }
            if (!allowedTabs || allowedTabs.includes('mealTypes')) { fetchPromises.push(fetch(`/api/meal-types${query}`).then(r => r.json())); labels.push('mealTypes'); }

            const results = await Promise.all(fetchPromises);

            results.forEach((data, index) => {
                const label = labels[index];
                if (Array.isArray(data)) {
                    if (label === 'categories') setCategories(data);
                    if (label === 'units') setUnits(data);
                    if (label === 'departments') setDepartments(data);
                    if (label === 'events') setEvents(data);
                    if (label === 'logCategories') setLogCategories(data);
                    if (label === 'donationTypes') setDonationTypes(data);
                    if (label === 'paymentModes') setPaymentModes(data);
                    if (label === 'recipientCategories') setRecipientCategories(data);
                    if (label === 'roles') setRoles(data);
                    if (label === 'positions') setPositions(data);
                    if (label === 'cleaningAreas') setCleaningAreas(data);
                    if (label === 'peopleCategories') setPeopleCategories(data);
                    if (label === 'cashbookCategories') setCashbookCategories(data);
                    if (label === 'cashbookSignatures') setCashbookSignatures(data);
                    if (label === 'cashbookVendorTypes') setCashbookVendorTypes(data);
                    if (label === 'mealTypes') setMealTypes(data);
                }
            });
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    let currentList = [];
    let apiUrl = '';

    switch (activeTab) {
        case 'categories':
            currentList = categories;
            if (Array.isArray(newItemSection) && newItemSection.length > 0) {
                currentList = categories.filter(c => {
                    const sec = c.section || 'general';
                    return newItemSection.includes(sec);
                });
            } else if (typeof newItemSection === 'string' && newItemSection !== '') {
                if (newItemSection === 'general') {
                    currentList = categories.filter(c => !c.section || c.section === 'general');
                } else {
                    currentList = categories.filter(c => c.section === newItemSection);
                }
            }
            apiUrl = '/api/categories';
            break;
        case 'units':
            currentList = units;
            apiUrl = '/api/units';
            break;
        case 'departments':
            currentList = departments;
            apiUrl = '/api/departments';
            break;
        case 'events':
            currentList = events;
            apiUrl = '/api/events';
            break;
        case 'logCategories':
            currentList = logCategories;
            apiUrl = '/api/log-categories';
            break;
        case 'donationTypes':
            currentList = donationTypes;
            apiUrl = '/api/donation-event-types';
            break;
        case 'paymentModes':
            currentList = paymentModes;
            apiUrl = '/api/payment-modes';
            break;
        case 'recipientCategories':
            currentList = recipientCategories;
            apiUrl = '/api/recipient-categories';
            break;
        case 'roles':
            currentList = roles;
            apiUrl = '/api/roles';
            break;
        case 'positions':
            currentList = positions;
            apiUrl = '/api/positions';
            break;
        case 'cleaningAreas':
            currentList = cleaningAreas;
            apiUrl = '/api/cleaning/areas';
            break;
        case 'mealTypes':
            currentList = mealTypes;
            apiUrl = '/api/meal-types';
            break;
        case 'peopleCategories':
            currentList = peopleCategories;
            apiUrl = '/api/people-categories';
            break;
        case 'cashbookCategories':
            currentList = cashbookCategories;
            apiUrl = '/api/cashbook/categories';
            break;
        case 'cashbookSignatures':
            currentList = cashbookSignatures;
            apiUrl = '/api/cashbook/signatures';
            break;
        case 'cashbookVendorTypes':
            currentList = cashbookVendorTypes;
            apiUrl = '/api/cashbook/vendor-types';
            break;
    }

    const handleSave = async () => {
        if (isReadOnly) return;
        if (!newItemName.trim()) return;

        const method = editingItem ? 'PUT' : 'POST';
        const body = { name: newItemName };
        if (activeTab === 'categories') {
            body.section = Array.isArray(newItemSection) ? (newItemSection[0] || 'general') : newItemSection;
        }
        if (editingItem) body.id = editingItem._id;
        // Most items are company-specific. If we have a selected company, pass it.
        if (companyId) body.companyId = companyId;

        try {
            const res = await fetch(apiUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setNewItemName('');
                setNewItemSection(['general']);
                setEditingItem(null);
                await loadData();
                if (onRefresh) onRefresh();
            } else {
                alert('Failed to save');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (isReadOnly) return;
        if (!window.confirm('Delete this item? It may affect products using it.')) return;
        try {
            const separator = apiUrl.includes('?') ? '&' : '?';
            const companyQuery = companyId ? `&companyId=${companyId}` : '';
            const res = await fetch(`${apiUrl}${separator}id=${id}${companyQuery}`, { method: 'DELETE' });
            if (res.ok) {
                await loadData();
                if (onRefresh) onRefresh();
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 transition-all">
            <div className="bg-card rounded-[2rem] sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[80vh]">
                <div className="px-4 py-5 sm:p-6 flex justify-between items-center bg-muted/30 border-b border-border gap-3">
                    <h2 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">Manage Source</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors group">
                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {visibleTabs.length > 1 && (
                    <div className="px-2 py-2 sm:p-2 bg-muted/20 border-b border-border">
                        <div className="flex gap-2 overflow-x-auto  px-1">
                            {visibleTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setEditingItem(null); setNewItemName(''); setNewItemSection(['general']); }}
                                    className={`shrink-0 px-3 sm:px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border ${activeTab === tab.id ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!isReadOnly && (
                    <div className="px-4 py-4 sm:p-6 bg-muted/10 border-b border-border">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder={editingItem ? "Update name..." : `Add new ${activeTab.slice(0, -1)}...`}
                                className="w-full sm:flex-1 min-w-0 px-4 py-3 rounded-xl bg-input border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
                            />

                            {activeTab === 'categories' && (
                                <FilterDropdown
                                    options={[
                                        { value: 'general', label: 'General' },
                                        { value: 'veg-fruits', label: 'Veg & Fruits' },
                                        { value: 'dairy', label: 'Milk & Buttermilk' }
                                    ]}
                                    value={newItemSection}
                                    onChange={(val) => setNewItemSection(val)}
                                    title="Select Section"
                                    isMulti={true}
                                    className="flex items-center justify-between cursor-pointer w-full sm:w-auto px-4 py-3 rounded-xl bg-input border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground h-[46px] min-w-[150px]"
                                />
                            )}

                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handleSave}
                                    disabled={!newItemName.trim()}
                                    className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-primary-hover disabled: disabled:cursor-not-allowed transition-all"
                                >
                                    {editingItem ? 'Update' : 'Add'}
                                </button>

                                {editingItem && (
                                    <button
                                        onClick={() => {
                                            setEditingItem(null);
                                            setNewItemName('');
                                            setNewItemSection(['general']);
                                        }}
                                        className="flex-1 sm:flex-none px-4 py-3 bg-muted text-foreground rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-muted/80 transition-all border border-border"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-y-auto px-3 py-3 sm:p-4 space-y-2 flex-1">
                    {currentList.map(item => (
                        <div key={item._id} className="flex items-start sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-primary/5 transition-all group">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className="font-semibold text-foreground text-sm sm:text-base break-words">{item.name}</span>
                                {activeTab === 'categories' && item.section && item.section !== 'general' && (
                                    <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                                        {item.section === 'dairy' ? 'Milk & Buttermilk' : item.section === 'veg-fruits' ? 'Veg & Fruits' : item.section}
                                    </span>
                                )}
                                {role === 'Super Admin' && item.companyId?.name && (
                                    <span className="text-[10px] font-bold text-[#e67022] uppercase tracking-tight opacity-70 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 whitespace-nowrap">
                                        {item.companyId.name}
                                    </span>
                                )}
                            </div>
                            {!isReadOnly && (
                                <div className="flex gap-1 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => { setEditingItem(item); setNewItemName(item.name); if (activeTab === 'categories') setNewItemSection([item.section || 'general']); }}
                                        className="p-2 text-primary hover:bg-blue-100 rounded-lg"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {currentList.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground italic text-sm">No items found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
