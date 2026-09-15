// This file must be placed in the root directory of your website.
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// MUST match the keys from your Firebase Console
firebase.initializeApp({
    apiKey: "AIzaSyAyJBfc41qnxalYuBFtKnjW3ba7qfVdWK0",
    projectId: "dermaai-4dd3d",
    messagingSenderId: "728359598941",
    appId: "1:728359598941:web:fc2eb29642628196a506b4"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background push:', payload);

    const notificationTitle = payload.notification.title || 'DermaAI Alert';
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico', // Replace with path to your actual app logo
        badge: '/favicon.ico',
        data: payload.data || {}
    };

    // This triggers the Native OS (Windows/Mac/iOS/Android) Push Notification banner
    self.registration.showNotification(notificationTitle, notificationOptions);
});