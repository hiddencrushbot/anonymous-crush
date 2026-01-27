// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Config decode helper
function _0x(s) { return atob(s); }

// Firebase config (encoded)
const firebaseConfig = {
    apiKey: _0x('QUl6YVN5RGFrSGJHQ2RPTXJST3R3RjY3R0pLLUJyandPeGplNkpv'),
    authDomain: _0x('YXNrLWRpcmVjdGx5LmZpcmViYXNlYXBwLmNvbQ=='),
    projectId: _0x('YXNrLWRpcmVjdGx5'),
    storageBucket: _0x('YXNrLWRpcmVjdGx5LmZpcmViYXNlc3RvcmFnZS5hcHA='),
    messagingSenderId: _0x('NzIzODY0NTg1NjQ3'),
    appId: _0x('MTo3MjM4NjQ1ODU2NDc6d2ViOjliZGVmMGUzZjUwNGU2MmM2ODFiNWE=')
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
