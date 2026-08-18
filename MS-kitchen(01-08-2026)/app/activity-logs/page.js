'use client';

import React, { useState, useEffect } from 'react';
import { Eye,
    Activity,
    Calendar,
    Search,
    Building2,
    User,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    RefreshCcw,
    X
} from 'lucide-react';
import TableActionButton from '../../components/TableActionButton';
import { motion } from 'framer-motion';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import DateRangePicker from '../../components/DateRangePicker';
export default function ActivityLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [selectedLog, setSelectedLog] = useState(null);

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        companyId: '',
        userId: '',
        method: ''
    });

    const [currentUserRole, setCurrentUserRole] = useState(null);

    // Initial Fetch (Metadata)
    useEffect(() => {
        fetchMetadata();
    }, []);

    // Fetch Logs when filters or page change
    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const fetchMetadata = async () => {
        try {
            // Check Auth & Role
            const authRes = await fetch('/api/auth/me');
            if (authRes.ok) {
                const authData = await authRes.json();
                setCurrentUserRole(authData.role);

                // Fetch Users (All relevant to this admin)
                const usersRes = await fetch('/api/users');
                if (usersRes.ok) setUsers(await usersRes.json());

                // Fetch Companies (Only if Super Admin)
                if (authData.role === 'Super Admin') {
                    const compRes = await fetch('/api/companies');
                    if (compRes.ok) setCompanies(await compRes.json());
                }
            }
        } catch (error) {
            console.error("Failed to fetch metadata", error);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.companyId && { companyId: filters.companyId }),
                ...(filters.userId && { userId: filters.userId }),
                ...(filters.method && { method: filters.method }),
            });

            const res = await fetch(`/api/activity-logs?${query.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            companyId: '',
            userId: '',
            method: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <main className="flex-1 p-4 md:p-10 mb-20 md:mb-0 min-h-screen bg-background">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Activity className="text-primary-foreground" size={24} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">Activity Logs</h1>
                    </div>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ">
                        Monitor System Activities & User Actions
                    </p>
                </div>
                <TableActionButton
                    icon={<RefreshCcw size={20} />}
                    label="Refresh"
                    tone="slate"
                    onClick={fetchLogs}
                    title="Refresh"
                />
            </header>

            {/* Filters */}
            <div className="bg-card p-6 rounded-[2rem] shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date Range */}
                    <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-2">Date Range</label>
                        <DateRangePicker
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            onChange={(start, end) => {
                                setFilters(prev => ({ ...prev, startDate: start || '', endDate: end || '' }));
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        />
                    </div>

                    {/* Company Filter (Super Admin Only) */}
                    {currentUserRole === 'Super Admin' && (
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-2">Company</label>
                            <div className="relative">
                                <Building2 className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                <SearchableSelect
                                    options={[
                                        ...companies.map(c => ({ value: c._id, label: c.name }))
                                    ]}
                                    value={filters.companyId}
                                    onChange={(val) => handleFilterChange('companyId', val)}
                                    placeholder="All Companies"
                                    className="w-full pl-12 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* User Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-2">User</label>
                        <div className="relative">
                            <User className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                            <SearchableSelect
                                options={users
                                    .filter(u => !filters.companyId || u.companyId === filters.companyId)
                                    .map(u => ({ value: u._id, label: `${u.name} (${u.role})` }))
                                }
                                value={filters.userId}
                                onChange={(val) => handleFilterChange('userId', val)}
                                placeholder="All Users"
                                className="w-full pl-12 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Method Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-2">Method</label>
                        <div className="relative">
                            <Filter className="absolute z-10 left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                            <SearchableSelect
                                options={[
                                    { value: 'GET', label: 'GET' },
                                    { value: 'POST', label: 'POST' },
                                    { value: 'PUT', label: 'PUT' },
                                    { value: 'DELETE', label: 'DELETE' }
                                ]}
                                value={filters.method}
                                onChange={(val) => handleFilterChange('method', val)}
                                placeholder="All Methods"
                                className="w-full pl-12 py-3 bg-muted/50 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <TableActionButton
                        icon={<X size={16} />}
                        label="Clear Filters"
                        tone="emerald"
                        onClick={clearFilters}
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-muted sticky top-0 z-20 whitespace-nowrap double-header-row">
                                <th className="px-8 py-5 text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap">Time</th>
                                <th className="px-8 py-5 text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap">User</th>
                                <th className="px-8 py-5 text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap">Action</th>
                                <th className="px-8 py-5 text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap">Method</th>
                                <th className="px-8 py-5 text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap">Route</th>
                                <th className="px-8 py-5 border-r-2 border-border text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap">Details</th>
                                <th className="px-8 py-5 text-muted-foreground font-bold capitalize tracking-normal text-xs whitespace-nowrap text-center">Company</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-10 text-center text-muted-foreground font-bold">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-10 text-center text-slate-700 font-bold">
                                        No activity logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="border-b border-border/90 hover:bg-muted transition-colors">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900">
                                                    {new Date(log.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {log.user ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{log.user.name}</span>
                                                    <span className="text-xs text-slate-700">{log.user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-slate-700 italic">Unknown User</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest 
                                                ${log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-600' :
                                                    log.action.includes('DELETE') ? 'bg-red-50 text-red-600' :
                                                        'bg-indigo-50 text-indigo-600'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${log.method === 'GET' ? 'bg-blue-50 text-blue-600' :
                                                log.method === 'POST' ? 'bg-green-50 text-green-600' :
                                                    log.method === 'PUT' ? 'bg-orange-50 text-orange-600' :
                                                        log.method === 'DELETE' ? 'bg-red-50 text-red-600' :
                                                            'bg-stone-50 text-slate-800'
                                                }`}>
                                                {log.method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <code className="text-xs font-mono text-stone-600 bg-stone-100 px-2 py-1 rounded">
                                                {log.route || 'N/A'}
                                            </code>
                                        </td>
                                        <td className="px-8 py-6 border-r-2 border-border">
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs font-mono text-slate-800 max-w-[150px] truncate" title={JSON.stringify(log.details || {}, null, 2)}>
                                                    {JSON.stringify(log.details || {}).substring(0, 30)}
                                                    {JSON.stringify(log.details || {}).length > 30 && '...'}
                                                </div>
                                                {Object.keys(log.details || {}).length > 0 && (
                                                    <TableActionButton 
                                                        icon={<Eye size={16} strokeWidth={2.5} />} 
                                                        label="View" 
                                                        tone="blue" 
                                                        onClick={() => setSelectedLog(log)} 
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-sm font-bold text-muted-foreground">
                                                {log.company?.name || 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-8 pt-6 border-t border-border px-8 pb-8">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onItemsPerPageChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
                    />
                </div>
            </div>

            {/* Detail View Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 flex items-center justify-between bg-muted/40 border-b border-border">
                            <div>
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Activity Details</h3>
                                <p className="text-xs text-muted-foreground font-bold mt-1">
                                    {new Date(selectedLog.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Action</label>
                                    <span className="text-sm font-bold text-foreground">{selectedLog.action}</span>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">User</label>
                                    <span className="text-sm font-bold text-foreground">{selectedLog.user?.name || 'Unknown'}</span>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Method</label>
                                    <span className={`text-xs font-bold px-2 py-1 rounded inline-block ${selectedLog.method === 'GET' ? 'bg-blue-100/10 text-blue-500' :
                                        selectedLog.method === 'POST' ? 'bg-green-100/10 text-green-500' :
                                            selectedLog.method === 'PUT' ? 'bg-orange-100/10 text-orange-500' :
                                                selectedLog.method === 'DELETE' ? 'bg-red-100/10 text-red-500' :
                                                    'bg-muted text-muted-foreground'
                                        }`}>
                                        {selectedLog.method || 'N/A'}
                                    </span>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Route</label>
                                    <code className="text-xs font-mono text-foreground break-all">{selectedLog.route || 'N/A'}</code>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-xl col-span-2 border border-border">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Context Info</label>
                                    <div className="flex gap-4 text-xs text-foreground">
                                        <span><strong className="text-muted-foreground">IP:</strong> {selectedLog.ipAddress || 'Unknown'}</span>
                                        <span><strong className="text-muted-foreground">Platform:</strong> {selectedLog.userAgent ? (selectedLog.userAgent.includes('Windows') ? 'Windows' : selectedLog.userAgent.includes('Mac') ? 'MacOS' : 'Other') : 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Full Details Payload</label>
                                <div className="bg-stone-900 rounded-xl p-4 overflow-x-auto shadow-inner">
                                    <pre className="text-xs font-mono text-green-400 leading-relaxed">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-muted/40 border-t border-border flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2.5 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors text-sm border border-border"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}

