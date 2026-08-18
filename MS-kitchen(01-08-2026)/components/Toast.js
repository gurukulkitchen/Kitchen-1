'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// --- Context ---
const ToastContext = createContext(null);

// --- Provider ---
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 2800) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// --- Individual Toast ---
function ToastItem({ toast, onDismiss }) {
    const config = {
        success: {
            icon: <CheckCircle size={16} strokeWidth={2.5} />,
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            icon_color: 'text-emerald-600',
            text_color: 'text-emerald-800',
            bar: 'bg-emerald-400',
        },
        error: {
            icon: <XCircle size={16} strokeWidth={2.5} />,
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon_color: 'text-red-600',
            text_color: 'text-red-800',
            bar: 'bg-red-400',
        },
        warning: {
            icon: <AlertTriangle size={16} strokeWidth={2.5} />,
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon_color: 'text-amber-600',
            text_color: 'text-amber-800',
            bar: 'bg-amber-400',
        },
        info: {
            icon: <Info size={16} strokeWidth={2.5} />,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon_color: 'text-blue-600',
            text_color: 'text-blue-800',
            bar: 'bg-blue-400',
        },
    };

    const c = config[toast.type] || config.success;

    return (
        <div
            className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${c.bg} ${c.border} animate-toast-in`}
            style={{ minWidth: 220 }}
        >
            <span className={`mt-0.5 flex-shrink-0 ${c.icon_color}`}>{c.icon}</span>
            <p className={`text-[12px] font-semibold leading-snug flex-1 ${c.text_color}`}>{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-muted-foreground transition-colors mt-0.5"
            >
                <X size={13} />
            </button>
        </div>
    );
}

// --- Hook ---
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback: no-op if used outside provider (avoids crash)
        return { showToast: () => {} };
    }
    return ctx;
}
