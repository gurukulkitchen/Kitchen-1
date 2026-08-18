"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Menu,
  LogOut,
  UtensilsCrossed,
  ChevronDown,
  Carrot,
  Settings,
  X,
  Milk as MilkIcon,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompany } from "@/context/CompanyContext";
import { useTheme } from "next-themes";

export default function Sidebar({ isCollapsed, toggleSidebar }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { selectedCompanyIds } = useCompany();
  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const [role, setRole] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("role") || null;
  });
  const [userName, setUserName] = useState(() => {
    if (typeof window === "undefined") return "My Profile";
    return localStorage.getItem("name") || "My Profile";
  });
  const [avatar, setAvatar] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("avatar") || null;
  });
  const [menuItems, setMenuItems] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]);

  useEffect(() => {
    // Auth check
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
          setUserName(data.user?.name || "My Profile");
          setAvatar(data.user?.avatar || null);
          if (data.role) localStorage.setItem("role", data.role);
          if (data.user?.name) localStorage.setItem("name", data.user.name);
          if (data.user?.avatar) localStorage.setItem("avatar", data.user.avatar);
          else localStorage.removeItem("avatar");
        } else {
          setRole("Guest");
          setUserName("Guest");
          setAvatar(null);
        }
      } catch (error) {
        console.error("Auth verification failed", error);
        setRole("Guest");
        setUserName("Guest");
      }
    };

    verifyAuth();

    // Fetch Menus & Companies
    const fetchMenusAndCompanies = async () => {
      try {
        const [menusRes, companiesRes] = await Promise.all([
          fetch("/api/menus"),
          fetch("/api/companies")
        ]);
        if (menusRes.ok) setMenuItems(await menusRes.json());
        if (companiesRes.ok) setAllCompanies(await companiesRes.json());
      } catch (error) {
        console.error("Failed to fetch menus/companies", error);
      }
    };

    fetchMenusAndCompanies();
  }, []);

  // Fetch Permissions when role changes
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    if (role) {
      const fetchPermissions = async () => {
        try {
          const res = await fetch(`/api/permissions?role=${role}`);
          if (res.ok) {
            const data = await res.json();
            const permMap = {};
            data.forEach((p) => {
              if (p.menuId) {
                const mId = p.menuId._id || p.menuId;
                permMap[mId] = p;
              }
            });
            setPermissions(permMap);
          }
        } catch (error) {
          console.error("Failed to fetch permissions", error);
        }
      };
      fetchPermissions();
    }
  }, [role]);

  const isVisible = (item) => {
    if (item.route === "/super-admin/settings" || item.label === "Settings") return false;
    if (role === "Super Admin") return true;
    const perm = permissions[item._id];
    if (!perm) return false;
    return perm.read === true;
  };

  const toggleMenu = (label) => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderIcon = (iconName, label = "", route = "", className = "") => {
    const cleanLabel = label ? label.trim().toLowerCase() : "";
    const cleanRoute = route ? route.trim().toLowerCase() : "";

    let svgFile = "";

    if (cleanLabel.includes("dashboard") || cleanRoute === "/dashboard" || cleanRoute === "/") {
      svgFile = "Dashboard.svg";
    } else if (cleanLabel.includes("product data") || cleanRoute === "/inventory") {
      svgFile = "P. Data.svg";
    } else if (cleanLabel.endsWith(" in") || cleanRoute.endsWith("/in")) {
      svgFile = "In.svg";
    } else if (cleanLabel.endsWith(" out") || cleanRoute.endsWith("/out")) {
      svgFile = "Out.svg";
    } else if (cleanLabel.includes("stock data") || cleanLabel.includes("inventory")) {
      svgFile = "Inventory.svg";
    } else if (cleanLabel.includes("veg & fruit")) {
      svgFile = "Veg.svg";
    } else if (cleanLabel.includes("milk & butter.m")) {
      svgFile = "Milk.svg";
    } else if (cleanLabel.includes("daily menu") || cleanRoute === "/daily-menu") {
      svgFile = "review.svg";
    } else if (cleanLabel.includes("monthly menu") || cleanRoute === "/monthly-menu") {
      svgFile = "Monthly.svg";
    } else if (cleanLabel.includes("menu")) {
      svgFile = "Menu.svg";
    } else if (cleanLabel.includes("other exp") || cleanRoute === "/othermaintenance") {
      svgFile = "Other Exp..svg";
    } else if (cleanLabel.includes("cleaning") || cleanRoute === "/cleaning") {
      svgFile = "Cleaning.svg";
    } else if (cleanLabel.includes("recipe") || cleanRoute === "/recipe-qty") {
      svgFile = "Recipe Qty..svg";
    } else if (cleanLabel.includes("attendance") || cleanRoute === "/attendance") {
      svgFile = "Attendance.svg";
    } else if (cleanLabel.includes("staff data") || cleanRoute === "/staff" || cleanLabel.includes("emp. data")) {
      svgFile = "Emp. Data.svg";
    } else if (cleanLabel.includes("employee")) {
      svgFile = "Employee.svg";
    } else if (cleanLabel.includes("donation") || cleanRoute === "/donation") {
      svgFile = "Donations.svg";
    } else if (cleanLabel.includes("cash book") || cleanRoute === "/cashbook") {
      svgFile = "Cash Book.svg";
    } else if (cleanLabel.includes("setting") || cleanRoute === "/admin/settings" || cleanRoute.startsWith("/super-admin")) {
      svgFile = "Vector (1).svg";
    } else if (cleanLabel.includes("activity log") || cleanRoute === "/activity-logs") {
      svgFile = "Activity.svg";
    }

    if (svgFile) {
      const src = `/icons/sidebar/${svgFile}`;
      return (
        <img
          src={src}
          className={`w-[18px] h-[18px] min-w-[18px] min-h-[18px] object-contain ${className}`}
          alt={label}
        />
      );
    }

    const IconComponent =
      {
        LayoutDashboard,
        Package,
        ArrowDownToLine,
        ArrowUpFromLine,
        Menu,
        LogOut,
        UtensilsCrossed,
        Carrot: Package,
        Settings,
        Milk: MilkIcon,
        Activity,
      }[iconName] || Package;

    return <IconComponent size={18} className={className} />;
  };

  // Helper to check if any child is active
  const isParentActive = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => child.route === pathname);
  };

  // Auto-expand active parents on load
  useEffect(() => {
    const newExpanded = {};
    menuItems.forEach((item) => {
      if (item.children && (isParentActive(item) || (pathname === '/dashboard' && (item.label === 'Stock Data' || item.label === 'Inventory')))) {
        newExpanded[item.label] = true;
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedMenus((prev) => ({ ...prev, ...newExpanded }));
  }, [pathname, menuItems]);

  // Profile dropdown handlers removed as profile is moved to Navbar

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
    setIsMobileProfileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    });

    // Clear session storage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <>
      <aside className={`text-slate-300 px-5 py-6 hidden md:flex flex-col h-screen sticky top-0 font-sans no-scrollbar relative overflow-hidden self-start shadow-xl border-r border-[#D2602D]/20 dark:border-stone-800/60 transition-all duration-300 bg-gradient-to-r from-[#8A281A] to-[#D2602D] dark:bg-gradient-to-b dark:from-[#2D2C2C] dark:to-[#333333] ${isCollapsed ? 'w-0 px-0 opacity-0' : 'w-[280px]'}`}>
        {/* Background Gradient */}

        {/* Header - Logo Section */}
        <div className="relative z-10 mb-6 mt-2 flex flex-col items-center select-none">
          <div className="w-[64px] h-[64px] relative mb-3">
            <img
              src="/uploads/Untitled-1.png"
              alt="Gurukul Kitchen"
              className="w-full h-full object-contain"
              style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.65))' }}
            />
          </div>
          <h1 className="text-centerleading-none mb-4" style={{ fontFamily: 'SegoePrint, cursive', fontSize: '18px', color: 'white' }}>
            <span style={{ color: '#FF850a', fontSize: '25px' }}>G</span>urukul <span style={{ color: '#FF850a', fontSize: '25px' }}>K</span>itchen
          </h1>
          <div className="h-[2px] bg-white w-full" />
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar relative z-10">
          {(() => {
            if (role === "Super Admin" || role === "Developer" || role === "Admin") {
              return (
                <NavItem
                  icon={renderIcon("LayoutDashboard", "Dashboard", "/dashboard")}
                  label="Dashboard"
                  href="/dashboard"
                  active={pathname === "/dashboard"}
                />
              );
            }
            if (menuItems.length === 0) return null;
            const dashboardMenu = menuItems.find(item => item.label === 'Dashboard');
            if (dashboardMenu) {
              const perm = permissions[dashboardMenu._id];
              if (!perm || perm.read !== true) return null;
            } else {
              return null;
            }
            return (
              <NavItem
                icon={renderIcon("LayoutDashboard", "Dashboard", "/dashboard")}
                label="Dashboard"
                href="/dashboard"
                active={pathname === "/dashboard"}
              />
            );
          })()}
          {menuItems.filter(item => item.label !== 'Dashboard' && item.route !== '/dashboard').map((item) => {
            if (!isVisible(item)) return null;

            const hasChildren = item.children && item.children.length > 0;
            const isActive = pathname === item.route;
            const isExpanded = expandedMenus[item.label];

            return (
              <React.Fragment key={item._id}>
                {hasChildren ? (
                  (() => {
                    const visibleChildren = item.children.filter((child) => isVisible(child));
                    if (visibleChildren.length === 0 && item.type === "parent") return null;

                    return (
                      <div className="mb-0.5">
                        <div
                          onClick={() => toggleMenu(item.label)}
                          className={`
                            flex items-center justify-between px-5 py-2 rounded-[16px] cursor-pointer transition-all select-none group focus:outline-none border
                            ${isExpanded
                              ? "border-transparent text-white"
                              : "border-transparent text-white/90 hover:bg-white/5 hover:text-white"
                            }
                          `}
                          style={isExpanded ? (isDark ? {
                            border: "1.5px solid #D4612D",
                            backgroundColor: "rgba(37, 37, 37, 0.6)",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                          } : {
                            border: "2.5px solid transparent",
                            backgroundImage: "linear-gradient(rgba(122, 43, 14, 0.25), rgba(122, 43, 14, 0.25)), linear-gradient(to right, #882619, #D4612D)",
                            backgroundOrigin: "border-box",
                            backgroundClip: "padding-box, border-box",
                            boxShadow: "inset 0 3px 5px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.2)"
                          }) : {}}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`transition-colors shrink-0 ${isExpanded ? "text-white [filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`}>
                              {renderIcon(item.icon, item.label, item.route, item.iconClassName)}
                            </div>
                            <span className={`font-bold text-[14px] ${isExpanded ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                              {item.label}
                            </span>
                          </div>
                          <svg
                            width="10"
                            height="6"
                            viewBox="0 0 10 6"
                            fill="currentColor"
                            className={`transform transition-all duration-300 ${isExpanded ? "rotate-0 text-[#F9C8B0]" : "-rotate-90 text-white/80 group-hover:text-white"}`}
                          >
                            <path d="M0 0 L10 0 L5 6 Z" />
                          </svg>
                        </div>

                        {/* Submenu */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-96 opacity-100 mt-2 mb-3" : "max-h-0 opacity-0"
                            }`}
                        >
                          <div className="pl-8 pr-4 space-y-[4px] py-1 relative">
                            {/* Vertical line for proper indentation */}


                            {item.children.map((child, idx) => {
                              if (!isVisible(child)) return null;
                              return (
                                <NavItem
                                  key={child._id || idx}
                                  icon={renderIcon(child.icon, child.label, child.route, child.iconClassName)}
                                  label={child.label}
                                  href={child.route}
                                  active={pathname === child.route}
                                  isSubItem={true}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <NavItem
                    icon={renderIcon(item.icon, item.label, item.route, item.iconClassName)}
                    label={item.label}
                    href={item.route}
                    active={isActive}
                  />
                )}
                {/* Separator after Dairy section */}
                {item.label && item.label.toLowerCase().includes("milk & butter.m") && (
                  <div className="my-4 px-4">
                    <div className="h-[1px] bg-[#EA8468] w-full" />
                  </div>
                )}
                {/* Separator after Employee section */}
                {item.label && item.label.toLowerCase() === "employee" && (
                  <div className="my-4 px-4">
                    <div className="h-[1px] bg-[#EA8468] w-full" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
          {/* Static Admin Settings & Activity Logs */}
          {(role === "Super Admin" || role === "Admin") && (
            <>
              <NavItem
                icon={renderIcon("Settings", role === "Super Admin" ? "Setting" : "Setting", role === "Super Admin" ? "/super-admin/companies" : "/admin/settings")}
                label={role === "Super Admin" ? "Setting" : "Setting"}
                href={role === "Super Admin" ? "/super-admin/companies" : "/admin/settings"}
                active={role === "Super Admin" ? pathname.startsWith("/super-admin") : pathname === "/admin/settings"}
              />
              <NavItem
                icon={renderIcon("Activity", "Activity Logs", "/activity-logs")}
                label="Activity Logs"
                href="/activity-logs"
                active={pathname === "/activity-logs"}
              />
              <div className="my-4 px-4">
                <div className="h-[1px] bg-[#EA8468] w-full" />
              </div>
            </>
          )}
        </nav>


        {/* <div className="relative z-10 mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-full transition-all group border border-red-500/10 hover:border-red-500/30"
          >
            <div className="text-red-500 group-hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </div>
            <span className="font-bold text-[13px]">Terminate Session</span>
          </button>
        </div> */}
      </aside>

      {/* Mobile Menu Button  (Simplified for space, matching design above) */}
      <button
        onClick={() => // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsMobileMenuOpen(true)}
        className="md:hidden fixed bottom-5 right-4 z-50 w-14 h-14 bg-gradient-to-r from-[#FF7029] to-[#C34C0E] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all"
      >
        <Menu size={24} strokeWidth={2.5} />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[min(280px,calc(100vw-1rem))] max-w-full text-slate-600 p-5 flex flex-col z-[70] overflow-hidden bg-gradient-to-r from-[#8A281A] to-[#D2602D] dark:bg-gradient-to-b dark:from-[#2D2C2C] dark:to-[#333333]"
            >
              {/* Mobile Gradient BG rendered via inline style above */}
              {/* Header */}
              <div className="relative z-10 mb-4 flex items-start justify-between">
                <div className="flex flex-col items-center flex-1 mt-2">
                  <div className="w-[50px] h-[50px] relative mb-2">
                    <img
                      src="/uploads/Untitled-1.png"
                      alt="Gurukul Kitchen"
                      className="w-full h-full object-contain"
                      style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.35))' }}
                    />
                  </div>
                  <h1 className="text-center font-bold leading-none mb-3" style={{ fontFamily: 'SegoePrint, cursive', fontSize: '15px', color: 'white' }}>
                    <span style={{ color: '#FF850a', fontSize: '20px' }}>G</span>urukul <span style={{ color: '#FF850a', fontSize: '20px' }}>K</span>itchen
                  </h1>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-stone-800 rounded-full transition-colors text-slate-700 hover:text-white shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="h-[1px] bg-white/20 w-full mb-4 relative z-10" />

              <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar relative z-10">
                {(() => {
                  if (role === "Super Admin" || role === "Developer") {
                    return (
                      <div onClick={() => setIsMobileMenuOpen(false)}>
                        <NavItem
                          icon={renderIcon("LayoutDashboard", "Dashboard", "/dashboard")}
                          label="Dashboard"
                          href="/dashboard"
                          active={pathname === "/dashboard"}
                        />
                      </div>
                    );
                  }
                  if (menuItems.length === 0) return null;
                  const dashboardMenu = menuItems.find(item => item.label === 'Dashboard');
                  if (dashboardMenu) {
                    const perm = permissions[dashboardMenu._id];
                    if (!perm || perm.read !== true) return null;
                  } else {
                    return null;
                  }
                  return (
                    <div onClick={() => setIsMobileMenuOpen(false)}>
                      <NavItem
                        icon={renderIcon("LayoutDashboard", "Dashboard", "/dashboard")}
                        label="Dashboard"
                        href="/dashboard"
                        active={pathname === "/dashboard"}
                      />
                    </div>
                  );
                })()}
                {menuItems.filter(item => item.label !== 'Dashboard' && item.route !== '/dashboard').map((item) => {
                  if (!isVisible(item)) return null;

                  const hasChildren = item.children && item.children.length > 0;
                  const isActive = pathname === item.route;
                  const isExpanded = expandedMenus[item.label];

                  return (
                    <React.Fragment key={item._id}>
                      {hasChildren ? (
                        <div className="mb-0.5">
                          <div
                            onClick={() => toggleMenu(item.label)}
                            className={`
                              flex items-center justify-between px-4 py-3 rounded-[2rem] cursor-pointer transition-all select-none group border
                              ${isExpanded
                                ? "border-transparent text-white"
                                : "border-transparent text-white/90 hover:bg-white/5"
                              }
                            `}
                            style={isExpanded ? (isDark ? {
                              border: "1.5px solid #D4612D",
                              backgroundColor: "rgba(37, 37, 37, 0.6)",
                              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
                            } : {
                              border: "2.5px solid transparent",
                              backgroundImage: "linear-gradient(rgba(122, 43, 14, 0.25), rgba(122, 43, 14, 0.25)), linear-gradient(to right, #882619, #D4612D)",
                              backgroundOrigin: "border-box",
                              backgroundClip: "padding-box, border-box",
                              boxShadow: "inset 0 3px 5px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.2)"
                            }) : {}}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`transition-colors shrink-0 ${isExpanded ? "text-white [filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`}>
                                {renderIcon(item.icon, item.label, item.route, item.iconClassName)}
                              </div>
                              <span className={`font-bold text-[14px] ${isExpanded ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                                {item.label}
                              </span>
                            </div>
                            <svg
                              width="10"
                              height="6"
                              viewBox="0 0 10 6"
                              fill="currentColor"
                              className={`transform transition-all duration-300 ${isExpanded ? "rotate-0 text-[#FFB593]" : "-rotate-90 text-white/80 group-hover:text-white"}`}
                            >
                              <path d="M0 0 L10 0 L5 6 Z" />
                            </svg>
                          </div>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-96 opacity-100 mt-2 mb-3" : "max-h-0 opacity-0"
                              }`}
                          >
                            <div className="pl-6 pr-2 space-y-[4px] py-1 relative">
                              {/* Vertical line indentation */}
                              <div className="absolute left-[16px] top-1 bottom-1 w-[2px] bg-stone-800/50 rounded-full" />

                              {item.children.map((child, idx) => {
                                if (!isVisible(child)) return null;
                                return (
                                  <div key={child._id || idx} onClick={() => // eslint-disable-next-line react-hooks/set-state-in-effect
                                    setIsMobileMenuOpen(false)}>
                                    <NavItem
                                      icon={renderIcon(child.icon, child.label, child.route, child.iconClassName)}
                                      label={child.label}
                                      href={child.route}
                                      active={pathname === child.route}
                                      isSubItem={true}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => // eslint-disable-next-line react-hooks/set-state-in-effect
                          setIsMobileMenuOpen(false)}>
                          <NavItem
                            icon={renderIcon(item.icon, item.label, item.route, item.iconClassName)}
                            label={item.label}
                            href={item.route}
                            active={isActive}
                          />
                        </div>
                      )}
                      {/* Separator after Dairy section */}
                      {item.label && item.label.toLowerCase().includes("milk & butter.m") && (
                        <div className="my-6 px-4">
                          <div className="h-[1px] bg-white/20 w-full" />
                        </div>
                      )}
                      {/* Separator after Employee section */}
                      {item.label && item.label.toLowerCase() === "employee" && (
                        <div className="my-6 px-4">
                          <div className="h-[1px] bg-white/20 w-full" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
                {/* Static Admin Settings & Activity Logs for Mobile */}
                {(role === "Super Admin" || role === "Admin") && (
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    <NavItem
                      icon={renderIcon("Settings", role === "Super Admin" ? "Settings" : "Settings", role === "Super Admin" ? "/super-admin/companies" : "/admin/settings")}
                      label={role === "Super Admin" ? "Settings" : "Settings"}
                      href={role === "Super Admin" ? "/super-admin/companies" : "/admin/settings"}
                      active={role === "Super Admin" ? pathname.startsWith("/super-admin") : pathname === "/admin/settings"}
                    />
                    <NavItem
                      icon={renderIcon("Activity", "Activity Logs", "/activity-logs")}
                      label="Activity Logs"
                      href="/activity-logs"
                      active={pathname === "/activity-logs"}
                    />
                    <div className="my-6 px-4">
                      <div className="h-[1px] bg-white/20 w-full" />
                    </div>
                  </div>
                )}
              </nav>
              {/* 
              <div className="relative z-10 mt-auto pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 border border-red-500/20 rounded-full"
                >
                  <LogOut size={14} />
                  <span className="font-bold text-xs">Terminate Session</span>
                </button>
              </div> */}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function NavItem({ icon, label, href, active = false, isSubItem = false }) {
  if (isSubItem) {
    return (
      <Link href={href || "#"}>
        <div
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-[16px] cursor-pointer transition-all group relative border
            ${active
              ? "bg-white text-[#A63D13] border-[#C85A2A] shadow-lg shadow-black/20 dark:bg-gradient-to-r dark:from-[#882619] dark:via-[#AA3A1E] dark:to-[#D4612D] dark:text-white dark:border-[#D4612D] dark:shadow-md"
              : "border-transparent text-white/90 hover:bg-white/5 hover:text-white"
            }
          `}
        >
          <div className={`transition-colors shrink-0 ${active ? "text-[#A63D13] dark:text-white dark:[filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`}>
            {icon}
          </div>
          <span className={`text-[13.5px] leading-tight ${active ? "font-bold text-[#A63D13] dark:text-white" : "font-semibold text-white/90 group-hover:text-white"}`}>
            {label}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href || "#"}>
      <div
        className={`
          flex items-center gap-3 px-5 py-2.5 rounded-[16px] cursor-pointer transition-all group relative border
          ${active
            ? "bg-white text-[#A63D13] border-[#C85A2A] shadow-lg shadow-black/20 dark:bg-gradient-to-r dark:from-[#882619] dark:via-[#AA3A1E] dark:to-[#D4612D] dark:text-white dark:border-[#D4612D] dark:shadow-md"
            : "border-transparent text-white/90 hover:bg-white/5"
          }
        `}
      >
        <div className={`shrink-0 ${active ? "text-[#A63D13] dark:text-white dark:[filter:brightness(0)_invert(1)]" : "text-white/80 group-hover:text-white"}`}>{icon}</div>
        <span className={`text-[14px] font-bold ${active ? "text-[#A63D13] dark:text-white" : "text-white"}`}>
          {label}
        </span>
      </div>
    </Link>
  );
}
