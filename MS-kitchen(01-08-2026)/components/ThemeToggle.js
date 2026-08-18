'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" />; // Placeholder to avoid hydration mismatch
    }

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 relative overflow-hidden cursor-pointer"
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={resolvedTheme}
                    initial={{ y: 20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center justify-center w-full h-full"
                >
                    <img
                        src="/icons/navbar/dark mode.svg"
                        alt="Dark Mode"
                        className="w-5 h-5 object-contain transition-all hover:opacity-70 hover:brightness-125 dark:hidden"
                    />
                    <img
                        src="/icons/navbar/DarkDark.svg"
                        alt="Dark Mode"
                        className="w-5 h-5 object-contain transition-all hover:opacity-70 hover:brightness-125 hidden dark:block"
                    />
                </motion.div>
            </AnimatePresence>
        </button>
    );
}
