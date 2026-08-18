import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function DateRangePicker({ startDate, endDate, onChange, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

    // Internal state for the selection before confirming
    const [start, setStart] = useState(startDate ? new Date(startDate) : null);
    const [end, setEnd] = useState(endDate ? new Date(endDate) : null);

    // State for the calendar view (which month we are looking at)
    const [viewDate, setViewDate] = useState(startDate ? new Date(startDate) : new Date());

    useEffect(() => {
        setStart(startDate ? new Date(startDate) : null);
        setEnd(endDate ? new Date(endDate) : null);
        setViewDate(startDate ? new Date(startDate) : new Date());
    }, [startDate, endDate]);

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 450; // Calendar is taller
        const offsetY = 8;
        
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        const newMenuStyle = {
            left: Math.max(12, Math.min(rect.left, window.innerWidth - 332)), // 320px width + padding
            width: 320,
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
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target)) {
                // If the target is not inside the portal menu either
                if (!event.target.closest('[data-datepicker-id="datepicker-menu"]')) {
                    setIsOpen(false);
                    setStart(startDate ? new Date(startDate) : null);
                    setEnd(endDate ? new Date(endDate) : null);
                }
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, startDate, endDate]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
        const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

        const days = [];
        // Previous month trailing days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            days.push({
                date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
                isCurrentMonth: false
            });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(currentYear, currentMonth, i),
                isCurrentMonth: true
            });
        }
        // Next month leading days
        const remainingCells = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(currentYear, currentMonth + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    };

    const handleDateClick = (clickedDate) => {
        // Reset time parts for comparison
        clickedDate.setHours(0, 0, 0, 0);

        if (!start || (start && end)) {
            // Start new selection
            setStart(clickedDate);
            setEnd(null);
        } else {
            // Select end date (or swap if before start)
            if (clickedDate < start) {
                setEnd(start);
                setStart(clickedDate);
            } else {
                setEnd(clickedDate);
            }
        }
    };

    const formatDateString = (d) => {
        if (!d) return '';
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const handleConfirm = () => {
        if (onChange) {
            onChange(formatDateString(start), formatDateString(end));
        }
        setIsOpen(false);
    };

    const handleReset = () => {
        setStart(null);
        setEnd(null);
    };

    const nextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const prevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const formatDateDisplay = (dateObj) => {
        if (!dateObj) return 'Select Date';
        const d = dateObj.getDate().toString().padStart(2, '0');
        const m = MONTHS[dateObj.getMonth()];
        const y = dateObj.getFullYear();
        return `${d} ${m}, ${y}`;
    };

    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const isWithinRange = (date) => {
        if (!start || !end) return false;
        return date > start && date < end;
    };

    const renderDisplayValue = () => {
        if (!startDate && !endDate) return 'Select Date Range';
        const startStr = startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---';
        const endStr = endDate ? new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---';
        return `${startStr} - ${endStr}`;
    };

    return (
        <div className={`relative ${className}`}>
            {/* Trigger Input */}
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center px-4 py-3 bg-muted/50 border border-border rounded-xl cursor-pointer hover:border-[#e67022]/30 transition-colors group focus-within:ring-2 ring-[#e67022]/20 shadow-sm"
            >
                <Calendar className="text-muted-foreground mr-3 group-hover:text-[#e67022] transition-colors shrink-0" size={16} />
                <span className={`text-sm font-bold truncate ${(!startDate && !endDate) ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {renderDisplayValue()}
                </span>
            </div>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <motion.div
                        data-datepicker-id="datepicker-menu"
                        initial={{ opacity: 0, y: menuStyle.placement === 'top' ? 10 : -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: menuStyle.placement === 'top' ? 10 : -10, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                            ...menuStyle,
                            transformOrigin: menuStyle.placement === 'top' ? 'bottom left' : 'top left'
                        }}
                        className="fixed z-[1000] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-1"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                            <h3 className="text-xl font-black text-foreground tracking-tight">Date Range</h3>
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 text-[11px] font-black text-[#e67022] bg-orange-50/50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-100/50 uppercase tracking-wider"
                            >
                                Reset
                            </button>
                        </div>

                        {/* From / To Labels */}
                        <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-b border-border/50 gap-4">
                            <div className="flex flex-col flex-1 gap-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground ml-1">From</span>
                                <div className="px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground truncate shadow-sm">
                                    {formatDateDisplay(start)}
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 gap-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground ml-1">To</span>
                                <div className="px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground truncate shadow-sm">
                                    {formatDateDisplay(end)}
                                </div>
                            </div>
                        </div>

                        {/* Calendar Navigation */}
                        <div className="px-4 py-4 flex items-center justify-between">
                            <button onClick={prevMonth} className="p-2 hover:bg-muted text-foreground rounded-full transition-colors active:scale-95">
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                            <span className="text-sm font-black text-foreground tracking-tight">
                                {MONTHS[currentMonth]} {currentYear}
                            </span>
                            <button onClick={nextMonth} className="p-2 hover:bg-muted text-foreground rounded-full transition-colors active:scale-95">
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="px-4 pb-4">
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map(day => (
                                    <div key={day} className="text-center text-[9px] font-black uppercase tracking-widest text-[#e67022]">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-y-1">
                                {generateCalendarDays().map((item, idx) => {
                                    const isStart = isSameDay(item.date, start);
                                    const isEnd = isSameDay(item.date, end);
                                    const isBetween = isWithinRange(item.date);
                                    const isSelected = isStart || isEnd;

                                    let bgClass = '';
                                    if (isSelected) {
                                        bgClass = 'bg-[#e67022] text-white font-bold shadow-md shadow-orange-200/50';
                                    } else if (isBetween) {
                                        bgClass = 'bg-orange-50 text-[#e67022] font-bold';
                                    } else if (!item.isCurrentMonth) {
                                        bgClass = 'text-muted-foreground/30 font-bold hover:bg-muted';
                                    } else {
                                        bgClass = 'text-foreground font-bold hover:bg-muted';
                                    }

                                    // For range background effect bridging days
                                    let wrapperClass = "relative flex items-center justify-center p-0.5";
                                    if (isBetween) wrapperClass += " bg-orange-50/60";
                                    if (isStart && end) wrapperClass += " bg-gradient-to-r from-transparent via-orange-50/60 to-orange-50/60";
                                    if (isEnd && start) wrapperClass += " bg-gradient-to-l from-transparent via-orange-50/60 to-orange-50/60";

                                    return (
                                        <div key={idx} className={wrapperClass}>
                                            <button
                                                onClick={() => handleDateClick(item.date)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${bgClass} ${isSelected ? 'z-10' : ''}`}
                                            >
                                                {item.date.getDate().toString().padStart(2, '0')}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-card">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[11px] font-black text-muted-foreground uppercase hover:text-foreground transition-colors py-2 tracking-widest"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="text-[11px] font-black text-[#e67022] uppercase hover:text-[#d6651f] transition-colors py-2 tracking-widest"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
