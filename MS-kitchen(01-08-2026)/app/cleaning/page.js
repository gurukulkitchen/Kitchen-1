"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Edit3, ShieldAlert } from 'lucide-react';
import usePermissions from "@/hooks/usePermissions";
import PermissionWrapper from "@/components/PermissionWrapper";
import { useCompany } from "@/context/CompanyContext";
import { motion, AnimatePresence } from 'framer-motion';
import MonthYearPicker from '@/components/MonthYearPicker';
import { useFormStore } from '@/lib/store';
import {
    PlusCircle,
    CheckCircle2,
    XCircle,
    Calendar,
    Download,
    ArrowDownToLine,
    BarChart3,
    Search,
    ChevronLeft,
    ChevronRight,
    Brush,
    Info,
    X,
    Check,
    FileText,
    ClipboardCheck,
    History,
    Settings,
    Trash2,
    Database
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { addStandardHeader } from '@/lib/pdfGenerator';
import TableActionButton from '@/components/TableActionButton';
import MasterDataManager from '@/components/MasterDataManager';
import DateTimePicker from "@/components/DateTimePicker";

export default function CleaningPage() {
    const [view, setView] = useState('daily'); // 'daily', 'monthly', 'analytics'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
    const downloadDropdownRef = React.useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target)) {
                setIsDownloadDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const { setFormData, forms } = useFormStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Sync with persistent store


    // Dynamic Data
    const [areas, setAreas] = useState([]);
    const [dailyLog, setDailyLog] = useState({ logs: [], note: '' });
    const [monthlyLogs, setMonthlyLogs] = useState([]); // Array of logs for the month
    const [loading, setLoading] = useState(true);
    const { permissions, loading: permsLoading, hasPermission } = usePermissions();
    const { isReadOnly, selectedCompanyIds, companyName, companyAddress, companyPhone } = useCompany();
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch('/api/companies');
                if (res.ok) {
                    const data = await res.json();
                    setCompanies(data);
                }
            } catch (error) {
                console.error("Failed to fetch companies:", error);
            }
        };
        fetchCompanies();
    }, []);

    const getCompanyName = (companyId) => {
        if (!companies || companies.length === 0 || !companyId) return "";
        const company = companies.find(c => String(c._id) === String(companyId));
        return company ? company.name : "";
    };

    // Area Management
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    const fetchAreas = React.useCallback(async () => {
        try {
            const companyId = selectedCompanyIds?.[0];
            const query = companyId ? `?companyId=${companyId}` : '';
            const res = await fetch(`/api/cleaning/areas${query}`);
            if (res.ok) {
                const data = await res.json();
                setAreas(data);
            }
        } catch (error) {
            console.error("Failed to fetch areas", error);
        }
    }, [selectedCompanyIds]);

    const fetchDailyLog = React.useCallback(async (date) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/cleaning/logs?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setDailyLog(data || { logs: [], note: '' });
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMonthlyLogs = React.useCallback(async (dateStr) => {
        try {
            setLoading(true);
            const dateObj = new Date(dateStr);
            const month = dateObj.getMonth() + 1;
            const year = dateObj.getFullYear();

            const res = await fetch(`/api/cleaning/logs?month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setMonthlyLogs(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch monthly logs", error);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        const persistedData = forms['cleaning'];
        if (persistedData) {
            if (persistedData.view) setView(persistedData.view);
            if (persistedData.selectedDate) setSelectedDate(persistedData.selectedDate);
            if (persistedData.note) setDailyLog(prev => ({ ...prev, note: persistedData.note }));
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            setFormData('cleaning', { view, selectedDate, note: dailyLog.note });
        }
    }, [view, selectedDate, dailyLog.note, isHydrated]);

    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);

    useEffect(() => {
        if (view === 'daily') {
            fetchDailyLog(selectedDate);
        } else if (view === 'monthly') {
            fetchMonthlyLogs(selectedDate);
        }
    }, [selectedDate, view, fetchDailyLog, fetchMonthlyLogs]);

    const saveLog = useCallback(async (updatedLogData) => {
        if (isReadOnly) return;
        try {
            await fetch('/api/cleaning/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate,
                    companyId: isReadOnly ? undefined : selectedCompanyIds[0],
                    ...updatedLogData
                })
            });
        } catch (error) {
            console.error("Failed to save log", error);
        }
    }, [selectedDate]);

    // const toggleArea = async (area) => {
    //     const currentLogs = dailyLog.logs || [];
    //     const existingEntryIndex = currentLogs.findIndex(l => l.areaId === area._id);

    //     let newLogs = [...currentLogs];
    //     if (existingEntryIndex >= 0) {
    //         newLogs[existingEntryIndex] = {
    //             ...newLogs[existingEntryIndex],
    //             status: !newLogs[existingEntryIndex].status
    //         };
    //     } else {
    //         newLogs.push({
    //             areaId: area._id,
    //             areaName: area.name, // Snapshot name
    //             status: true
    //         });
    //     }

    //     setDailyLog(prev => ({ ...prev, logs: newLogs }));
    //     await saveLog({ logs: newLogs, note: dailyLog.note });
    // };

    // const toggleArea = async (area) => {
    //     const currentLogs = dailyLog.logs || [];
    //     const existingEntryIndex = currentLogs.findIndex(l => l.areaId === area._id);

    //     let newLogs = [...currentLogs];

    //     if (existingEntryIndex >= 0) {
    //         // Cycle: 1 (Half) -> 2 (Done) -> 0 (Pending)
    //         const currentStatus = newLogs[existingEntryIndex].status || 0;
    //         let nextStatus;
    //         if (currentStatus === 1) nextStatus = 2;      // From Half to Done
    //         else if (currentStatus === 2) nextStatus = 0; // From Done to Pending
    //         else nextStatus = 1;                         // From Pending to Half

    //         newLogs[existingEntryIndex] = {
    //             ...newLogs[existingEntryIndex],
    //             status: nextStatus
    //         };
    //     } else {
    //         // Initial click: Move from nothing (Pending/0) to Half Done (1)
    //         newLogs.push({
    //             areaId: area._id,
    //             areaName: area.name,
    //             status: 1
    //         });
    //     }

    //     setDailyLog(prev => ({ ...prev, logs: newLogs }));
    //     await saveLog({ logs: newLogs, note: dailyLog.note });
    // };

    const toggleArea = async (area) => {
        const currentLogs = dailyLog.logs || [];
        const existingEntryIndex = currentLogs.findIndex(l => l.areaId === area._id);

        let newLogs = [...currentLogs];

        if (existingEntryIndex >= 0) {
            // Cycle: 0 (Pending) -> 1 (Half) -> 2 (Done) -> back to 0
            const currentStatus = newLogs[existingEntryIndex].status;
            let nextStatus = (currentStatus + 1) % 3;

            newLogs[existingEntryIndex] = {
                ...newLogs[existingEntryIndex],
                status: nextStatus
            };
        } else {
            // If it was "Pending" (visual only), first click moves it to "Half Done" (1)
            newLogs.push({
                areaId: area._id,
                areaName: area.name,
                status: 1
            });
        }

        setDailyLog(prev => ({ ...prev, logs: newLogs }));
        await saveLog({ logs: newLogs, note: dailyLog.note });
    };

    const handleMarkAll = async (statusValue) => {
        // Determine the label for the confirmation message
        const statusLabel = statusValue === 2 ? 'DONE' : statusValue === 1 ? 'HALF DONE' : 'PENDING';

        if (!confirm(`Are you sure you want to mark all areas as ${statusLabel}?`)) return;

        const newLogs = areas.map(area => ({
            areaId: area._id,
            areaName: area.name,
            status: statusValue
        }));

        setDailyLog(prev => ({ ...prev, logs: newLogs }));
        await saveLog({ logs: newLogs, note: dailyLog.note });
    };

    const handleNoteChange = async (e) => {
        const note = e.target.value;
        setDailyLog(prev => ({ ...prev, note }));
    };

    const handleNoteBlur = () => {
        saveLog({ logs: dailyLog.logs, note: dailyLog.note });
    };



    // Derived state for UI
    const getAreaStatus = (areaId) => {
        const log = dailyLog.logs?.find(l => l.areaId === areaId);
        // If log exists, return its status; otherwise return 0 (Pending)
        return log ? log.status : 0;
    };

    const completionRate = useMemo(() => {
        if (areas.length === 0) return 0;

        const totalPoints = areas.reduce((acc, area) => {
            const status = getAreaStatus(area._id);
            if (status === 2) return acc + 1;   // Green = 100%
            if (status === 1) return acc + 0.5; // Yellow = 50%
            return acc;                         // Red = 0%
        }, 0);

        return Math.round((totalPoints / areas.length) * 100);
    }, [areas, dailyLog]);

    const completedCount = useMemo(
        // Optional: Shows count of fully completed areas
        () => areas.filter((area) => getAreaStatus(area._id) === 2).length,
        [areas, dailyLog]
    );

    const pendingCount = Math.max(areas.length - completedCount, 0);

    const formattedSelectedDate = useMemo(() => {
        const date = new Date(selectedDate);
        return view === 'monthly'
            ? date.toLocaleString('en-GB', { month: 'short', year: 'numeric' })
            : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }, [selectedDate, view]);

    // Helper for Monthly View
    const getDaysInMonth = (dateStr) => {
        const d = new Date(dateStr);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    };

    const getMonthlyStatus = (areaId, day) => {
        const d = new Date(selectedDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const checkDate = `${year}-${month}-${dayStr}`;

        const logForDay = monthlyLogs.find(l => l.date === checkDate);
        if (!logForDay) return false; // No log means not done or pending

        const areaLog = logForDay.logs?.find(l => l.areaId === areaId);
        return areaLog ? areaLog.status : false;
    };

    const getImageDataUrl = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load PDF logo');

        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleExportData = async (format) => {
        if (format === 'excel') {
            if (view === 'daily') {
                const reportDate = new Date(selectedDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                const data = areas.map(area => {
                    const rawStatus = getAreaStatus(area._id);
                    const statusStr = (rawStatus === 2 || rawStatus === true) ? "Done" : rawStatus === 1 ? "Half Done" : "Pending";
                    return {
                        "Area": area.name.toUpperCase(),
                        "Status": statusStr
                    };
                });
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Daily Cleaning");
                XLSX.writeFile(wb, `cleaning-report-${selectedDate}.xlsx`);
            } else if (view === 'monthly') {
                const monthName = new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' });
                const days = getDaysInMonth(selectedDate);
                const data = areas.map(area => {
                    const row = { "Area": area.name };
                    for (let d = 1; d <= days; d++) {
                        const status = getMonthlyStatus(area._id, d);
                        row[d] = (status === 2 || status === true) ? "Done" : status === 1 ? "Half" : "";
                    }
                    return row;
                });
                const headers = ["Area", ...Array.from({ length: days }, (_, i) => String(i + 1))];
                const ws = XLSX.utils.json_to_sheet(data, { header: headers });
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Monthly Cleaning");
                XLSX.writeFile(wb, `cleaning-monthly-${monthName}.xlsx`);
            }
            return;
        }

        const doc = new jsPDF({
            orientation: view === 'monthly' ? 'landscape' : 'portrait'
        });

        // Helper to load custom font
        const loadCustomFont = async () => {
            try {
                const response = await fetch('/fonts/ZapfHumnst BT Bold.ttf');
                if (!response.ok) throw new Error('Font file not found');
                const arrayBuffer = await response.arrayBuffer();
                const binaryString = Array.from(new Uint8Array(arrayBuffer))
                    .map(b => String.fromCharCode(b))
                    .join('');
                doc.addFileToVFS("ZapfHumnst-BT-Bold.ttf", binaryString);
                doc.addFont("ZapfHumnst-BT-Bold.ttf", "ZapfHumnst-BT-Bold", "bold");
                return true;
            } catch (error) {
                console.warn("Could not load custom font ZapfHumnst BT Bold:", error);
                return false;
            }
        };

        const customFontLoaded = await loadCustomFont();

        if (view === 'daily') {
            await addStandardHeader(doc, 'Daily Cleaning Report', companyName, companyAddress, companyPhone);

            const pageWidth = doc.internal.pageSize.getWidth();
            const reportDate = new Date(selectedDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            // Add date and completion info below standard header
            doc.setFontSize(8.5);
            doc.setTextColor(35, 35, 35);
            doc.setFont('helvetica', 'normal');
            doc.text(`Date : ${reportDate}`, 10, 24);
            doc.text(`Completion : ${completionRate}%`, pageWidth - 45, 24);

            const tableData = areas.map(area => {
                const rawStatus = getAreaStatus(area._id);
                const statusStr = (rawStatus === 2 || rawStatus === true) ? "Done" : rawStatus === 1 ? "Half Done" : "Pending";
                return [area.name.toUpperCase(), statusStr];
            });

            autoTable(doc, {
                startY: 28,
                head: [['Area', 'Status']],
                body: tableData,
                theme: 'grid',
                margin: { left: 18, right: 18 },
                styles: {
                    fontSize: 9,
                    cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
                    lineColor: [166, 166, 166],
                    lineWidth: 0.18,
                    textColor: [40, 40, 40],
                    valign: 'middle',
                    halign: 'center'
                },
                headStyles: {
                    fillColor: [246, 246, 246],
                    textColor: [35, 35, 35],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fillColor: [255, 255, 255]
                },
                columnStyles: {
                    0: { cellWidth: 80, textColor: [229, 119, 13] },
                    1: { cellWidth: 68, fontStyle: 'bold' }
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 1) {
                        const status = data.cell.raw;
                        if (status === 'Done') {
                            data.cell.styles.textColor = [22, 163, 74];
                        } else if (status === 'Half Done') {
                            data.cell.styles.textColor = [202, 138, 4];
                        } else {
                            data.cell.styles.textColor = [220, 38, 38];
                        }
                    }
                }
            });

            doc.save(`cleaning-report-${selectedDate}.pdf`);

        } else if (view === 'monthly') {
            await addStandardHeader(doc, 'Monthly Cleaning Log', companyName, companyAddress, companyPhone);

            const monthName = new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' });

            doc.setFontSize(10);
            doc.setTextColor(35, 35, 35);
            doc.setFont("helvetica", "normal");
            doc.text(`Month: ${monthName}`, 14, 25);

            const days = getDaysInMonth(selectedDate);
            const headRow = ['Area', ...Array.from({ length: days }, (_, i) => String(i + 1))];

            const bodyData = areas.map(area => {
                const row = [area.name];
                for (let d = 1; d <= days; d++) {
                    const status = getMonthlyStatus(area._id, d);
                    // Status: 2 = Done, 1 = Half, 0 = Pending
                    row.push(status === 2 ? "Y" : status === 1 ? "H" : "");
                }
                return row;
            });

            autoTable(doc, {
                startY: 35,
                head: [headRow],
                body: bodyData,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 1.5 },
                headStyles: { fillColor: [234, 88, 12], fontSize: 7 },
                columnStyles: { 0: { cellWidth: 35 } }, // Area name column width
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index > 0) {
                        const val = data.cell.raw;
                        if (val === 'Y') {
                            data.cell.styles.fillColor = [209, 250, 229]; // Emerald-100
                            data.cell.styles.textColor = [6, 95, 70]; // Emerald-800
                            data.cell.text = 'Y';
                            data.cell.styles.halign = 'center';
                        } else if (val === 'H') {
                            data.cell.styles.fillColor = [254, 243, 199]; // Amber-100
                            data.cell.styles.textColor = [146, 64, 14]; // Amber-800
                            data.cell.text = 'H';
                            data.cell.styles.halign = 'center';
                        } else {
                            data.cell.text = '';
                        }
                    }
                }
            });

            doc.save(`cleaning-monthly-${monthName}.pdf`);
        }
    };

    if (permsLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground">Loading Cleaning Logs...</p>
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
                        You don&apos;t have permission to view Cleaning logs. Please contact your administrator for access.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6" style={{ fontFamily: 'ITCAvantGardeStd' }}>
            <div className="bg-card rounded-lg shadow-2xl overflow-hidden mx-auto max-w-[1400px]">
                {/* 1. Top Bar - Source Action */}
                <div className="flex justify-end items-center px-6 py-2.5 bg-white dark:bg-[#252525] border-b border-[#882619]">
                    {!isReadOnly && (
                        <PermissionWrapper action="source">
                            <button
                                type="button"
                                onClick={() => setIsManageModalOpen(true)}
                                className="flex items-center gap-1.5 bg-transparent border-0 outline-none text-[#882619] dark:text-[#D4612D] font-extrabold text-xs hover:opacity-80 transition-opacity cursor-pointer mt-1.5"
                            >
                                <img src="/icons/action/Source.svg" className="w-7 h-7 block dark:hidden" alt="Source" />
                                <img src="/icons/action/SourceDark.svg" className="w-7 h-7 hidden dark:block" alt="Source" />
                                <span className="text-sm font-extrabold bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent">Source</span>
                            </button>
                        </PermissionWrapper>
                    )}
                </div>

                {/* 2. Main Header Banner Box */}
                <div className="bg-[#E5E5E5] dark:bg-[#252525] py-3.5 px-6 md:px-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-y border-[#882619]/50">
                    {/* Left: Overall Progress Score & Stats Stack */}
                    <div className="flex flex-wrap items-center gap-5">
                        <div className="  gap-3">
                            <span className="bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent text-3xl md:text-4xl font-black tracking-tight">
                                {completionRate} %
                            </span>
                            <div className="flex flex-col">
                                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold leading-tight">Daily Progress</span>
                            </div>
                        </div>

                        {/* Vertical Divider Line */}
                        <div className="h-10 border-r border-[#A4A4A4] dark:border-zinc-700 hidden sm:block"></div>

                        {/* Stats Info Stack */}
                        <div className="flex flex-col gap-1">
                            <div className="text-xl text-slate-900 dark:text-zinc-100">
                                Total Areas : <strong className="font-[800] text-xl text-black dark:text-white">{areas.length}</strong>
                            </div>
                            <div className="flex flex-wrap items-center text-xs md:text-sm font-bold">
                                <span className="text-[#3B873E] dark:text-emerald-400">Completed : <strong className="font-extrabold">{completedCount}</strong></span>
                                <span className="text-slate-800 dark:text-zinc-400 mx-2.5 font-normal">|</span>
                                <span className="text-[#B7791F] dark:text-amber-400">Half : <strong className="font-extrabold">{areas.filter(a => getAreaStatus(a._id) === 1).length}</strong></span>
                                <span className="text-slate-800 dark:text-zinc-400 mx-2.5 font-normal">|</span>
                                <span className="text-[#B83A24] dark:text-[#D4612D]">Pending : <strong className="font-extrabold">{areas.filter(a => getAreaStatus(a._id) === 0).length}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Date Picker, View Toggle, Download Action */}
                    <div className="flex flex-wrap items-center gap-4 self-end xl:self-auto relative">
                        {/* Date Picker Pill */}
                        <div className="flex items-center px-3 py-1 bg-white dark:bg-zinc-800 rounded-xl border border-[#D4612D] shadow-sm shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    const d = new Date(selectedDate);
                                    if (view === 'monthly') d.setMonth(d.getMonth() - 1);
                                    else d.setDate(d.getDate() - 1);
                                    setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-1 text-[#D05E2C] dark:text-[#D4612D] hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer flex items-center"
                            >
                                <span className="text-[10px] leading-none select-none">◀</span>
                            </button>

                            {view === 'monthly' ? (
                                <div className="mx-1 shrink-0">
                                    <MonthYearPicker
                                        value={selectedDate.slice(0, 7)}
                                        onChange={(val) => { if (val) setSelectedDate(`${val}-01`); }}
                                        variant="ghost"
                                    />
                                </div>
                            ) : (
                                <DateTimePicker
                                    showTime={false}
                                    value={selectedDate}
                                    onChange={(val) => { if (val) setSelectedDate(val); }}
                                    customTrigger={
                                        <div className="flex items-center gap-2 px-2 py-0.5 text-xs md:text-sm font-extrabold cursor-pointer select-none">
                                            <Calendar size={16} className="text-[#D4612D]" />
                                            <span className="text-[#882619] dark:text-[#D4612D]">
                                                {formattedSelectedDate}
                                            </span>
                                        </div>
                                    }
                                />
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    const d = new Date(selectedDate);
                                    if (view === 'monthly') d.setMonth(d.getMonth() + 1);
                                    else d.setDate(d.getDate() + 1);
                                    setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-1 text-[#D05E2C] dark:text-[#D4612D] hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer flex items-center"
                            >
                                <span className="text-[10px] leading-none select-none">▶</span>
                            </button>
                        </div>

                        {/* Daily / Monthly Toggle Pill */}
                        <div className="flex items-center p-1 bg-white dark:bg-zinc-800 rounded-xl border border-[#D4612D] shadow-sm shrink-0">
                            {['daily', 'monthly'].map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setView(v)}
                                    className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer border-0 outline-none ${view === v
                                        ? 'bg-gradient-to-r from-[#882619] to-[#D4612D] text-white shadow-md'
                                        : 'text-[#882619] dark:text-[#D4612D] hover:opacity-80 bg-transparent'
                                        }`}
                                >
                                    {v.charAt(0).toUpperCase() + v.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Download Action */}
                        <div className="relative" ref={downloadDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                                className="flex flex-col items-center justify-center gap-0.5 group transition-transform hover:scale-105 cursor-pointer bg-transparent border-0 outline-none"
                                title="Download"
                            >
                                <img src="/icons/action/Download.svg" className="w-16 h-16 block dark:hidden" alt="Download" />
                                <img src="/icons/action/DownloadDark.svg" className="w-16 h-16 block hidden dark:block" alt="Download" />
                            </button>
                            <AnimatePresence>
                                {isDownloadDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-36 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-700 overflow-hidden z-50 py-1"
                                    >
                                        <button onClick={() => { handleExportData('pdf'); setIsDownloadDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 bg-transparent border-0 cursor-pointer">
                                            <FileText size={15} className="text-red-500" /> PDF
                                        </button>
                                        <button onClick={() => { handleExportData('excel'); setIsDownloadDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 bg-transparent border-0 cursor-pointer">
                                            <FileText size={15} className="text-emerald-600" /> Excel
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* 3. Main Body */}
                <div className="p-6 bg-white dark:bg-[#1a1a1a]">
                    <AnimatePresence mode="wait">
                        {view === 'daily' && (
                            <motion.div
                                key="daily"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="space-y-6"
                            >
                                {loading ? (
                                    <div className="text-center py-20 text-slate-400 font-medium">Loading daily logs...</div>
                                ) : areas.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 py-20 text-center text-slate-500 dark:text-zinc-400">
                                        No areas defined. Open Source to add areas.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {areas.map((area) => {
                                            const rawStatus = getAreaStatus(area._id);
                                            const status = (rawStatus === true) ? 2 : (rawStatus === false || !rawStatus) ? 0 : Number(rawStatus);

                                            // Cards styling matching exact reference design
                                            const cardStyles = {
                                                0: { // Pending
                                                    cardBg: 'bg-white dark:bg-zinc-900/50',
                                                    label: 'PENDING',
                                                    labelColor: 'text-[#DB6A58]',
                                                    iconBg: 'bg-[#E87A68] shadow-md shadow-[#E87A68]/30',
                                                    icon: <XCircle size={22} strokeWidth={2} className="text-white" />
                                                },
                                                1: { // Half Done
                                                    cardBg: 'bg-[#FFFBE6] dark:bg-amber-950/20 ',
                                                    label: 'HALF DONE',
                                                    labelColor: 'text-[#D97706]',
                                                    iconBg: 'bg-[#EAB308] shadow-md shadow-[#EAB308]/30',
                                                    icon: <History size={22} strokeWidth={2} className="text-white" />
                                                },
                                                2: { // Completed
                                                    cardBg: 'bg-[#FFF3EB] dark:bg-emerald-950/20 ',
                                                    label: 'COMPLETED',
                                                    labelColor: 'text-[#05A869]',
                                                    iconBg: 'bg-[#05A869] shadow-md shadow-[#05A869]/30',
                                                    icon: <CheckCircle2 size={22} strokeWidth={2} className="text-white" />
                                                }
                                            };

                                            const config = cardStyles[status] || cardStyles[0];

                                            return (
                                                <motion.button
                                                    key={area._id}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => !isReadOnly && hasPermission('write') && toggleArea(area)}
                                                    disabled={isReadOnly || !hasPermission('write')}
                                                    className={`group flex items-center justify-between py-4 px-6 rounded-2xl shadow-sm transition-all text-left ${config.cardBg} ${(isReadOnly || !hasPermission('write')) ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={`text-[11px] font-bold tracking-wider ${config.labelColor}`}>
                                                            {config.label}
                                                        </span>
                                                        <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-800 dark:text-zinc-100 leading-tight mt-0.5">
                                                            {area.name}
                                                        </h3>
                                                        <span className="text-xs font-semibold text-[#9C8275] dark:text-zinc-400">
                                                            {getCompanyName(area.companyId) || 'Nilkanth Prasadam'}
                                                        </span>
                                                    </div>

                                                    <div className={`w-12 h-12 rounded-[1.25rem] ${config.iconBg} flex items-center justify-center shrink-0`}>
                                                        {config.icon}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {view === 'monthly' && (
                            <motion.div
                                key="monthly"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                className="space-y-4"
                            >
                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-card text-center shadow-sm md:text-left">
                                    <div className="p-6 flex justify-between items-center bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                                        <h3 className="text-base font-black text-slate-800 dark:text-zinc-100 uppercase tracking-tight">Monthly Log Overview</h3>
                                        <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                                    </div>

                                    {loading ? (
                                        <div className="p-20 text-center text-slate-400 font-medium">Loading monthly data...</div>
                                    ) : (
                                        <div className="bg-card overflow-hidden">
                                            <div className="overflow-x-auto no-scrollbar max-w-full">
                                                <table className="w-full border-separate border-spacing-0 table-fixed min-w-[1000px]">
                                                    <thead>
                                                        <tr className="bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold capitalize text-xs whitespace-nowrap double-header-row">
                                                            <th className="px-6 py-3.5 sticky left-0 bg-slate-50 dark:bg-zinc-800 z-20 w-48 text-left border-r border-[#A4A4A4]">Area \ Day</th>
                                                            {[...Array(getDaysInMonth(selectedDate))].map((_, i) => (
                                                                <th key={i} className="px-1 py-3.5 text-center min-w-[32px] border-r border-[#A4A4A4]">{i + 1}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#000000] dark:divide-zinc-700 font-medium">
                                                        {areas.map((area) => (
                                                            <tr key={area._id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-[#000000]">
                                                                <td className="px-6 py-3 text-xs font-extrabold text-slate-800 dark:text-zinc-200 sticky left-0 bg-card z-10 whitespace-nowrap overflow-hidden text-ellipsis text-left border-r border-[#A4A4A4]">
                                                                    <div>{area.name}</div>
                                                                    {getCompanyName(area.companyId) && (
                                                                        <div className="text-[9px] text-slate-400 dark:text-zinc-400 uppercase mt-0.5 font-bold tracking-wider">{getCompanyName(area.companyId)}</div>
                                                                    )}
                                                                </td>
                                                                {[...Array(getDaysInMonth(selectedDate))].map((_, i) => {
                                                                    const status = getMonthlyStatus(area._id, i + 1);

                                                                    return (
                                                                        <td key={i} className="px-0 py-3 text-center border-r border-[#A4A4A4]">
                                                                            <div className="flex items-center justify-center">
                                                                                {status === 2 ? (
                                                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                                                ) : status === 1 ? (
                                                                                    <History size={14} className="text-amber-500" />
                                                                                ) : (
                                                                                    <XCircle size={14} className="text-red-400/30" strokeWidth={2} />
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border-t border-slate-200 dark:border-zinc-800">
                                        <div className="flex items-center justify-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 uppercase tracking-widest">Cleaned</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <History size={14} className="text-amber-500" />
                                                <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 uppercase tracking-widest">Half Cleaned</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <XCircle size={14} className="text-red-400" />
                                                <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 uppercase tracking-widest">Pending</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Master Data Manager */}
            <MasterDataManager
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                onRefresh={fetchAreas}
                allowedTabs={['cleaningAreas']}
            />
        </div>
    );
}
