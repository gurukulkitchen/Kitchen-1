"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  Download,
  Loader2,
  Filter,
  FileText,
  ArrowDownToLine,
  Database,
} from "lucide-react";
import * as XLSX from 'xlsx';
import MonthYearPicker from "@/components/MonthYearPicker";
import { formatIndianNumber } from "@/lib/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { generateStockPDF } from "@/lib/pdfGenerator";
import FilterDropdown from "@/components/FilterDropdown";

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all 
      ${active
        ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
        : "text-muted-foreground hover:bg-orange-200 dark:hover:bg-white"
      }`}
  >
    {children}
  </button>
);

const ToggleSwitch = ({ leftLabel, rightLabel, value, onChange }) => (
  <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-inner">
    <button
      onClick={() => onChange(false)}
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${!value
        ? "bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-md"
        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
        }`}
    >
      {leftLabel}
    </button>
    <button
      onClick={() => onChange(true)}
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${value
        ? "bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-md"
        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
        }`}
    >
      {rightLabel}
    </button>
  </div>
);

const ProductDashboard = ({ companyId = "" }) => {
  const [view, setView] = useState("monthDetail");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [endMonth, setEndMonth] = useState(new Date());
  const [displayType, setDisplayType] = useState(false); // false: Amount, true: Qty
  const [transactionType, setTransactionType] = useState(false); // false: In, true: Out
  const [imageErrors, setImageErrors] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Theme Management
  const [theme, setTheme] = useState("light");

  // Apply theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Listen for theme changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        const newTheme = e.newValue || "light";
        setTheme(newTheme);
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const visibleCols = useMemo(() => {
    const cols = [];
    if (view === "monthDetail") return cols;

    let d = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const end = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1);
    const effectiveEnd = d > end ? d : end;
    let count = 0;

    while (d <= effectiveEnd && count < 36) {
      cols.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('en-US', { month: 'short' }) +
          (selectedMonth.getFullYear() !== endMonth.getFullYear() ? ` '${String(d.getFullYear()).slice(-2)}` : '')
      });
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      count++;
    }
    return cols;
  }, [selectedMonth, endMonth, view]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const categoryParam = Array.isArray(categoryFilter) && categoryFilter.length > 0
        ? encodeURIComponent(categoryFilter.join(','))
        : "all";

      const baseUrl = `/api/dashboard/products?companyId=${encodeURIComponent(companyId)}`;

      if (view === "yearSummary") {
        const startY = selectedMonth.getFullYear();
        const endY = endMonth.getFullYear();
        const years = Array.from({ length: endY - startY + 1 }, (_, i) => startY + i);

        const results = await Promise.all(
          years.map(y =>
            fetch(`${baseUrl}&mode=monthly&year=${y}&month=1&category=${categoryParam}&search=${encodeURIComponent(debouncedSearch)}&limit=50`)
              .then(r => r.ok ? r.json() : null)
          )
        );

        const itemsMap = new Map();
        results.forEach((res, i) => {
          if (!res?.items) return;
          const y = years[i];
          res.items.forEach(item => {
            if (!itemsMap.has(item.id)) {
              itemsMap.set(item.id, { ...item, yearlyData: {} });
            }
            itemsMap.get(item.id).yearlyData[y] = item.months;
          });
        });

        setData({ items: Array.from(itemsMap.values()), mode: "monthly" });
      } else {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth() + 1;
        const url = `${baseUrl}&mode=daily&year=${year}&month=${month}&category=${categoryParam}&search=${encodeURIComponent(debouncedSearch)}&limit=all`;
        const res = await fetch(url);
        const json = await res.json();
        if (res.ok) setData(json);
      }
    } catch (e) {
      console.error("Failed to load product dashboard:", e);
    } finally {
      setLoading(false);
    }
  }, [companyId, view, selectedMonth, endMonth, categoryFilter, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const formatValue = (val, unit) => {
    if (displayType) return `${formatIndianNumber(val)} ${unit?.name || unit || ""}`;
    return `₹ ${formatIndianNumber(Math.round(val))}`;
  };

  const getDayValue = (item, day) => {
    const dayData = item.days?.[day];
    if (!dayData) return "-";
    return transactionType
      ? (displayType ? dayData.outQty : dayData.outAmount)
      : (displayType ? dayData.inQty : dayData.inAmount);
  };

  const getTotalValue = (item) => {
    const totalData = item.total;
    if (!totalData) return 0;
    return transactionType
      ? (displayType ? totalData.outQty : totalData.outAmount)
      : (displayType ? totalData.inQty : totalData.inAmount);
  };

  return (
    <main className="max-w-[1700px] mx-auto p-4 sm:p-6 md:p-8 space-y-6 bg-background text-foreground">
      {/* Header Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-orange-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Quick Search..."
              className="pl-12 pr-6 py-3 bg-muted border border-border rounded-2xl w-64 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative z-40">
            <FilterDropdown
              options={categories.map(c => ({ value: c._id, label: c.name }))}
              value={categoryFilter}
              onChange={setCategoryFilter}
              title="Category"
              isMulti={true}
            />
          </div>

          <MonthYearPicker label="From" value={{ month: selectedMonth.getMonth() + 1, year: selectedMonth.getFullYear() }} onChange={({ month, year }) => setSelectedMonth(new Date(year, month - 1, 1))} />
          <span className="text-muted-foreground font-black text-xs uppercase tracking-widest hidden sm:block">→</span>
          <MonthYearPicker label="To" value={{ month: endMonth.getMonth() + 1, year: endMonth.getFullYear() }} onChange={({ month, year }) => setEndMonth(new Date(year, month - 1, 1))} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ToggleSwitch leftLabel="Exp." rightLabel="Qty" value={displayType} onChange={setDisplayType} />
          <ToggleSwitch leftLabel="In" rightLabel="Out" value={transactionType} onChange={setTransactionType} />

          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={downloading}
              className="p-3 bg-card border border-border rounded-2xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
            >
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 top-full z-[100] mt-2 w-48 rounded-2xl border border-border bg-card shadow-2xl">
                <button onClick={() => { /* handleDownloadExcel */ setShowDownloadMenu(false); }} className="flex w-full items-center gap-3 px-5 py-4 hover:bg-muted text-sm font-bold">
                  <ArrowDownToLine size={18} className="text-emerald-600" />
                  Export as Excel
                </button>
                <button onClick={() => { /* handleDownloadPDF */ setShowDownloadMenu(false); }} className="flex w-full items-center gap-3 px-5 py-4 hover:bg-muted text-sm font-bold border-t border-border">
                  <FileText size={18} className="text-blue-600" />
                  Export as PDF
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center bg-muted/30 p-1 rounded-full border border-border">
            <TabButton active={view === "monthDetail"} onClick={() => setView("monthDetail")}>Monthly</TabButton>
            <TabButton active={view === "yearSummary"} onClick={() => setView("yearSummary")}>Yearly</TabButton>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-orange-600" size={40} />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Syncing Product Data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {view === "monthDetail" ? (
            <motion.div
              key="monthly-table"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="overflow-hidden bg-card border border-border rounded-[1.5rem] shadow-xl"
            >
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                <table className="w-full border-collapse border-spacing-0">
                  <thead>
                    <tr className="sticky top-0 z-[50] bg-background/80 backdrop-blur-md">
                      <th className="sticky left-0 z-[60] bg-card border-b border-r border-border p-5 text-left min-w-[300px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Product Name</span>
                          <Filter className="w-3 h-3 text-orange-600 ml-1" />
                        </div>
                      </th>
                      {Array.from({ length: data?.daysInMonth || 31 }).map((_, i) => (
                        <th key={i} className="border-b border-r border-border p-4 min-w-[100px] bg-muted/40 group cursor-default">
                          <div className="relative inline-block">
                            <span className="text-md font-black text-muted-foreground group-hover:text-orange-600 transition-colors">{i + 1}</span>
                          </div>
                        </th>
                      ))}
                      <th className="sticky right-0 z-[60] bg-card border-b border-l border-border p-6 min-w-[150px] text-right">
                        <div className="flex items-center justify-end gap-2 text-orange-600">
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Total</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items?.map((item) => (
                      <tr key={item.id} className="group hover:bg-muted/20 transition-all duration-200">
                        <td className="sticky left-0 z-20 bg-card border-b border-r border-border p-4 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-card rounded-2xl overflow-hidden border border-border flex items-center justify-center shrink-0 shadow-sm relative group-hover:border-orange-200 transition-all">
                              {item.image && !imageErrors[item.id] ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={() => handleImageError(item.id)}
                                />
                              ) : (
                                <img
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.name}&backgroundColor=fff&textColor=e86924&fontWeight=800`}
                                  alt={item.name}
                                  className="w-10 h-10 object-contain"
                                />
                              )}
                              <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-[11px] font-black text-foreground group-hover:text-orange-600 transition-colors uppercase tracking-tighter truncate leading-tight">{item.name}</h4>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-90">Category: {item.category?.name || item.category || '-'}</p>
                            </div>
                          </div>
                        </td>
                        {Array.from({ length: data?.daysInMonth || 31 }).map((_, i) => {
                          const rawValue = getDayValue(item, i + 1);
                          const val = Math.round(Number(rawValue));
                          return (
                            <td key={i} className="border-b border-r border-border p-4 text-center">
                              {rawValue === "-" || rawValue === 0 ? (
                                <span className="text-zinc-400 dark:text-zinc-600 font-bold">--</span>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-[11px] font-black text-foreground">
                                    {displayType ? formatIndianNumber(rawValue) : `₹ ${formatIndianNumber(val)}`}
                                  </span>
                                  {displayType && <span className="text-[7px] font-black text-muted-foreground uppercase opacity-80">{item.unit?.name || item.unit}</span>}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="sticky right-0 z-20 bg-card border-b border-l border-border p-6 text-right transition-colors">
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-black text-orange-600 italic tracking-tighter">
                              {formatValue(getTotalValue(item), item.unit)}
                            </div>
                            <span className="text-[8px] font-black text-orange-600/40 uppercase tracking-widest italic">{transactionType ? 'OUTFLOW' : 'INFLOW'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!data?.items || data.items.length === 0) && (
                <div className="py-32 text-center space-y-6">
                  <div className="w-20 h-20 bg-muted/30 dark:bg-zinc-800/30 rounded-full flex items-center justify-center mx-auto border border-border">
                    <Database className="text-muted-foreground/30 dark:text-zinc-700" size={32} />
                  </div>
                  <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] italic">No activity recorded for this period</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="yearly-cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 gap-8">
                {data?.items?.map((product) => (
                  <CardView
                    key={product.id}
                    product={product}
                    visibleCols={visibleCols}
                    isImgError={imageErrors[product.id]}
                    onImgError={() => handleImageError(product.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
  );
};

// ==================== UPDATED CARD VIEW ====================

const CardView = ({ product, visibleCols, isImgError, onImgError }) => {
  const formatQty = (qty, unit) => `${formatIndianNumber(qty || 0)} ${unit?.name || unit || ''}`.trim();
  const formatRupee = (value) => `₹ ${formatIndianNumber(Math.round(value || 0))}`;

  return (
    <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-muted rounded-[1.5rem] flex items-center justify-center border border-border overflow-hidden shrink-0">
            {product.image && !isImgError ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={onImgError}
              />
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${product.name}&backgroundColor=fff&textColor=e86924&fontWeight=800`}
                alt={product.name}
                className="w-12 h-12 object-contain"
              />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground italic tracking-tighter uppercase">{product.name}</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category: {product.category?.name || product.category || '-'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 bg-white dark:bg-zinc-900/50 p-5 rounded-[1.5rem] border border-border w-full lg:w-auto">
          <MiniStat label="IN" qty={formatQty(product.summary?.inQty, product.unit)} price={formatRupee(product.summary?.inAmount)} color="text-emerald-500" />
          <MiniStat label="OUT" qty={formatQty(product.summary?.outQty, product.unit)} price={formatRupee(product.summary?.outAmount)} color="text-rose-500" />
          <MiniStat label="BALANCE" qty={formatQty(product.summary?.balanceQty, product.unit)} price={formatRupee(product.summary?.balanceAmount)} color="text-amber-500" />
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-[1.5rem] bg-muted/30 dark:bg-zinc-900/30">
        <div className="grid min-w-[800px]" style={{ gridTemplateColumns: `repeat(${Math.min(visibleCols.length || 1, 12)}, minmax(0, 1fr))` }}>
          {visibleCols.map((col, idx) => {
            const yData = product.yearlyData?.[col.year] || [];
            const mData = yData.find(mon => mon.month === col.month) || { inQty: 0, outQty: 0, balanceQty: 0 };

            return (
              <div key={idx} className="border-r border-border last:border-r-0 p-5 flex flex-col items-center group bg-card transition-all">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                  {col.label}
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex justify-between border-b border-border pb-1">
                    <span className="text-[9px] font-black text-emerald-500">IN</span>
                    <span className="text-[10px] font-black text-foreground">{formatQty(mData.inQty)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-1">
                    <span className="text-[9px] font-black text-rose-500">OUT</span>
                    <span className="text-[10px] font-black text-foreground">{formatQty(mData.outQty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] font-black text-amber-500">BAL</span>
                    <span className="text-[10px] font-black text-orange-600">{formatQty(mData.balanceQty)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, qty, price, color }) => (
  <div className="flex items-center gap-4 min-w-[120px]">
    <div className={`text-[11px] font-black italic uppercase tracking-wider w-16 shrink-0 ${color}`}>
      {label}
    </div>
    <div className="flex flex-col">
      <div className="text-[13px] font-black text-foreground tracking-tight leading-none mb-1">
        {qty}
      </div>
      <div className="text-[10px] text-muted-foreground font-bold italic leading-none">
        {price}
      </div>
    </div>
  </div>
);

export default ProductDashboard;


// "use client";

// import React, { useEffect, useMemo, useState, useCallback } from "react";
// import {
//   Search,
//   ChevronDown,
//   Calendar as CalendarIcon,
//   Download,
//   Plus,
//   Database,
//   Loader2,
//   Filter,
//   FileText,
//   ArrowDownToLine
// } from "lucide-react";
// import * as XLSX from 'xlsx';
// import MonthYearPicker from "@/components/MonthYearPicker";
// import { formatIndianNumber } from "@/lib/formatters";
// import { motion, AnimatePresence } from "framer-motion";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { generateStockPDF } from "@/lib/pdfGenerator";
// import FilterDropdown from "@/components/FilterDropdown";

// const TabButton = ({ active, children, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${active ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "text-muted-foreground hover:bg-muted"
//       }`}
//   >
//     {children}
//   </button>
// );

// const ToggleSwitch = ({ leftLabel, rightLabel, value, onChange }) => (
//   <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-inner">
//     <button
//       onClick={() => onChange(false)}
//       className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${!value
//         ? "bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-md"
//         : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
//         }`}
//     >
//       {leftLabel}
//     </button>
//     <button
//       onClick={() => onChange(true)}
//       className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${value
//         ? "bg-white dark:bg-orange-600 text-orange-600 dark:text-white shadow-md"
//         : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
//         }`}
//     >
//       {rightLabel}
//     </button>
//   </div>
// );

// const ProductDashboard = ({ companyId = "" }) => {
//   const [view, setView] = useState("monthDetail"); // 'monthDetail' (31-day table) vs 'yearSummary' (12-month cards)
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [categories, setCategories] = useState([]);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState([]);
//   const [selectedMonth, setSelectedMonth] = useState(new Date());
//   const [endMonth, setEndMonth] = useState(new Date());
//   const [displayType, setDisplayType] = useState(false); // false: Exp (Amount), true: Qty
//   const [transactionType, setTransactionType] = useState(false); // false: In, true: Out
//   const [imageErrors, setImageErrors] = useState({});
//   const [downloading, setDownloading] = useState(false);
//   const [showDownloadMenu, setShowDownloadMenu] = useState(false);

//   const handleImageError = (id) => {
//     setImageErrors(prev => ({ ...prev, [id]: true }));
//   };

//   const visibleCols = useMemo(() => {
//     const cols = [];
//     if (view === "monthDetail") return cols;
//     let d = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
//     const end = new Date(endMonth.getFullYear(), endMonth.getMonth(), 1);
//     const effectiveEnd = d > end ? d : end;
//     let count = 0;
//     while (d <= effectiveEnd && count < 36) {
//       cols.push({
//         year: d.getFullYear(),
//         month: d.getMonth() + 1,
//         label: d.toLocaleString('en-US', { month: 'short' }) + (selectedMonth.getFullYear() !== endMonth.getFullYear() ? ` '${String(d.getFullYear()).slice(-2)}` : '')
//       });
//       d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
//       count++;
//     }
//     return cols;
//   }, [selectedMonth, endMonth, view]);

//   // Debounce search term
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(searchTerm);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   const handleDownloadPDF = async () => {
//     try {
//       setDownloading(true);

//       let headers, tableData;

//       if (view === "yearSummary") {
//         headers = ["Product Name", "Category", "Item Unit", ...visibleCols.map(c => c.label), "Total Value"];
//         tableData = data?.items?.map(item => {
//           const row = [item.name, item.category?.name || item.category || '-', item.unit?.name || item.unit || '-'];
//           visibleCols.forEach(col => {
//             const yData = item.yearlyData?.[col.year] || [];
//             const mData = yData.find(mon => mon.month === col.month);
//             if (!mData) { row.push("-"); return; }
//             const val = transactionType ? (displayType ? mData.outQty : mData.outAmount) : (displayType ? mData.inQty : mData.inAmount);
//             row.push(val === 0 ? "-" : (displayType ? formatIndianNumber(val) : `${formatIndianNumber(Math.round(val))}`));
//           });
//           row.push(formatValue(getTotalValue(item), item.unit));
//           return row;
//         }) || [];
//       } else {
//         headers = ["Product Name", "Cat", "Unit", ...Array.from({ length: (data?.daysInMonth || 31) }, (_, i) => (i + 1).toString()), "Total"];
//         tableData = data?.items?.map(item => {
//           const row = [item.name, (item.category?.name || item.category || '-').substring(0, 5), item.unit?.name || item.unit || '-'];
//           for (let i = 1; i <= (data?.daysInMonth || 31); i++) {
//             const val = getDayValue(item, i);
//             row.push(val === "-" || val === 0 ? "-" : Math.round(Number(val)));
//           }
//           row.push(getTotalValue(item));
//           return row;
//         }) || [];
//       }

//       const fileName = view === "yearSummary" ? `Annual_Report_${selectedMonth.getFullYear()}${selectedMonth.getFullYear() !== endMonth.getFullYear() ? `-${endMonth.getFullYear()}` : ''}.pdf` : `Monthly_Report_${selectedMonth.toLocaleString('default', { month: 'long' })}_${selectedMonth.getFullYear()}.pdf`;
//       const title = view === "yearSummary" ? "Annual Inventory Report" : "Monthly Inventory Data";

//       await generateStockPDF({
//         title,
//         headers,
//         data: tableData,
//         fileName
//       });

//       setDownloading(false);
//     } catch (err) {
//       console.error("PDF Generation Error:", err);
//       setDownloading(false);
//     }
//   };

//   const handleDownloadExcel = () => {
//     try {
//       let headers, tableData;
//       if (view === "yearSummary") {
//         headers = ["Product Name", "Category", "Item Unit", ...visibleCols.map(c => c.label), "Total Value"];
//         tableData = data?.items?.map(item => {
//           const row = [item.name, item.category?.name || item.category || '-', item.unit?.name || item.unit || '-'];
//           visibleCols.forEach(col => {
//             const yData = item.yearlyData?.[col.year] || [];
//             const mData = yData.find(mon => mon.month === col.month);
//             if (!mData) { row.push(0); return; }
//             const val = transactionType ? (displayType ? mData.outQty : mData.outAmount) : (displayType ? mData.inQty : mData.inAmount);
//             row.push(val || 0);
//           });
//           row.push(getTotalValue(item));
//           return row;
//         }) || [];
//       } else {
//         headers = ["Product Name", "Category", "Unit", ...Array.from({ length: (data?.daysInMonth || 31) }, (_, i) => (i + 1).toString()), "Total"];
//         tableData = data?.items?.map(item => {
//           const row = [item.name, item.category?.name || item.category || '-', item.unit?.name || item.unit || '-'];
//           for (let i = 1; i <= (data?.daysInMonth || 31); i++) {
//             const val = getDayValue(item, i);
//             row.push(val === "-" ? 0 : Number(val));
//           }
//           row.push(getTotalValue(item));
//           return row;
//         }) || [];
//       }

//       const ws = XLSX.utils.aoa_to_sheet([headers, ...tableData]);
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Inventory");
//       const fileName = view === "yearSummary" ? `Annual_Report_${selectedMonth.getFullYear()}${selectedMonth.getFullYear() !== endMonth.getFullYear() ? `-${endMonth.getFullYear()}` : ''}.xlsx` : `Monthly_Report_${selectedMonth.toLocaleString('default', { month: 'long' })}.xlsx`;
//       XLSX.writeFile(wb, fileName);
//     } catch (err) {
//       console.error("Excel Export Error:", err);
//     }
//   };

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const year = selectedMonth.getFullYear();
//       const month = selectedMonth.getMonth() + 1;
//       const mode = view === "monthDetail" ? "daily" : "monthly";

//       const categoryParam = Array.isArray(categoryFilter) && categoryFilter.length > 0
//         ? encodeURIComponent(categoryFilter.join(','))
//         : "all";

//       const baseUrl = `/api/dashboard/products?companyId=${encodeURIComponent(companyId)}`;

//       if (view === "yearSummary") {
//         const startY = selectedMonth.getFullYear();
//         const endY = endMonth.getFullYear();
//         const years = [];
//         for (let y = startY; y <= endY; y++) years.push(y);

//         const results = await Promise.all(
//           years.map(y => fetch(`${baseUrl}&mode=monthly&year=${y}&month=1&category=${categoryParam}&search=${encodeURIComponent(debouncedSearch)}&limit=50`).then(r => r.ok ? r.json() : null))
//         );

//         const itemsMap = new Map();
//         results.forEach((res, i) => {
//           if (!res || !res.items) return;
//           const y = years[i];
//           res.items.forEach(item => {
//             if (!itemsMap.has(item.id)) {
//               itemsMap.set(item.id, { ...item, yearlyData: {} });
//             }
//             itemsMap.get(item.id).yearlyData[y] = item.months;
//           });
//         });
//         setData({ items: Array.from(itemsMap.values()), mode: "monthly", year: startY });
//       } else {
//         const year = selectedMonth.getFullYear();
//         const month = selectedMonth.getMonth() + 1;
//         const url = `${baseUrl}&mode=daily&year=${year}&month=${month}&category=${categoryParam}&search=${encodeURIComponent(debouncedSearch)}&limit=all`;
//         const res = await fetch(url);
//         const json = await res.json();
//         if (res.ok) setData(json);
//       }
//     } catch (e) {
//       console.error("Failed to load product dashboard:", e);
//     } finally {
//       setLoading(false);
//     }
//   }, [companyId, view, selectedMonth, categoryFilter, debouncedSearch]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   useEffect(() => {
//     fetch("/api/categories")
//       .then(res => res.json())
//       .then(data => Array.isArray(data) && setCategories(data))
//       .catch(err => console.error("Error fetching categories:", err));
//   }, []);

//   const formatValue = (val, unit) => {
//     if (displayType) {
//       return `${formatIndianNumber(val)} ${unit?.name || unit || ""}`;
//     }
//     return `₹ ${formatIndianNumber(Math.round(val))}`;
//   };

//   const getDayValue = (item, day) => {
//     const dayData = item.days?.[day];
//     if (!dayData) return "-";

//     if (transactionType) { // OUT
//       return displayType ? dayData.outQty : dayData.outAmount;
//     } else { // IN
//       return displayType ? dayData.inQty : dayData.inAmount;
//     }
//   };

//   const getTotalValue = (item) => {
//     const totalData = item.total;
//     if (!totalData) return 0;

//     if (transactionType) { // OUT
//       return displayType ? totalData.outQty : totalData.outAmount;
//     } else { // IN
//       return displayType ? totalData.inQty : totalData.inAmount;
//     }
//   };

//   return (
//     <main className="max-w-[1700px] mx-auto p-4 sm:p-6 md:p-8 space-y-6">
//       {/* Header Filters */}
//       <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-border/50">
//         <div className="flex flex-wrap items-center gap-4">
//           <div className="relative group">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-orange-600 transition-colors" size={18} />
//             <input
//               type="text"
//               placeholder="Quick Search..."
//               className="pl-12 pr-6 py-3 bg-muted/40 border border-border rounded-2xl w-64 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all shadow-inner"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>

//           <div className="relative z-40">
//             <FilterDropdown
//               options={categories.map(c => ({ value: c._id, label: c.name }))}
//               value={categoryFilter}
//               onChange={setCategoryFilter}
//               title="Category"
//               isMulti={true}
//             />
//           </div>

//           <MonthYearPicker
//             label="From"
//             value={{ month: selectedMonth.getMonth() + 1, year: selectedMonth.getFullYear() }}
//             onChange={({ month, year }) => setSelectedMonth(new Date(year, month - 1, 1))}
//           />
//           <span className="text-muted-foreground font-black text-xs uppercase tracking-widest hidden sm:block">→</span>
//           <MonthYearPicker
//             label="To"
//             value={{ month: endMonth.getMonth() + 1, year: endMonth.getFullYear() }}
//             onChange={({ month, year }) => setEndMonth(new Date(year, month - 1, 1))}
//           />
//         </div>

//         <div className="flex flex-wrap items-center gap-4">
//           <ToggleSwitch leftLabel="Exp." rightLabel="Qty" value={displayType} onChange={setDisplayType} />
//           <ToggleSwitch leftLabel="In" rightLabel="Out" value={transactionType} onChange={setTransactionType} />

//           <div className="relative" data-download-menu="true">
//             <button
//               onClick={() => setShowDownloadMenu(!showDownloadMenu)}
//               disabled={downloading}
//               className="p-3 bg-card border border-border rounded-2xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm group disabled:"
//             >
//               {downloading ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />}
//             </button>

//             {showDownloadMenu && (
//               <div className="absolute right-0 top-full z-[100] mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
//                 <button
//                   onClick={() => { handleDownloadExcel(); setShowDownloadMenu(false); }}
//                   className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-bold text-foreground transition hover:bg-muted"
//                 >
//                   <ArrowDownToLine size={18} className="text-emerald-600" />
//                   Export as Excel
//                 </button>
//                 <button
//                   onClick={() => { handleDownloadPDF(); setShowDownloadMenu(false); }}
//                   className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-bold text-foreground transition hover:bg-muted border-t border-border/50"
//                 >
//                   <FileText size={18} className="text-blue-600" />
//                   Export as PDF
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center bg-muted/30 p-1 rounded-full border border-border shadow-inner ml-2">
//             <TabButton active={view === "monthDetail"} onClick={() => setView("monthDetail")}>Monthly</TabButton>
//             <TabButton active={view === "yearSummary"} onClick={() => setView("yearSummary")}>Yearly</TabButton>
//           </div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-40 gap-4">
//           <Loader2 className="animate-spin text-orange-600" size={40} />
//           <p className="text-sm font-black text-muted-foreground uppercase tracking-widest italic">Syncing Product Data...</p>
//         </div>
//       ) : (
//         <AnimatePresence mode="wait">
//           {view === "monthDetail" ? (
//             <motion.div
//               key="monthly-table"
//               initial={{ opacity: 0, scale: 0.98 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="overflow-hidden bg-card border border-zinc-300 dark:border-zinc-700 rounded-[1.5rem] shadow-xl relative"
//             >
//               <div className="overflow-x-auto overflow-y-auto max-h-[70vh] ">
//                 <table className="w-full border-collapse border-spacing-0">
//                   <thead>
//                     <tr className="sticky top-0 z-[50] bg-background/80 backdrop-blur-md double-header-row">
//                       <th className="sticky left-0 z-[60] bg-card border-b border-r border-zinc-300 dark:border-zinc-700 p-5 text-left min-w-[300px]">
//                         <div className="flex items-center gap-2">
//                           <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Product Name</span>
//                           <Filter className="w-3 h-3 text-orange-600 ml-1 " />
//                         </div>
//                       </th>
//                       {Array.from({ length: data?.daysInMonth || 31 }).map((_, i) => (
//                         <th key={i} className="border-b border-r border-zinc-300 dark:border-zinc-700 p-4 min-w-[100px] bg-muted/40 group cursor-default">
//                           <div className="relative inline-block">
//                             <span className="text-md font-black text-muted-foreground group-hover:text-orange-600 transition-colors">{i + 1}</span>
//                           </div>
//                         </th>
//                       ))}
//                       <th className="sticky right-0 z-[60] bg-card border-b border-l border-zinc-300 dark:border-zinc-700 p-6 min-w-[150px] text-right">
//                         <div className="flex items-center justify-end gap-2 text-orange-600">
//                           <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Total</span>
//                         </div>
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="">
//                     {data?.items?.map((item, idx) => (
//                       <tr key={item.id} className="group  transition-all duration-200">
//                         <td className="sticky left-0 z-20 bg-card  border-b border-r border-zinc-300 dark:border-zinc-700 p-4 transition-colors">
//                           <div className="flex items-center gap-4">
//                             <div className="w-14 h-14 bg-card rounded-2xl overflow-hidden border border-zinc-300 flex items-center justify-center shrink-0 shadow-sm relative group-hover:border-orange-200 transition-all">
//                               {item.image && !imageErrors[item.id] ? (
//                                 <img
//                                   src={item.image}
//                                   alt={item.name}
//                                   className="w-full h-full object-cover"
//                                   onError={() => handleImageError(item.id)}
//                                 />
//                               ) : (
//                                 <img
//                                   src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.name}&backgroundColor=fff&textColor=e86924&fontWeight=800`}
//                                   alt={item.name}
//                                   className="w-10 h-10 object-contain"
//                                 />
//                               )}
//                               <div className="absolute inset-0 bg-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                             </div>
//                             <div className="overflow-hidden">
//                               <h4 className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors uppercase tracking-tighter truncate leading-tight">{item.name}</h4>
//                               <p className="text-[9px] font-bold text-muted-foreground dark:text-slate-600 uppercase opacity-90">Category: {item.category?.name || item.category || '-'}</p>
//                             </div>
//                           </div>
//                         </td>
//                         {Array.from({ length: data?.daysInMonth || 31 }).map((_, i) => {
//                           const rawValue = getDayValue(item, i + 1);
//                           const val = Math.round(Number(rawValue));
//                           return (
//                             <td key={i} className="border-b border-r border-zinc-300 dark:border-zinc-700 p-4 text-center">
//                               {rawValue === "-" || rawValue === 0 ? (
//                                 <span className="text-zinc-400 dark:text-zinc-600 font-bold">--</span>
//                               ) : (
//                                 <div className="flex flex-col items-center">
//                                   <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-100">
//                                     {displayType ? formatIndianNumber(rawValue) : `₹ ${formatIndianNumber(val)}`}
//                                   </span>
//                                   {displayType && <span className="text-[7px] font-black text-muted-foreground dark:text-slate-600 uppercase opacity-80">{item.unit?.name || item.unit}</span>}
//                                 </div>
//                               )}
//                             </td>
//                           );
//                         })}
//                         <td className="sticky right-0 z-20 bg-card border-b border-l border-zinc-300 dark:border-zinc-700 p-6 text-right transition-colors">
//                           <div className="flex flex-col items-end">
//                             <div className="text-sm font-black text-orange-600 italic tracking-tighter">
//                               {formatValue(getTotalValue(item), item.unit)}
//                             </div>
//                             <span className="text-[8px] font-black text-orange-600/40 uppercase tracking-widest italic">{transactionType ? 'OUTFLOW' : 'INFLOW'}</span>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//               {(!data?.items || data.items.length === 0) && (
//                 <div className="py-32 text-center space-y-6">
//                   <div className="w-20 h-20 bg-muted/30 dark:bg-zinc-800/30 rounded-full flex items-center justify-center mx-auto border border-border dark:border-zinc-800">
//                     <Database className="text-muted-foreground/30 dark:text-zinc-700" size={32} />
//                   </div>
//                   <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] italic">No activity recorded for this period</p>
//                 </div>
//               )}
//             </motion.div>
//           ) : (
//             <motion.div
//               key="daily-cards"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="space-y-8"
//             >
//               <div className="grid grid-cols-1 gap-8">
//                 {data?.items?.map((product) => (
//                   <CardView
//                     key={product.id}
//                     product={product}
//                     visibleCols={visibleCols}
//                     isImgError={imageErrors[product.id]}
//                     onImgError={() => handleImageError(product.id)}
//                   />
//                 ))}
//               </div>
//               {(!data?.items || data.items.length === 0) && (
//                 <div className="py-40 text-center uppercase tracking-widest font-black text-muted-foreground italic opacity-70">
//                   No products found
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       )}
//     </main>
//   );
// };

// const CardView = ({ product, visibleCols, isImgError, onImgError }) => {
//   const formatQty = (qty, unit) => `${formatIndianNumber(qty || 0)} ${unit?.name || unit || ''}`.trim();
//   const formatRupee = (value) => `₹ ${formatIndianNumber(Math.round(value || 0))}`;

//   return (
//     <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-zinc-300 dark:border-zinc-700 space-y-8 transition-colors duration-300">
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//         <div className="flex items-center gap-5">
//           <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border border-zinc-300 dark:border-zinc-700 overflow-hidden shrink-0">
//             {product.image && !isImgError ? (
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-full object-cover"
//                 onError={onImgError}
//               />
//             ) : (
//               <img
//                 src={`https://api.dicebear.com/7.x/initials/svg?seed=${product.name}&backgroundColor=fff&textColor=e86924&fontWeight=800`}
//                 alt={product.name}
//                 className="w-12 h-12 object-contain"
//               />
//             )}
//           </div>
//           <div>
//             <h2 className="text-2xl font-black text-primary italic tracking-tighter uppercase">{product.name}</h2>
//             <p className="text-[10px] font-black text-muted-foreground dark:text-slate-600 uppercase tracking-[0.2em] italic">Category : {product.category?.name || product.category || '-'}</p>
//           </div>
//         </div>

//         <div style={{ backgroundColor: "white" }} className="flex flex-wrap items-center gap-8 bg-muted/20 dark:bg-zinc-800/40 p-5 rounded-[1.5rem] border border-zinc-300 dark:border-zinc-700 w-full lg:w-auto">
//           <MiniStat label="IN" qty={formatQty(product.summary?.inQty, product.unit)} price={formatRupee(product.summary?.inAmount)} color="text-emerald-500" />
//           <MiniStat label="OUT" qty={formatQty(product.summary?.outQty, product.unit)} price={formatRupee(product.summary?.outAmount)} color="text-rose-500" />
//           <MiniStat label="BALANCE" qty={formatQty(product.summary?.balanceQty, product.unit)} price={formatRupee(product.summary?.balanceAmount)} color="text-amber-500" />
//         </div>
//       </div>

//       <div className="overflow-x-auto no-scrollbar border border-zinc-300 dark:border-zinc-700 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-900/50">
//         <div className="grid min-w-[800px]" style={{ gridTemplateColumns: `repeat(${Math.min(visibleCols.length || 1, 12)}, minmax(0, 1fr))` }}>
//           {visibleCols.map((col, idx) => {
//             const yData = product.yearlyData?.[col.year] || [];
//             const mData = yData.find(mon => mon.month === col.month) || { inQty: 0, outQty: 0, balanceQty: 0 };
//             return (
//               <div key={idx} style={{ backgroundColor: "white" }} className="border-r border-zinc-300 dark:border-zinc-700 last:border-r-0 p-4 dark:bg-zinc-900/60 min-h-[140px] bg-white  flex flex-col items-center group transition-all hover:bg-card dark:hover:bg-zinc-800">
//                 <div className="text-[10px] font-black text-muted-foreground uppercase italic tracking-tighter mb-4 group-hover:text-primary whitespace-nowrap">
//                   {col.label}
//                 </div>
//                 <div className="space-y-3 w-full">
//                   <div className="flex justify-between border-b border-zinc-200 pb-1">
//                     <span className="text-[9px] font-black text-emerald-500">IN</span>
//                     <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-200" style={{ color: "black" }}>{formatQty(mData.inQty)}</span>
//                   </div>
//                   <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1">
//                     <span className="text-[9px] font-black text-rose-500">OUT</span>
//                     <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-200" style={{ color: "black" }}>{formatQty(mData.outQty)}</span>
//                   </div>
//                   <div className="flex justify-between font-bold">
//                     <span className="text-[9px] font-black text-amber-500 italic">BAL</span>
//                     <span className="text-[10px] font-black text-orange-600 italic">{formatQty(mData.balanceQty)}</span>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// const MiniStat = ({ label, qty, price, color }) => (
//   <div className="flex items-center gap-4 min-w-[120px]">
//     <div className={`text-[11px] font-black italic uppercase tracking-wider ${color} w-16 shrink-0`}>
//       {label}
//     </div>
//     <div className="flex flex-col">
//       <div style={{ color: "black" }} className="text-[13px] font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none mb-1">
//         {qty}
//       </div>
//       <div style={{ color: "black" }} className="text-[10px] text-muted-foreground dark:text-slate-600 font-bold italic leading-none">
//         {price}
//       </div>
//     </div>
//   </div>
// );

// export default ProductDashboard;
