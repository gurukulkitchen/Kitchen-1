'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, ChevronDown, X } from 'lucide-react';

export default function SearchableSelect({
    options = [], // Expected format: [{ value: 'id1', label: 'Item 1' }, ...]
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    className = '',
    showSearchIcon = false
}) {
    const triggerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, minWidth: 220 });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        if (!Array.isArray(options)) return [];
        const seen = new Set();
        return options.filter(opt => {
            if (!opt || seen.has(String(opt.value))) return false;
            seen.add(String(opt.value));
            return String(opt?.label || '').toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [options, searchTerm]);

    const safeValue = value || '';

    // Find the label for the current value to display
    const selectedLabel = useMemo(() => {
        const selected = options.find(opt => String(opt.value) === String(safeValue));
        return selected ? selected.label : placeholder;
    }, [options, safeValue, placeholder]);

    const updateMenuPosition = useMemo(() => {
        return () => {
            if (!triggerRef.current || !isOpen) return;
            const rect = triggerRef.current.getBoundingClientRect();
            // Minimum width of 260px, or match the input width if larger
            const minWidth = Math.max(triggerRef.current.offsetWidth, 260);
            const offsetY = 8;

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Threshold for opening upwards
            const shouldOpenUp = spaceBelow < 400 && spaceAbove > spaceBelow;

            let left = rect.left;

            // Adjust if it goes off screen on the right
            if (left + minWidth > window.innerWidth - 12) {
                left = window.innerWidth - minWidth - 12;
            }
            // Ensure it doesn't go off screen on the left
            left = Math.max(12, left);

            const newMenuStyle = {
                left,
                minWidth,
                placement: shouldOpenUp ? 'top' : 'bottom'
            };

            if (shouldOpenUp) {
                newMenuStyle.bottom = (window.innerHeight - rect.top) + offsetY;
                newMenuStyle.top = 'auto';
                newMenuStyle.maxHeight = Math.min(300, spaceAbove - offsetY - 40);
            } else {
                newMenuStyle.top = rect.bottom + offsetY;
                newMenuStyle.bottom = 'auto';
                newMenuStyle.maxHeight = Math.min(300, spaceBelow - offsetY - 40);
            }

            setMenuStyle(newMenuStyle);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            return;
        }
        updateMenuPosition();
        window.addEventListener('resize', updateMenuPosition);
        window.addEventListener('scroll', updateMenuPosition, true);

        return () => {
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [isOpen, updateMenuPosition]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest(`[data-searchselect-id="searchable-select-menu"]`) && !triggerRef.current?.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative shrink-0 w-full">
            <div
                ref={triggerRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between cursor-pointer transition-all ${disabled ? ' cursor-not-allowed' : 'hover:opacity-90'} ${className || 'w-full text-xs font-bold text-primary bg-transparent py-1 outline-none'}`}
            >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    {showSearchIcon && <Search size={15} className="text-[#BD4423]/60 shrink-0" />}
                    <span className={`truncate ${!safeValue ? 'text-slate-400 font-medium' : 'text-[#BD4423] dark:text-[#D4612D] font-normal text-sm'}`}>{selectedLabel}</span>
                </div>
                <div className="shrink-0 ml-2 flex items-center">
                    <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-[#BD4423] dark:border-t-[#D4612D] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            data-searchselect-id="searchable-select-menu"
                            initial={{ opacity: 0, y: menuStyle.placement === 'top' ? 4 : -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuStyle.placement === 'top' ? 4 : -4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            onClick={e => e.stopPropagation()}
                            className="fixed bg-card text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.25)] rounded-[1.5rem] p-2 z-[500] border border-border flex flex-col cursor-default font-sans font-normal normal-case tracking-normal text-left backdrop-blur-3xl"
                            style={{
                                ...menuStyle,
                                transformOrigin: menuStyle.placement === 'top' ? 'bottom center' : 'top center'
                            }}
                        >
                            <div className="px-2 pb-2 mb-2 border-b border-border">
                                <div className="relative group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full bg-muted border border-border rounded-xl pl-9 pr-3 py-2 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/40 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div
                                className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-0.5"
                                style={{ maxHeight: menuStyle.maxHeight || '300px' }}
                            >
                                {filteredOptions.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-[10px] text-muted-foreground italic font-bold uppercase tracking-widest ">No items found</div>
                                ) : (
                                    <>
                                        {filteredOptions.map(option => {
                                            const isSelected = String(safeValue) === String(option.value);
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        onChange(option.value);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-left rounded-xl transition-all flex items-center justify-between group w-full ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground hover:bg-muted hover:shadow-sm border border-transparent'}`}
                                                >
                                                    <span className="truncate pr-4">{option.label || '-'}</span>
                                                    <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${isSelected ? 'bg-card text-primary border-white scale-110' : 'border-border bg-muted group-hover:border-border/60'}`}>
                                                        {isSelected && <Check size={10} strokeWidth={4} />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </>
                                )}
                            </div>

                            <div className="mt-2 pt-2 border-t border-border">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange('');
                                        setIsOpen(false);
                                    }}
                                    className="w-full py-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-red-500/60 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/10 flex items-center justify-center gap-2"
                                >
                                    <X size={10} strokeWidth={3} />
                                    Clear Selection
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
