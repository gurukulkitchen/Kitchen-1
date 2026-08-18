'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export default function DateTimePicker({ value, onChange, label, required = false, className = "", isInline = false, showTime = true, customTrigger = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

  // Handle local state for calendar navigation and selections
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  useEffect(() => {
    if (!value && onChange) {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const hr = now.getHours();
      const min = String(now.getMinutes()).padStart(2, '0');

      if (showTime) {
        const formattedH = String(hr).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}T${formattedH}:${min}`);
      } else {
        onChange(`${yyyy}-${mm}-${dd}`);
      }
    }
  }, [value, onChange, showTime]);

  let parsedDate = null;
  if (value) {
    if (value.includes('T')) {
      const [datePart, timePart] = value.split('T');
      const [y, m, d] = datePart.split('-').map(Number);
      const [h, min] = timePart.split(':').map(Number);
      parsedDate = new Date(y, m - 1, d, h, min);
    } else {
      const [y, m, d] = value.split('-').map(Number);
      parsedDate = new Date(y, m - 1, d);
    }
  } else {
    parsedDate = new Date();
  }
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  const selectedYear = isValidDate ? parsedDate.getFullYear() : null;
  const selectedMonth = isValidDate ? parsedDate.getMonth() : null;
  const selectedDay = isValidDate ? parsedDate.getDate() : null;

  // Time selections
  const now = new Date();
  const currentRawHours = now.getHours();
  let activeHour = currentRawHours % 12;
  if (activeHour === 0) activeHour = 12;
  let activeMinute = now.getMinutes();
  let activeAmPm = currentRawHours >= 12 ? 'PM' : 'AM';

  if (isValidDate) {
    const rawHours = parsedDate.getHours();
    activeMinute = parsedDate.getMinutes();
    activeAmPm = rawHours >= 12 ? 'PM' : 'AM';
    activeHour = rawHours % 12;
    if (activeHour === 0) activeHour = 12;
  }

  // Position updates for the absolute dropdown portal
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 380;
    const dropdownWidth = showTime ? 560 : 300; // wider to fit both calendar & time pickers
    const offsetY = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const newMenuStyle = {
      left: Math.max(16, Math.min(window.innerWidth - dropdownWidth - 16, rect.left)),
      width: dropdownWidth,
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

      // Sync calendar view month/year to selected value on open
      if (isValidDate) {
        setViewYear(selectedYear);
        setViewMonth(selectedMonth);
      }
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Premium feature: Auto scroll into view for active hours and minutes lists
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourListRef.current) {
          const activeHourEl = hourListRef.current.querySelector('[data-active="true"]');
          if (activeHourEl) activeHourEl.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
        if (minuteListRef.current) {
          const activeMinuteEl = minuteListRef.current.querySelector('[data-active="true"]');
          if (activeMinuteEl) activeMinuteEl.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      }, 50);
    }
  }, [isOpen, activeHour, activeMinute]);

  // Construct display value formatted as: "DD-MM-YYYY hh:mm AM/PM" or "DD-MM-YYYY"
  const getDisplayValue = () => {
    if (!isValidDate) return showTime ? 'Select Date & Time' : 'Select Date';
    const dd = String(selectedDay).padStart(2, '0');
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const yyyy = selectedYear;
    if (!showTime) {
      return `${dd}-${mm}-${yyyy}`;
    }
    const hh = String(activeHour).padStart(2, '0');
    const min = String(activeMinute).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} ${hh}:${min} ${activeAmPm}`;
  };

  // Build calendar days grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  // Adjust so Monday is index 0
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const prevDays = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    prevDays.push({ day: prevMonthDays - i, isCurrentMonth: false, monthOffset: -1 });
  }

  const currentDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push({ day: i, isCurrentMonth: true, monthOffset: 0 });
  }

  const totalCells = 42;
  const nextDaysCount = totalCells - (prevDays.length + currentDays.length);
  const nextDays = [];
  for (let i = 1; i <= nextDaysCount; i++) {
    nextDays.push({ day: i, isCurrentMonth: false, monthOffset: 1 });
  }

  const allDays = [...prevDays, ...currentDays, ...nextDays];

  // Helper to update the full date time string
  const updateDateTime = (newYear, newMonth, newDay, newHour, newMin, newAmPm) => {
    const y = newYear !== undefined ? newYear : (selectedYear || new Date().getFullYear());
    const m = newMonth !== undefined ? newMonth : (selectedMonth !== null ? selectedMonth : new Date().getMonth());
    const d = newDay !== undefined ? newDay : (selectedDay || new Date().getDate());

    const hr = newHour !== undefined ? newHour : activeHour;
    const min = newMin !== undefined ? newMin : activeMinute;
    const ampm = newAmPm !== undefined ? newAmPm : activeAmPm;

    const formattedM = String(m + 1).padStart(2, '0');
    const formattedD = String(d).padStart(2, '0');

    if (!showTime) {
      onChange(`${y}-${formattedM}-${formattedD}`);
      return;
    }

    // Convert to 24 hour system
    let hour24 = hr;
    if (ampm === 'PM' && hr !== 12) hour24 = hr + 12;
    if (ampm === 'AM' && hr === 12) hour24 = 0;

    const formattedH = String(hour24).padStart(2, '0');
    const formattedMin = String(min).padStart(2, '0');

    onChange(`${y}-${formattedM}-${formattedD}T${formattedH}:${formattedMin}`);
  };

  const handleDaySelect = (dayObj) => {
    let targetYear = viewYear;
    let targetMonth = viewMonth + dayObj.monthOffset;

    // Handle month overflow/underflow
    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }

    updateDateTime(targetYear, targetMonth, dayObj.day);
    setViewYear(targetYear);
    setViewMonth(targetMonth);
  };

  const handleMonthPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleMonthNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');

    if (!showTime) {
      onChange(`${y}-${m}-${d}`);
    } else {
      const hr = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      onChange(`${y}-${m}-${d}T${hr}:${min}`);
    }
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  return (
    <div className={`relative flex flex-col gap-1 w-full ${className}`}>
      {label && !isInline && (
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4 mb-0.5">
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      <div className="relative">
        {customTrigger ? (
          React.cloneElement(customTrigger, {
            ref: triggerRef,
            onClick: (e) => {
              if (customTrigger.props.onClick) customTrigger.props.onClick(e);
              setIsOpen(!isOpen);
            }
          })
        ) : isInline ? (
          <div
            ref={triggerRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between px-2.5 py-1 bg-card border border-primary/30 rounded-lg text-[13px] font-black text-foreground outline-none cursor-pointer hover:border-primary transition-all text-center select-none w-full min-h-[30px]"
          >
            <span className="flex-1 text-center font-black tracking-tight">
              {getDisplayValue()}
            </span>
            <img src="/icons/action/Calender.svg" className="w-5 h-5 transition-transform group-hover:scale-110 dark:hidden" alt="View Image" />
            <img src="/icons/action/CalenderDark.svg" className="w-5 h-5 transition-transform group-hover:scale-110 hidden dark:block" alt="View Image" />

          </div>
        ) : (
          <div
            ref={triggerRef}
            onClick={() => setIsOpen(!isOpen)}
            className="gradient-border flex items-center justify-between px-5 py-3.5 rounded-xl text-xs font-bold text-foreground outline-none cursor-pointer transition-all text-center select-none"
            style={{
              border: "1px solid",
              borderImage: "linear-gradient(90deg, #882619, #D4612D) 1",
            }}
          >
            <span className="flex-1 text-center font-bold tracking-tight">
              {getDisplayValue()}
            </span>
            <img src="/icons/action/Calender.svg" className="w-5 h-5 transition-transform group-hover:scale-110 dark:hidden" alt="View Image" />
            <img src="/icons/action/CalenderDark.svg" className="w-5 h-5 transition-transform group-hover:scale-110 hidden dark:block" alt="View Image" />
          </div>
        )}

        {isOpen && typeof document !== 'undefined' && createPortal(
          <>
            {/* Backdrop click closer */}
            <div data-datetime-picker="true" className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />

            <motion.div
              data-datetime-picker="true"
              initial={{ opacity: 0, scale: 0.95, y: menuStyle.placement === 'top' ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: menuStyle.placement === 'top' ? 10 : -10 }}
              style={{
                ...menuStyle,
                transformOrigin: menuStyle.placement === 'top' ? 'bottom left' : 'top left'
              }}
              className={`fixed z-[1000] bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-5 flex gap-5 overflow-hidden h-[360px] ${showTime ? 'w-[560px]' : 'w-[300px]'}`}
            >
              {/* Left Column: Calendar Grid */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-1.5">
                    {MONTHS_FULL[viewMonth]} {viewYear}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleMonthPrev}
                      className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleMonthNext}
                      className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {WEEKDAYS.map((day) => (
                    <span key={day} className="text-[10px] font-black text-muted-foreground/60 uppercase">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center flex-1">
                  {allDays.map((dayObj, idx) => {
                    const isSelected =
                      selectedYear === viewYear &&
                      selectedMonth === viewMonth &&
                      selectedDay === dayObj.day &&
                      dayObj.isCurrentMonth;

                    const isCurrent = dayObj.isCurrentMonth;

                    return (
                      <button
                        key={`${idx}-${dayObj.day}`}
                        type="button"
                        onClick={() => handleDaySelect(dayObj)}
                        className={`aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all ${isSelected
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : isCurrent
                            ? 'text-foreground hover:bg-muted'
                            : 'text-muted-foreground/30 hover:bg-muted/30'
                          }`}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleToday}
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              {showTime && (
                <>
                  {/* Vertical Divider */}
                  <div className="w-[1px] bg-border/80 h-full shrink-0" />

                  {/* Right Column: Time Picker */}
                  <div className="w-[200px] flex gap-3 h-full select-none">
                    {/* Hours column */}
                    <div className="flex-1 flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider text-center mb-1">Hour</span>
                      <div
                        ref={hourListRef}
                        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col gap-1 pr-0.5"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                          const isActive = activeHour === h;
                          return (
                            <button
                              key={`hr-${h}`}
                              type="button"
                              data-active={isActive}
                              onClick={() => updateDateTime(undefined, undefined, undefined, h, undefined, undefined)}
                              className={`py-2 text-[11px] font-black rounded-xl shrink-0 transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                              {String(h).padStart(2, '0')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Minutes column */}
                    <div className="flex-1 flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider text-center mb-1">Min</span>
                      <div
                        ref={minuteListRef}
                        className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col gap-1 pr-0.5"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                          const isActive = activeMinute === m;
                          return (
                            <button
                              key={`min-${m}`}
                              type="button"
                              data-active={isActive}
                              onClick={() => updateDateTime(undefined, undefined, undefined, undefined, m, undefined)}
                              className={`py-2 text-[11px] font-black rounded-xl shrink-0 transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                              {String(m).padStart(2, '0')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AM/PM column */}
                    <div className="w-[50px] flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-wider text-center mb-1">Period</span>
                      <div className="flex-1 flex flex-col gap-1">
                        {['AM', 'PM'].map((p) => {
                          const isActive = activeAmPm === p;
                          return (
                            <button
                              key={`period-${p}`}
                              type="button"
                              onClick={() => updateDateTime(undefined, undefined, undefined, undefined, undefined, p)}
                              className={`py-3 text-[11px] font-black rounded-xl shrink-0 transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
          , document.body
        )}
      </div>
    </div>
  );
}
