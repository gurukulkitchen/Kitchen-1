"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, IndianRupee, Calendar, FileText, Download, ArrowDownToLine, Loader2 } from 'lucide-react';
import { formatIndianNumber } from '@/lib/formatters';
import MonthYearPicker from '@/components/MonthYearPicker';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';
import FilterDropdown from '@/components/FilterDropdown';

const ToDashboard = ({ companyId = '' }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const now = new Date();
    const [startPeriod, setStartPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
    const [endPeriod, setEndPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState(['Total Expense', 'Par Day', 'Par Student', 'Day / Student']);

    const metricOptions = ['Total Expense', 'Par Day', 'Par Student', 'Day / Student'];

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    // Fetch data for all years in the selected range
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get unique years in range
                const years = [];
                for (let y = startPeriod.year; y <= endPeriod.year; y++) years.push(y);
                const results = await Promise.all(
                    years.map(y => fetch(`/api/dashboard/to?year=${y}${companyId ? `&companyId=${companyId}` : ''}`)
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null)
                    )
                );
                // Merge into a map keyed by year
                const byYear = {};
                years.forEach((y, i) => { if (results[i]) byYear[y] = results[i]; });
                setData(byYear);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [companyId, startPeriod, endPeriod]);

    // Build visible columns: [{year, monthIdx (0-based), label}]
    const visibleCols = useMemo(() => {
        const cols = [];
        let d = new Date(startPeriod.year, startPeriod.month - 1, 1);
        const end = new Date(endPeriod.year, endPeriod.month - 1, 1);
        const effectiveEnd = d > end ? d : end;
        let count = 0;
        while (d <= effectiveEnd && count < 36) {
            cols.push({
                year: d.getFullYear(),
                monthIdx: d.getMonth(), // 0-based
                label: months[d.getMonth()] + (startPeriod.year !== endPeriod.year ? ` '${String(d.getFullYear()).slice(-2)}` : '')
            });
            d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            count++;
        }
        return cols;
    }, [startPeriod, endPeriod]);

    const tableRows = useMemo(() => {
        if (!data || Object.keys(data).length === 0) return [];

        // Collect all depts across all years; use the first year's structure as base
        const firstYear = startPeriod.year;
        const firstData = data[firstYear];
        if (!firstData) return [];
        const depts = firstData.departments || [];
        const order = ['all', 'breakfast', 'lunch', 'night', 'dinner'];
        const sortedDepts = [...depts].sort((a, b) => {
            const idxA = order.indexOf(a.key.toLowerCase());
            const idxB = order.indexOf(b.key.toLowerCase());
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.name.localeCompare(b.name);
        });
        const mainKeys = ['all', 'breakfast', 'lunch', 'night', 'dinner'];
        const filteredDepts = sortedDepts.filter(d =>
            mainKeys.includes(d.key.toLowerCase()) || d.total > 0
        );
        const getDaysInMonth = (mIdx, y) => new Date(y, mIdx + 1, 0).getDate();

        return filteredDepts.map(dept => {
            // Build per-visible-column amounts
            const colAmounts = visibleCols.map(col => {
                const yearData = data[col.year];
                if (!yearData) return 0;
                const deptInYear = (yearData.departments || []).find(d => d.key === dept.key);
                return deptInYear ? (deptInYear.monthlyAmounts[col.monthIdx] || 0) : 0;
            });
            const total = colAmounts.reduce((s, a) => s + a, 0);
            
            // Per Day Calculation
            const parDayData = colAmounts.map((amt, i) => {
                const days = getDaysInMonth(visibleCols[i].monthIdx, visibleCols[i].year);
                return days > 0 ? amt / days : 0;
            });
            const totalDays = visibleCols.reduce((acc, col, i) =>
                acc + (colAmounts[i] > 0 ? getDaysInMonth(col.monthIdx, col.year) : 0), 0);
            const totalParDay = total > 0 && totalDays > 0 ? total / totalDays : 0;

            // Per Student Calculation
            const perStudentData = colAmounts.map((amt, i) => {
                const yearData = data[visibleCols[i].year];
                const studentCount = yearData?.monthlyStudentCounts?.[visibleCols[i].monthIdx] || 0;
                return studentCount > 0 ? amt / studentCount : 0;
            });
            
            const activeMonths = visibleCols.filter((col, i) => colAmounts[i] > 0);
            const totalStudents = activeMonths.reduce((acc, col) => {
                const yearData = data[col.year];
                return acc + (yearData?.monthlyStudentCounts?.[col.monthIdx] || 0);
            }, 0);
            const avgStudents = activeMonths.length > 0 ? totalStudents / activeMonths.length : 0;
            const totalPerStudent = (total > 0 && avgStudents > 0) ? total / avgStudents : 0;

            // Per Day Per Student Calculation
            const perStudentParDayData = colAmounts.map((amt, i) => {
                const days = getDaysInMonth(visibleCols[i].monthIdx, visibleCols[i].year);
                const yearData = data[visibleCols[i].year];
                const studentCount = yearData?.monthlyStudentCounts?.[visibleCols[i].monthIdx] || 0;
                return (days > 0 && studentCount > 0) ? (amt / days) / studentCount : 0;
            });
            const totalPerStudentParDay = (total > 0 && totalDays > 0 && avgStudents > 0) ? (total / totalDays) / avgStudents : 0;

            return { 
                ...dept, 
                colAmounts, 
                total, 
                parDayData, 
                totalParDay,
                perStudentData,
                totalPerStudent,
                perStudentParDayData,
                totalPerStudentParDay
            };
        });
    }, [data, visibleCols, startPeriod]);

    const handleDownloadExcel = () => {
        if (!tableRows.length) return;
        const headers = ["Source", ...visibleCols.map(c => c.label), "TOTAL"];
        const rows = tableRows.map(row => [
            row.name,
            ...row.colAmounts,
            row.total
        ]);

        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expense Summary");
        XLSX.writeFile(wb, `Expense_Summary_${startPeriod.year}${startPeriod.year !== endPeriod.year ? `-${endPeriod.year}` : ''}.xlsx`);
    };

    const handleDownloadPDF = async () => {
        if (!tableRows.length) return;
        setLoading(true);
        try {
            const doc = new jsPDF({ orientation: 'landscape' });
            await addStandardHeader(doc, `Expense Summary - ${startPeriod.year}${startPeriod.year !== endPeriod.year ? `-${endPeriod.year}` : ''}`);

            const headers = ["Source", ...visibleCols.map(c => c.label), "TOTAL"];
            const rows = tableRows.map(row => [
                row.name,
                ...row.colAmounts.map(amt => amt > 0 ? formatIndianNumber(Math.round(amt)) : '0'),
                formatIndianNumber(Math.round(row.total))
            ]);

            autoTable(doc, {
                startY: 25,
                head: [headers],
                body: rows,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 1.5 },
                headStyles: { fillColor: [239, 120, 52] }
            });

            // Add Metric Summaries (PAR DAY, PAR STUDENT, DAY / STUDENT)
            const metricRows = tableRows.filter(r => ['breakfast', 'lunch', 'night', 'dinner'].includes(r.key.toLowerCase()));
            if (metricRows.length > 0) {
                doc.addPage();
                await addStandardHeader(doc, `Yearly Metric Summary - ${startPeriod.year}`);
                
                const allMetricRows = [];
                metricRows.forEach(row => {
                    // PAR DAY
                    allMetricRows.push([
                        `PAR DAY - ${row.name}`,
                        ...row.parDayData.map(v => v > 0 ? v.toFixed(1) : '0'),
                        row.totalParDay.toFixed(1)
                    ]);
                    // PAR STUDENT
                    allMetricRows.push([
                        `PAR STUDENT - ${row.name}`,
                        ...row.perStudentData.map(v => v > 0 ? v.toFixed(2) : '0'),
                        row.totalPerStudent.toFixed(2)
                    ]);
                    // DAY / STUDENT
                    allMetricRows.push([
                        `DAY / STUDENT - ${row.name}`,
                        ...row.perStudentParDayData.map(v => v > 0 ? v.toFixed(2) : '0'),
                        row.totalPerStudentParDay.toFixed(2)
                    ]);
                });

                autoTable(doc, {
                    startY: 25,
                    head: [headers],
                    body: allMetricRows,
                    theme: 'grid',
                    styles: { fontSize: 6, cellPadding: 1 },
                    headStyles: { fillColor: [59, 130, 246] },
                    didParseCell: (data) => {
                        if (data.row.index % 3 === 0) data.cell.styles.fillColor = [241, 245, 249]; // PAR DAY rows
                        if (data.row.index % 3 === 1) data.cell.styles.textColor = [79, 70, 229];   // PAR STUDENT rows
                        if (data.row.index % 3 === 2) data.cell.styles.textColor = [225, 29, 72];    // DAY / STUDENT rows
                    }
                });
            }

            doc.save(`Yearly_Expense_Summary_${startPeriod.year}.pdf`);
        } catch (e) {
            console.error("PDF Export Error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1700px] mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header / Year Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tight italic flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#ff8b2b] rounded-full" />
                        Yearly Expense Summary
                    </h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 ml-5">Comprehensive source breakdown by month</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <MonthYearPicker
                        label="From"
                        value={startPeriod}
                        onChange={setStartPeriod}
                    />
                    <span className="text-muted-foreground font-black text-xs uppercase tracking-widest hidden sm:block">→</span>
                    <MonthYearPicker 
                        label="To" 
                        value={endPeriod} 
                        onChange={setEndPeriod} 
                    />
                    
                    <div className="relative">
                        <FilterDropdown
                            options={metricOptions}
                            value={selectedMetrics}
                            onChange={(val) => setSelectedMetrics(val.length === 0 ? metricOptions : val)}
                            title="Metrics"
                            isMulti={true}
                        />
                    </div>

                    <div className="relative" data-download-menu="true">
                        <button 
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            className="h-11 px-6 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Export Report</span>
                        </button>

                        {showDownloadMenu && (
                            <div className="absolute right-0 top-full z-[100] mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { handleDownloadExcel(); setShowDownloadMenu(false); }}
                                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-bold text-foreground transition hover:bg-muted"
                                >
                                    <ArrowDownToLine size={18} className="text-emerald-600" />
                                    Export as Excel
                                </button>
                                <button
                                    onClick={() => { handleDownloadPDF(); setShowDownloadMenu(false); }}
                                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-bold text-foreground transition hover:bg-muted border-t border-border/50"
                                >
                                    <FileText size={18} className="text-blue-600" />
                                    Export as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Yearly Table */}
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-[#EF7834]">
                                <th className="sticky left-0 z-20 bg-[#EF7834] py-4 px-6 text-center text-xs font-black text-white uppercase tracking-widest border-b border-white/10 min-w-[140px]">MONTH</th>
                                {visibleCols.map((col, i) => (
                                    <th key={i} className="py-4 px-4 text-center text-xs font-black text-white uppercase tracking-widest border-b border-white/10 min-w-[100px]">{col.label}</th>
                                ))}
                                <th className="py-4 px-6 text-center text-xs font-black text-white uppercase tracking-widest border-b border-white/10 min-w-[120px]">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={14} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Loading Yearly Analytics...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : tableRows.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleCols.length + 2} className="py-24 text-center text-muted-foreground font-bold italic uppercase">No expense records found for {startPeriod.year}{startPeriod.year !== endPeriod.year ? `–${endPeriod.year}` : ''}</td>
                                </tr>
                            ) : (
                                <>
                                    {/* Main Expense Rows */}
                                    {tableRows.map((row, rIdx) => (
                                        selectedMetrics.includes('Total Expense') && (
                                            <tr key={row.key} className="hover:bg-muted/30 transition-colors group">
                                                <td className="sticky left-0 z-10 bg-card py-5 px-6 border-r border-border font-black text-[11px] text-muted-foreground uppercase tracking-widest text-center group-hover:bg-muted transition-colors">
                                                    {row.name}
                                                </td>
                                                {row.colAmounts.map((amt, mIdx) => (
                                                    <td key={mIdx} className={`py-5 px-4 text-center text-[13px] font-bold ${amt > 0 ? 'text-foreground' : 'text-slate-300'}`}>
                                                        {amt > 0 ? `₹ ${formatIndianNumber(Math.round(amt))}` : '₹ 0'}
                                                    </td>
                                                ))}
                                                <td className="py-5 px-6 text-center text-sm font-black text-foreground bg-muted/20">
                                                    ₹ {formatIndianNumber(Math.round(row.total))}
                                                </td>
                                            </tr>
                                        )
                                    ))}

                                    {/* Spacer row */}
                                    <tr className="bg-muted/10 h-2"><td colSpan={visibleCols.length + 2}></td></tr>

                                    {/* Calculated Metrics Rows (only for main meals) */}
                                    {tableRows.filter(r => ['breakfast', 'lunch', 'night', 'dinner'].includes(r.key.toLowerCase())).map((row, rIdx) => {
                                        const colors = {
                                            breakfast: 'text-orange-500',
                                            lunch: 'text-green-600',
                                            night: 'text-blue-600',
                                            dinner: 'text-blue-600'
                                        };
                                        const colorClass = colors[row.key.toLowerCase()] || 'text-primary';
                                        
                                        return (
                                            <React.Fragment key={`metrics-${row.key}`}>
                                                {/* PAR DAY */}
                                                {selectedMetrics.includes('Par Day') && (
                                                    <tr className="hover:bg-muted/30 transition-colors group bg-slate-50/30">
                                                        <td className="sticky left-0 z-10 bg-slate-50 py-4 px-6 border-r border-border font-black text-[10px] uppercase tracking-tighter text-center group-hover:bg-muted transition-colors leading-tight">
                                                            <span className={colorClass}>PAR DAY</span><br/>
                                                            <span className="text-muted-foreground">{row.name}</span>
                                                        </td>
                                                        {row.parDayData.map((val, mIdx) => (
                                                            <td key={mIdx} className={`py-4 px-4 text-center text-xs font-black ${colorClass}`}>
                                                                {val > 0 ? `₹ ${val.toFixed(1)}` : '₹ 0'}
                                                            </td>
                                                        ))}
                                                        <td className={`py-4 px-6 text-center text-xs font-black bg-muted/20 ${colorClass}`}>
                                                            ₹ {row.totalParDay.toFixed(1)}
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* PAR STUDENT */}
                                                {selectedMetrics.includes('Par Student') && (
                                                    <tr className="hover:bg-muted/30 transition-colors group bg-slate-100/20">
                                                        <td className="sticky left-0 z-10 bg-slate-100/50 py-4 px-6 border-r border-border font-black text-[10px] uppercase tracking-tighter text-center group-hover:bg-muted transition-colors leading-tight">
                                                            <span className="text-indigo-600">PAR STUDENT</span><br/>
                                                            <span className="text-muted-foreground">{row.name}</span>
                                                        </td>
                                                        {row.perStudentData.map((val, mIdx) => (
                                                            <td key={mIdx} className="py-4 px-4 text-center text-xs font-black text-indigo-600">
                                                                {val > 0 ? `₹ ${val.toFixed(2)}` : '₹ 0'}
                                                            </td>
                                                        ))}
                                                        <td className="py-4 px-6 text-center text-xs font-black bg-muted/20 text-indigo-600">
                                                            ₹ {row.totalPerStudent.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )}

                                                {/* PER DAY / STUDENT */}
                                                {selectedMetrics.includes('Day / Student') && (
                                                    <tr className="hover:bg-muted/30 transition-colors group bg-slate-200/20">
                                                        <td className="sticky left-0 z-10 bg-slate-200/30 py-4 px-6 border-r border-border font-black text-[10px] uppercase tracking-tighter text-center group-hover:bg-muted transition-colors leading-tight">
                                                            <span className="text-rose-600">DAY / STUDENT</span><br/>
                                                            <span className="text-muted-foreground">{row.name}</span>
                                                        </td>
                                                        {row.perStudentParDayData.map((val, mIdx) => (
                                                            <td key={mIdx} className="py-4 px-4 text-center text-xs font-black text-rose-600">
                                                                {val > 0 ? `₹ ${val.toFixed(2)}` : '₹ 0'}
                                                            </td>
                                                        ))}
                                                        <td className="py-4 px-6 text-center text-xs font-black bg-muted/20 text-rose-600">
                                                            ₹ {row.totalPerStudentParDay.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend / Info */}
            <div className="flex flex-col sm:flex-row gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div className="p-3 bg-blue-500 text-white rounded-xl h-fit">
                    <FileText size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Report Information</h4>
                    <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
                        This table displays the total monthly expenses for each source. 
                        The <span className="font-bold">"PAR DAY"</span> rows represent the average daily cost for that specific meal.
                        The <span className="font-bold text-indigo-700">"PAR STUDENT"</span> rows represent the average cost per student per month.
                        The <span className="font-bold text-rose-700">"DAY / STUDENT"</span> rows represent the average cost per student per day.
                        All metrics are calculated using student counts retrieved from the Source data.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ToDashboard;
