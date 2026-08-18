'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

const PermissionsContext = createContext();

export function PermissionsProvider({ children }) {
    const pathname = usePathname();
    const [permissionsByRoute, setPermissionsByRoute] = useState({});
    const [loadingRoutes, setLoadingRoutes] = useState({});
    const fetchingRef = useRef(new Set());

    const fetchPermissions = useCallback(async (route) => {
        if (fetchingRef.current.has(route)) return;

        fetchingRef.current.add(route);
        setLoadingRoutes(prev => ({ ...prev, [route]: true }));

        try {
            const res = await fetch(`/api/permissions/check?route=${route}`);
            if (res.ok) {
                const data = await res.json();
                setPermissionsByRoute(prev => ({ ...prev, [route]: data }));
            } else {
                setPermissionsByRoute(prev => ({
                    ...prev,
                    [route]: { read: false, write: false, edit: false, delete: false, mrp: false, isSuper: false }
                }));
            }
        } catch (error) {
            console.error(`Error fetching permissions for ${route}:`, error);
            setPermissionsByRoute(prev => ({
                ...prev,
                [route]: { read: false, write: false, edit: false, delete: false, mrp: false, isSuper: false }
            }));
        } finally {
            setLoadingRoutes(prev => ({ ...prev, [route]: false }));
            fetchingRef.current.delete(route);
        }
    }, []);

    useEffect(() => {
        const publicRoutes = ['/login', '/register', '/forgot-password'];

        if (pathname && !publicRoutes.includes(pathname) && !permissionsByRoute[pathname]) {
            fetchPermissions(pathname);
        }
    }, [pathname, fetchPermissions, permissionsByRoute]);

    const getPermissionsForRoute = (route) => {
        return permissionsByRoute[route] || {
            read: false,
            write: false,
            edit: false,
            delete: false,
            mrp: false,
            isSuper: false
        };
    };

    const isRouteLoading = (route) => {
        return loadingRoutes[route] === true;
    };

    const value = {
        permissions: getPermissionsForRoute(pathname),
        loading: isRouteLoading(pathname),
        hasPermission: (action) => {
            const perms = getPermissionsForRoute(pathname);
            if (perms.isSuper) return true;
            return !!perms[action];
        },
        refresh: () => {
            setPermissionsByRoute(prev => {
                const next = { ...prev };
                delete next[pathname];
                return next;
            });
        }
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissionsContext() {
    const context = useContext(PermissionsContext);
    if (context === undefined) {
        throw new Error('usePermissionsContext must be used within a PermissionsProvider');
    }
    return context;
}
