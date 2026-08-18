import admin from './firebase';

/**
 * Sends a notification to multiple FCM tokens.
 * @param {string[]} tokens - Array of FCM tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Optional data payload.
 */
export async function sendNotifications(tokens, title, body, data = {}) {
    if (!tokens || tokens.length === 0) return;

    // Filter out empty tokens
    const validTokens = tokens.filter(token => token && token.trim() !== '');
    if (validTokens.length === 0) return;

    if (!admin.apps.length) {
        console.warn('Firebase Admin not initialized. Skipping notification.');
        return;
    }

    const message = {
        notification: {
            title,
            body,
        },
        data: {
            ...data,
            click_action: 'FLUTTER_NOTIFICATION_CLICK', // Common for mobile apps
        },
        tokens: validTokens,
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} notifications; ${response.failureCount} failed.`);

        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`Token ${validTokens[idx]} failed with error: ${resp.error.message}`);
                }
            });
        }
    } catch (error) {
        console.error('Error sending multicast message:', error);
    }
}
