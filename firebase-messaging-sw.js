// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ⬇️ BU KISIM DEĞİŞTİ - FETCH YOK, DİREKT CONFIG ⬇️
firebase.initializeApp({
  apiKey: "AIzaSyDGst4vJBXSbHdc-lctzWSUok4wB85qAaM",
  authDomain: "anonymous-crush-6b73e.firebaseapp.com",
  projectId: "anonymous-crush-6b73e",
  storageBucket: "anonymous-crush-6b73e.firebasestorage.app",
  messagingSenderId: "648941043828",
  appId: "1:648941043828:web:3ef1cd1bd5652e9f2fa0d7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || '💭 Yeni Soru!';
  const notificationOptions = {
    body: payload.notification?.body || 'Yeni bildirim',
    icon: 'https://i.imgur.com/vfKAzjc.png',
    badge: 'https://i.imgur.com/vfKAzjc.png',
    tag: 'ask-secretly',
    requireInteraction: true,
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/ask-secretly.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url.includes('hiddencrushbot.com') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
