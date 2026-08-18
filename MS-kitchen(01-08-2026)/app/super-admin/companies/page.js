"use client";
import CustomSelect from '../../../components/CustomSelect';
import FilterDropdown from '../../../components/FilterDropdown';
import MenusPage from '../../menus/page';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Trash2,
    Edit3,
    X,
    Building2,
    Mail,
    MapPin,
    Lock,
    Search,
    ChevronDown,
    Building,
    Filter,
    FileText,
    Key,
    Shield,
    Users,
    Check,
    AlertCircle,
    User,
    Eye,
    EyeOff,
    Phone,
    Menu
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import TableActionButton from '../../../components/TableActionButton';

export default function CompaniesPage() {
    const { showToast } = useToast();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('branch'); // 'branch', 'user', 'credentials', 'permissions'

    // Form State for Branch
    const [formData, setFormData] = useState({
        name: '',
        shortName: '',
        code: '',
        address: '',
        mobileNumber: '',
        email: '',
        password: '',
        status: 'active',
        editingId: null
    });
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

    // State for Users and Roles
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [rolePermissions, setRolePermissions] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(true);
    const [expandedMenuIds, setExpandedMenuIds] = useState({});
    const [userPermissions, setUserPermissions] = useState({});

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        roleId: '',
        role: '',
        companyId: '',
        assignedCompanies: [],
        status: 'Active',
        editingId: null
    });

    // Filter State for Credentials
    const [credentialFilters, setCredentialFilters] = useState({
        position: [],
        name: [],
        branch: [],
        phone: []
    });

    // Filter State for Branch
    const [branchFilters, setBranchFilters] = useState({
        name: [],
        shortName: [],
        code: [],
        mobileNumber: []
    });

    // Selection and Search States
    const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [branchSearch, setBranchSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        fetchCompanies();
        fetchRoles();
        fetchMenus();
        fetchUsers();
    }, []);

    useEffect(() => {
        if (isUserModalOpen) {
            const currentRole = userData.role || roles.find(r => r._id === userData.roleId)?.name;
            if (currentRole) {
                fetchModalPermissionsForRole(currentRole);
            }
        }
    }, [isUserModalOpen, userData.roleId]);

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/companies');
            const data = await res.json();
            setCompanies(data);
        } catch (error) {
            console.error('Error fetching companies', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch('/api/roles');
            const data = await res.json();
            setRoles(data);
        } catch (error) {
            console.error('Error fetching roles', error);
        }
    };

    const fetchMenus = async () => {
        try {
            const res = await fetch('/api/menus');
            const data = await res.json();
            setMenus(data);
        } catch (error) {
            console.error('Error fetching menus', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const handleSaveCompany = async (e) => {
        e.preventDefault();
        const method = formData.editingId ? 'PUT' : 'POST';
        const body = { ...formData, id: formData.editingId };

        try {
            const res = await fetch('/api/companies', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                fetchCompanies();
                resetForm();
                setIsBranchModalOpen(false);
                showToast(formData.editingId ? 'Branch updated successfully!' : 'Branch created successfully!');
            } else {
                const err = await res.json();
                showToast(`Error: ${err.message}`, 'error');
            }
        } catch (error) {
            console.error('Failed to save branch', error);
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const method = userData.editingId ? 'PUT' : 'POST';
        const selectedRoleObj = roles.find(r => r._id === userData.roleId || r.name === userData.role);
        const body = {
            ...userData,
            id: userData.editingId,
            role: selectedRoleObj?.name || userData.role || 'Staff',
            roleId: selectedRoleObj?._id || userData.roleId || null
        };

        try {
            const res = await fetch('/api/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                fetchUsers();
                resetUserForm();
                setIsUserModalOpen(false);
                showToast(userData.editingId ? 'User updated successfully!' : 'User created successfully!');
            } else {
                const err = await res.json();
                showToast(`Error: ${err.message}`, 'error');
            }
        } catch (error) {
            console.error('Failed to save user', error);
        }
    };

    const handleAddPosition = async (positionName) => {
        if (!positionName) return;
        try {
            const res = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: positionName, description: 'Added via User modal' }),
            });
            if (res.ok) {
                const newRole = await res.json();
                fetchRoles();
                setUserData(prev => ({
                    ...prev,
                    roleId: newRole._id,
                    role: newRole.name
                }));
                showToast('Position added successfully!');
            } else {
                const err = await res.json();
                showToast(`Error: ${err.message || 'Failed to add position'}`, 'error');
            }
        } catch (error) {
            console.error('Failed to add position', error);
        }
    };

    const fetchModalPermissionsForRole = async (roleName) => {
        if (!roleName) {
            setUserPermissions({});
            return;
        }
        try {
            const res = await fetch(`/api/permissions?role=${encodeURIComponent(roleName)}`);
            if (res.ok) {
                const data = await res.json();
                const permMap = {};
                if (Array.isArray(data)) {
                    data.forEach(p => {
                        const targetId = p.menuId?._id || p.menuId;
                        if (targetId) {
                            permMap[targetId] = {
                                read: !!p.read,
                                write: !!p.write,
                                edit: !!p.edit,
                                delete: !!p.delete,
                                mrp: !!p.mrp,
                                source: !!p.source
                            };
                        }
                    });
                }
                setUserPermissions(permMap);
            }
        } catch (error) {
            console.error('Error fetching position permissions', error);
        }
    };

    const shouldShowMrp = (label1, label2 = '') => {
        const combined = `${label1 || ''} ${label2 || ''}`.toLowerCase();
        if (combined.includes('cleaning') || combined.includes('recipe')) {
            return false;
        }
        const allowed = ['inventory', 'stock', 'veg', 'fruit', 'milk', 'butter', 'item', 'material', 'mrp'];
        if (allowed.some(kw => combined.includes(kw))) {
            return true;
        }
        return /\b(in|out)\b/i.test(combined);
    };

    const handleModalPermissionToggle = (menuId, field) => {
        setUserPermissions(prev => {
            const current = prev[menuId] || { read: false, write: false, edit: false, delete: false, mrp: false, source: false };
            return {
                ...prev,
                [menuId]: {
                    ...current,
                    [field]: !current[field]
                }
            };
        });
    };

    const fetchPermissionsForRole = async (roleName) => {
        try {
            const res = await fetch(`/api/permissions?role=${roleName}`);
            const data = await res.json();
            const permMap = {};
            data.forEach(p => {
                permMap[p.menuId] = { read: p.read, write: p.write, edit: p.edit, delete: p.delete, mrp: p.mrp };
            });
            setRolePermissions(permMap);
        } catch (error) {
            console.error('Failed to fetch permissions', error);
        }
    };

    const handlePermissionToggle = async (menuId, field) => {
        const newPerms = { ...rolePermissions };
        if (!newPerms[menuId]) newPerms[menuId] = { read: false, write: false, edit: false, delete: false, mrp: false };
        newPerms[menuId][field] = !newPerms[menuId][field];
        setRolePermissions(newPerms);

        try {
            await fetch('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole, menuId, ...newPerms[menuId] })
            });
        } catch (error) {
            console.error('Failed to save permission', error);
        }
    };

    const resetUserForm = () => {
        setUserData({
            name: '',
            email: '',
            password: '',
            phone: '',
            roleId: '',
            role: '',
            companyId: '',
            assignedCompanies: [],
            status: 'Active',
            editingId: null
        });
        setUserPermissions({});
    };

    const resetForm = () => {
        setFormData({ name: '', shortName: '', code: '', address: '', email: '', password: '', status: 'active', editingId: null });
    };

    const getSelectedCompanyName = () => {
        const company = companies.find(c => c._id === userData.companyId);
        return company ? company.name : 'Select Branch First';
    };

    const toggleSelectCompany = (id) => {
        setSelectedCompanyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleSelectAllCompanies = () => {
        if (selectedCompanyIds.length === companies.length) setSelectedCompanyIds([]);
        else setSelectedCompanyIds(companies.map(c => c._id));
    };
    const handleBulkDeleteBranches = async () => {
        if (!selectedCompanyIds.length) return;
        if (!confirm(`Delete ${selectedCompanyIds.length} branches?`)) return;
        for (const id of selectedCompanyIds) {
            await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        }
        fetchCompanies();
        setSelectedCompanyIds([]);
    };

    const toggleSelectUser = (id) => {
        setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleSelectAllUsers = () => {
        if (selectedUserIds.length === filteredUsers.length) setSelectedUserIds([]);
        else setSelectedUserIds(filteredUsers.map(u => u._id));
    };
    const handleBulkDeleteUsers = async () => {
        if (!selectedUserIds.length) return;
        if (!confirm(`Delete ${selectedUserIds.length} users?`)) return;
        for (const id of selectedUserIds) {
            await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        }
        fetchUsers();
        setSelectedUserIds([]);
    };

    const filteredCompanies = companies.filter(c => {
        const passName = branchFilters.name.length === 0 || branchFilters.name.includes(c.name || '');
        const passShortName = branchFilters.shortName.length === 0 || branchFilters.shortName.includes(c.shortName || '');
        const passCode = branchFilters.code.length === 0 || branchFilters.code.includes(c.code || '');
        const passPhone = branchFilters.mobileNumber.length === 0 || branchFilters.mobileNumber.includes(c.mobileNumber || '');

        const passSearch = !branchSearch || (
            (c.name || '').toLowerCase().includes(branchSearch.toLowerCase()) ||
            (c.shortName || '').toLowerCase().includes(branchSearch.toLowerCase()) ||
            (c.code || '').toLowerCase().includes(branchSearch.toLowerCase()) ||
            (c.mobileNumber || '').toLowerCase().includes(branchSearch.toLowerCase())
        );

        return passName && passShortName && passCode && passPhone && passSearch;
    });

    const filteredUsers = users
        .filter(u => u.hasPassword && !u.noLogin)
        .filter(u => {
            const branchName = companies.find(c => c._id === u.companyId)?.name || '';
            const passPosition = credentialFilters.position.length === 0 || credentialFilters.position.includes(u.role || '');
            const passName = credentialFilters.name.length === 0 || credentialFilters.name.includes(u.name || '');
            const passBranch = credentialFilters.branch.length === 0 || credentialFilters.branch.includes(branchName);
            const passPhone = credentialFilters.phone.length === 0 || credentialFilters.phone.includes(u.phone || '');
            const passSearch = !userSearch || (
                (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                (u.role || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                (u.phone || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                branchName.toLowerCase().includes(userSearch.toLowerCase())
            );

            return passPosition && passName && passBranch && passPhone && passSearch;
        });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-[#882619] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className='dark:bg-[#252525] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden'>
                {/* Top Pill Tabs Bar matching design image */}
                <div className="bg-white dark:bg-[#252525] p-6 flex justify-start">
                    <div className="inline-flex items-center p-1 bg-white dark:bg-[#1c1c1c] border border-[#D4612D]/80 rounded-xl shadow-xs">
                        <TabButton active={activeTab === 'branch'} onClick={() => setActiveTab('branch')} label="New Branch" />
                        <TabButton active={activeTab === 'credentials'} onClick={() => setActiveTab('credentials')} label="User ID & Pa." />
                        <TabButton active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} label="Personalisation" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'branch' && (
                        <motion.div key="branch-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {/* Single combined card for form + table */}
                            <div className="bg-[#E3E3E3] dark:bg-[#252525]  shadow-sm overflow-hidden">
                                <div className="relative py-[1px] bg-[#E3E3E3] dark:bg-[#252525]">
                                    {/* Top Gradient Border */}
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />

                                    {/* Bottom Gradient Border */}
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />

                                    <div className="flex flex-row items-center justify-between gap-4 py-4 px-6 bg-[#E5E5E5] dark:bg-[#181818]">
                                        <div className="flex items-baseline gap-2 shrink-0">
                                            <span className="text-2xl font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                {companies.length}
                                            </span>
                                            <span className="text-sm font-semibold italic text-stone-700 dark:text-stone-300 font-serif whitespace-nowrap">
                                                Gurukul Kitchen Branch
                                            </span>
                                        </div>

                                        <div className="relative w-full max-w-xs">
                                            <input
                                                type="text"
                                                placeholder="Quick Search"
                                                value={branchSearch}
                                                onChange={(e) => setBranchSearch(e.target.value)}
                                                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-[#1e1e1e] border border-[#D4612D] dark:border-[#D4612D] rounded-xl text-xs font-medium outline-none focus:border-[#D4612D] shadow-xs"
                                            />
                                            <Search
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                                            />
                                        </div>

                                        <div className="flex items-center gap-5 shrink-0">
                                            {selectedCompanyIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleBulkDeleteBranches}
                                                    className="flex flex-col items-center justify-center gap-0.5 group transition-all cursor-pointer"
                                                >
                                                    <img
                                                        src="/icons/action/Delete.svg"
                                                        className="w-6 h-6"
                                                        alt="Delete"
                                                    />
                                                    <span className="text-[10px] font-medium text-[#CD0000]">
                                                        Delete
                                                    </span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetForm();
                                                    setIsBranchModalOpen(true);
                                                }}
                                                className="flex flex-col items-center justify-center gap-0.5 group transition-all cursor-pointer"
                                            >
                                                <img src="/icons/action/Add.svg" className="w-10 h-10 block dark:hidden" alt="New Branch" />
                                                <img src="/icons/action/AddDark.svg" className="w-10 h-10 hidden dark:block" alt="New Branch" />
                                                <span className="text-[10px] font-medium text-[#882619]">
                                                    New Branch
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>


                                {/* Table */}
                                <div className="overflow-x-auto bg-white dark:bg-[#252525] p-6">
                                    <table className="w-full border-collapse text-left bg-white dark:bg-[#252525]">
                                        <thead>
                                            <tr
                                                style={{ borderBottom: "3px double #78716c" }}
                                                className="text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-[#252525]"
                                            >
                                                <th className="w-12 px-3 py-3.5 text-center border-r border-stone-300 dark:border-stone-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={companies.length > 0 && selectedCompanyIds.length === companies.length}
                                                        onChange={toggleSelectAllCompanies}
                                                        className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                                    />
                                                </th>
                                                <FilterHeader
                                                    label="Branch Full Name"
                                                    filterKey="name"
                                                    filters={branchFilters}
                                                    setFilters={setBranchFilters}
                                                    options={[...new Set(companies.map(c => c.name || ''))].sort()}
                                                    className="border-r border-stone-300 dark:border-stone-600 px-4 py-3.5"
                                                />
                                                <FilterHeader
                                                    label="Branch Short Name"
                                                    filterKey="shortName"
                                                    filters={branchFilters}
                                                    setFilters={setBranchFilters}
                                                    options={[...new Set(companies.map(c => c.shortName || ''))].sort()}
                                                    className=" dark:border-stone-600 px-4 py-3.5"
                                                />
                                                <FilterHeader
                                                    label="Branch Code"
                                                    filterKey="code"
                                                    filters={branchFilters}
                                                    setFilters={setBranchFilters}
                                                    options={[...new Set(companies.map(c => c.code || ''))].sort()}
                                                    className="border-r border-stone-300 dark:border-stone-600 px-4 py-3.5"
                                                />
                                                <FilterHeader
                                                    label="Ph. No."
                                                    filterKey="mobileNumber"
                                                    filters={branchFilters}
                                                    setFilters={setBranchFilters}
                                                    options={[...new Set(companies.map(c => c.mobileNumber || ''))].sort()}
                                                    className="border-r border-stone-300 dark:border-stone-600 px-4 py-3.5"
                                                />
                                                <th className="px-4 py-3.5 text-center text-stone-800 dark:text-stone-200 font-semibold text-xs whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCompanies.map((company) => (
                                                <tr key={company._id} className="border-b border-stone-300/80 dark:border-stone-600/60 transition-colors hover:bg-stone-100/50 dark:hover:bg-stone-800/40">
                                                    <td className="px-3 py-3 text-center border-r border-stone-300 dark:border-stone-600">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCompanyIds.includes(company._id)}
                                                            onChange={() => toggleSelectCompany(company._id)}
                                                            className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-stone-300 dark:border-stone-600">
                                                        <span className="text-xs font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                            {company.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 dark:border-stone-600 text-xs font-medium text-stone-700 dark:text-stone-300">
                                                        {company.shortName || '—'}
                                                    </td>
                                                    <td className="px-4 py-3  dark:border-stone-600 text-xs font-medium text-stone-700 dark:text-stone-300">
                                                        {company.code || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-700 dark:text-stone-300">
                                                        {company.mobileNumber || '—'}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({
                                                                        name: company.name,
                                                                        shortName: company.shortName || '',
                                                                        code: company.code || '',
                                                                        mobileNumber: company.mobileNumber || '',
                                                                        address: company.address || '',
                                                                        email: company.email || '',
                                                                        password: '',
                                                                        status: company.status || 'active',
                                                                        editingId: company._id
                                                                    });
                                                                    setIsBranchModalOpen(true);
                                                                }}
                                                                className="hover:scale-110 transition-transform cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <img src="/icons/action/Edit.svg" className="w-4 h-4" alt="Edit" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    if (!window.confirm('Are you sure?')) return;
                                                                    await fetch(`/api/companies/${company._id}`, { method: 'DELETE' });
                                                                    fetchCompanies();
                                                                }}
                                                                className="hover:scale-110 transition-transform cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <img src="/icons/action/Delete.svg" className="w-7 h-7 dark:hidden " alt="Delete" />
                                                                <img src="/icons/action/DeleteDark.svg" className="w-7 h-7 dark:block hidden" alt="Delete" />                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Branch Add/Edit Modal matching Image 2 */}
                            <AnimatePresence>
                                {isBranchModalOpen && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative w-full max-w-md bg-[#FAF8F5] dark:bg-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800"
                                        >
                                            {/* Header matching Image 2 */}
                                            <div className="bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] py-5 px-6 text-center shadow-md">
                                                <h2 className="text-2xl md:text-3xl font-medium text-white tracking-wide font-sans"
                                                    style={{ color: "white" }}>
                                                    {formData.editingId ? 'Edit Branch' : 'New Branch Add'}
                                                </h2>
                                                <p className="text-xs italic text-stone-200 font-serif mt-1">
                                                    Gurukul Kitchen New Branch
                                                </p>
                                            </div>

                                            {/* Form Body matching Image 2 */}
                                            <form onSubmit={handleSaveCompany} className="p-6 md:p-8 space-y-4"
                                                style={{
                                                    backgroundColor: 'white',
                                                    backgroundImage: "url('/uploads/VEG%20BG.png')",
                                                    backgroundSize: 'auto',
                                                    backgroundRepeat: 'repeat',
                                                }}>
                                                {/* Branch Full Name */}
                                                <div className="flex items-center">
                                                    <label className="text-right pr-3 text-xs font-medium text-stone-800 dark:text-stone-200">
                                                        <span className="text-[#CD0000] font-bold mr-0.5">*</span> Branch Full Name :
                                                    </label>
                                                    <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-xl shadow-xs">
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                            placeholder="Name"
                                                            required
                                                            className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Branch Short Name */}
                                                <div className="flex items-center">
                                                    <label className="w-2/5 text-right pr-3 text-xs font-medium text-stone-800 dark:text-stone-200">
                                                        <span className="text-[#CD0000] font-bold mr-0.5">*</span> Branch Short Name :
                                                    </label>
                                                    <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-xl shadow-xs">
                                                        <input
                                                            type="text"
                                                            value={formData.shortName}
                                                            onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                                                            placeholder="1234567890"
                                                            className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Branch Code */}
                                                <div className="flex items-center">
                                                    <label className="w-2/5 text-right pr-3 text-xs font-medium text-stone-800 dark:text-stone-200">
                                                        <span className="text-[#CD0000] font-bold mr-0.5">*</span> Branch Code :
                                                    </label>
                                                    <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-xl shadow-xs">
                                                        <input
                                                            type="text"
                                                            value={formData.code}
                                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                            placeholder="Branch Code 3 Letter"
                                                            className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Ph. No. */}
                                                <div className="flex items-center">
                                                    <label className="w-2/5 text-right pr-3 text-xs font-medium text-stone-800 dark:text-stone-200">
                                                        <span className="text-[#CD0000] font-bold mr-0.5">*</span> Ph. No. :
                                                    </label>
                                                    <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-xl shadow-xs">
                                                        <input
                                                            type="text"
                                                            value={formData.mobileNumber}
                                                            onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                                                            placeholder="Branch Mobile Number"
                                                            className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Branch Address */}
                                                <div className="flex items-center">
                                                    <label className="w-2/5 text-right pr-3 text-xs font-medium text-stone-800 dark:text-stone-200">
                                                        <span className="text-[#CD0000] font-bold mr-0.5">*</span> Branch Address :
                                                    </label>
                                                    <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-xl shadow-xs">
                                                        <input
                                                            type="text"
                                                            value={formData.address}
                                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                            placeholder="Branch Full Address"
                                                            className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Modal Buttons matching Image 2 */}
                                                <div className="flex items-center justify-center gap-8 pt-6 pb-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsBranchModalOpen(false)}
                                                        className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-semibold text-xs cursor-pointer transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-8 py-2.5 bg-gradient-to-r from-[#882619] to-[#D4612D] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                                                    >
                                                        {formData.editingId ? 'Update Branch' : 'Create Book'}
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>

                        </motion.div>
                    )}
                    {activeTab === 'permissions' && (
                        <motion.div key="menus-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <MenusPage />
                        </motion.div>
                    )}

                    {activeTab === 'credentials' && (
                        <motion.div key="credentials-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="bg-white dark:bg-[#252525] overflow-hidden shadow-sm border border-stone-200 dark:border-stone-800">
                                <div className="relative py-[1px] bg-[#E3E3E3] dark:bg-[#252525]">
                                    {/* Top Gradient Border */}
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />

                                    {/* Bottom Gradient Border */}
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#882619] to-[#D4612D]" />
                                    {/* Controls Sub-header Bar matching image1 */}
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 border-b border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-[#1f1f1f]">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                {filteredUsers.length}
                                            </span>
                                            <span className="text-sm font-semibold italic text-stone-700 dark:text-stone-300 font-serif">
                                                User Credential List
                                            </span>
                                        </div>

                                        <div className="relative w-full max-w-sm">
                                            <input
                                                type="text"
                                                placeholder="Quick Search"
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-[#1e1e1e] border border-[#D4612D] dark:border-[#D4612D] rounded-xl text-xs font-medium outline-none focus:border-[#D4612D] shadow-xs"
                                            />
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                        </div>

                                        <div className="flex items-center gap-5">
                                            {selectedUserIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleBulkDeleteUsers}
                                                    className="flex flex-col items-center justify-center gap-0.5 group transition-all cursor-pointer"
                                                >
                                                    <img src="/icons/action/Delete.svg" className="w-6 h-6 dark:hidden " alt="Delete" />
                                                    <img src="/icons/action/DeleteDark.svg" className="w-6 h-6 dark:block hidden" alt="Delete" />                                                    <span className="text-[10px] font-medium text-[#CD0000]">Delete</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetUserForm();
                                                    setIsUserModalOpen(true);
                                                }}
                                                className="flex flex-col items-center justify-center gap-0.5 group transition-all cursor-pointer"
                                            >
                                                <img src="/icons/action/Add.svg" className="w-10 h-10 block dark:hidden" alt="Add User" />
                                                <img src="/icons/action/AddDark.svg" className="w-10 h-10 hidden dark:block" alt="Add User" />
                                                <span className="text-[10px] font-medium text-[#882619]">Add User</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto bg-white dark:bg-[#252525] p-6">
                                    <table className="w-full border-collapse text-left bg-white dark:bg-[#252525]">
                                        <thead>
                                            <tr
                                                style={{ borderBottom: "3px double #78716c" }}
                                                className="text-xs font-semibold text-stone-700 bg-white dark:bg-[#252525]"
                                            >
                                                <th className="w-12 px-3 py-3.5 text-center border-r border-stone-300">
                                                    <input
                                                        type="checkbox"
                                                        checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                                                        onChange={toggleSelectAllUsers}
                                                        className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                                    />
                                                </th>
                                                <FilterHeader
                                                    label="Position"
                                                    filterKey="position"
                                                    filters={credentialFilters}
                                                    setFilters={setCredentialFilters}
                                                    options={[...new Set(users.filter(u => u.hasPassword && !u.noLogin).map(u => u.role || ''))].sort()}
                                                    className="border-r border-stone-300 px-4 py-3.5"
                                                />
                                                <FilterHeader
                                                    label="User Name"
                                                    filterKey="name"
                                                    filters={credentialFilters}
                                                    setFilters={setCredentialFilters}
                                                    options={[...new Set(users.filter(u => u.hasPassword && !u.noLogin).map(u => u.name || ''))].sort()}
                                                    className="border-r border-stone-300 px-4 py-3.5"
                                                />
                                                <FilterHeader
                                                    label="Branch Name"
                                                    filterKey="branch"
                                                    filters={credentialFilters}
                                                    setFilters={setCredentialFilters}
                                                    options={[...new Set(users.filter(u => u.hasPassword && !u.noLogin).map(u => companies.find(c => c._id === u.companyId)?.name || ''))].sort()}
                                                    className="border-r border-stone-300 px-4 py-3.5"
                                                />
                                                <FilterHeader
                                                    label="Ph No."
                                                    filterKey="phone"
                                                    filters={credentialFilters}
                                                    setFilters={setCredentialFilters}
                                                    options={[...new Set(users.filter(u => u.hasPassword && !u.noLogin).map(u => u.phone || ''))].sort()}
                                                    className="border-r border-stone-300 px-4 py-3.5"
                                                />
                                                <th className="px-4 py-3.5 text-center text-stone-800 dark:text-stone-200 font-semibold text-xs whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((u) => (
                                                <tr key={u._id} className="border-b border-stone-300/80 transition-colors hover:bg-stone-100/50 dark:hover:bg-stone-800/40">
                                                    <td className="px-3 py-3 text-center border-r border-stone-300">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUserIds.includes(u._id)}
                                                            onChange={() => toggleSelectUser(u._id)}
                                                            className="h-3.5 w-3.5 rounded border-[#882619] cursor-pointer accent-[#882619]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-stone-300 text-xs font-medium text-stone-700 dark:text-stone-300">{u.role}</td>
                                                    <td className="px-4 py-3 border-r border-stone-300">
                                                        <span className="text-xs font-bold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">
                                                            {u.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-stone-300 text-xs font-medium text-stone-700 dark:text-stone-300">
                                                        {companies.find(c => c._id === u.companyId)?.name || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-stone-300 text-xs font-medium text-stone-700 dark:text-stone-300">
                                                        {u.phone || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setUserData({
                                                                        ...u,
                                                                        roleId: u.roleId || roles.find(r => r.name === u.role)?._id || '',
                                                                        companyId: u.companyId || '',
                                                                        assignedCompanies: u.assignedCompanies || (u.companyId ? [u.companyId] : []),
                                                                        status: u.status || 'Active',
                                                                        password: '',
                                                                        editingId: u._id
                                                                    });
                                                                    setIsUserModalOpen(true);
                                                                }}
                                                                className="hover:scale-110 transition-transform cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <img src="/icons/action/Edit.svg" className="w-4 h-4" alt="Edit" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    if (!window.confirm('Are you sure?')) return;
                                                                    try {
                                                                        await fetch(`/api/users/${u._id}`, { method: 'DELETE' });
                                                                        fetchUsers();
                                                                        showToast('User access removed');
                                                                    } catch (err) {
                                                                        showToast('Failed to delete user', 'error');
                                                                    }
                                                                }}
                                                                className="hover:scale-110 transition-transform cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <img src="/icons/action/Delete.svg" className="w-7 h-7 dark:hidden " alt="Delete" />
                                                                <img src="/icons/action/DeleteDark.svg" className="w-7 h-7 dark:block hidden" alt="Delete" />                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2 text-stone-400">
                                                            <Search size={32} strokeWidth={1.5} />
                                                            <p className="text-xs font-medium">No matching users found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add / Edit User Modal matching design image */}
            <AnimatePresence>
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] py-5 px-6 text-center shadow-md shrink-0">
                                <h2 className="text-2xl md:text-3xl font-medium text-white tracking-wide font-serif">
                                    {userData.editingId ? 'Edit User' : 'Add New User'}
                                </h2>
                                <p className="text-xs italic text-stone-200/90 font-serif mt-1">
                                    Configure user access and branch permissions
                                </p>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSaveUser} className="p-6 md:p-8 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)]"
                                style={{
                                    backgroundColor: 'white',
                                    backgroundImage: "url('/uploads/VEG%20BG.png')",
                                    backgroundSize: 'auto',
                                    backgroundRepeat: 'repeat',
                                }}>
                                {/* Full Name */}
                                <div className="flex items-center">
                                    <label className="w-1/3 text-right pr-3 text-xs font-medium text-stone-800 dark:text-stone-200">
                                        <span className="text-[#CD0000] font-bold mr-0.5">*</span> Full Name :
                                    </label>
                                    <div className="w-2/3 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs">
                                        <input
                                            type="text"
                                            value={userData.name}
                                            onChange={e => setUserData({ ...userData, name: e.target.value })}
                                            placeholder="Name"
                                            required
                                            className="w-full px-4 py-1.5 bg-white dark:bg-[#252525] rounded-full text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                        />
                                    </div>
                                </div>

                                {/* Position */}
                                <div className="flex items-center">
                                    <label className="w-1/3 text-right pr-3 text-xs font-medium text-stone-800 dark:text-stone-200">
                                        <span className="text-[#CD0000] font-bold mr-0.5">*</span> Position :
                                    </label>
                                    <div className="w-2/3 flex items-center gap-2">
                                        <div className="flex-1 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs relative">
                                            <select
                                                value={userData.roleId || roles.find(r => r.name === userData.role)?._id || ''}
                                                onChange={e => {
                                                    const selectedRoleObj = roles.find(r => r._id === e.target.value);
                                                    const roleName = selectedRoleObj?.name || '';
                                                    setUserData({
                                                        ...userData,
                                                        roleId: selectedRoleObj?._id || '',
                                                        role: roleName
                                                    });
                                                    if (roleName) {
                                                        fetchModalPermissionsForRole(roleName);
                                                    } else {
                                                        setUserPermissions({});
                                                    }
                                                }}
                                                required
                                                className="w-full px-4 py-1.5 bg-white dark:bg-[#252525] rounded-full text-xs text-stone-800 dark:text-stone-200 outline-none appearance-none cursor-pointer pr-8"
                                            >
                                                <option value="">Select Position</option>
                                                {roles.map(r => (
                                                    <option key={r._id} value={r._id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newPos = prompt("Enter new position name:");
                                                if (newPos) handleAddPosition(newPos);
                                            }}
                                            className="text-[10px] text-[#882619] dark:text-[#D4612D] font-medium hover:underline whitespace-nowrap cursor-pointer"
                                        >
                                            + Add Position
                                        </button>
                                    </div>
                                </div>

                                {/* Gradient Divider 1 */}
                                <div className="h-[1.5px] bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] my-4 opacity-80" />

                                {/* 2-Column Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 items-end">
                                    {/* Login Id Column */}
                                    <div className="space-y-1">
                                        <div className="text-center md:text-right pr-2">
                                            <span className="text-[10px] italic font-serif text-stone-500 dark:text-stone-400">
                                                Login Id Your 10 Digit Ph. No. Only
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <label className="w-2/5 text-right pr-2 text-xs font-medium text-stone-800 dark:text-stone-200 whitespace-nowrap">
                                                <span className="text-[#CD0000] font-bold mr-0.5">*</span> Login Id :
                                            </label>
                                            <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs">
                                                <input
                                                    type="text"
                                                    maxLength={10}
                                                    value={userData.phone}
                                                    onChange={e => setUserData({ ...userData, phone: e.target.value.replace(/\D/g, '') })}
                                                    placeholder="Phone No 10 Digit Only"
                                                    required
                                                    className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-full text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Column */}
                                    <div className="space-y-1">
                                        <div className="flex items-center">
                                            <label className="w-2/5 text-right pr-2 text-xs font-medium text-stone-800 dark:text-stone-200 whitespace-nowrap">
                                                <span className="text-[#CD0000] font-bold mr-0.5">*</span> Password :
                                            </label>
                                            <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={userData.password}
                                                    onChange={e => setUserData({ ...userData, password: e.target.value })}
                                                    placeholder="Password"
                                                    required={!userData.editingId}
                                                    className="w-full pl-3.5 pr-8 py-1.5 bg-white dark:bg-[#252525] rounded-full text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                                                >
                                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Login Status Column */}
                                    <div className="flex items-center mt-2">
                                        <label className="w-2/5 text-right pr-2 text-xs font-medium text-stone-800 dark:text-stone-200 whitespace-nowrap">
                                            <span className="text-[#CD0000] font-bold mr-0.5">*</span> Login Status :
                                        </label>
                                        <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs relative">
                                            <select
                                                value={userData.status || 'Active'}
                                                onChange={e => setUserData({ ...userData, status: e.target.value })}
                                                className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-full text-xs text-stone-800 dark:text-stone-200 outline-none appearance-none cursor-pointer pr-8"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Branch Assign Column */}
                                    <div className="space-y-1">
                                        <div className="text-center md:text-right pr-2">
                                            <span className="text-[10px] italic font-serif text-stone-500 dark:text-stone-400">
                                                Multi Select Branch
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <label className="w-2/5 text-right pr-2 text-xs font-medium text-stone-800 dark:text-stone-200 whitespace-nowrap">
                                                <span className="text-[#CD0000] font-bold mr-0.5">*</span> Branch Assign :
                                            </label>
                                            <div className="w-3/5 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs relative">
                                                <select
                                                    value={userData.companyId || ''}
                                                    onChange={e => {
                                                        const cId = e.target.value;
                                                        setUserData({
                                                            ...userData,
                                                            companyId: cId,
                                                            assignedCompanies: userData.assignedCompanies?.includes(cId)
                                                                ? userData.assignedCompanies
                                                                : [...(userData.assignedCompanies || []), cId]
                                                        });
                                                    }}
                                                    className="w-full px-3.5 py-1.5 bg-white dark:bg-[#252525] rounded-full text-xs text-stone-800 dark:text-stone-200 outline-none appearance-none cursor-pointer pr-8 truncate"
                                                >
                                                    <option value="">Multi Select Branch</option>
                                                    {companies.map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gradient Divider 2 */}
                                <div className="h-[1.5px] bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] my-4 opacity-80" />

                                {/* User Permission Management Control */}
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs md:text-sm font-bold italic text-[#882619] dark:text-[#E2765A] font-serif">
                                            User Permission Management Control :
                                        </h3>
                                        {userData.role && (
                                            <span className="text-[10px] bg-[#882619]/10 dark:bg-[#D4612D]/20 text-[#882619] dark:text-[#D4612D] font-bold px-2 py-0.5 rounded-full">
                                                {userData.role}
                                            </span>
                                        )}
                                    </div>

                                    <div className="pl-1 space-y-2 max-h-56 overflow-y-auto no-scrollbar border border-stone-200/80 dark:border-stone-800 rounded-xl p-3 bg-stone-50/50 dark:bg-[#1a1a1a]">
                                        {menus.length > 0 ? (
                                            menus.map(menu => {
                                                const hasChildren = menu.children && menu.children.length > 0;
                                                const isExpanded = expandedMenuIds[menu._id] !== false;

                                                return (
                                                    <div key={menu._id} className="space-y-1.5 pb-2 border-b border-stone-200/60 dark:border-stone-800/80 last:border-b-0">
                                                        {/* Parent Menu */}
                                                        <div className="flex items-center justify-between py-1 px-2 bg-white dark:bg-[#252525] rounded-lg shadow-2xs border border-stone-200/50 dark:border-stone-700/50">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (hasChildren) {
                                                                        setExpandedMenuIds(prev => ({
                                                                            ...prev,
                                                                            [menu._id]: !isExpanded
                                                                        }));
                                                                    }
                                                                }}
                                                                className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:text-[#882619] cursor-pointer"
                                                            >
                                                                {hasChildren ? (
                                                                    <ChevronDown
                                                                        size={14}
                                                                        className={`transition-transform duration-200 text-[#882619] ${isExpanded ? '' : '-rotate-90'}`}
                                                                    />
                                                                ) : (
                                                                    <span className="w-3.5 h-3.5 text-[#882619] flex items-center justify-center text-[10px]">▪</span>
                                                                )}
                                                                <span>{menu.label} :</span>
                                                            </button>

                                                            <div className="flex items-center gap-3">
                                                                {['read', 'write', 'edit', 'delete', 'mrp', 'source'].map(perm => {
                                                                    if (perm === 'mrp' && !shouldShowMrp(menu.label)) return null;
                                                                    return (
                                                                        <label key={perm} className="flex items-center gap-1 cursor-pointer text-[10px] capitalize font-medium text-stone-600 dark:text-stone-400">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={userPermissions[menu._id]?.[perm] || false}
                                                                                onChange={() => handleModalPermissionToggle(menu._id, perm)}
                                                                                className="accent-[#882619] rounded cursor-pointer h-3.5 w-3.5"
                                                                            />
                                                                            {perm === 'mrp' ? 'Mrp' : perm === 'source' ? 'Source' : perm}
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Submenus (Children) */}
                                                        {hasChildren && isExpanded && (
                                                            <div className="pl-6 space-y-1 pt-0.5">
                                                                {menu.children.map(child => {
                                                                    const childId = child._id || child.id || child.label;
                                                                    return (
                                                                        <div key={childId} className="flex items-center justify-between py-1 px-2.5 bg-stone-100/60 dark:bg-[#202020] rounded-md border border-stone-200/40 dark:border-stone-800/40 text-xs">
                                                                            <span className="text-stone-700 dark:text-stone-300 font-medium text-[11px] flex items-center gap-1.5">
                                                                                <span className="text-[#882619] font-bold">↳</span> {child.label} :
                                                                            </span>
                                                                            <div className="flex items-center gap-3">
                                                                                {['read', 'write', 'edit', 'delete', 'mrp', 'source'].map(perm => {
                                                                                    if (perm === 'mrp' && !shouldShowMrp(child.label, menu.label)) return null;
                                                                                    return (
                                                                                        <label key={perm} className="flex items-center gap-1 cursor-pointer text-[10px] capitalize text-stone-500 dark:text-stone-400">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={userPermissions[childId]?.[perm] || false}
                                                                                                onChange={() => handleModalPermissionToggle(childId, perm)}
                                                                                                className="accent-[#882619] rounded cursor-pointer h-3.5 w-3.5"
                                                                                            />
                                                                                            {perm === 'mrp' ? 'Mrp' : perm === 'source' ? 'Source' : perm}
                                                                                        </label>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-[10px] text-stone-400 italic text-center py-2">No menu items found</p>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex items-center justify-end gap-6 pt-6 pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserModalOpen(false)}
                                        className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white font-semibold text-xs cursor-pointer transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2.5 bg-gradient-to-r from-[#882619] to-[#D4612D] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                                    >
                                        {userData.editingId ? 'Update User' : 'Add New User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}

function TabButton({ active, label, icon, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${active
                ? 'bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] text-white shadow-md font-medium'
                : 'bg-transparent text-stone-600 dark:text-stone-300 hover:text-[#882619] dark:hover:text-[#D4612D] font-medium'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function InputField({ label, icon, subtext, type = 'text', ...props }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[140px]">
                {icon && <div className="text-stone-400">{icon}</div>}
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">{label} :</label>
            </div>
            <div className="flex-1">
                <input
                    type={type}
                    {...props}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-stone-300 dark:border-stone-700 rounded-full outline-none focus:border-[#D4612D] transition-all font-bold text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 shadow-xs"
                />
                {subtext && <p className="text-[10px] text-stone-400 italic ml-4 mt-1">{subtext}</p>}
            </div>
        </div>
    );
}

function SelectField({ label, icon, options, ...props }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[140px]">
                {icon && <div className="text-stone-400">{icon}</div>}
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">{label} :</label>
            </div>
            <div className="flex-1">
                <CustomSelect {...props} className="w-full px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-stone-300 dark:border-stone-700 rounded-full outline-none appearance-none font-bold text-xs text-stone-900 dark:text-stone-100 shadow-xs cursor-pointer">
                    <option value="">Select Option</option>
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </CustomSelect>
            </div>
        </div>
    );
}

function FilterHeader({ label, filterKey, filters, setFilters, options = [], className }) {
    return (
        <th className={`text-left border-r border-stone-300 ${className || 'px-4 py-3.5'}`}>
            <FilterDropdown
                title={label}
                showTitleOnly={true}
                icon={<img src="/icons/action/Fillter.svg" className="w-3.5 h-3.5 hover:scale-110 transition-transform cursor-pointer" alt="Filter" />}
                placeholder={`Search ${label}...`}
                options={options.map(opt => ({ value: opt || 'N/A', label: opt || 'N/A' }))}
                value={filters[filterKey] || []}
                onChange={(selectedValues) => {
                    setFilters(prev => ({
                        ...prev,
                        [filterKey]: selectedValues
                    }));
                }}
                isMulti={true}
                className="!bg-transparent !border-0 !p-0 !h-auto text-xs font-semibold text-stone-700 dark:text-stone-300 inline-flex items-center justify-start gap-1.5 shadow-none cursor-pointer"
                style={{ minWidth: 'auto' }}
            />
        </th>
    );
}

function PermissionCheckbox({ checked, onChange, disabled }) {
    return (
        <button
            type="button"
            onClick={disabled ? undefined : onChange}
            disabled={disabled}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${checked
                ? 'bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-xs font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95 cursor-pointer'}`}
        >
            {checked ? <Check size={16} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />}
        </button>
    );
}

