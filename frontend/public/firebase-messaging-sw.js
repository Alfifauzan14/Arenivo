// Arenivo Firebase Cloud Messaging & PWA Service Worker
// Handles background push notifications and PWA caching/lifecycle

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification event listener
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { text: event.data.text() };
    }
  }

  // Support both FCM notification payload and data payload
  const notificationTitle =
    data.notification?.title ||
    data.data?.title ||
    data.title ||
    "Arenivo Booking Lapangan";

  const notificationOptions = {
    body:
      data.notification?.body ||
      data.data?.body ||
      data.body ||
      data.text ||
      "Pembaruan pesanan terbaru di Arenivo.",
    icon: data.notification?.icon || data.data?.icon || "/arenivo-icon-192.png",
    badge: "/favicon.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.data?.url || data.url || "/pesanan",
      timestamp: Date.now()
    },
    tag: data.data?.tag || data.tag || "arenivo-notification",
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Handle notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If an Arenivo tab is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
