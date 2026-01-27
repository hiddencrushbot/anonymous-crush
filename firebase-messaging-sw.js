// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config (base64 decoded)
const firebaseConfig = {
    apiKey: "AIzaSyDakHbGCdOMrROtwF67GJK-BrjwOxje6Jo",
    authDomain: "ask-directly.firebaseapp.com",
    projectId: "ask-directly",
    storageBucket: "ask-directly.firebasestorage.app",
    messagingSenderId: "723864585647",
    appId: "1:723864585647:web:9bdef0e3f504e62c681b5a"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    
    const notificationTitle = payload.notification.title || '💭 Ask Secretly';
    const notificationOptions = {
        body: payload.notification.body || 'Yeni bir bildiriminiz var',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();
    
    // Open the app
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});
