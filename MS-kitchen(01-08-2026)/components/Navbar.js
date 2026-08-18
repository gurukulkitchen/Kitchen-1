'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar({ toggleSidebar, isSidebarCollapsed }) {
    const pathname = usePathname();
    const dropdownRef = useRef(null);
    const mobileCompanyDropdownRef = useRef(null);
    const mobileProfileDropdownRef = useRef(null);
    const mobileProfileButtonRef = useRef(null);

    const { selectedCompanyIds, assignedCompanies, toggleCompanyId, companyName } = useCompany();
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [isMobileCompanyDropdownOpen, setIsMobileCompanyDropdownOpen] = useState(false);
    const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

    const [allCompanies, setAllCompanies] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [userName, setUserName] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('name') || '';
    });
    const [userRole, setUserRole] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('role') || '';
    });
    const [avatar, setAvatar] = useState(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('avatar') || null;
    });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
    const notifDropdownRef = useRef(null);

    useEffect(() => {
        const fetchNavbarData = async () => {
            try {
                const [companiesRes, menusRes, authRes] = await Promise.all([
                    fetch('/api/companies'),
                    fetch('/api/menus'),
                    fetch('/api/auth/me'),
                ]);

                if (companiesRes.ok) setAllCompanies(await companiesRes.json());
                if (menusRes.ok) setMenuItems(await menusRes.json());
                if (authRes.ok) {
                    const authData = await authRes.json();
                    const user = authData.user || authData;
                    setUserName(user.name || user.username || 'User');
                    setUserRole(user.role || '');
                    const fetchedAvatar = user.avatar || user.profileImage || user.image || null;
                    if (fetchedAvatar) {
                        setAvatar(fetchedAvatar);
                        localStorage.setItem('avatar', fetchedAvatar);
                    } else {
                        const localAv = localStorage.getItem('avatar');
                        if (localAv) setAvatar(localAv);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch navbar data:', error);
            }
        };
        fetchNavbarData();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsCompanyDropdownOpen(false);
            }
            if (mobileCompanyDropdownRef.current && !mobileCompanyDropdownRef.current.contains(event.target)) {
                setIsMobileCompanyDropdownOpen(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
                setIsNotifDropdownOpen(false);
            }
            if (mobileProfileDropdownRef.current && !mobileProfileDropdownRef.current.contains(event.target)) {
                if (mobileProfileButtonRef.current && !mobileProfileButtonRef.current.contains(event.target)) {
                    setIsMobileProfileOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchCurrentNotifications();
        }
    }, [selectedCompanyIds]);

    const fetchCurrentNotifications = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            let notifUrl = `/api/meal-notifications?notificationDate=${today}`;
            if (selectedCompanyIds?.[0]) notifUrl += `&companyId=${selectedCompanyIds[0]}`;
            const res = await fetch(notifUrl);
            if (res.ok) setNotifications(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleHardRefresh = () => {
        if (typeof window !== 'undefined') window.location.reload();
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const currentAssignedCompanies = allCompanies.filter(c =>
        assignedCompanies.some(ac => (ac?.$oid || ac).toString() === (c._id?.$oid || c._id).toString())
    );

    const findMenuLabel = (items, route) => {
        for (const item of items) {
            if (item.route === route) return item.label;
            if (item.children?.length) {
                const childLabel = findMenuLabel(item.children, route);
                if (childLabel) return childLabel;
            }
        }
        return '';
    };

    const formatPathLabel = (route) => route
        .split('?')[0]
        .split('/')
        .filter(Boolean)
        .map(part => part.replace(/-/g, ' '))
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' / ');

    const currentPageTitle = findMenuLabel(menuItems, pathname) || formatPathLabel(pathname) || 'Dashboard';

    const selectedCompany = selectedCompanyIds.length === 1
        ? allCompanies.find(c => String(c._id?.$oid || c._id) === String(selectedCompanyIds[0]))
        : null;

    const branchButtonLabel = selectedCompanyIds.length > 1
        ? `${selectedCompanyIds.length} Branches`
        : selectedCompany
            ? (selectedCompany.shortName || selectedCompany.name)
            : companyName || 'All Branches';

    const branchFullName = selectedCompany
        ? selectedCompany.name
        : companyName || 'All Branches';

    return (
        <header
            className="sticky top-0 z-[50] flex items-center justify-between px-5 py-10 h-[58px] border-b border-[#E8C5B0]/40 dark:border-stone-700/60 bg-gradient-to-l from-[#FFF1E6] via-[#FFFDFC] to-[#FFEBDF] dark:bg-none dark:from-[#2F2F2F] dark:via-[#2F2F2F] dark:to-[#2F2F2F] dark:bg-[#2F2F2F]"
        >
            {/* LEFT: Hamburger + Page Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="flex items-center justify-center cursor-pointer p-1 shrink-0"
                    title={isSidebarCollapsed ? 'Open Sidebar' : 'Close Sidebar'}
                >
                    <img
                        src="/icons/navbar/Hide & Unhide.svg"
                        alt="Toggle Sidebar"
                        className="w-5 h-5 object-contain transition-all hover:opacity-60 dark:brightness-0 dark:invert"
                    />
                </button>
                <h1
                    className="text-[22px] font-black tracking-[0.15em] uppercase leading-none bg-gradient-to-r from-[#FF5102] to-[#862519] dark:from-[#FF7A45] dark:to-[#E2765A] bg-clip-text text-transparent drop-shadow-xs"
                >
                    {currentPageTitle}
                </h1>
            </div>

            {/* RIGHT: Branch + Icons + User */}
            <div className="flex items-center gap-3 lg:gap-5">

                {/* Branch Selector (Desktop) */}
                {currentAssignedCompanies.length > 0 && (
                    <div className="relative hidden lg:block" ref={dropdownRef}>
                        <p className="text-[11px] font-medium text-[#0E0E0E] dark:text-stone-300 text-center mb-0.5 leading-none italic">Select Branch</p>
                        <button
                            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-[6px] text-white rounded-[9px] text-[12px] font-semibold whitespace-nowrap min-w-[110px] justify-between cursor-pointer shadow-md bg-gradient-to-r from-[#8A281A] to-[#C85A2A] dark:from-[#882619] dark:via-[#AA3A1E] dark:to-[#D4612D]"
                        >
                            <span className="truncate max-w-[120px]">{branchButtonLabel}</span>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`shrink-0 transition-transform duration-200 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`}>
                                <path d="M0 0H10L5 6L0 0Z" fill="white" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {isCompanyDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute right-0 mt-2 w-[min(14rem,calc(100vw-2rem))] bg-card rounded-xl shadow-xl border border-border overflow-hidden z-[60] p-1"
                                >
                                    <div className="p-2 border-b border-border/50 mb-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Branch</p>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {currentAssignedCompanies.map((company) => {
                                            const companyId = String(company._id?.$oid || company._id);
                                            const isSelected = selectedCompanyIds.map(id => String(id?.$oid || id)).includes(companyId);
                                            return (
                                                <label
                                                    key={company._id}
                                                    className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold rounded-lg transition-all mb-0.5 cursor-pointer hover:bg-muted group"
                                                >
                                                    <span className={`truncate pr-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{company.name}</span>
                                                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleCompanyId(company._id)} />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Icon Buttons */}
                <div className="flex items-center gap-1">

                    {/* Notification */}
                    <div className="relative" ref={notifDropdownRef}>
                        <button
                            onClick={() => {
                                const newState = !isNotifDropdownOpen;
                                setIsNotifDropdownOpen(newState);
                                if (newState) fetchCurrentNotifications();
                            }}
                            className="w-9 h-9 flex items-center justify-center cursor-pointer relative"
                            title="Notifications"
                        >
                            <img src="/icons/navbar/Notification.svg" alt="Notifications" className="w-5 h-5 object-contain transition-all hover:opacity-60 dark:hidden" />
                            <img src="/icons/navbar/NotificationDark.svg" alt="Notifications" className="w-5 h-5 object-contain transition-all hover:opacity-60 hidden dark:block" />
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-red-500 rounded-full border border-white" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-card rounded-xl shadow-xl border border-border overflow-hidden z-[60] p-1"
                                >
                                    <div className="p-3 border-b border-border/50 mb-1 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Notifications</p>
                                        <span className="text-[9px] font-bold px-2 py-0.5 bg-[#8A281A]/10 text-[#8A281A] rounded-full">{notifications.length} New</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">All caught up!</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={async () => {
                                                        try {
                                                            await fetch(`/api/meal-notifications?id=${notif._id}`, { method: 'PATCH' });
                                                            setNotifications(prev => prev.filter(n => n._id !== notif._id));
                                                            window.location.href = `/monthly-menu?month=${notif.date.slice(0, 7)}&date=${notif.date}`;
                                                            setIsNotifDropdownOpen(false);
                                                        } catch (e) { console.error(e); }
                                                    }}
                                                    className="p-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 cursor-pointer"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-[#8A281A] uppercase tracking-widest mb-0.5 truncate">{notif.mealType}</p>
                                                        <p className="text-[11px] font-medium text-foreground leading-relaxed">{notif.text}</p>
                                                        <p className="text-[9px] text-muted-foreground mt-1 font-bold">{notif.date}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Dark Mode (Desktop Only) */}
                    <div className="hidden lg:block">
                        <ThemeToggle />
                    </div>

                    {/* Full Screen (Desktop Only) */}
                    <button
                        onClick={toggleFullScreen}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer hidden lg:flex"
                        title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                    >
                        <img src="/icons/navbar/full screen.svg" alt="Full Screen" className="w-5 h-5 object-contain transition-all hover:opacity-60 dark:hidden" />
                        <img src="/icons/navbar/FullscreenDark.svg" alt="Full Screen" className="w-5 h-5 object-contain transition-all hover:opacity-60 hidden dark:block" />

                    </button>

                    {/* Hard Refresh (Desktop Only) */}
                    <button
                        onClick={handleHardRefresh}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer hidden lg:flex"
                        title="Hard Refresh"
                    >
                        <img src="/icons/navbar/hard refresh.svg" alt="Hard Refresh" className="w-5 h-5 object-contain transition-all hover:opacity-60 dark:hidden" />
                        <img src="/icons/navbar/RefreshDark.svg" alt="Full Screen" className="w-5 h-5 object-contain transition-all hover:opacity-60 hidden dark:block" />

                    </button>
                </div>

                {/* User Info + Avatar */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden lg:block">
                        <p className="text-[14px] font-bold text-[#8A281A] dark:text-[#E2765A] leading-tight">{userName}</p>
                        <p className="text-[10px] text-gray-400 dark:text-stone-300 leading-tight mt-0.5">
                            {branchFullName}
                            {userRole && (
                                <>
                                    {" | "}
                                    <span className="font-bold text-gray-800 dark:text-white">{userRole}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <button
                        ref={mobileProfileButtonRef}
                        onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                        className="w-9 h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center border-2 border-[#D2602D]/80 bg-gradient-to-br from-[#882619] via-[#AA3A1E] to-[#D4612D] text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
                    >
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={userName}
                                className="w-full h-full object-cover"
                                onError={() => setAvatar(null)}
                            />
                        ) : (
                            <span className="font-bold text-[13px] text-white select-none">
                                {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                            </span>
                        )}
                    </button>
                </div>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                    {isMobileProfileOpen && (
                        <motion.div
                            ref={mobileProfileDropdownRef}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-5 top-[58px] w-72 bg-[#FDF6F2] dark:bg-[#171717] rounded-2xl shadow-2xl border border-[#E8C5B0]/40 overflow-hidden z-[60] p-4 flex flex-col gap-4"
                        >
                            {/* Profile Info Summary */}
                            <div className="flex items-center gap-3 pb-3 border-b border-[#E8C5B0]/30">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D2602D]/80 shadow-sm bg-gradient-to-br from-[#882619] via-[#AA3A1E] to-[#D4612D] text-white flex items-center justify-center shrink-0">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={userName}
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatar(null)}
                                        />
                                    ) : (
                                        <span className="font-bold text-sm text-white select-none">
                                            {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[14px] font-bold text-[#8A281A] dark:text-[#F9C8B0] leading-tight truncate">{userName}</p>
                                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">
                                        {branchFullName}
                                        {userRole && (
                                            <>
                                                {" | "}
                                                <span className="font-bold text-gray-700 dark:text-gray-300">{userRole}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Core Account Actions (Admin Profile & Sign Out) */}
                            <div className="flex flex-col gap-1 py-1">
                                <a
                                    href="/profile"
                                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-[#8A281A]/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A281A] dark:text-[#F9C8B0]">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Admin Profile
                                </a>
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        document.cookie.split(";").forEach(cookie => {
                                            const name = cookie.split("=")[0].trim();
                                            document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                                        });
                                        if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
                                        window.location.href = "/login";
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left w-full focus:outline-none cursor-pointer"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>

                            {/* Mobile Branch Selector */}
                            {currentAssignedCompanies.length > 0 && (
                                <div className="flex flex-col gap-1 lg:hidden" ref={mobileCompanyDropdownRef}>
                                    <p className="text-[9px] font-medium text-gray-400 mb-0.5 leading-none italic">Select Branch</p>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsMobileCompanyDropdownOpen(!isMobileCompanyDropdownOpen)}
                                            className="flex items-center gap-2 px-4 py-[8px] text-white rounded-[9px] text-[12px] font-semibold whitespace-nowrap w-full justify-between cursor-pointer shadow-md focus:outline-none"
                                            style={{ background: 'linear-gradient(to right, #8A281A, #C85A2A)' }}
                                        >
                                            <span className="truncate max-w-[180px]">{branchButtonLabel}</span>
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`shrink-0 transition-transform duration-200 ${isMobileCompanyDropdownOpen ? 'rotate-180' : ''}`}>
                                                <path d="M0 0H10L5 6L0 0Z" fill="white" />
                                            </svg>
                                        </button>

                                        <AnimatePresence>
                                            {isMobileCompanyDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 4 }}
                                                    className="absolute left-0 right-0 mt-1 bg-[#FDF6F2] dark:bg-[#262626] rounded-xl shadow-xl border border-[#E8C5B0]/40 overflow-hidden z-[70] p-1 max-h-48 overflow-y-auto"
                                                >
                                                    {currentAssignedCompanies.map((company) => {
                                                        const companyId = String(company._id?.$oid || company._id);
                                                        const isSelected = selectedCompanyIds.map(id => String(id?.$oid || id)).includes(companyId);
                                                        return (
                                                            <label
                                                                key={company._id}
                                                                className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold rounded-lg transition-all mb-0.5 cursor-pointer hover:bg-muted group"
                                                            >
                                                                <span className={`truncate pr-2 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{company.name}</span>
                                                                <div className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#8A281A] border-[#8A281A] shadow-sm' : 'border-border'}`}>
                                                                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                                </div>
                                                                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleCompanyId(company._id)} />
                                                            </label>
                                                        );
                                                    })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Utility Controls Row */}
                            <div className="flex items-center justify-around pt-2 border-t border-[#E8C5B0]/20 lg:hidden">
                                <div className="flex flex-col items-center gap-1">
                                    <ThemeToggle />
                                    <span className="text-[9px] text-gray-400 font-bold">Theme</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <button
                                        onClick={toggleFullScreen}
                                        className="w-9 h-9 flex items-center justify-center cursor-pointer rounded-full hover:bg-[#8A281A]/5 dark:hover:bg-white/5 transition-all focus:outline-none"
                                        title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                                    >
                                        <img src="/icons/navbar/full screen.svg" alt="Full Screen" className="w-5 h-5 object-contain" />
                                    </button>
                                    <span className="text-[9px] text-gray-400 font-bold">Fullscreen</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <button
                                        onClick={handleHardRefresh}
                                        className="w-9 h-9 flex items-center justify-center cursor-pointer rounded-full hover:bg-[#8A281A]/5 dark:hover:bg-white/5 transition-all focus:outline-none"
                                        title="Hard Refresh"
                                    >
                                        <img src="/icons/navbar/hard refresh.svg" alt="Hard Refresh" className="w-5 h-5 object-contain" />
                                    </button>
                                    <span className="text-[9px] text-gray-400 font-bold">Refresh</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </header>
    );
}
