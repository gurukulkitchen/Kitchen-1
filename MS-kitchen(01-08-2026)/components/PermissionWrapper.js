'use client';

import React from 'react';
import usePermissions from '../hooks/usePermissions';

/**
 * PermissionWrapper component
 * 
 * @param {Object} props
 * @param {string} props.action - The permission action required ('read', 'write', 'edit', 'delete')
 * @param {React.ReactNode} props.children - The elements to render if permission is granted
 * @param {React.ReactNode} [props.fallback=null] - Optional fallback to render if permission is denied
 */
export default function PermissionWrapper({ action, children, fallback = null }) {
    const { hasPermission, loading } = usePermissions();

    if (loading) return null; // Or a smaller loader if needed

    if (hasPermission(action)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
