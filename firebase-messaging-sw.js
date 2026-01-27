// Firebase Messaging Service Worker
// Firebase config artık environment variables'dan gelecek

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config'i API'den al (güvenli) - Promise chain kullan!
fetch('/.netlify/functions/get-firebase-config')
    .then(response => {
        if (!response.ok) {
            throw new Error('Firebase config alınamadı');
        }
        return response.json();
    })
    .then(config => {
        // Firebase'i başlat
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
    })
    .catch(error => {
        console.error('Firebase init error in SW:', error);
    });

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/ask-secretly.html';
    
    // Open the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Eğer zaten açık bir pencere varsa, onu kullan
                for (let client of windowClients) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Yoksa yeni pencere aç
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
