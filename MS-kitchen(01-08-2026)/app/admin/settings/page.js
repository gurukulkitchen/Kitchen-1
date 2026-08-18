'use client';

import CustomSelect from '../../../components/CustomSelect';
import SearchableSelect from '@/components/SearchableSelect';
import FilterDropdown from '@/components/FilterDropdown';
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
    Menu as MenuIcon,
    Edit2,
    ChevronRight,
    LayoutDashboard,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    UtensilsCrossed,
    Settings,
    Carrot,
    MoreVertical,
    Database
} from 'lucide-react';
import { useToast } from '@/components/Toast';
import TableActionButton from '../../../components/TableActionButton';

// Icon mapping helper
const getIcon = (iconName, size = 20, className = '') => {
    const icons = {
        LayoutDashboard,
        Package,
        ArrowDownToLine,
        ArrowUpFromLine,
        Menu: MenuIcon,
        UtensilsCrossed,
        Settings,
        Carrot,
        Circle: Package // Default
    };
    const Icon = icons[iconName] || icons.Circle;
    return <Icon size={size} className={className} />;
};

export default function AdminSettingsPage() {
    const { showToast } = useToast();
    const [currentUser, setCurrentUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('credentials'); // 'credentials', 'permissions'
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    // State for Users and Roles
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [userPermissions, setUserPermissions] = useState({});
    const [expandedMenuIds, setExpandedMenuIds] = useState({});
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRole, setEditingRole] = useState(null);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        roleId: '',
        companyId: '',
        assignedCompanies: [],
        status: 'Active',
        editingId: null
    });

    // Filter State for Credentials
    const [credentialFilters, setCredentialFilters] = useState({
        position: [],
        name: [],
        phone: [],
        status: []
    });
    const [showFilterInputs, setShowFilterInputs] = useState({
        position: false,
        name: false,
        phone: false,
        status: false
    });

    // Selection and Search States
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [userSearch, setUserSearch] = useState('');

    const fetchRolesAndPermissions = React.useCallback(async (userObj = currentUser) => {
        try {
            const role = userObj?.role || currentUser?.role;
            if (!role) return;

            // Fetch Roles
            const roleRes = await fetch('/api/roles');
            const roleData = await roleRes.json();

            const manageRoles = roleData.filter(r => {
                if (role !== 'Super Admin' && (r.name === 'Super Admin' || r.name === 'Admin')) return false;
                if (!r.isSystem && (userObj?.companyId || currentUser?.companyId)) {
                    const compId = userObj?.companyId || currentUser?.companyId;
                    if (r.companyId && String(r.companyId) !== String(compId)) return false;
                }
                return true;
            });
            setRoles(manageRoles);

            // Fetch Permissions
            const permMap = {};
            for (const roleItem of manageRoles) {
                const pRes = await fetch(`/api/permissions?role=${roleItem.name}`, { cache: 'no-store' });
                const pData = await pRes.json();
                permMap[roleItem.name] = {};
                pData.forEach(p => {
                    if (p.menuId) {
                        permMap[roleItem.name][p.menuId._id || p.menuId] = p;
                    }
                });
            }
            setPermissions(permMap);
        } catch (error) {
            console.error("Error fetching permissions:", error);
        }
    }, [currentUser]);

    const fetchMenus = React.useCallback(async () => {
        try {
            const res = await fetch('/api/menus');
            const data = await res.json();
            setMenus(data);
        } catch (error) {
            console.error('Error fetching menus', error);
        }
    }, []);

    const fetchUsers = React.useCallback(async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    }, []);

    useEffect(() => {
        const initPage = async () => {
            try {
                const authRes = await fetch('/api/auth/me');
                if (!authRes.ok) {
                    window.location.href = '/login';
                    return;
                }
                const authData = await authRes.json();
                const user = authData.user || authData;
                setCurrentUser(user);
                setCurrentUserRole(user.role);

                const companiesRes = await fetch('/api/companies');
                if (companiesRes.ok) {
                    const allCompanies = await companiesRes.json();
                    setCompanies(allCompanies);
                    if (user.companyId) {
                        const adminCompany = allCompanies.find(c => String(c._id) === String(user.companyId));
                        setCompany(adminCompany);
                    }
                }

                await Promise.all([
                    fetchRolesAndPermissions(user),
                    fetchMenus(),
                    fetchUsers()
                ]);
            } catch (error) {
                console.error('Error initializing settings page', error);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, []);

    useEffect(() => {
        if (isUserModalOpen) {
            const currentRole = userData.role || roles.find(r => r._id === userData.roleId)?.name;
            if (currentRole) {
                fetchModalPermissionsForRole(currentRole);
            }
        }
    }, [isUserModalOpen, userData.roleId]);

    const resetUserForm = () => {
        setUserData({
            name: '',
            email: '',
            password: '',
            phone: '',
            roleId: '',
            companyId: currentUser?.companyId || '',
            assignedCompanies: currentUser?.companyId ? [currentUser.companyId] : [],
            status: 'Active',
            editingId: null
        });
        setUserPermissions({});
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
                fetchRolesAndPermissions();
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

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const method = userData.editingId ? 'PUT' : 'POST';
        const selectedRoleObj = roles.find(r => r._id === userData.roleId || r.name === userData.role);
        const body = {
            ...userData,
            id: userData.editingId,
            companyId: userData.companyId || currentUser?.companyId,
            assignedCompanies: userData.assignedCompanies?.length ? userData.assignedCompanies : (currentUser?.companyId ? [currentUser.companyId] : []),
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
            showToast('Failed to save user', 'error');
        }
    };

    const handlePermissionChange = async (roleName, menuId, field, value) => {
        const activeRoleObj = roles.find(r => r.name === roleName);
        if (activeRoleObj?.isSystem) {
            showToast('System role permissions cannot be modified.', 'error');
            return;
        }

        const currentPerms = permissions[roleName]?.[menuId] || { read: false, write: false, edit: false, delete: false, mrp: false, source: false };
        let newPerms = { ...currentPerms, [field]: value };

        if (field === 'read' && !value) {
            newPerms = { read: false, write: false, edit: false, delete: false, mrp: false, source: false };
        } else if (value && (field === 'write' || field === 'edit' || field === 'delete' || field === 'mrp' || field === 'source')) {
            newPerms.read = true;
        }

        setPermissions(prev => ({
            ...prev,
            [roleName]: {
                ...prev[roleName],
                [menuId]: newPerms
            }
        }));

        try {
            const res = await fetch('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: roleName,
                    menuId,
                    ...newPerms
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                showToast(err.error || 'Failed to update permissions', 'error');
                fetchRolesAndPermissions();
            }
        } catch (error) {
            console.error('Failed to update permission', error);
            showToast('Failed to update permissions', 'error');
            fetchRolesAndPermissions();
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        try {
            const method = editingRole ? 'PUT' : 'POST';
            const body = editingRole ? { id: editingRole._id, name: newRoleName } : { name: newRoleName, description: `Custom role for ${company?.name || 'Company'}` };

            const res = await fetch('/api/roles', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setNewRoleName('');
                setEditingRole(null);
                fetchRolesAndPermissions();
                showToast(editingRole ? 'Role updated successfully!' : 'Role created successfully!');
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to save role', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to save role', 'error');
        }
    };

    const handleEditRole = (role) => {
        if (role.isSystem) {
            showToast("System roles cannot be edited.", "error");
            return;
        }
        setEditingRole(role);
        setNewRoleName(role.name);
    };

    const handleDeleteRole = async (id) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            const res = await fetch(`/api/roles?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchRolesAndPermissions();
                showToast('Role deleted successfully!');
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to delete role', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete role', 'error');
        }
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

    const filteredUsers = users
        .filter(u => u.hasPassword && !u.noLogin)
        .filter(u => {
            const passPosition = credentialFilters.position.length === 0 || credentialFilters.position.includes(u.role || '');
            const passName = credentialFilters.name.length === 0 || credentialFilters.name.includes(u.name || '');
            const passPhone = credentialFilters.phone.length === 0 || credentialFilters.phone.includes(u.phone || '');
            const passStatus = credentialFilters.status.length === 0 || credentialFilters.status.includes(u.status || 'Active');
            const passSearch = !userSearch || (
                (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                (u.role || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                (u.phone || '').toLowerCase().includes(userSearch.toLowerCase())
            );

            return passPosition && passName && passPhone && passStatus && passSearch;
        });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-[#882619] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className='dark:bg-[#252525] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden'>

                {/* Top Pill Tabs Bar */}
                <div className="bg-white dark:bg-[#252525] p-6 flex justify-start">
                    <div className="inline-flex items-center p-1 bg-white dark:bg-[#1c1c1c] border border-[#D4612D]/80 rounded-xl shadow-xs">
                        <TabButton active={activeTab === 'credentials'} onClick={() => setActiveTab('credentials')} label="User ID & Pa." />
                        <TabButton active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} label="Personalisation" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'permissions' && (
                        <motion.div key="permissions-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {/* Create/Edit Role Input */}
                            <div className="mb-6 p-6 rounded-2xl bg-white dark:bg-[#252525] border border-stone-200 dark:border-stone-800 shadow-sm">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
                                            {editingRole ? 'Edit Role Name' : 'New Role Name'}
                                        </label>
                                        <input
                                            className="w-full px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-stone-300 dark:border-stone-700 rounded-full outline-none font-bold text-xs text-stone-900 dark:text-white"
                                            placeholder="e.g. Kitchen staff"
                                            value={newRoleName}
                                            onChange={(e) => setNewRoleName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCreateRole}
                                            className="px-6 py-2 bg-gradient-to-r from-[#882619] to-[#D4612D] text-white rounded-full text-xs font-bold shadow-md transition-all active:scale-95 hover:opacity-90 cursor-pointer"
                                        >
                                            {editingRole ? 'Update Role' : 'Create Role'}
                                        </button>
                                        {editingRole && (
                                            <button
                                                onClick={() => { setEditingRole(null); setNewRoleName(''); }}
                                                className="bg-stone-400 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-stone-500 transition-all cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Role List Tags */}
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {roles.map(role => (
                                        <div key={role._id} className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-700">
                                            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">{role.name}</span>
                                            {!role.isSystem && (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleEditRole(role)}
                                                        className="p-1 text-stone-500 hover:text-stone-800 transition-colors"
                                                        title="Edit Role Name"
                                                    >
                                                        <img src="/icons/action/Edit.svg" className="w-3.5 h-3.5" alt="Edit" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRole(role._id)}
                                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                                        title="Delete Role"
                                                    >
                                                        <img src="/icons/action/Delete.svg" className="w-5 h-5" alt="Delete" />
                                                    </button>
                                                </div>
                                            )}
                                            {role.isSystem && (
                                                <span className="text-[9px] bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">System</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Matrix Table */}
                            <div className="bg-white dark:bg-[#252525] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm mb-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-left bg-white dark:bg-[#252525]">
                                        <thead>
                                            <tr style={{ borderBottom: "3px double #78716c" }} className="text-xs font-semibold text-stone-700 bg-white dark:bg-[#252525]">
                                                <th className="px-6 py-3.5 border-r border-stone-300 text-stone-800 dark:text-stone-200 font-bold text-xs whitespace-nowrap min-w-[200px] text-left">Menu Item</th>
                                                {roles.map(role => (
                                                    <th key={role._id} className="px-6 py-3.5 text-stone-800 dark:text-stone-200 font-bold text-xs whitespace-nowrap text-center min-w-[180px] border-r border-stone-300 last:border-r-0">
                                                        {role.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                                            {menus.map(menu => (
                                                <React.Fragment key={menu._id}>
                                                    <tr className="hover:bg-stone-100/50 dark:hover:bg-stone-800/40 transition-colors">
                                                        <td className="px-6 py-4 border-r border-stone-300 font-bold text-xs bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent flex items-center gap-2">
                                                            {getIcon(menu.icon, 16, "text-stone-500")}
                                                            {menu.label}
                                                        </td>
                                                        {roles.map(role => {
                                                            const rolePerms = permissions[role.name]?.[menu._id] || {};
                                                            return (
                                                                <td key={`${role._id}-${menu._id}`} className="px-6 py-4 text-center border-r border-stone-300 last:border-r-0">
                                                                    <div className="flex justify-center gap-3">
                                                                        {['read', 'write', 'edit', 'delete', 'mrp', 'source'].map(action => (
                                                                            <label key={action} className={`flex flex-col items-center cursor-pointer group ${role.isSystem ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                                <span className="text-[8px] font-black uppercase text-stone-500 mb-1">{action}</span>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-3.5 h-3.5 rounded accent-[#882619] cursor-pointer disabled:cursor-not-allowed"
                                                                                    checked={rolePerms[action] || false}
                                                                                    disabled={role.isSystem}
                                                                                    onChange={(e) => handlePermissionChange(role.name, menu._id, action, e.target.checked)}
                                                                                />
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>

                                                    {menu.children && menu.children.map(child => (
                                                        <tr key={child._id} className="hover:bg-stone-100/50 dark:hover:bg-stone-800/40 transition-colors">
                                                            <td className="px-6 py-4 border-r border-stone-300 font-medium text-xs text-stone-600 dark:text-stone-300 pl-12 flex items-center gap-2">
                                                                {child.label}
                                                            </td>
                                                            {roles.map(role => {
                                                                const rolePerms = permissions[role.name]?.[child._id] || {};
                                                                return (
                                                                    <td key={`${role._id}-${child._id}`} className="px-6 py-4 text-center border-r border-stone-300 last:border-r-0">
                                                                        <div className="flex justify-center gap-3">
                                                                            {['read', 'write', 'edit', 'delete', 'mrp', 'source'].map(action => (
                                                                                <label key={action} className={`flex flex-col items-center cursor-pointer group ${role.isSystem ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                                    <span className="text-[8px] font-black uppercase text-stone-500 mb-1">{action}</span>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="w-3.5 h-3.5 rounded accent-[#882619] cursor-pointer disabled:cursor-not-allowed"
                                                                                        checked={rolePerms[action] || false}
                                                                                        disabled={role.isSystem}
                                                                                        onChange={(e) => handlePermissionChange(role.name, child._id, action, e.target.checked)}
                                                                                    />
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'credentials' && (
                        <motion.div key="credentials-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="bg-white dark:bg-[#252525] overflow-hidden shadow-sm border border-stone-200 dark:border-stone-800">
                                {/* Controls Sub-header Bar matching image1 */}
                                <div className="relative bg-[#E3E3E3] dark:bg-[#252525]">
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
                                                    label="Ph No."
                                                    filterKey="phone"
                                                    filters={credentialFilters}
                                                    setFilters={setCredentialFilters}
                                                    options={[...new Set(users.filter(u => u.hasPassword && !u.noLogin).map(u => u.phone || ''))].sort()}
                                                    className="border-r border-stone-300 px-4 py-3.5"
                                                />
                                                <FilterHeader
                                                    label="Login Status"
                                                    filterKey="status"
                                                    filters={credentialFilters}
                                                    setFilters={setCredentialFilters}
                                                    options={['Active', 'Inactive']}
                                                    className="border-r border-stone-300 px-4 py-3.5 text-center"
                                                />
                                                <th className="px-4 py-3.5 text-center text-stone-800 dark:text-stone-200 font-semibold text-xs whitespace-nowrap">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length > 0 ? filteredUsers.map((u) => (
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
                                                        {u.phone || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 border-r border-stone-300 text-center">
                                                        <button
                                                            disabled={u.role === 'Super Admin'}
                                                            onClick={async () => {
                                                                const newStatus = u.status === 'Inactive' ? 'Active' : 'Inactive';
                                                                try {
                                                                    const res = await fetch('/api/users', {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ id: u._id, status: newStatus })
                                                                    });
                                                                    if (res.ok) {
                                                                        fetchUsers();
                                                                        showToast(`Login ${newStatus === 'Active' ? 'Enabled' : 'Disabled'} successfully!`);
                                                                    } else {
                                                                        showToast('Failed to update login status', 'error');
                                                                    }
                                                                } catch (err) {
                                                                    showToast('Failed to update login status', 'error');
                                                                }
                                                            }}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all border ${u.status !== 'Inactive'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                                }`}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full ${u.status !== 'Inactive' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            {u.role === 'Super Admin' ? 'Active' : (u.status || 'Active')}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button
                                                                type="button"
                                                                disabled={u.role === 'Super Admin'}
                                                                onClick={() => {
                                                                    setUserData({
                                                                        name: u.name,
                                                                        email: u.email || '',
                                                                        password: '',
                                                                        phone: u.phone || '',
                                                                        roleId: u.roleId || '',
                                                                        companyId: u.companyId || currentUser?.companyId,
                                                                        assignedCompanies: u.assignedCompanies || [currentUser?.companyId],
                                                                        status: u.status || 'Active',
                                                                        editingId: u._id
                                                                    });
                                                                    setIsUserModalOpen(true);
                                                                }}
                                                                className="hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
                                                                title="Edit"
                                                            >
                                                                <img src="/icons/action/Edit.svg" className="w-4 h-4" alt="Edit" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={u.role === 'Super Admin'}
                                                                onClick={async () => {
                                                                    if (!window.confirm(`Are you sure you want to delete user "${u.name}"?`)) return;
                                                                    try {
                                                                        const res = await fetch(`/api/users?id=${u._id}`, { method: 'DELETE' });
                                                                        if (res.ok) {
                                                                            fetchUsers();
                                                                            showToast('User deleted successfully!');
                                                                        } else {
                                                                            const err = await res.json();
                                                                            showToast(err.message || 'Failed to delete user', 'error');
                                                                        }
                                                                    } catch (e) {
                                                                        showToast('Failed to delete user', 'error');
                                                                    }
                                                                }}
                                                                className="hover:scale-110 transition-transform cursor-pointer disabled:opacity-50"
                                                                title="Delete"
                                                            >
                                                                <img src="/icons/action/Delete.svg" className="w-7 h-7 dark:hidden " alt="Delete" />
                                                                <img src="/icons/action/DeleteDark.svg" className="w-7 h-7 dark:block hidden" alt="Delete" />                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-10">
                                                        <div className="flex flex-col items-center justify-center gap-2 text-stone-400">
                                                            <AlertCircle size={24} />
                                                            <p className="text-xs font-medium">No users found</p>
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

                <UserFormModal
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    userData={userData}
                    setUserData={setUserData}
                    roles={roles}
                    companies={companies}
                    handleSaveUser={handleSaveUser}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    handleAddPosition={handleAddPosition}
                    fetchModalPermissionsForRole={fetchModalPermissionsForRole}
                    userPermissions={userPermissions}
                    setUserPermissions={setUserPermissions}
                    expandedMenuIds={expandedMenuIds}
                    setExpandedMenuIds={setExpandedMenuIds}
                    shouldShowMrp={shouldShowMrp}
                    handleModalPermissionToggle={handleModalPermissionToggle}
                    menus={menus}
                />
            </div>
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

function InputField({ label, value, onChange, placeholder, type = 'text', required = false, disabled = false, className = '', subtext = '' }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">{label}</label>
                {required && <span className="text-red-500">*</span>}
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-stone-300 dark:border-stone-700 rounded-full outline-none font-bold text-xs text-stone-900 dark:text-white transition-all focus:border-[#D4612D] disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed ${className}`}
            />
            {subtext && <span className="text-[10px] font-medium text-stone-400 italic ml-2">{subtext}</span>}
        </div>
    );
}

function SelectField({ label, icon, value, onChange, options, required = false }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center gap-2">
                {icon && <span className="text-stone-400">{icon}</span>}
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">{label}</label>
                {required && <span className="text-red-500">*</span>}
            </div>
            <div className="relative">
                <CustomSelect
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-stone-300 dark:border-stone-700 rounded-full outline-none appearance-none font-bold text-xs text-stone-900 dark:text-white cursor-pointer focus:border-[#D4612D]"
                >
                    <option value="">Select Option</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </CustomSelect>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
        </div>
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

function FilterHeader({ label, filterKey, filters, setFilters, options, className = '' }) {
    const selectedValues = filters[filterKey] || [];

    return (
        <th className={`text-left group relative border-r border-stone-300 ${className}`}>
            <FilterDropdown
                options={options}
                value={selectedValues}
                onChange={(newVal) => setFilters(prev => ({ ...prev, [filterKey]: newVal }))}
                title={label}
                showTitleOnly={true}
                isMulti={true}
                icon={<img src="/icons/action/Fillter.svg" className="w-3.5 h-3.5 cursor-pointer hover:scale-110 transition-transform" alt="Filter" />}
                className="inline-flex items-center justify-start gap-1.5 p-0 border-0 bg-transparent shadow-none h-auto text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
            />
        </th>
    );
}

function UserFormModal({
    isOpen,
    onClose,
    userData,
    setUserData,
    roles,
    companies,
    handleSaveUser,
    showPassword,
    setShowPassword,
    handleAddPosition,
    fetchModalPermissionsForRole,
    userPermissions,
    setUserPermissions,
    expandedMenuIds,
    setExpandedMenuIds,
    shouldShowMrp,
    handleModalPermissionToggle,
    menus
}) {
    const [showNewPositionInput, setShowNewPositionInput] = useState(false);
    const [newPositionText, setNewPositionText] = useState('');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] flex flex-col"
                >
                    {/* Header Banner matching design image */}
                    <div className="bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] py-5 px-6 text-center shadow-md shrink-0">
                        <h2 className="text-2xl md:text-3xl font-medium text-white tracking-wide font-serif">
                            {userData.editingId ? 'Edit User' : 'Add New User'}
                        </h2>
                        <p className="text-xs italic text-stone-200/90 font-serif mt-1">
                            Configure user access and branch permissions
                        </p>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSaveUser} className="p-6 md:p-8 space-y-4 overflow-y-auto max-h-[calc(90vh-100px)]">
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
                                {!showNewPositionInput ? (
                                    <>
                                        <div className="flex-1 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs relative">
                                            <SearchableSelect
                                                options={roles.map(r => ({ value: r._id, label: r.name }))}
                                                value={userData.roleId || roles.find(r => r.name === userData.role)?._id || ''}
                                                onChange={val => {
                                                    const selectedRoleObj = roles.find(r => r._id === val);
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
                                                placeholder="Select Position"
                                                className="w-full bg-white dark:bg-[#252525] rounded-full px-3.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPositionInput(true)}
                                            className="text-[10px] text-[#882619] dark:text-[#D4612D] font-medium hover:underline whitespace-nowrap cursor-pointer"
                                        >
                                            + Add Position
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="text-right">
                                            <span className="text-[10px] font-medium text-[#882619] dark:text-[#D4612D] font-serif">+ Add New</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 p-[1.5px] bg-gradient-to-r from-[#882619] to-[#D4612D] rounded-full shadow-xs">
                                                <input
                                                    type="text"
                                                    value={newPositionText}
                                                    onChange={e => setNewPositionText(e.target.value)}
                                                    placeholder="Position name"
                                                    className="w-full px-3.5 py-1 bg-white dark:bg-[#252525] rounded-full text-xs text-stone-800 dark:text-stone-200 outline-none placeholder:text-stone-400"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (newPositionText.trim()) {
                                                        await handleAddPosition(newPositionText.trim());
                                                        setNewPositionText('');
                                                        setShowNewPositionInput(false);
                                                    }
                                                }}
                                                className="px-4 py-1.5 bg-gradient-to-r from-[#882619] to-[#D4612D] text-white text-xs font-bold rounded-full shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewPositionInput(false);
                                                    setNewPositionText('');
                                                }}
                                                className="text-stone-400 hover:text-stone-600 text-xs p-1 cursor-pointer"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                    <SearchableSelect
                                        options={[
                                            { value: 'Active', label: 'Active' },
                                            { value: 'Inactive', label: 'Inactive' }
                                        ]}
                                        value={userData.status || 'Active'}
                                        onChange={val => setUserData({ ...userData, status: val })}
                                        placeholder="Active"
                                        className="w-full bg-white dark:bg-[#252525] rounded-full px-3.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none"
                                    />
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
                                        <SearchableSelect
                                            options={companies?.map(c => ({ value: c._id, label: c.name })) || []}
                                            value={userData.companyId || ''}
                                            onChange={val => {
                                                setUserData({
                                                    ...userData,
                                                    companyId: val,
                                                    assignedCompanies: userData.assignedCompanies?.includes(val)
                                                        ? userData.assignedCompanies
                                                        : [...(userData.assignedCompanies || []), val]
                                                });
                                            }}
                                            placeholder="Multi Select Branch"
                                            className="w-full bg-white dark:bg-[#252525] rounded-full px-3.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 outline-none"
                                        />
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
                                onClick={onClose}
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
        </AnimatePresence>
    );
}

