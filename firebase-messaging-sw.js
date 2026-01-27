// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase Config (public key'ler, güvenli)
firebase.initializeApp({
  apiKey: "AIzaSyDGst4vJBXSbHdc-lctzWSUok4wB85qAaM",
  authDomain: "anonymous-crush-6b73e.firebaseapp.com",
  projectId: "anonymous-crush-6b73e",
  storageBucket: "anonymous-crush-6b73e.firebasestorage.app",
  messagingSenderId: "648941043828",
  appId: "1:648941043828:web:3ef1cd1bd5652e9f2fa0d7",
  measurementId: "G-2E41N0KJDY"
});

const messaging = firebase.messaging();

// Background notification handler
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification.title || '💭 Ask Secretly';
  const notificationOptions = {
    body: payload.notification.body || 'Yeni bildirim',
    icon: 'https://i.imgur.com/vfKAzjc.png',
    badge: 'https://i.imgur.com/vfKAzjc.png',
    data: payload.data,
    requireInteraction: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/ask-secretly.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Açık bir pencere varsa ona odaklan
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('hiddencrushbot.com') && 'focus' in client) {
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
