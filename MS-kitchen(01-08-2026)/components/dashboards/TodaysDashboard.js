import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addStandardHeader } from '@/lib/pdfGenerator';
import { useRouter, useSearchParams } from 'next/navigation';

const TodaysDashboard = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = searchParams.get('companyId');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = companyId ? `/api/dashboard?companyId=${companyId}` : '/api/dashboard';
                const res = await fetch(url);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [companyId]);

    const withCompany = (path) => {
        if (!companyId) return path;
        const join = path.includes('?') ? '&' : '?';
        return `${path}${join}companyId=${encodeURIComponent(companyId)}`;
    };

    const getSummary = (title) => {
        if (loading) return <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/50 italic"><Loader2 className="animate-spin" size={10} /> Syncing Data...</div>;
        if (!data) return 'Unavailable';

        const { inventoryStats, cleaningStats, todaysSummaries } = data;

        switch (title) {
            case 'Stock Alerts':
                return `${inventoryStats?.critical?.length || 0} Critical · ${inventoryStats?.low?.length || 0} Low`;
            case "Today's Cleaning":
                return `${cleaningStats?.percentage || 0}% Progress · ${cleaningStats?.completed || 0} - Areas`;
            case 'Last Stock In Entry':
                if (!todaysSummaries?.lastStockIn) return 'Pending Entry';
                const si = todaysSummaries.lastStockIn;
                return `${si.item?.name || 'Product'} · ${si.quantity}${si.item?.unit || ''} · ${new Date(si.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
            case 'Last Stock Out Entry':
                if (!todaysSummaries?.lastStockOut) return 'Pending Entry';
                const so = todaysSummaries.lastStockOut;
                return `${so.item?.name || 'Product'} · ${so.quantity}${so.item?.unit || ''} · ${new Date(so.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
            case 'Last Veg & Fruts Out Entry':
                if (!todaysSummaries?.lastVegFruitOut) return 'Pending Entry';
                const vo = todaysSummaries.lastVegFruitOut;
                return `${vo.item?.name || 'Product'} · ${vo.quantity}${vo.item?.unit || ''} · ${new Date(vo.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
            case 'Last Milk & butter M. Out Entry':
                if (!todaysSummaries?.lastMilkOut) return 'Pending Entry';
                const mo = todaysSummaries.lastMilkOut;
                return `${mo.item?.name || 'Product'} · ${mo.quantity}${mo.item?.unit || ''} · ${new Date(mo.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
            case "Today's Menu & Feedback":
                if (!todaysSummaries?.feedback || todaysSummaries.feedback.count === 0) return 'No records for today';
                const fb = todaysSummaries.feedback;
                return `${fb.averageRating}★ · ${fb.lastMenu.substring(0, 15)}${fb.lastMenu.length > 15 ? '..' : ''}`;
            default:
                return '';
        }
    };

    const handleDownloadPDF = async () => {
        if (!data) return;
        setExporting(true);
        try {
            const doc = new jsPDF();
            await addStandardHeader(doc, "Today's Status Report");

            // Section 1: Stock Alerts
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Stock Alerts", 14, 30);

            const alertHeaders = ["Item", "Status", "Qty"];
            const criticalAlerts = data.inventoryStats?.critical?.map(item => [item.name, "CRITICAL", `${item.stock} ${item.unit}`]) || [];
            const lowAlerts = data.inventoryStats?.low?.map(item => [item.name, "LOW", `${item.stock} ${item.unit}`]) || [];

            autoTable(doc, {
                startY: 35,
                head: [alertHeaders],
                body: [...criticalAlerts, ...lowAlerts],
                theme: 'grid',
                headStyles: { fillColor: [220, 38, 38] }
            });

            // Section 2: Daily Summaries
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Daily Summaries", 14, doc.lastAutoTable.finalY + 15);

            const summaryHeaders = ["Category", "Details"];
            const summaries = [
                ["Cleaning Progress", `${data.cleaningStats?.percentage || 0}% (${data.cleaningStats?.completed || 0} Areas)`],
                ["Last Stock In", getSummary('Last Stock In Entry')],
                ["Last Stock Out", getSummary('Last Stock Out Entry')],
                ["Veg/Fruit Out", getSummary('Last Veg & Fruts Out Entry')],
                ["Milk/Dairy Out", getSummary('Last Milk & butter M. Out Entry')],
                ["Menu & Feedback", getSummary("Today's Menu & Feedback")]
            ];

            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 20,
                head: [summaryHeaders],
                body: summaries,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] }
            });

            doc.save(`Todays_Status_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (e) {
            console.error("PDF Export Error:", e);
        } finally {
            setExporting(false);
        }
    };

    const alertCards = [
        { title: 'Stock Alerts', isDark: true, href: withCompany('/inventory'), colSpan: 'sm:col-span-2 lg:col-span-2' },
        { title: "Today's Cleaning", href: withCompany('/cleaning') },
        { title: 'Last Stock In Entry', href: withCompany('/inventory/in') },
        { title: 'Last Stock Out Entry', href: withCompany('/inventory/out') },
        { title: 'Last Veg & Fruts Out Entry', href: withCompany('/inventory/vegetable-fruit/out') },
        { title: 'Last Milk & butter M. Out Entry', href: withCompany('/inventory/milk/out') },
        { title: "Today's Menu & Feedback", href: withCompany('/daily-menu') },
    ];

    return (
        <main className="max-w-[1200px] mx-auto p-4 sm:p-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tight">Today's Status</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 italic">Real-time alerts and activity summary</p>
                </div>
                {/* <button
                    onClick={handleDownloadPDF}
                    disabled={exporting || loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-black text-xs uppercase italic tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export Status PDF
                </button> */}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {alertCards.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => card.href && router.push(card.href)}
                        className={`
                            relative h-[135px] sm:h-[165px] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between cursor-pointer group
                            transition-all hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.97] border border-border/50 shadow-xl
                            ${card.colSpan || ''}
                            ${card.isDark
                                ? 'bg-gradient-to-br from-primary to-orange-600 text-white border-primary/20 shadow-primary/30'
                                : 'bg-card text-foreground hover:border-primary/40 hover:shadow-primary/5'
                            }
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`text-[15px] sm:text-[17px] font-black tracking-tight leading-tight max-w-[85%] uppercase italic ${card.isDark ? 'text-white' : 'text-foreground group-hover:text-primary transition-colors'}`}>
                                {card.title}
                            </span>

                            <div className={`
                                p-1.5 rounded-full transition-all group-hover:translate-x-1
                                ${card.isDark ? 'bg-card/20 text-white' : 'bg-primary/10 text-primary'}
                            `}>
                                <ChevronRight size={18} strokeWidth={3} />
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className={`text-[11px] font-black uppercase tracking-[0.15em] mb-1  ${card.isDark ? 'text-white' : 'text-muted-foreground'}`}>
                                Daily Summary
                            </div>
                            <div className={`text-[13px] sm:text-[14px] font-bold tracking-tight ${card.isDark ? 'text-white/90' : 'text-foreground/80'}`}>
                                {getSummary(card.title)}
                            </div>
                        </div>

                        {/* Decorative glass effect for dark cards */}
                        {card.isDark && (
                            <>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-card/10 rounded-full blur-3xl group-hover:bg-card/20 transition-all" />
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-[24px]" />
                            </>
                        )}
                    </div>
                ))}
            </div>
        </main>
    );
};

export default TodaysDashboard;
