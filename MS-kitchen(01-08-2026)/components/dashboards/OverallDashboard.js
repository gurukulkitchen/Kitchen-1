"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChevronDown, ChevronRight, FileText, Calendar, Loader2, Download, Check } from 'lucide-react';
import MonthYearPicker from '../MonthYearPicker';
import { useTheme } from 'next-themes';
import { formatIndianNumber } from '@/lib/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';

// Helper to get chart options based on theme
const getCommonChartOptions = (isDark) => ({
    credits: { enabled: false },
    title: { text: undefined },
    legend: { enabled: false },
    tooltip: {
        backgroundColor: isDark ? '#171717' : '#FFFFFF',
        borderColor: isDark ? '#262626' : '#E6E6E6',
        borderRadius: 8,
        shadow: true,
        style: { color: isDark ? '#f5f5f4' : '#333333', fontSize: '11px', fontFamily: 'Montserrat, sans-serif' },
        formatter: function () {
            const y = typeof this.y === 'number' ? this.y : 0;
            return `<b>${this.x}</b><br/>${this.series.name}: <b>₹ ${formatIndianNumber(Math.round(y))}</b>`;
        },
        useHTML: true,
    },
    xAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        gridLineWidth: 1, // Vertical Separator Lines
        gridLineColor: isDark ? '#262626' : '#F0F0F0',
        labels: {
            style: { color: isDark ? '#a3a3a3' : '#999999', fontSize: '10px', fontWeight: '600' }
        },
        crosshair: {
            width: 1,
            color: isDark ? '#262626' : '#F0F0F0',
            dashStyle: 'Dash'
        }
    },
    yAxis: {
        title: { text: undefined },
        gridLineColor: isDark ? '#262626' : '#F0F0F0',
        labels: {
            enabled: false // Labels are enabled/disabled per chart
        }
    },
});

