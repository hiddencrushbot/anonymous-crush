// Firebase Messaging Service Worker
// Firebase config artık environment variables'dan gelecek

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config'i API'den al (güvenli)
async function initializeFirebase() {
    try {
        const response = await fetch('/.netlify/functions/get-firebase-config');
        const config = await response.json();
        
        firebase.initializeApp(config);
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
    } catch (error) {
        console.error('Firebase init error in SW:', error);
    }
}

// Initialize
initializeFirebase();

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();
    
    // Open the app
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});
