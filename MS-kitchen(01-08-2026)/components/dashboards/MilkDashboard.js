"use client"
import { ArrowDownToLine, ChevronDown, CalendarDays, Loader2, FileText } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import MonthYearPicker from '@/components/MonthYearPicker';
import { formatIndianNumber } from '@/lib/formatters';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';

const DataTable = ({ data, isRightTable }) => {
    const headers = ['Date', 'Qty', 'Rate', 'Total'];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b-2 border-foreground/80">
                        {headers.map((header) => (
                            <th key={header} className="text-sm font-bold text-foreground px-1.5 py-3 uppercase italic tracking-tighter">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {data.map((row, index) => {
                        const [date, qty, rate, total] = row;

                        return (
                            <tr key={index} className="hover:bg-muted/30 transition-colors">
                                <td className="text-[13px] font-medium text-foreground px-1.5 py-2.5">{date}</td>
                                <td className="text-[13px] font-medium text-foreground px-1.5 py-2.5">{qty}</td>
                                <td className="text-[13px] font-medium text-foreground px-1.5 py-2.5">₹ {formatIndianNumber(rate)}</td>
                                <td className="text-[13px] font-black text-primary px-1.5 py-2.5">₹ {formatIndianNumber(total)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const ToggleSwitch = ({ leftLabel, rightLabel, value, onChange }) => (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-inner">
        <button
            onClick={() => onChange(false)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${!value
                ? "bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-md"
                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
        >
            {leftLabel}
        </button>
        <button
            onClick={() => onChange(true)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${value
                ? "bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-md"
                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
        >
            {rightLabel}
        </button>
    </div>
);

const MilkDashboard = ({ companyId = '' }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const [yearData, setYearData] = useState(null);
    const [prevYearData, setPrevYearData] = useState(null);
    const [endYearData, setEndYearData] = useState(null);
    const [monthData, setMonthData] = useState(null);

    const [selectedType, setSelectedType] = useState('OUT');
    const [selectedItemId, setSelectedItemId] = useState(''); // empty => all items in section
    const [itemMenuOpen, setItemMenuOpen] = useState(false);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    const now = useMemo(() => new Date(), []);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [endYear, setEndYear] = useState(now.getFullYear());
    const [endMonth, setEndMonth] = useState(now.getMonth() + 1);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                const companyPart = companyId ? `&companyId=${encodeURIComponent(companyId)}` : '';
                const res = await fetch(`/api/kitchen/items?section=dairy${companyPart}`);
                const json = await res.json();
                if (!cancelled && res.ok) setItems(Array.isArray(json) ? json : []);
            } catch (e) {
                console.error('Failed to load milk items:', e);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [companyId]);

    const sectionQuery = useMemo(() => {
        const companyPart = companyId ? `&companyId=${encodeURIComponent(companyId)}` : '';
        const itemPart = selectedItemId ? `&itemId=${encodeURIComponent(selectedItemId)}` : '';
        return `${companyPart}${itemPart}`;
    }, [companyId, selectedItemId]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            try {
                const [yearRes, prevRes] = await Promise.all([
                    fetch(`/api/dashboard/section?section=dairy&type=${selectedType}&year=${selectedYear}&month=1${sectionQuery}`),
                    fetch(`/api/dashboard/section?section=dairy&type=${selectedType}&year=${selectedYear - 1}&month=1${sectionQuery}`)
                ]);
                if (cancelled) return;
                if (yearRes.ok) setYearData(await yearRes.json());
                if (prevRes.ok) setPrevYearData(await prevRes.json());
            } catch (e) {
                console.error('Failed to load milk yearly data:', e);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [sectionQuery, selectedType, selectedYear]);

    // Fetch endYear data when it differs from selectedYear
    useEffect(() => {
        if (endYear === selectedYear || endYear === selectedYear - 1) {
            setEndYearData(null); // reuse yearData or prevYearData
            return;
        }
        let cancelled = false;
        const run = async () => {
            try {
                const res = await fetch(`/api/dashboard/section?section=dairy&type=${selectedType}&year=${endYear}&month=1${sectionQuery}`);
                if (!cancelled && res.ok) setEndYearData(await res.json());
            } catch (e) {
                console.error('Failed to load milk end-year data:', e);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [sectionQuery, selectedType, selectedYear, endYear]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/dashboard/section?section=dairy&type=${selectedType}&year=${selectedYear}&month=${selectedMonth}${sectionQuery}`);
                if (!cancelled && res.ok) setMonthData(await res.json());
            } catch (e) {
                console.error('Failed to load milk month data:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [sectionQuery, selectedType, selectedMonth, selectedYear]);

    const handleDownload = () => {
        if (!dynamicDailyRows || dynamicDailyRows.length === 0) return;
        
        const dataToExport = dynamicDailyRows.map(r => ({
            'Date': `${r[0]}-${selectedMonth}-${selectedYear}`,
            'Qty (Lt)': r[1],
            'Avg Rate': r[2],
            'Total (₹)': r[3]
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Milk Daily Report");
        XLSX.writeFile(wb, `Milk_Report_${selectedMonthLabel}.xlsx`);
    };

    const handleDownloadPDF = async () => {
        if (!dynamicDailyRows || dynamicDailyRows.length === 0) return;
        setLoading(true);
        try {
            const doc = new jsPDF();
            await addStandardHeader(doc, "Milk Daily Report");
            
            const tableHeaders = ["Date", "Qty (Lt)", "Rate (₹)", "Total (₹)"];
            const tableRows = dynamicDailyRows.map(r => [
                `${r[0]}-${selectedMonth}-${selectedYear}`,
                r[1],
                formatIndianNumber(r[2]),
                formatIndianNumber(r[3])
            ]);

            autoTable(doc, {
                startY: 25,
                head: [tableHeaders],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [239, 120, 52] }
            });

            doc.save(`Milk_Report_${selectedMonthLabel}.pdf`);
        } catch (e) {
            console.error("PDF Export Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const formatRupee = (value) => `₹ ${formatIndianNumber(value || 0)}`;

    const getMonthlyAmount = (year, month) => {
        // Check all fetched year datasets
        const allDatasets = [
            { y: selectedYear, data: yearData },
            { y: selectedYear - 1, data: prevYearData },
            { y: endYear, data: endYearData || (endYear === selectedYear ? yearData : endYear === selectedYear - 1 ? prevYearData : null) },
        ];
        const match = allDatasets.find(ds => ds.y === year && ds.data);
        if (!match) return 0;
        const row = match.data?.monthly?.find(m => m.month === month);
        return Number(row?.totalAmount || 0);
    };

    const dynamicOverviewData = useMemo(() => {
        const result = [];
        let d = new Date(selectedYear, selectedMonth - 1, 1);
        const end = new Date(endYear, endMonth - 1, 1);
        // If FROM is after TO, show just the FROM month
        const effectiveEnd = d > end ? d : end;
        let count = 0;
        while (d <= effectiveEnd && count < 36) {
            const keyYear = d.getFullYear();
            const keyMonth = d.getMonth() + 1;
            const label = `${d.toLocaleString('en-US', { month: 'short' })} - ${String(keyYear).slice(-2)}`;
            result.push({ monthYear: label, amount: formatRupee(getMonthlyAmount(keyYear, keyMonth)) });
            d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            count++;
        }
        return result;
    }, [yearData, prevYearData, endYearData, selectedMonth, selectedYear, endMonth, endYear]);

    const dynamicDailyRows = useMemo(() => {
        if (!monthData?.daily) return null;
        return monthData.daily.map(d => ([
            d.day,
            Number(d.totalQty || 0),
            Number(d.avgRate || 0),
            Number(d.totalAmount || 0)
        ]));
    }, [monthData]);

    const dynamicTableData1 = useMemo(() => dynamicDailyRows ? dynamicDailyRows.slice(0, 15) : null, [dynamicDailyRows]);
    const dynamicTableData2 = useMemo(() => dynamicDailyRows ? dynamicDailyRows.slice(15) : null, [dynamicDailyRows]);

    const monthTotalAmount = useMemo(() => (dynamicDailyRows || []).reduce((sum, r) => sum + (Number(r[3]) || 0), 0), [dynamicDailyRows]);
    const monthTotalQty = useMemo(() => (dynamicDailyRows || []).reduce((sum, r) => sum + (Number(r[1]) || 0), 0), [dynamicDailyRows]);

    const selectedMonthLabel = useMemo(() => {
        const d = new Date(selectedYear, selectedMonth - 1, 1);
        return d.toLocaleString('en-US', { month: 'long' }) + ` ${String(selectedYear).slice(-2)}`;
    }, [selectedMonth, selectedYear]);

    const selectedItemName = useMemo(() => {
        if (!selectedItemId) return 'Select Milk Name';
        const found = items.find(i => (i._id || i.id) === selectedItemId);
        return found?.name || 'Select Milk Name';
    }, [items, selectedItemId]);

    const milkProducts = useMemo(() => {
        if (!items?.length) return [];
        return items.slice(0, 4).map((it, idx) => ({
            id: it._id || it.id,
            name: it.name,
            color: idx === 0 ? 'bg-[#FF9100] hover:bg-[#FF9100]/90' : idx === 1 ? 'bg-[#22c55e] hover:bg-[#22c55e]/90' : idx === 2 ? 'bg-indigo-500 hover:bg-indigo-500/90' : 'bg-cyan-500 hover:bg-cyan-500/90',
            textColor: 'text-white'
        }));
    }, [items]);

    const overviewData = Array.from({ length: 12 }, (_, i) => ({
        monthYear: i < 6 ? `${['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i]} - 25` : `${['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'][i - 6]} - ${i < 7 ? '25' : '26'}`,
        amount: '₹ 2,43,500',
    }));

    const tableData1 = Array.from({ length: 15 }, (_, i) => [i + 1, 74, 74, 74]);
    const tableData2 = Array.from({ length: 16 }, (_, i) => [i + 16, 74, 74, 74]);

    return (
        <main className="p-2 sm:p-4 md:p-8 space-y-6">
            <div className="max-w-[1600px] mx-auto bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-10 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 mb-8 md:items-center">
                    <div className="flex flex-wrap gap-2.5">
                        <ToggleSwitch 
                            leftLabel="In" 
                            rightLabel="Out" 
                            value={selectedType === 'OUT'} 
                            onChange={(isOut) => setSelectedType(isOut ? 'OUT' : 'IN')} 
                        />

                        <div className="relative">
                            <button
                                onClick={() => { setItemMenuOpen(v => !v); }}
                                className="bg-primary text-white text-[12px] sm:text-[13px] font-bold px-4 h-9 rounded-full flex items-center gap-2 shadow-md hover:bg-primary-hover transition-all"
                            >
                                {selectedItemName}
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            {itemMenuOpen && (
                                <div className="absolute z-50 mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in duration-200">
                                    <button
                                        onClick={() => { setSelectedItemId(''); setItemMenuOpen(false); }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-muted transition-colors border-b border-border/50"
                                    >
                                        All Milk
                                    </button>
                                    {items.map(it => (
                                        <button
                                            key={it._id || it.id}
                                            onClick={() => { setSelectedItemId(it._id || it.id); setItemMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                                        >
                                            {it.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-1.5 border border-border rounded-xl grow lg:justify-end bg-muted/20">
                        {milkProducts.map((product, idx) => (
                            <span
                                key={idx}
                                onClick={() => product.id && setSelectedItemId(product.id)}
                                className={`${product.color} ${product.textColor} text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm ${product.id ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                            >
                                {product.name}
                            </span>
                        ))}
                    </div>
                    <div className="relative" data-download-menu="true">
                        <button 
                            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 h-9 bg-indigo-500/10 text-indigo-500 rounded-full hover:bg-indigo-500/20 transition-all font-bold text-xs uppercase self-end md:self-auto disabled:"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" strokeWidth={3} />}
                            Download
                        </button>

                        {showDownloadMenu && (
                            <div className="absolute right-0 top-full z-[100] mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => { handleDownload(); setShowDownloadMenu(false); }}
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

                <div className="mb-8 p-6 bg-muted/20 rounded-2xl border border-border/50">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
                        <h2 className="text-xl sm:text-2xl font-black text-foreground flex flex-wrap items-center italic tracking-tighter">
                            Total : <span className="text-primary mx-2">{formatRupee(monthTotalAmount)}</span> 
                            <span className="mx-2 text-border hidden sm:inline">|</span> 
                            Total : <span className="text-primary mx-2">{formatIndianNumber(monthTotalQty)} Lt.</span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto no-scrollbar rounded-xl border border-border bg-card shadow-inner">
                        <div className={`grid min-w-[700px] lg:min-w-0`} style={{ gridTemplateColumns: `repeat(${Math.min(dynamicOverviewData.length || 1, 12)}, minmax(0, 1fr))` }}>
                            {dynamicOverviewData.map((data, idx) => (
                                <div key={idx} className={`p-3 text-center border-r border-border last:border-r-0 ${idx % 2 === 0 ? 'bg-muted/10' : 'bg-transparent'}`}>
                                    <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase italic">{data.monthYear}</div>
                                    <div className="text-[11px] font-black text-primary truncate">{data.amount}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border border-border rounded-2xl p-4 sm:p-6 lg:p-8 bg-card shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 pb-6 border-b border-border/50">
                        <div className="flex flex-wrap items-center gap-4 flex-grow md:flex-grow-0">
                            <MonthYearPicker 
                                value={{ month: selectedMonth, year: selectedYear }} 
                                onChange={({ month, year }) => {
                                    setSelectedMonth(month);
                                    setSelectedYear(year);
                                }} 
                                label="From" 
                            />
                            <span className="text-muted-foreground font-black text-xs uppercase tracking-widest hidden sm:block">→</span>
                            <MonthYearPicker 
                                value={{ month: endMonth, year: endYear }} 
                                onChange={({ month, year }) => {
                                    setEndMonth(month);
                                    setEndYear(year);
                                }} 
                                label="To" 
                            />
                        </div>
                        <h3 className="text-lg font-black text-foreground whitespace-nowrap italic tracking-tighter ml-auto">
                            Total : <span className="text-primary">{formatRupee(monthTotalAmount)}</span> 
                            <span className="mx-2 text-border">|</span> 
                            Total : <span className="text-primary">{formatIndianNumber(monthTotalQty)} Lt.</span>
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-10">
                        <DataTable data={dynamicTableData1 || tableData1} />
                        <DataTable data={dynamicTableData2 || tableData2} isRightTable={true} />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default MilkDashboard;
