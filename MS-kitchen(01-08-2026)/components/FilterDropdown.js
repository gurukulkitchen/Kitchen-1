'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, ChevronDown, X } from 'lucide-react';

export default function FilterDropdown({
    options = [],
    value,
    onChange,
    title = 'Select...',
    placeholder = 'Search...',
    align = 'left',
    isMulti = false,
    className = '',
    disabled = false,
    style = {},
    icon = null,
    showTitleOnly = false
}) {
    const triggerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, minWidth: 220 });
    const [searchTerm, setSearchTerm] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const normalizedOptions = useMemo(() => {
        if (!Array.isArray(options)) return [];
        const seen = new Set();
        return options.map(opt => {
            if (typeof opt === 'object' && opt !== null) {
                return { value: String(opt.value || ''), label: String(opt.label || opt.value || '') };
            }
            return { value: String(opt), label: String(opt) };
        }).filter(opt => {
            if (seen.has(opt.value)) return false;
            seen.add(opt.value);
            return true;
        });
    }, [options]);

    const filteredOptions = useMemo(() => {
        return normalizedOptions.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [normalizedOptions, searchTerm]);

    const displayValue = useMemo(() => {
        const getLabel = (val) => {
            if (val === undefined || val === null || val === '') return title;
            
            // If value is an object {value, label}, extract the value string
            const strVal = (typeof val === 'object' && val !== null) ? String(val.value || '') : String(val);
            
            const opt = normalizedOptions.find(o => o.value === strVal);
            if (opt) return opt.label;
            
            // If not found in options, return the label if it's an object, or the value itself
            if (typeof val === 'object' && val !== null) return String(val.label || val.value || title);
            return String(val || title);
        };

        if (isMulti) {
            if (!Array.isArray(value) || value.length === 0) return title;
            if (value.length === 1) return getLabel(value[0]);
            return `${value.length} Selected`;
        }
        return getLabel(value);
    }, [isMulti, value, title, normalizedOptions]);

    const isAllSelected = useMemo(() => {
        if (isMulti) return !Array.isArray(value) || value.length === 0;
        return !value || value === '';
    }, [isMulti, value]);

    const updateMenuPosition = useMemo(() => {
        return () => {
            if (!triggerRef.current || !isOpen) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const minWidth = triggerRef.current.offsetWidth > 220 ? triggerRef.current.offsetWidth : 220;
            const offsetY = 8;
            
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            // Threshold for opening upwards: less than 400px below and more space above than below
            const shouldOpenUp = spaceBelow < 400 && spaceAbove > spaceBelow;

            let left = rect.left;
            if (align === 'right') {
                left = rect.right - minWidth + rect.width;
            }
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

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (!e.target.closest(`[data-dropdown-id="${title}"]`)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, title]);

    const handleOptionClick = (optionValue) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value.map(String) : [];
            const newValue = currentValues.includes(String(optionValue))
                ? currentValues.filter(v => v !== String(optionValue))
                : [...currentValues, String(optionValue)];
            onChange(newValue);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        onChange(isMulti ? [] : '');
        setIsOpen(false);
    };

    return (
        <div className={`relative shrink-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div
                ref={triggerRef}
                data-dropdown-id={title}
                tabIndex={0}
                onMouseDown={e => e.preventDefault()}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`${className || 'flex items-center justify-between cursor-pointer shadow-sm transition-all focus:outline-none pl-4 pr-3 py-2.5 bg-card border rounded-xl text-[11px] font-bold outline-none h-11'} ${isOpen ? 'border-primary ring-2 ring-primary/10 text-primary' : (!isAllSelected ? 'border-primary/50 text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary')} ${disabled ? 'pointer-events-none' : ''}`}
                style={style}
            >
                <span className="truncate pr-1">{showTitleOnly ? title : displayValue}</span>
                {icon ? (
                    <div className="shrink-0">{icon}</div>
                ) : (
                    <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : 'text-primary'}`} />
                )}
            </div>

            {mounted && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            data-dropdown-id={title}
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
                            <div className="px-2 pb-2 mb-2 border-b border-border">
                                <div className="relative group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder={placeholder}
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
                                ) : (
                                    <>
                                        <button
                                            key="all-option"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                onChange(isMulti ? [] : '');
                                                if (!isMulti) setIsOpen(false);
                                            }}
                                            className={`px-3 py-2 text-[11px] font-bold text-left rounded-xl transition-all flex items-center justify-between group w-full ${isAllSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/70 hover:bg-muted hover:text-foreground hover:shadow-sm hover:border-border border border-transparent'}`}
                                        >
                                            <span className="truncate pr-4 tracking-tight">All</span>
                                            <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${isAllSelected ? 'bg-card text-primary border-white scale-110' : 'border-border bg-muted group-hover:border-border/60'}`}>
                                                {isAllSelected && <Check size={10} strokeWidth={4} />}
                                            </div>
                                        </button>

                                        {filteredOptions.map(option => {
                                            const isSelected = isMulti
                                                ? Array.isArray(value) && value.map(String).includes(option.value)
                                                : String(value) === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onMouseDown={e => e.preventDefault()}
                                                    onClick={() => handleOptionClick(option.value)}
                                                    className={`px-3 py-2 text-[11px] font-bold text-left rounded-xl transition-all flex items-center justify-between group w-full ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/70 hover:bg-muted hover:text-foreground hover:shadow-sm hover:border-border border border-transparent'}`}
                                                >
                                                    <span className="truncate pr-4 tracking-tight">{option.label || '-'}</span>
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
                                        handleClear();
                                    }}
                                    className="w-full py-2.5 text-[9px] font-black uppercase tracking-[0.15em] text-red-500/60 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/10 flex items-center justify-center gap-2"
                                >
                                    <X size={10} strokeWidth={3} />
                                    Clear Filter
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
