'use client';

import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter(); // Initialize router
    const [showLayout, setShowLayout] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        // Check for authentication
        const checkAuth = () => {
            const isPublicPage = pathname === '/login' || pathname === '/register';

            if (isPublicPage) {
                setShowLayout(false);
                return;
            }

            setShowLayout(true);

            // Check localStorage
            const localToken = localStorage.getItem('token');
            const localExpireToken = localStorage.getItem('expire_token');

            // Check cookies
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
            };

            const cookieToken = getCookie('token');
            const cookieExpireToken = getCookie('expire_token');

            if (!localToken && !localExpireToken && !cookieToken && !cookieExpireToken) {
                router.push('/login');
            }
        };

        checkAuth();

        // Automatic Logout Check
        const checkTimeRestriction = () => {
            const loginStartTime = localStorage.getItem('loginStartTime');
            const loginEndTime = localStorage.getItem('loginEndTime');

            if (loginStartTime && loginEndTime) {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Kolkata',
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const parts = formatter.formatToParts(now);
                const hour = parts.find(p => p.type === 'hour')?.value;
                const minute = parts.find(p => p.type === 'minute')?.value;
                const currentTime = `${hour}:${minute}`;

                if (currentTime < loginStartTime || currentTime > loginEndTime) {
                    alert('Login time window expired. You are being logged out.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('companyName');
                    localStorage.removeItem('loginStartTime');
                    localStorage.removeItem('loginEndTime');
                    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    router.push('/login');
                }
            }
        };

        const intervalId = setInterval(checkTimeRestriction, 60000); // Check every minute
        checkTimeRestriction(); // Initial check

        return () => clearInterval(intervalId);
    }, [pathname, router]);

    if (!showLayout) {
        return <>{children}</>;
    }

    return (
        <div
            className="flex min-h-screen md:h-screen overflow-x-hidden"
            style={{
                backgroundImage: "url('/uploads/VEG%20BG.png')",
                backgroundSize: 'auto',
                backgroundRepeat: 'repeat',
                backgroundAttachment: 'local',
            }}
        >
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div className={`main-content-wrapper flex-1 min-w-0 flex flex-col overflow-y-auto transition-all duration-300`}>
                <Navbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
