'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Filter, Search, X } from 'lucide-react';

const OFFSET_MAP = {
    'top-10': 40,
    'top-14': 56,
    'top-16': 64
};

export default function TableColumnFilter({
    colKey,
    title,
    options = [],
    align = 'left',
    topOffset = 'top-10',
    showOptionIcon = false,
    colFilters = {},
    activeFilterCol,
    onToggle,
    onChange,
    iconSrc
}) {
    const triggerRef = useRef(null);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, minWidth: 220 });
    const [searchTerm, setSearchTerm] = useState('');
    const isOpen = activeFilterCol === colKey;
    const selectedCount = colFilters[colKey]?.length || 0;
    const justifyClass = align === 'center' ? 'justify-center' : 'justify-start';

    const filteredOptions = useMemo(() => {
        if (!Array.isArray(options)) return [];
        const uniqueOptions = [...new Set(options)];
        return uniqueOptions.filter(opt =>
            String(opt || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const updateMenuPosition = useMemo(() => {
        return () => {
            if (!triggerRef.current || !isOpen) return;

            const rect = triggerRef.current.getBoundingClientRect();
            const minWidth = 220;
            const offsetY = 12; // Small spacing below header

            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Threshold for opening upwards
            const shouldOpenUp = spaceBelow < 400 && spaceAbove > spaceBelow;

            // Calculate horizontal position - avoid overflow
            let left = rect.left;
            if (align === 'center') {
                left = rect.left + (rect.width / 2) - (minWidth / 2);
            } else if (align === 'right') {
                left = rect.right - minWidth;
            }

            // Boundary checks
            left = Math.max(12, Math.min(left, window.innerWidth - minWidth - 12));

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
    }, [isOpen, align]);

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

    // Handle clicking outside to close
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest('[data-col-filter-root="true"]')) {
                onToggle(null, e);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onToggle]);

    return (
        <>
            <div
                ref={triggerRef}
                data-col-filter-root="true"
                className={`group relative flex items-center gap-1.5 cursor-pointer select-none transition-all ${justifyClass} ${isOpen ? 'text-primary' : 'hover:text-primary/70'}`}
                onClick={(e) => onToggle(colKey, e)}
            >
                <span className="whitespace-nowrap">{title}</span>
                <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">
                    {selectedCount > 0 ? (
                        <div className="bg-primary text-white text-[10px] font-black rounded-full px-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center leading-none shadow-sm shadow-primary/40 animate-in zoom-in-50 duration-200 border-2 border-card">
                            {selectedCount}
                        </div>
                    ) : iconSrc ? (
                        <img src={iconSrc} alt="filter" className="w-3.5 h-3.5 object-contain" />
                    ) : (
                        <Filter size={12} className={`${isOpen ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-primary/40'} transition-colors`} />
                    )}
                </div>
            </div>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            data-col-filter-root="true"
                            initial={{ opacity: 0, y: menuStyle.placement === 'top' ? 4 : -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: menuStyle.placement === 'top' ? 4 : -4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            onClick={e => e.stopPropagation()}
                            className="fixed bg-card text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[1.5rem] p-2 z-[500] border border-border flex flex-col cursor-default font-sans font-normal normal-case tracking-normal text-left backdrop-blur-3xl ring-1 ring-black/5"
                            style={{
                                ...menuStyle,
                                transformOrigin: menuStyle.placement === 'top' ? 'bottom center' : 'top center'
                            }}
                        >
                            {/* Search Box */}
                            <div className="px-2 pb-2 mb-2 border-b border-border">
                                <div className="relative group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search items..."
                                        className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-[11px] font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground shadow-sm"
                                    />
                                </div>
                            </div>


                            <div
                                className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-0.5"
                                style={{ maxHeight: menuStyle.maxHeight || '300px' }}
                            >
                                {filteredOptions.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-[10px] text-muted-foreground italic font-bold uppercase tracking-widest ">No items found</div>
                                ) : filteredOptions.map(option => {
                                    const isSelected = colFilters[colKey]?.includes(option);
                                    return (
                                        <button
                                            key={option}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onChange(colKey, option);
                                            }}
                                            className={`px-3 py-2 text-[11px] font-bold text-left rounded-xl transition-all flex items-center justify-between group w-full ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/70 hover:bg-muted hover:text-foreground hover:shadow-sm hover:border-border border border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {showOptionIcon && (
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-card/20 text-white' : 'bg-black/5 text-muted-foreground group-hover:bg-black/10 group-hover:text-foreground'}`}>
                                                        <Filter size={10} />
                                                    </div>
                                                )}
                                                <span className="truncate pr-4 tracking-tight">{option || '-'}</span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${isSelected ? 'bg-card text-primary border-white scale-110' : 'border-border bg-muted group-hover:border-border/60'}`}>
                                                {isSelected && <Check size={10} strokeWidth={4} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-2 pt-2 border-t border-border">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(colKey, '');
                                    }}
                                    className="w-full py-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-red-500/60 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/10 flex items-center justify-center gap-2"
                                >
                                    <X size={10} strokeWidth={3} />
                                    Clear Column Filter
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
