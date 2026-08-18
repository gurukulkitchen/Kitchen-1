import { logActivity } from './logActivity';

/**
 * Middleware helper to log API activities.
 * Extracts IP, User Agent, Method, and Route from the request.
 * 
 * @param {Request} req - The Next.js Request object.
 * @param {Object} user - The user object (must contain userId/_id and companyId).
 * @param {String} action - The action name (e.g., 'STAFF_CREATE').
 * @param {Object} details - Optional details about the activity.
 */
export async function activityMiddleware(req, user, action, details = {}) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '';
        const userAgent = req.headers.get('user-agent') || '';
        const method = req.method;
        const route = req.url;

        // Handle different user ID properties (some parts of app use .id, some .userId, some ._id)
        const userId = user.userId || user.id || user._id;

        // Handle company ID (could be string or object if populated)
        const companyId = user.companyId?._id || user.companyId;

        await logActivity(
            userId,
            companyId,
            action,
            details,
            ip,
            userAgent,
            method,
            route
        );
    } catch (error) {
        console.error('Activity Middleware Error:', error);
    }
}
