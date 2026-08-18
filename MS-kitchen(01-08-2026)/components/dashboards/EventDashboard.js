"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Calendar, ArrowDownToLine, Info, Filter, FileText } from 'lucide-react';
import { formatIndianNumber } from '@/lib/formatters';
import TableColumnFilter from '@/components/TableColumnFilter';
import MonthYearPicker from '@/components/MonthYearPicker';
import FilterDropdown from '@/components/FilterDropdown';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';

const EventDashboard = ({ companyId = '' }) => {
    const [data, setData] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('All');
    const [eventMenuOpen, setEventMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [colFilters, setColFilters] = useState({});
    const [activeFilterCol, setActiveFilterCol] = useState(null);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const now = new Date();
    const [periodA, setPeriodA] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
    const [periodB, setPeriodB] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

    const handleImageError = (id) => {
        setImageErrors(prev => ({ ...prev, [id]: true }));
    };

    const toggleColFilter = (col, e) => {
        if (e) e.stopPropagation();
        setActiveFilterCol(activeFilterCol === col ? null : col);
    };

    const handleColFilterChange = (col, val) => {
        if (val === '') {
            setColFilters(prev => {
                const next = { ...prev };
                delete next[col];
                return next;
            });
            return;
        }

        setColFilters(prev => {
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

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (companyId) params.append('companyId', companyId);
            // Build date range: FROM = first day of periodA, TO = last day of periodB
            const fromDate = `${periodA.year}-${String(periodA.month).padStart(2, '0')}-01`;
            const toLastDay = new Date(periodB.year, periodB.month, 0).getDate();
            const toDate = `${periodB.year}-${String(periodB.month).padStart(2, '0')}-${toLastDay}`;
            params.append('from', fromDate);
            params.append('to', toDate);
            if (selectedEvent && selectedEvent !== 'All') params.append('event', selectedEvent);

            const res = await fetch(`/api/dashboard/events?${params.toString()}`);
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (e) {
            console.error('Failed to load event dashboard:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [companyId, periodA, periodB, selectedEvent]);

    const formatRupee = (value) => `₹ ${formatIndianNumber(value || 0)}`;

    const months = useMemo(() => {
        const monthly = data?.monthly || [];
        const result = [];
        let d = new Date(periodA.year, periodA.month - 1, 1);
        const end = new Date(periodB.year, periodB.month - 1, 1);
        const effectiveEnd = d > end ? d : end;
        let count = 0;

        while (d <= effectiveEnd && count < 36) {
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const label = `${d.toLocaleString('en-US', { month: 'short' })} - ${String(y).slice(-2)}`;
            const mData = monthly.find(x => x.year === y && x.month === m);
            result.push({ label, amount: formatRupee(mData ? mData.totalAmount : 0) });
            d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            count++;
        }
        return result;
    }, [data, periodA, periodB]);

    const tableData = useMemo(() => {
        let recent = data?.recent || [];
        const categoryToSheet = (category) => {
            const catName = category?.name || category;
            const c = String(catName || '').toLowerCase();
            if (c.includes('milk') || c.includes('buttermilk') || c.includes('dairy')) return 'Milk & Butter.M';
            if (c.includes('vegetable') || c.includes('fruit') || c.includes('veg')) return 'Veg & Fruit';
            return 'Stock Out';
        };

        let mapped = recent.map(t => {
            const dt = new Date(t.date);
            const date = `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`;
            const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
            const unitName = t.item?.unit?.name || t.item?.unit || '';
            const qtyStr = `${formatIndianNumber(t.quantity)} ${unitName}`.trim();
            const totalAmount = Number(t.totalAmount || 0);
            const rate = t.quantity ? (totalAmount / Number(t.quantity || 1)) : 0;
            return {
                date,
                time,
                sheet: categoryToSheet(t.item?.category),
                to: t.department?.name || t.department || 'All',
                event: t.event?.name || t.event || '-',
                product: t.item?.name || 'Unknown',
                rate: formatIndianNumber(rate),
                qty: qtyStr,
                total: formatIndianNumber(totalAmount),
                narration: t.narration || '-',
                image: t.item?.image,
                id: t.item?._id,
                color: 'text-foreground'
            };
        });

        // Apply filters
        Object.keys(colFilters).forEach(col => {
            const values = colFilters[col];
            if (values && values.length > 0) {
                mapped = mapped.filter(item => {
                    if (col === 'product') return values.includes(item.product);
                    if (col === 'to') return values.includes(item.to);
                    if (col === 'event') return values.includes(item.event);
                    if (col === 'sheet') return values.includes(item.sheet);
                    if (col === 'date') return values.includes(item.date);
                    if (col === 'narration') return values.includes(item.narration);
                    if (col === 'rate') return values.includes(item.rate);
                    if (col === 'qty') return values.includes(item.qty);
                    if (col === 'total') return values.includes(item.total);
                    return true;
                });
            }
        });

        return mapped;
    }, [data, colFilters]);

    const tableTotal = useMemo(() => {
        return tableData.reduce((sum, row) => {
            const val = Number(String(row.total || 0).replace(/,/g, ''));
            return sum + val;
        }, 0);
    }, [tableData]);

    const uniqueValues = useMemo(() => {
        const recent = data?.recent || [];
        const categoryToSheet = (category) => {
            const catName = category?.name || category;
            const c = String(catName || '').toLowerCase();
            if (c.includes('milk') || c.includes('buttermilk') || c.includes('dairy')) return 'Milk & Butter.M';
            if (c.includes('vegetable') || c.includes('fruit') || c.includes('veg')) return 'Veg & Fruit';
            return 'Stock Out';
        };

        const sets = {
            date: new Set(),
            to: new Set(),
            event: new Set(),
            product: new Set(),
            sheet: new Set(),
            rate: new Set(),
            qty: new Set(),
            total: new Set(),
            narration: new Set()
        };

        recent.forEach(t => {
            const dt = new Date(t.date);
            sets.date.add(`${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`);
            sets.to.add(t.department?.name || t.department || 'All');
            sets.event.add(t.event?.name || t.event || '-');
            sets.product.add(t.item?.name || 'Unknown');
            sets.sheet.add(categoryToSheet(t.item?.category));
            const totalAmount = Number(t.totalAmount || 0);
            const rate = t.quantity ? (totalAmount / Number(t.quantity || 1)) : 0;
            sets.rate.add(formatIndianNumber(rate));
            const unitName = t.item?.unit?.name || t.item?.unit || '';
            sets.qty.add(`${formatIndianNumber(t.quantity)} ${unitName}`.trim());
            sets.total.add(formatIndianNumber(totalAmount));
            sets.narration.add(t.narration || '-');
        });

        return {
            date: Array.from(sets.date).sort(),
            to: Array.from(sets.to).sort(),
            event: Array.from(sets.event).sort(),
            product: Array.from(sets.product).sort(),
            sheet: Array.from(sets.sheet).sort(),
            rate: Array.from(sets.rate).sort((a, b) => Number(a.replace(/,/g, '')) - Number(b.replace(/,/g, ''))),
            qty: Array.from(sets.qty).sort(),
            total: Array.from(sets.total).sort((a, b) => Number(a.replace(/,/g, '')) - Number(b.replace(/,/g, ''))),
            narration: Array.from(sets.narration).sort()
        };
    }, [data]);

    const headerTotal = useMemo(() => {
        const monthly = data?.monthly || [];
        return monthly.reduce((sum, m) => sum + Number(m.totalAmount || 0), 0);
    }, [data]);

    const handleDownloadExcel = () => {
        if (!tableData || tableData.length === 0) return;

        const dataToExport = tableData.map(row => ({
            "Date": row.date,
            "Time": row.time,
            "To": row.to,
            "Event": row.event,
            "Product Name": row.product,
            "Sheet": row.sheet,
            "Rate": row.rate,
            "Qty": row.qty,
            "Grand Total": row.total,
            "Narration": row.narration
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Events");
        XLSX.writeFile(wb, `Event_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleDownloadPDF = async () => {
        if (!tableData || tableData.length === 0) return;
        setLoading(true);
        try {
            const doc = new jsPDF({ orientation: 'landscape' });
            await addStandardHeader(doc, "Event Dashboard Report");

            const tableHeaders = ["Date", "To", "Event", "Product", "Sheet", "Rate", "Qty", "Total", "Narration"];
            const tableRows = tableData.map(row => [
                row.date,
                row.to,
                row.event,
                row.product,
                row.sheet,
                row.rate,
                row.qty,
                row.total,
                row.narration
            ]);

            autoTable(doc, {
                startY: 25,
                head: [tableHeaders],
                body: tableRows,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [239, 120, 52] }
            });

            doc.save(`Event_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (e) {
            console.error("PDF Export Error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-[1500px] mx-auto p-2 sm:p-4 md:p-8 space-y-8">
            <div className="bg-card rounded-3xl border border-border shadow-2xl p-4 sm:p-6 md:p-10 relative overflow-hidden transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="relative z-50">
                            <FilterDropdown
                                options={['All', ...(data?.eventsList || [])].map(evt => ({ value: evt, label: evt === 'All' ? 'All Events' : evt }))}
                                value={selectedEvent}
                                onChange={(val) => setSelectedEvent(val)}
                                title="Event"
                                isMulti={false}
                                style={{ minWidth: '180px' }}
                            />
                        </div>
                        <span className="text-2xl sm:text-3xl font-black text-foreground italic tracking-tighter ml-2">{formatRupee(tableTotal)}</span>
                    </div>

                    <div className="relative" data-download-menu="true">
                        <button
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            className="flex items-center gap-3 px-6 font-black text-xs uppercase shadow-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <div className="border-[2px] border-indigo-500 rounded-full p-1.5 text-indigo-500">
                                <ArrowDownToLine size={18} strokeWidth={3} />
                            </div>
                            Download
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

                <div className="overflow-x-auto no-scrollbar border border-border rounded-2xl mb-12 shadow-inner bg-muted/20">
                    <div className="grid min-w-[800px] lg:min-w-0" style={{ gridTemplateColumns: `repeat(${Math.min(months.length || 1, 12)}, minmax(0, 1fr))` }}>
                        {months.map((m, idx) => (
                            <div key={idx} className="border-r border-b border-border last:border-r-0 p-3 text-center bg-card/60 flex flex-col items-center justify-center min-h-[80px] hover:bg-card transition-colors group">
                                <div className="text-[10px] font-black flex items-center justify-center gap-1.5 mb-1.5 text-muted-foreground uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                                    {m.label} <div className="w-2 h-2 rounded-full border-2 border-primary bg-primary/20 shrink-0" />
                                </div>
                                <div className="text-[11px] font-black text-primary">{m.amount}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-muted/20 p-4 sm:p-6 rounded-3xl border border-border/50 mb-12 shadow-inner">
                    <MonthYearPicker
                        label="From"
                        value={periodA}
                        onChange={setPeriodA}
                    />
                    <span className="text-muted-foreground font-black text-xs uppercase tracking-widest hidden sm:block">→</span>
                    <MonthYearPicker
                        label="To"
                        value={periodB}
                        onChange={setPeriodB}
                    />
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="ml-auto bg-primary text-white px-8 py-3 rounded-full text-sm font-black hover:bg-primary-hover shadow-lg transition-all uppercase italic tracking-widest active:scale-95 disabled:opacity-50 min-w-[140px]"
                    >
                        {loading ? 'Searching...' : 'View Entry'}
                    </button>
                    <div className="text-xl font-black text-foreground italic tracking-tighter">
                        Grand Total : <span className="text-primary ml-2">{formatRupee(tableTotal)}</span>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
                    <table className="w-full min-w-[1200px] text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 double-header-row border-foreground/80 text-[13px] font-black italic uppercase tracking-tighter text-muted-foreground">
                                <th className="py-5 px-4">
                                    <TableColumnFilter colKey="date" title="Date" options={uniqueValues.date} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                </th>
                                <th className="py-5 px-4">
                                    <TableColumnFilter colKey="to" title="To :" options={uniqueValues.to} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                </th>
                                <th className="py-5 px-4">
                                    <TableColumnFilter colKey="event" title="Event" options={uniqueValues.event} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                </th>
                                <th className="py-5 px-4">
                                    <div className="flex flex-col gap-1">
                                        <TableColumnFilter colKey="product" title="Product Name" options={uniqueValues.product} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                        <TableColumnFilter colKey="sheet" title="Sheet" options={uniqueValues.sheet} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                    </div>
                                </th>
                                <th className="py-5 px-4 text-center">
                                    <TableColumnFilter colKey="rate" title="Rate" align="center" options={uniqueValues.rate} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                </th>
                                <th className="py-5 px-4 text-center">
                                    <TableColumnFilter colKey="qty" title="Qty" align="center" options={uniqueValues.qty} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                </th>
                                <th className="py-5 px-4 text-center">
                                    <TableColumnFilter colKey="total" title="Grand Total" align="center" options={uniqueValues.total} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                </th>
                                <th className="py-5 px-4">
                                    <TableColumnFilter colKey="narration" title="Narration" options={uniqueValues.narration} colFilters={colFilters} activeFilterCol={activeFilterCol} onToggle={toggleColFilter} onChange={handleColFilterChange} />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {tableData.map((row, i) => (
                                <tr key={i} className="text-[12px] font-bold hover:bg-muted/30 transition-all duration-200">
                                    <td className="py-4 px-4">
                                        <div className="text-rose-500 font-black italic">{row.date}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase ">{row.time}</div>
                                    </td>
                                    <td className="py-4 px-4 text-foreground/80 uppercase italic tracking-tight">{row.to}</td>
                                    <td className="py-4 px-4 text-primary font-black uppercase italic tracking-tight">{row.event}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-card flex-shrink-0 shadow-inner group-hover:border-primary/30 transition-all flex items-center justify-center p-0.5">
                                                {row.image && !imageErrors[row.id] ? (
                                                    <img
                                                        src={row.image}
                                                        alt={row.product}
                                                        className="w-full h-full object-cover rounded-lg"
                                                        onError={() => handleImageError(row.id)}
                                                    />
                                                ) : (
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.product}&backgroundColor=fff&textColor=e86924&fontWeight=800`}
                                                        alt={row.product}
                                                        className="w-8 h-8 object-contain"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-primary font-black uppercase italic leading-tight">{row.product}</span>
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{row.sheet}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-black">₹ {row.rate}</td>
                                    <td className="py-4 px-4 text-center font-black">{row.qty}</td>
                                    <td className="py-4 px-4 text-center text-primary font-black italic scale-110">₹ {row.total}</td>
                                    <td className={`py-4 px-4 font-black italic ${row.color} opacity-80`}>{row.narration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default EventDashboard;
