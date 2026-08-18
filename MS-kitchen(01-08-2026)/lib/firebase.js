import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
        if (serviceAccount.project_id) {
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized successfully');
        } else {
            console.warn('FIREBASE_SERVICE_ACCOUNT_JSON not found or invalid. Notifications will not be sent.');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
}

export default admin;
