/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// Handles background push notifications
// v2 — added skipWaiting + clients.claim for instant activation

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Activate immediately — don't wait for old SW to die
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Activating...');
  event.waitUntil(clients.claim());
});

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: 'AIzaSyAA5fDwZM72cd3dh7QmmIxpgUI3Jyg7aa0',
  authDomain: 'suncityconnect-83bc5.firebaseapp.com',
  projectId: 'suncityconnect-83bc5',
  storageBucket: 'suncityconnect-83bc5.firebasestorage.app',
  messagingSenderId: '955190417397',
  appId: '1:955190417397:web:790404ca46970d7005b2bc',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'SuncityConnect';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.tag || 'general',
    data: payload.data || {},
    vibrate: [100, 50, 100],
    renotify: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked');
  event.notification.close();

  // Navigate to the app when notification is clicked
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
