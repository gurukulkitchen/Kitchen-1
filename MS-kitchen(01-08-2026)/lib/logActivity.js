import ActivityLog from '@/models/ActivityLog';
import dbConnect from '@/lib/db';

/**
 * Logs a user activity.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} companyId - The ID of the company the user belongs to.
 * @param {string} action - Describe the action (e.g., 'LOGIN', 'CREATE_INVOICE').
 * @param {object} details - Optional details about the action.
 * @param {string} ipAddress - Optional IP address.
 * @param {string} userAgent - Optional User Agent string.
 * @param {string} method - HTTP Method (GET, POST, etc.)
 * @param {string} route - API Route accessed
 */
export async function logActivity(userId, companyId, action, details = {}, ipAddress = '', userAgent = '', method = '', route = '') {
    try {
        await dbConnect();

        const log = new ActivityLog({
            user: userId,
            company: companyId,
            action,
            details,
            ipAddress,
            userAgent,
            method,
            route
        });

        await log.save();
        console.log(`Activity logged: ${action} by user ${userId} [${method} ${route}]`);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
