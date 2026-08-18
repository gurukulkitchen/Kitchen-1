'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    Menu as MenuIcon,
    UtensilsCrossed,
    Settings,
    Carrot,
    MoreVertical,
    Database
} from 'lucide-react';
import TableActionButton from '@/components/TableActionButton';
import MasterDataManager from '@/components/MasterDataManager';
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";

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

export default function MenusPage() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    // Tabs & Permissions State
    const [activeTab, setActiveTab] = useState('permissions'); // Default to permissions
    const [isMenuManagementEnabled, setIsMenuManagementEnabled] = useState(false);

    const [roles, setRoles] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [newRoleName, setNewRoleName] = useState('');
    const [editingRole, setEditingRole] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [editingChild, setEditingChild] = useState(null);

    const { hasPermission } = usePermissions();

    // Form State
    const [formData, setFormData] = useState({
        _id: null,
        label: '',
        route: '#',
        icon: 'Circle',
        type: 'link',
        order: 0,
        children: []
    });

    const fetchMenus = React.useCallback(async () => {
        try {
            const res = await fetch('/api/menus');
            const data = await res.json();
            setMenus(data);
        } catch (error) {
            console.error('Error fetching menus:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRolesAndPermissions = React.useCallback(async () => {
        try {
            // Fetch Current User Role
            const authRes = await fetch('/api/auth/me');
            const authData = await authRes.json();
            const role = authData.role;
            setCurrentUserRole(role);

            // Fetch Roles
            const roleRes = await fetch('/api/roles');
            const roleData = await roleRes.json();

            // Filter roles: 
            // 1. Admins cannot manage Super Admin
            // 2. Admins cannot manage Admin itself
            const manageRoles = roleData.filter(r => {
                if (role === 'Super Admin') return true;
                if (r.name === 'Super Admin' || r.name === 'Admin') return false;
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
    }, []);

    useEffect(() => {
        // Check for Gurukul flag
        const gurukul = localStorage.getItem("Gurukul") === "true";
        setIsMenuManagementEnabled(gurukul);

        // If not enabled, force permissions tab
        if (!gurukul) setActiveTab('permissions');

        fetchMenus();
        fetchRolesAndPermissions();
    }, [fetchMenus, fetchRolesAndPermissions]);
    const handleCreateRole = async () => {
        if (!newRoleName.trim()) return;
        try {
            const method = editingRole ? 'PUT' : 'POST';
            const body = editingRole ? { id: editingRole._id, name: newRoleName } : { name: newRoleName };

            const res = await fetch('/api/roles', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setNewRoleName('');
                setEditingRole(null);
                fetchRolesAndPermissions();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to save role');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditRole = (role) => {
        if (role.isSystem) {
            alert("System roles cannot be edited.");
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
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete role');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePermissionChange = async (roleName, menuId, field, value) => {
        const currentPerms = permissions[roleName]?.[menuId] || { read: false, write: false, edit: false, delete: false, mrp: false, source: false };
        let newPerms = { ...currentPerms, [field]: value };

        // Dependency logic
        if (field === 'read' && !value) {
            // If read is turned off, turn off everything
            newPerms = { read: false, write: false, edit: false, delete: false, mrp: false, source: false };
        } else if (value && (field === 'write' || field === 'edit' || field === 'delete' || field === 'mrp' || field === 'source')) {
            // If any action is turned on, read must be on
            newPerms.read = true;
        }

        // Optimistic Update
        setPermissions(prev => ({
            ...prev,
            [roleName]: {
                ...prev[roleName],
                [menuId]: newPerms
            }
        }));

        try {
            await fetch('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: roleName,
                    menuId,
                    ...newPerms
                }),
            });
        } catch (error) {
            console.error('Failed to update permission', error);
            fetchRolesAndPermissions(); // Revert
        }
    };


    // --- Menu CRUD Logic (Existing) ---
    const handleSave = async () => {
        if (!formData.label) return alert("Label is required");

        // If editingChild is present, we handle it separately, EXCEPT if it's the MAIN modal save button
        // Which calls us directly if editingChild is NOT set on expected button click path
        // Wait, the button logic calls handleSave OR handleSaveChild based on state. So handleSave is for Parent.

        const isEditing = !!formData._id;
        const method = isEditing ? 'PUT' : 'POST';

        if (editingChild) return; // Should not happen if button wired correctly

        const body = { ...formData, id: formData._id };
        try {
            const res = await fetch('/api/menus', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) { fetchMenus(); closeModal(); }
            else alert("Failed to save menu");
        } catch (error) { console.error(error); alert("Error saving menu"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will delete the menu and all its children.")) return;
        try {
            const res = await fetch(`/api/menus?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchMenus();
        } catch (error) { console.error(error); }
    };

    const openModalForNew = () => {
        setFormData({ _id: null, label: '', route: '#', icon: 'Circle', type: 'link', order: menus.length + 1, children: [] });
        setEditingMenu(null); setEditingChild(null); setIsModalOpen(true);
    };

    const openModalForEdit = (menu) => {
        setFormData({ ...menu });
        setEditingMenu(menu); setEditingChild(null); setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false); setEditingMenu(null); setEditingChild(null);
    };

    const openAddChildModal = (parentMenu) => {
        setEditingMenu(parentMenu); setEditingChild({ isNew: true });
        setFormData({ label: '', route: '', icon: 'Circle', order: (parentMenu.children?.length || 0) + 1 });
        setIsModalOpen(true);
    };

    const openEditChildModal = (parentMenu, child, childIndex) => {
        setEditingMenu(parentMenu); setEditingChild({ isNew: false, index: childIndex });
        setFormData({ ...child }); setIsModalOpen(true);
    };

    const handleSaveChild = async () => {
        if (!formData.label) return alert("Label is required");
        if (!editingMenu) return;
        const updatedChildren = [...(editingMenu.children || [])];
        if (editingChild.isNew) updatedChildren.push(formData);
        else updatedChildren[editingChild.index] = formData;

        try {
            const res = await fetch('/api/menus', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingMenu._id, children: updatedChildren })
            });
            if (res.ok) { fetchMenus(); closeModal(); }
            else alert("Failed to update children");
        } catch (error) { console.error(error); }
    };

    const deleteChild = async (parentMenu, childIndex) => {
        if (!confirm("Delete this sub-menu?")) return;
        const updatedChildren = parentMenu.children.filter((_, idx) => idx !== childIndex);
        try {
            const res = await fetch('/api/menus', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parentMenu._id, children: updatedChildren })
            });
            if (res.ok) fetchMenus();
        } catch (error) { console.error(error); }
    };


    return (
        <div className="p-8 min-h-screen bg-background">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {activeTab === 'menus' ? 'Menu Management' : 'Role & Permission Management'}
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage system navigation and access controls</p>
                    </div>

                </div>

                {/* Tabs */}
                <div className="flex bg-card p-1 rounded-xl shadow-sm mb-8 w-fit hidden">
                    <button
                        onClick={() => setActiveTab('permissions')}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'permissions' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        Role Permissions
                    </button>
                    {isMenuManagementEnabled && currentUserRole === 'Super Admin' && (
                        <button
                            onClick={() => setActiveTab('menus')}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'menus' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            Menu Structure
                        </button>
                    )}
                </div>

                {/* Content */}
                {activeTab === 'menus' ? (
                    <>
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={openModalForNew}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
                            >
                                <Plus size={20} />
                                Add Parent Menu
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-muted-foreground">Loading menus...</div>
                        ) : (
                            <div className="grid gap-6">
                                {menus.sort((a, b) => a.order - b.order).map((menu) => (
                                    <div key={menu._id} className="bg-card rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between p-5 bg-card">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    {getIcon(menu.icon)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-foreground text-lg">{menu.label}</h3>
                                                    <div className="flex gap-3 text-xs font-mono mt-1">
                                                        <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">/{menu.route}</span>
                                                        <span className={`px-2 py-0.5 rounded ${menu.type === 'parent' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {menu.type === 'parent' ? 'Parent' : 'Single Link'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {menu.type === 'parent' && (
                                                    <TableActionButton icon={<Plus size={16} strokeWidth={2.5} />} label="Add" tone="slate" onClick={() => openAddChildModal(menu)} />
                                                )}
                                                <TableActionButton icon={<Edit2 size={16} strokeWidth={2.5} />} label="Edit" tone="blue" onClick={() => openModalForEdit(menu)} />
                                                <TableActionButton icon={<Trash2 size={16} strokeWidth={2.5} />} label="Delete" tone="red" onClick={() => handleDelete(menu._id)} />
                                            </div>
                                        </div>

                                        {menu.children && menu.children.length > 0 && (
                                            <div className="bg-muted/50 p-4 space-y-2">
                                                {menu.children.map((child, idx) => (
                                                    <div key={idx} className="flex items-center justify-between pl-4 pr-3 py-3 bg-card rounded-xl ml-8 relative before:absolute before:left-[-20px] before:top-1/2 before:w-4 before:h-[2px] before:bg-slate-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-muted-foreground">{getIcon(child.icon, 16)}</div>
                                                            <span className="font-medium text-foreground">{child.label}</span>
                                                            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{child.route}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <TableActionButton icon={<Edit2 size={16} strokeWidth={2.5} />} label="Edit" tone="blue" onClick={() => openEditChildModal(menu, child, idx)} />
                                                            <TableActionButton icon={<Trash2 size={16} strokeWidth={2.5} />} label="Delete" tone="red" onClick={() => deleteChild(menu, idx)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* Permissions Tab */
                    <div className="bg-card rounded-2xl shadow-sm p-6 overflow-hidden">
                        {/* Create Role */}
                        <div className="mb-8 p-6 rounded-xl bg-muted">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        {editingRole ? 'Edit Role Name' : 'New Role Name'}
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-card"
                                        placeholder="e.g. Manager"
                                        value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateRole}
                                        className={`${editingRole ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-2.5 rounded-lg font-bold transition-colors`}
                                    >
                                        {editingRole ? 'Update Role' : 'Create Role'}
                                    </button>
                                    {editingRole && (
                                        <button
                                            onClick={() => { setEditingRole(null); setNewRoleName(''); }}
                                            className="bg-slate-400 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-slate-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Role List */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <div key={role._id} className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border shadow-sm group">
                                        <span className="text-sm font-semibold text-foreground">{role.name}</span>
                                        {!role.isSystem && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEditRole(role)}
                                                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRole(role._id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                        {role.isSystem && (
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">System</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Matrix Table */}
                        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-muted sticky top-0 z-20 whitespace-nowrap double-header-row">
                                            <th className="px-4 py-4 border-r-2 border-border text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap sticky left-0 z-20 min-w-[200px] text-left">Menu Item</th>
                                            {roles.map(role => (
                                                <th key={role._id} className="px-4 py-4 text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap text-center min-w-[200px]">
                                                    {role.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menus.map(menu => (
                                            <React.Fragment key={menu._id}>
                                                {/* Parent Menu Row */}
                                                <tr className="hover:bg-muted transition-colors bg-muted/30 border-b border-border/90">
                                                    <td className="px-4 py-3 border-r-2 border-border font-bold text-foreground bg-card sticky left-0 flex items-center gap-2">
                                                        {getIcon(menu.icon, 16, "text-muted-foreground")}
                                                        {menu.label}
                                                    </td>
                                                    {roles.map(role => {
                                                        const rolePerms = permissions[role.name]?.[menu._id] || {};
                                                        return (
                                                            <td key={`${role._id}-${menu._id}`} className="px-4 py-3 text-center">
                                                                <div className="flex justify-center gap-4">
                                                                    {['read', 'write', 'edit', 'delete', 'mrp', 'source'].map(action => (
                                                                        <label key={action} className="flex flex-col items-center cursor-pointer group">
                                                                            <span className="text-[8px] font-black uppercase text-muted-foreground mb-1 group-hover:text-primary transition-colors">{action}</span>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="w-4 h-4 rounded text-[#ff8b2b] focus:ring-[#ff8b2b] transition-all cursor-pointer"
                                                                                checked={rolePerms[action] || false}
                                                                                onChange={(e) => handlePermissionChange(role.name, menu._id, action, e.target.checked)}
                                                                            />
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>

                                                {/* Sub-Menu Rows */}
                                                {menu.children && menu.children.map(child => (
                                                    <tr key={child._id} className="hover:bg-muted transition-colors border-b border-border/90">
                                                        <td className="px-4 py-3 border-r-2 border-border font-medium text-muted-foreground bg-card sticky left-0 pl-12 flex items-center gap-2 relative">
                                                            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-3 h-px bg-slate-300"></div>
                                                            {child.label}
                                                        </td>
                                                        {roles.map(role => {
                                                            const rolePerms = permissions[role.name]?.[child._id] || {};
                                                            return (
                                                                <td key={`${role._id}-${child._id}`} className="px-4 py-3 text-center">
                                                                    <div className="flex justify-center gap-4">
                                                                        {['read', 'write', 'edit', 'delete', 'mrp', 'source'].map(action => (
                                                                            <label key={action} className="flex flex-col items-center cursor-pointer group">
                                                                                <span className="text-[8px] font-black uppercase text-muted-foreground mb-1 group-hover:text-primary transition-colors">{action}</span>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-4 h-4 rounded text-[#ff8b2b] focus:ring-[#ff8b2b] transition-all cursor-pointer"
                                                                                    checked={rolePerms[action] || false}
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
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">
                                {editingChild ? (editingChild.isNew ? 'New Sub-Menu' : 'Edit Sub-Menu') : (formData._id ? 'Edit Menu' : 'New Menu')}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Label</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g. Dashboard"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Route</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.route}
                                        onChange={e => setFormData({ ...formData, route: e.target.value })}
                                        placeholder="e.g. /inventory"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Icon Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="Lucide Icon"
                                    />
                                </div>
                            </div>

                            {!editingChild && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg outline-none"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="link">Link</option>
                                            <option value="parent">Parent (Group)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Order</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 rounded-lg outline-none"
                                            value={formData.order}
                                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Icon Class Name for coloring */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Icon Color Class (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg outline-none"
                                    value={formData.iconClassName || ''}
                                    onChange={e => setFormData({ ...formData, iconClassName: e.target.value })}
                                    placeholder="e.g. text-red-500"
                                />
                            </div>

                            <button
                                onClick={editingChild ? handleSaveChild : handleSave}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={20} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isMasterModalOpen && (
                <MasterDataManager
                    isOpen={isMasterModalOpen}
                    onClose={() => setIsMasterModalOpen(false)}
                />
            )}
        </div>
    );
}



// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//     Plus,
//     Trash2,
//     Edit3,
//     X,
//     Menu as MenuIcon,
//     Search,
//     Type,
//     Link as LinkIcon,
//     Hash
// } from 'lucide-react';

// export default function MenusPage() {
//     const [menus, setMenus] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isFormOpen, setIsFormOpen] = useState(false);

//     const [label, setLabel] = useState('');
//     const [route, setRoute] = useState('');
//     const [order, setOrder] = useState(0);
//     const [editingId, setEditingId] = useState(null);

//     useEffect(() => {
//         fetchMenus();
//     }, []);

//     const normalizeId = (id) => {
//         if (!id) return '';
//         if (typeof id === 'string') return id;
//         return id.$oid || JSON.stringify(id);
//     };

//     const fetchMenus = async () => {
//         try {
//             const res = await fetch('/api/menus');
//             const data = await res.json();

//             // normalize ids
//             const normalized = data.map(menu => ({
//                 ...menu,
//                 _id: normalizeId(menu._id),
//                 children: (menu.children || []).map(child => ({
//                     ...child,
//                     _id: normalizeId(child._id)
//                 }))
//             }));

//             setMenus(normalized);
//         } catch (error) {
//             console.error('Error fetching menus', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleSaveMenu = async (e) => {
//         e.preventDefault();

//         const method = editingId ? 'PUT' : 'POST';
//         const body = { label, route, order };
//         if (editingId) body.id = editingId;

//         try {
//             const res = await fetch('/api/menus', {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(body),
//             });

//             if (res.ok) {
//                 fetchMenus();
//                 resetForm();
//                 setIsFormOpen(false);
//             } else {
//                 alert('Failed to save menu');
//             }
//         } catch (error) {
//             console.error('Error saving menu', error);
//         }
//     };

//     const handleDelete = async (id) => {
//         if (!confirm('Delete this item?')) return;

//         await fetch(`/api/menus?id=${id}`, { method: 'DELETE' });
//         fetchMenus();
//     };

//     const handleEdit = (menu) => {
//         setLabel(menu.label);
//         setRoute(menu.route);
//         setOrder(menu.order || 0);
//         setEditingId(menu._id);
//         setIsFormOpen(true);
//     };

//     const resetForm = () => {
//         setLabel('');
//         setRoute('');
//         setOrder(0);
//         setEditingId(null);
//     };

//     // 🔥 Safe filter (includes children)
//     const filteredMenus = menus
//         .filter(menu =>
//             (menu.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//             (menu.route || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//             menu.children?.some(child =>
//                 (child.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 (child.route || '').toLowerCase().includes(searchTerm.toLowerCase())
//             )
//         )
//         .sort((a, b) => (a.order || 0) - (b.order || 0));

//     if (loading) return <div className="p-10 text-center">Loading...</div>;

//     return (
//         <main className="p-6">
//             {/* HEADER */}
//             <div className="flex justify-between mb-6">
//                 <h1 className="text-xl font-bold flex gap-2 items-center">
//                     <MenuIcon /> Menu Manager
//                 </h1>

//                 <button
//                     onClick={() => { resetForm(); setIsFormOpen(true); }}
//                     className="bg-black text-white px-4 py-2 rounded"
//                 >
//                     <Plus size={16} /> Add Menu
//                 </button>
//             </div>

//             {/* SEARCH */}
//             <input
//                 type="text"
//                 placeholder="Search..."
//                 className="border p-3 w-full mb-6"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//             />

//             {/* TABLE */}
//             <table className="w-full border">
//                 <thead>
//                     <tr className="bg-gray-100 text-left">
//                         <th className="p-3">Order</th>
//                         <th className="p-3">Label</th>
//                         <th className="p-3">Route</th>
//                         <th className="p-3 text-center">Action</th>
//                     </tr>
//                 </thead>

//                 <tbody>
//                     <AnimatePresence>
//                         {filteredMenus.map(menu => (
//                             <React.Fragment key={menu._id}>
//                                 {/* PARENT */}
//                                 <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                                     <td className="p-3">{menu.order}</td>
//                                     <td className="p-3 font-bold">{menu.label}</td>
//                                     <td className="p-3">{menu.route}</td>
//                                     <td className="p-3 text-center">
//                                         <button onClick={() => handleEdit(menu)}><Edit3 size={16} /></button>
//                                         <button onClick={() => handleDelete(menu._id)}><Trash2 size={16} /></button>
//                                     </td>
//                                 </motion.tr>

//                                 {/* CHILDREN */}
//                                 {menu.children?.map(child => (
//                                     <motion.tr key={child._id} className="bg-gray-50">
//                                         <td className="p-3 pl-8 text-sm">↳</td>
//                                         <td className="p-3 pl-8">{child.label}</td>
//                                         <td className="p-3">{child.route}</td>
//                                         <td className="p-3 text-center">
//                                             <button onClick={() => handleEdit(child)}><Edit3 size={16} /></button>
//                                             <button onClick={() => handleDelete(child._id)}><Trash2 size={16} /></button>
//                                         </td>
//                                     </motion.tr>
//                                 ))}
//                             </React.Fragment>
//                         ))}
//                     </AnimatePresence>
//                 </tbody>
//             </table>

//             {/* MODAL */}
//             {isFormOpen && (
//                 <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
//                     <div className="bg-white p-6 rounded w-[400px]">
//                         <h2 className="text-lg font-bold mb-4">
//                             {editingId ? 'Edit Menu' : 'Add Menu'}
//                         </h2>

//                         <form onSubmit={handleSaveMenu} className="space-y-4">
//                             <Input label="Label" value={label} onChange={setLabel} />
//                             <Input label="Route" value={route} onChange={setRoute} />
//                             <Input label="Order" value={order} onChange={setOrder} type="number" />

//                             <button className="bg-black text-white w-full py-2 rounded">
//                                 Save
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </main>
//     );
// }

// /* INPUT COMPONENT */
// function Input({ label, value, onChange, type = 'text' }) {
//     return (
//         <div>
//             <label className="text-sm">{label}</label>
//             <input
//                 type={type}
//                 value={value}
//                 onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
//                 className="border p-2 w-full"
//             />
//         </div>
//     );
// }