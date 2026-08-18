'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthYearPicker({ value, onChange, placeholder = "Select Month", variant = "default" }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });
    const [isYearSelectMode, setIsYearSelectMode] = useState(false);

    // Support both string "YYYY-MM" and object { month, year }
    const isValueObject = value && typeof value === 'object' && 'month' in value && 'year' in value;
    const isValueString = typeof value === 'string';

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); // 0-11

    if (isValueObject) {
        currentYear = value.year;
        currentMonth = value.month - 1;
    } else if (isValueString && value) {
        const [y, m] = value.split('-');
        currentYear = parseInt(y);
        currentMonth = parseInt(m) - 1;
    }

    const [viewYear, setViewYear] = useState(currentYear);

    const selectedYear = currentYear;
    const selectedMonth = currentMonth;

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 350; // Estimated height
        const offsetY = 8;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        const newMenuStyle = {
            left: rect.left,
            width: 280,
            placement: shouldOpenUp ? 'top' : 'bottom'
        };

        if (shouldOpenUp) {
            newMenuStyle.bottom = (window.innerHeight - rect.top) + offsetY;
            newMenuStyle.top = 'auto';
        } else {
            newMenuStyle.top = rect.bottom + offsetY;
            newMenuStyle.bottom = 'auto';
        }

        setMenuStyle(newMenuStyle);
    };

    useEffect(() => {
        if (isOpen) {
            setViewYear(currentYear);
            setIsYearSelectMode(false);
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, currentYear]);

    const handleMonthClick = (monthIndex) => {
        const monthStr = String(monthIndex + 1).padStart(2, '0');
        if (isValueObject) {
            onChange({ month: monthIndex + 1, year: viewYear });
        } else {
            onChange(`${viewYear}-${monthStr}`);
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        if (isValueObject) {
            onChange({ month: '', year: '' });
        } else {
            onChange('');
        }
        setIsOpen(false);
    };

    const handleThisMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        if (isValueObject) {
            onChange({ month, year });
        } else {
            const monthStr = String(month).padStart(2, '0');
            onChange(`${year}-${monthStr}`);
        }
        setIsOpen(false);
    };

    const displayValue = isValueObject ? `${MONTHS[value.month - 1]} ${value.year}` :
        (isValueString && value) ? (() => {
            const [y, m] = value.split('-');
            return `${MONTHS[parseInt(m) - 1]} ${y}`;
        })() : placeholder;

    const triggerClasses = variant === 'badge'
        ? "border border-border rounded-full px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-all"
        : variant === 'ghost'
            ? "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-foreground text-sm font-bold cursor-pointer hover:bg-muted/50 transition-all min-w-[150px]"
            : "flex items-center gap-3 pl-4 pr-12 py-3 rounded-full border border-border bg-muted/30 text-foreground text-sm font-semibold outline-none cursor-pointer hover:border-primary/50 transition-all min-w-[160px]";

    return (
        <div className="relative">
            {variant === 'headerPill' ? (
                <div
                    ref={triggerRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className="p-[1.5px] bg-gradient-to-r from-[#882619] via-[#AA3A1E] to-[#D4612D] rounded-xl shadow-xs cursor-pointer hover:opacity-90 transition-all"
                >
                    <div className="bg-white dark:bg-[#252525] rounded-[10.5px] px-3.5 py-1.5 flex items-center gap-2.5 text-xs font-bold uppercase text-[#882619] dark:text-[#D4612D]">

                        <img src="/icons/action/Calender.svg" className="w-4 h-4 dark:hidden" alt="Calendar" />
                        <img src="/icons/action/CalenderDark.svg" className="w-4 h-4 hidden dark:block" alt="Calendar" />
                        <span className="whitespace-nowrap font-bold tracking-wide">{displayValue}</span>
                        <svg width="10" height="7" viewBox="0 0 10 7" fill="none" className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <path d="M5 7L0 0H10L5 7Z" fill="#882619" className="dark:fill-[#D4612D]" />
                        </svg>
                    </div>
                </div>
            ) : variant === 'pillGradient' ? (
                <div
                    ref={triggerRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className="gradient-pill-input flex items-center justify-between gap-3 px-5 py-2 cursor-pointer transition-all min-w-[170px] shadow-sm"
                >
                    <span className={value ? "text-slate-800 dark:text-zinc-100 font-medium text-sm" : "text-[#C2C2C2] font-normal text-sm"}>
                        {displayValue}
                    </span>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="#D4612D" className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <path d="M5 8L0 0H10L5 8Z" />
                    </svg>
                </div>
            ) : (
                <div
                    ref={triggerRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className={triggerClasses}
                >
                    <img src="/icons/action/Calender.svg" className="w-4 h-4 dark:hidden" alt="Calendar" />
                    <img src="/icons/action/CalenderDark.svg" className="w-4 h-4 hidden dark:block" alt="Calendar" />
                    <span className={variant === 'badge' ? "text-primary" : variant === 'ghost' ? "bg-gradient-to-r from-[#882619] to-[#D4612D] bg-clip-text text-transparent font-extrabold" : value ? "text-foreground" : "text-muted-foreground/50"}>
                        {variant === 'badge' ? displayValue.toUpperCase() : displayValue}
                    </span>
                    {variant !== 'ghost' && variant !== 'badge' && (
                        <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                </div>
            )}

            {isOpen && typeof document !== 'undefined' && createPortal(
                <>
                    <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: menuStyle.placement === 'top' ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: menuStyle.placement === 'top' ? 10 : -10 }}
                        style={{
                            ...menuStyle,
                            transformOrigin: menuStyle.placement === 'top' ? 'bottom left' : 'top left'
                        }}
                        className="fixed z-[1000] bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[1.5rem] p-4 flex flex-col gap-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-2">
                            <button
                                onClick={() => {
                                    if (isYearSelectMode) {
                                        setViewYear(v => v - 12);
                                    } else {
                                        setViewYear(v => v - 1);
                                    }
                                }}
                                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div
                                onClick={() => setIsYearSelectMode(v => !v)}
                                className="flex items-center gap-1 group cursor-pointer hover:bg-muted px-2.5 py-1 rounded-xl transition-all active:scale-95"
                            >
                                <span className="text-base font-black tracking-tight select-none">
                                    {isYearSelectMode ? `${viewYear - 5} - ${viewYear + 6}` : viewYear}
                                </span>
                                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isYearSelectMode ? 'rotate-180' : ''}`} />
                            </div>
                            <button
                                onClick={() => {
                                    if (isYearSelectMode) {
                                        setViewYear(v => v + 12);
                                    } else {
                                        setViewYear(v => v + 1);
                                    }
                                }}
                                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        {isYearSelectMode ? (
                            <div className="grid grid-cols-4 gap-2 min-w-[240px]">
                                {Array.from({ length: 12 }, (_, i) => viewYear - 5 + i).map((y) => {
                                    const isSelected = selectedYear === y;
                                    return (
                                        <button
                                            key={y}
                                            onClick={() => {
                                                setViewYear(y);
                                                setIsYearSelectMode(false);
                                            }}
                                            className={`py-2.5 rounded-xl font-bold text-xs transition-all ${isSelected
                                                ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                                                : 'hover:bg-muted text-foreground'
                                                }`}
                                        >
                                            {y}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 min-w-[240px]">
                                {MONTHS.map((m, idx) => {
                                    const isSelected = selectedMonth === idx && selectedYear === viewYear;
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => handleMonthClick(idx)}
                                            className={`py-2.5 rounded-xl font-bold text-xs transition-all ${isSelected
                                                ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                                                : 'hover:bg-muted text-foreground'
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
                            <button
                                onClick={handleThisMonth}
                                className="text-xs font-extrabold text-primary hover:underline"
                            >
                                This Month
                            </button>
                            {value && (
                                <button
                                    onClick={handleClear}
                                    className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <X size={12} /> Clear
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
                , document.body)}
        </div>
    );
}
