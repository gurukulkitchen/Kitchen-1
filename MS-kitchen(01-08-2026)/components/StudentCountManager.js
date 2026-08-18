"use client";
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Save, Database, Users } from 'lucide-react';
import { useCompany } from '@/context/CompanyContext';

export default function StudentCountManager({ isOpen, onClose }) {
    const { selectedCompanyIds } = useCompany();
    const companyId = selectedCompanyIds?.[0];
    
    const [counts, setCounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [newMonth, setNewMonth] = useState(new Date().toISOString().slice(0, 7));
    const [newCount, setNewCount] = useState('');

    useEffect(() => {
        if (isOpen && companyId) {
            fetchCounts();
        }
    }, [isOpen, companyId]);

    const fetchCounts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/student-counts?companyId=${companyId}`);
            if (res.ok) {
                const data = await res.json();
                setCounts(data);
            }
        } catch (error) {
            console.error("Failed to fetch counts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!newMonth || !newCount || isNaN(newCount)) return;
        setSaving(true);
        try {
            const res = await fetch('/api/student-counts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    month: newMonth, 
                    count: parseInt(newCount),
                    companyId: companyId
                }),
            });
            if (res.ok) {
                setNewCount('');
                fetchCounts();
            }
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this entry?")) return;
        try {
            const res = await fetch(`/api/student-counts?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchCounts();
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-card rounded-[2rem] border border-border shadow-[0_20px_60px_rgba(15,23,42,0.15)] overflow-hidden">
                <div className="px-7 pt-6 pb-4 bg-muted/20 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-foreground">Total Students</h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly Source Data</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-7">
                    {/* Add Form */}
                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Month</label>
                            <input 
                                type="month" 
                                value={newMonth}
                                onChange={(e) => setNewMonth(e.target.value)}
                                className="w-full h-10 px-4 rounded-xl bg-card border border-border outline-none focus:border-primary text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Total Count</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={newCount}
                                onChange={(e) => setNewCount(e.target.value)}
                                className="w-full h-10 px-4 rounded-xl bg-card border border-border outline-none focus:border-primary text-sm font-bold"
                            />
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={saving || !newCount}
                            className="col-span-2 mt-2 h-11 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <Save size={18} />
                            Save Student Count
                        </button>
                    </div>

                    {/* List */}
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : counts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm font-medium italic">
                                No records found.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {counts.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between p-3.5 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-muted flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-black text-primary leading-none">
                                                    {new Date(item.month).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                                </span>
                                                <span className="text-[8px] font-bold text-muted-foreground mt-0.5">
                                                    {new Date(item.month).getFullYear()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{item.count} Students</p>
                                                <p className="text-[10px] font-medium text-muted-foreground italic">Total Enrollment</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-7 py-5 bg-muted/20 border-t border-border text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                        This data is used to calculate percentages <br/> and ratios in dashboard charts.
                    </p>
                </div>
            </div>
        </div>
    );
}