const OverallDashboard = ({
    companyId = '',
    periodA: propPeriodA,
    setPeriodA: propSetPeriodA,
    periodB: propPeriodB,
    setPeriodB: propSetPeriodB
}) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const commonChartOptions = useMemo(() => getCommonChartOptions(isDark), [isDark]);

    const [dataA, setDataA] = useState(null);
    const [dataB, setDataB] = useState(null);
    const [selectedSubTabs, setSelectedSubTabs] = useState(['TOTAL EEP.']);
    const [isSubTabDropdownOpen, setIsSubTabDropdownOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    const [internalPeriodA, setInternalPeriodA] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [internalPeriodB, setInternalPeriodB] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear() - 1
    });

    const periodA = propPeriodA || internalPeriodA;
    const setPeriodA = propSetPeriodA || setInternalPeriodA;
    const periodB = propPeriodB || internalPeriodB;
    const setPeriodB = propSetPeriodB || setInternalPeriodB;

    const TAB_COLORS = {
        'TOTAL EEP.': '#fb923c',
        'OUT': '#38bdf8',
        'IN & OUT': '#4ade80',
        'BALANCE': '#818cf8',
        'VEG.': '#fbbf24',
        'MILK & CHHASH': '#f472b6',
        'OTHER': '#a78bfa',
        'HR': '#2dd4bf'
    };

    const handleDownloadPDF = async () => {
        if (!dataA) return;
        setExporting(true);
        try {
            const doc = new jsPDF();
            await addStandardHeader(doc, "Overall Dashboard Summary");

            // Section 1: Financial Overview
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Financial Overview", 14, 30);

            const financialHeaders = ["Metric", "Amount"];
            const financialRows = [
                ["Total Expenditure", formatIndianNumber(dataA?.cards?.totalExpense || 0)],
                ["Veg & Fruit Expense", formatIndianNumber(dataA?.cards?.vegExpense || 0)],
                ["Dairy Expense", formatIndianNumber(dataA?.cards?.dairyExpense || 0)],
                ["HR Expense", formatIndianNumber(dataA?.cards?.hrExpense || 0)]
            ];

            autoTable(doc, {
                startY: 35,
                head: [financialHeaders],
                body: financialRows,
                theme: 'striped',
                headStyles: { fillColor: [239, 120, 52] }
            });

            // Section 2: Staff Overview
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Staff Overview", 14, doc.lastAutoTable.finalY + 15);

            const staffHeaders = ["Category", "Value"];
            const staffRows = [
                ["Active Staff", dataA?.staffSummary?.activeStaff || 0],
                ["Total Staff", dataA?.staffSummary?.totalStaff || 0],
                ["Advance Due", formatIndianNumber(dataA?.staffSummary?.totalAdvanceDue || 0)],
                ["Monthly Salary", formatIndianNumber(dataA?.staffSummary?.monthlySalary || 0)]
            ];

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [staffHeaders],
                body: staffRows,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });

            // Section 3: Donation Summary
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Donation Summary", 14, doc.lastAutoTable.finalY + 15);

            const donationHeaders = ["Metric", "Amount"];
            const donationRows = [
                ["Total Donations", formatIndianNumber(dataA?.donationSummary?.total || 0)],
                ["Monthly Donations", formatIndianNumber(dataA?.donationSummary?.monthly || 0)]
            ];

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [donationHeaders],
                body: donationRows,
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94] }
            });

            doc.save(`Overall_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (e) {
            console.error("PDF Export Error:", e);
        } finally {
            setExporting(false);
        }
    };

    const months = useMemo(() => {
        const abbrs = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const shortYear = String(periodA.year).slice(-2);
        return abbrs.map(m => `${m}-${shortYear}`);
    }, [periodA.year]);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async (period, setter) => {
            try {
                let url = `/api/dashboard/overall?month=${period.month}&year=${period.year}`;
                if (companyId) url += `&companyId=${encodeURIComponent(companyId)}`;
                const res = await fetch(url);
                const json = await res.json();
                if (!cancelled && res.ok) setter(json);
            } catch (e) {
                console.error('Failed to load dashboard data:', e);
            }
        };

        fetchData(periodA, setDataA);
        fetchData(periodB, setDataB);

        return () => { cancelled = true; };
    }, [companyId, periodA, periodB]);

    const cardData = [
        { title: 'Total Exp.', value: '₹ 2,01,12,356', color: 'bg-[#333333]', textColor: 'text-white' },
        { title: 'Vegetable & Fruit Exp.', value: '₹ 2,01,12,356', color: 'bg-[#EF7834]', textColor: 'text-white', hasArrow: true },
        { title: 'Milk & Buttermilk Exp.', value: '₹ 2,01,12,356', color: 'bg-[#8B6B58]', textColor: 'text-white', hasArrow: true },
        { title: 'HR Exp.', value: '₹ 2,01,12,356', color: 'bg-[#5D5381]', textColor: 'text-white', hasArrow: true },
    ];

    const studentCountData = useMemo(() => {
        const counts = [640, null, null, null, null, 645, 641, 640, 640, 640, 640, 640];
        return months.map((m, i) => ({ month: m, count: counts[i] }));
    }, [months]);

    const formatRupee = (value) => `₹ ${formatIndianNumber(value || 0)}`;

    const chartSeries = useMemo(() => {
        if (!dataA) return [];
        const series = [];

        selectedSubTabs.forEach(tab => {
            const tabInfoA = dataA?.tabData?.[tab] || {};
            const amountsA = tabInfoA.monthlyAmounts || dataA?.chart?.monthlyAmounts || [];
            series.push({
                name: `${tab} (${periodA.year})`,
                data: amountsA,
                color: TAB_COLORS[tab] || '#fb923c',
                marker: { symbol: 'circle' }
            });

            if (periodA.year !== periodB.year || periodA.month !== periodB.month) {
                const tabInfoB = dataB?.tabData?.[tab] || {};
                const amountsB = tabInfoB.monthlyAmounts || dataB?.chart?.monthlyAmounts || [];
                series.push({
                    name: `${tab} (${periodB.year})`,
                    data: amountsB,
                    color: TAB_COLORS[tab] || '#fb923c',
                    dashStyle: 'Dash',
                    opacity: 0.6,
                    marker: { symbol: 'diamond' }
                });
            }
        });

        return series;
    }, [dataA, dataB, selectedSubTabs, TAB_COLORS, periodA, periodB]);

    const activeMonthlyCounts = useMemo(() => {
        const firstTab = selectedSubTabs[0];
        const tabData = dataA?.tabData?.[firstTab] || {};
        if (tabData?.monthlyCounts?.length) return tabData.monthlyCounts;
        return dataA?.chart?.monthlyCounts || [];
    }, [dataA, selectedSubTabs]);

    const dynamicCardData = useMemo(() => {
        if (!dataA?.cards) return cardData;
        return [
            { ...cardData[0], value: formatRupee(dataA.cards.totalExpense) },
            { ...cardData[1], value: formatRupee(dataA.cards.vegExpense) },
            { ...cardData[2], value: formatRupee(dataA.cards.dairyExpense) },
            { ...cardData[3], value: formatRupee(dataA.cards.hrExpense) },
        ];
    }, [dataA]);

    const dynamicStudentCountData = useMemo(() => {
        if (!dataA?.chart?.months?.length) return studentCountData;
        const monthsLabels = dataA.chart.months;
        return monthsLabels.map((m, idx) => ({ month: m, count: activeMonthlyCounts[idx] || '' }));
    }, [dataA, activeMonthlyCounts]);

    const subTabs = ['TOTAL EEP.', 'OUT', 'IN & OUT', 'BALANCE', 'VEG.', 'MILK & CHHASH', 'OTHER', 'HR'];

    const totalEepAmount = useMemo(() => {
        if (dataA?.tabData?.['TOTAL EEP.']?.totalAmount !== undefined) return dataA.tabData['TOTAL EEP.'].totalAmount;
        if (dataA?.cards?.totalExpense !== undefined) return dataA.cards.totalExpense;
        return 0;
    }, [dataA]);

    const barChartOptions = useMemo(() => ({
        ...commonChartOptions,
        chart: { type: 'column', height: 250, backgroundColor: 'transparent', spacingTop: 35 },
        legend: {
            enabled: selectedSubTabs.length > 1,
            itemStyle: { color: isDark ? '#a3a3a3' : '#666666', fontSize: '10px', fontWeight: '700' }
        },
        xAxis: {
            ...commonChartOptions.xAxis,
            categories: dynamicStudentCountData.map(d => d.month),
            gridLineWidth: 0,
        },
        yAxis: {
            ...commonChartOptions.yAxis,
            labels: {
                enabled: true,
                style: { color: isDark ? '#a3a3a3' : '#999999', fontSize: '10px', fontWeight: '600' },
                formatter: function () {
                    return `₹ ${formatIndianNumber(Math.round(this.value))}`;
                }
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                pointWidth: selectedSubTabs.length > 2 ? undefined : 16,
                borderRadius: 2,
                borderWidth: 0,
                colorByPoint: selectedSubTabs.length === 1,
                colors: selectedSubTabs.length === 1
                    ? [TAB_COLORS[selectedSubTabs[0]] || '#fb923c']
                    : (isDark ?
                        ['#fb923c', '#38bdf8', '#4ade80', '#262626', '#262626', '#fb923c', '#38bdf8', '#4ade80', '#fb923c', '#38bdf8', '#4ade80', '#525252'] :
                        ['#5B9BD5', '#4AACC5', '#9BBB59', '#F1F1F1', '#F1F1F1', '#5B9BD5', '#4AACC5', '#9BBB59', '#5B9BD5', '#4AACC5', '#9BBB59', '#1A1A1A']),
                dataLabels: {
                    enabled: selectedSubTabs.length === 1,
                    crop: false,
                    overflow: 'none',
                    formatter: function () {
                        return `₹ ${formatIndianNumber(Math.round(this.y || 0))}`;
                    },
                    useHTML: true,
                    allowOverlap: true,
                    style: { fontSize: '10px', fontWeight: '700', color: isDark ? '#f5f5f4' : '#333333', textOutline: 'none' },
                    y: -14
                }
            }
        },
        series: chartSeries
    }), [commonChartOptions, isDark, dynamicStudentCountData, selectedSubTabs, chartSeries]);

    const lineChartOptions = useMemo(() => ({
        ...commonChartOptions,
        chart: { type: 'line', height: 180, backgroundColor: 'transparent', spacingTop: 25 },
        legend: {
            enabled: selectedSubTabs.length > 1,
            itemStyle: { color: isDark ? '#a3a3a3' : '#666666', fontSize: '10px', fontWeight: '700' }
        },
        xAxis: {
            ...commonChartOptions.xAxis,
            categories: dynamicStudentCountData.map(d => d.month),
            gridLineWidth: 1,
        },
        yAxis: {
            ...commonChartOptions.yAxis,
            labels: { enabled: false }
        },
        plotOptions: {
            line: {
                lineWidth: 3,
                marker: {
                    enabled: true,
                    radius: 4,
                    lineWidth: 2,
                    lineColor: isDark ? '#171717' : '#FFFFFF',
                    fillColor: '#EF7834'
                },
                dataLabels: {
                    enabled: selectedSubTabs.length === 1,
                    formatter: function () {
                        return `₹ ${formatIndianNumber(Math.round(this.y || 0))}`;
                    },
                    useHTML: true,
                    allowOverlap: true,
                    style: { fontSize: '10px', fontWeight: '700', color: isDark ? '#f5f5f4' : '#333333', textOutline: 'none' },
                    y: -15
                }
            }
        },
        series: chartSeries
    }), [commonChartOptions, isDark, dynamicStudentCountData, selectedSubTabs, chartSeries]);

    return (
        <main className="max-w-[1700px] mx-auto space-y-6 md:space-y-8 pb-16">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {/* Card 1: Total Exp. (Red/Orange Rust Gradient) */}
                <div className="bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] text-white rounded-[22px] p-3 md:p-4 shadow-md flex flex-col justify-between h-38 transition-transform hover:scale-[1.01]">
                    <div>
                        <h4 className="text-sm font-bold !text-white tracking-wide">Total Exp.</h4>
                        <div className="text-xl md:text-2xl font-extrabold !text-white my-1.5">
                            {formatRupee(dataA?.cards?.totalExpense || totalEepAmount)}
                        </div>
                    </div>
                    <p className="text-xs italic !text-white/90 font-serif">All In + Other + HR</p>
                </div>

                {/* Card 2: Milk & Buttermilk Exp. (Solid Dark Charcoal #454545) */}
                <div className="bg-[#454545] dark:bg-[#383838] text-white rounded-[22px] p-3 md:p-4 shadow-md flex flex-col justify-between h-38 transition-transform hover:scale-[1.01]">
                    <div>
                        <h4 className="text-sm font-bold !text-white tracking-wide">Milk & Buttermilk Exp.</h4>
                        <div className="text-xl md:text-2xl font-extrabold !text-white my-1.5">
                            {formatRupee(dataA?.cards?.dairyExpense)}
                        </div>
                    </div>
                    <p className="text-xs italic !text-white/80 font-serif">Milk & Buttermilk In Exp.</p>
                </div>

                {/* Card 3: Veg. & Fruit (Solid Dark Charcoal #454545) */}
                <div className="bg-[#454545] dark:bg-[#383838] text-white rounded-[22px] p-3 md:p-4 shadow-md flex flex-col justify-between h-38 transition-transform hover:scale-[1.01]">
                    <div>
                        <h4 className="text-sm font-bold !text-white tracking-wide">Veg. & Fruit</h4>
                        <div className="text-xl md:text-2xl font-extrabold !text-white my-1.5">
                            {formatRupee(dataA?.cards?.vegExpense)}
                        </div>
                    </div>
                </div>

                {/* Card 4: HR Exp. (Solid Dark Charcoal #454545) */}
                <div className="bg-[#454545] dark:bg-[#383838] text-white rounded-[22px] p-3 md:p-4 shadow-md flex flex-col justify-between h-38 transition-transform hover:scale-[1.01]">
                    <div>
                        <h4 className="text-sm md:text-base font-bold !text-white tracking-wide">HR Exp.</h4>
                        <div className="text-xl md:text-2xl font-extrabold !text-white my-1.5">
                            {formatRupee(dataA?.cards?.hrExpense)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Filter Categories</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsSubTabDropdownOpen(!isSubTabDropdownOpen)}
                                className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-xl hover:border-primary/50 transition-all text-sm font-bold min-w-[240px] justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{ backgroundColor: selectedSubTabs.length === 1 ? TAB_COLORS[selectedSubTabs[0]] : '#fb923c' }}
                                    />
                                    <span>
                                        {selectedSubTabs.length === 1
                                            ? selectedSubTabs[0]
                                            : selectedSubTabs.length > 1
                                                ? `${selectedSubTabs[0]} + ${selectedSubTabs.length - 1} more`
                                                : "Select Categories"}
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isSubTabDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSubTabDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsSubTabDropdownOpen(false)}
                                    />
                                    <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-card border border-border rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                                        <div className="px-3 py-2 border-b border-border mb-1 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Charts</span>
                                            <button
                                                onClick={() => setSelectedSubTabs(['TOTAL EEP.'])}
                                                className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto px-2 py-1 space-y-0.5 no-scrollbar">
                                            {subTabs.map((tab) => {
                                                const isActive = selectedSubTabs.includes(tab);
                                                return (
                                                    <div
                                                        key={tab}
                                                        onClick={() => {
                                                            if (isActive) {
                                                                if (selectedSubTabs.length > 1) setSelectedSubTabs(selectedSubTabs.filter(t => t !== tab));
                                                            } else {
                                                                setSelectedSubTabs([...selectedSubTabs, tab]);
                                                            }
                                                        }}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isActive ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-border'}`}>
                                                            {isActive && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-tight">{tab}</span>
                                                        <div className="flex-1" />
                                                        {isActive && (
                                                            <div
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: TAB_COLORS[tab] }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 px-6 py-3 bg-card border border-border rounded-2xl shadow-sm ml-auto">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Expenditure</span>
                            <span className="text-lg font-black text-primary leading-none">{formatRupee(totalEepAmount)}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-border" />
                        <button
                            onClick={handleDownloadPDF}
                            disabled={exporting || !dataA}
                            className="p-2 hover:bg-muted rounded-xl transition-colors group"
                            title="Export PDF"
                        >
                            <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <HighchartsReact key={`bar-${selectedSubTabs.join('-')}-${isDark}`} highcharts={Highcharts} options={barChartOptions} />
                </div>
                <div className="p-6 md:p-8 pt-0">
                    <HighchartsReact key={`line-${selectedSubTabs.join('-')}-${isDark}`} highcharts={Highcharts} options={lineChartOptions} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Staff Overview Card */}
                <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-lg border border-border flex flex-col justify-between group cursor-pointer relative overflow-hidden h-64 sm:h-72 transition-all hover:border-primary/30">
                    <div className="flex justify-between items-start">
                        <h3 className="text-primary text-[16px] sm:text-[20px] font-black tracking-tight uppercase">Staff Overview</h3>
                        <ChevronRight className="text-primary w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-baseline justify-between gap-4">
                            <p className="text-[14px] sm:text-[18px] font-bold text-muted-foreground leading-tight">Total Staff (Active / All)</p>
                            <p className="text-[18px] sm:text-[24px] font-black text-foreground">{dataA?.staffSummary?.activeStaff || 0} / {dataA?.staffSummary?.totalStaff || 0}</p>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                            <p className="text-[14px] sm:text-[18px] font-bold text-muted-foreground leading-tight">Advance Due</p>
                            <p className="text-[18px] sm:text-[24px] font-black text-primary">{formatRupee(dataA?.staffSummary?.totalAdvanceDue)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-4">
                        <MonthYearPicker
                            variant="badge"
                            value={`${periodA.year}-${String(periodA.month).padStart(2, '0')}`}
                            onChange={(val) => {
                                if (!val) return;
                                const [y, m] = val.split('-');
                                setPeriodA({ year: parseInt(y), month: parseInt(m) });
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="text-[14px] sm:text-[22px] font-bold text-foreground leading-none">{formatRupee(dataA?.staffSummary?.monthlySalary)}</span>
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black mt-1">Estim. Monthly Salary</span>
                        </div>
                    </div>
                </div>

                {/* Donation Overview Card */}
                <div className="bg-card rounded-3xl p-6 sm:p-10 shadow-lg border border-border flex flex-col justify-between group cursor-pointer relative overflow-hidden h-64 sm:h-72 transition-all hover:border-primary/30">
                    <div className="flex justify-between items-start">
                        <h1 className="text-primary text-[16px] sm:text-[20px] font-black tracking-tight uppercase  flex flex-col leading-tight">
                            TOTAL DONATIONS
                            <span className="text-[20px] sm:text-[28px] text-foreground not-italic mt-1">{formatRupee(dataA?.donationSummary?.total)}</span>
                        </h1>
                        <ChevronRight className="text-primary w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
                    </div>
                    <div className="mt-auto flex items-center gap-2 sm:gap-3">
                        <MonthYearPicker
                            variant="badge"
                            value={`${periodA.year}-${String(periodA.month).padStart(2, '0')}`}
                            onChange={(val) => {
                                if (!val) return;
                                const [y, m] = val.split('-');
                                setPeriodA({ year: parseInt(y), month: parseInt(m) });
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="text-[14px] sm:text-[22px] font-bold text-foreground leading-none">{formatRupee(dataA?.donationSummary?.monthly)}</span>
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black mt-1">Monthly Donations</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OverallDashboard;
