'use client';

import { usePermissionsContext } from '../context/PermissionsContext';

export default function usePermissions() {
    const context = usePermissionsContext();

    return {
        permissions: context.permissions,
        loading: context.loading,
        hasPermission: context.hasPermission,
        canRead: context.hasPermission('read'),
        canWrite: context.hasPermission('write'),
        canEdit: context.hasPermission('edit'),
        canDelete: context.hasPermission('delete'),
        canSeeMRP: context.permissions?.mrp || context.permissions?.isSuper || false,
        isSuper: context.permissions?.isSuper || false,
        refresh: context.refresh
    };
}
