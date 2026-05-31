// ============================================
//  KEBET — Firebase Cloud Messaging Service Worker
//  Place this file at the ROOT of your web project
//  (same folder as index.html, dashboard-owner.html, etc.)
// ============================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAuR0ccqos7BFAEXRFMfKp18LtLkmsogF8",
  authDomain: "kebet-6a12b.firebaseapp.com",
  projectId: "kebet-6a12b",
  storageBucket: "kebet-6a12b.firebasestorage.app",
  messagingSenderId: "1098491917554",
  appId: "1:1098491917554:web:94c535d8f52fd3f4d98c6b"
});

const messaging = firebase.messaging();

// Handle background messages (app not in foreground)
messaging.onBackgroundMessage(function(payload) {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Kebet ከቤት', {
    body: body || '',
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.type || 'kebet-notification',
    data: payload.data || {}
  });
});

// Notification click → open the right page
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const type = event.notification.data?.type;
  let url = '/dashboard-owner.html';
  if (type === 'booking')    url = '/dashboard-worker.html';
  if (type === 'accepted')   url = '/dashboard-owner.html';
  if (type === 'contract')   url = '/contract.html';
  if (type === 'message')    url = '/messages.html';
  if (type === 'payment')    url = '/payments.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
