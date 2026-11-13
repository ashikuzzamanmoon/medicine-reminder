/// <reference lib="webworker" />
// Service Worker for Medicine Reminder PWA & Push Notifications

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "ওষুধের রিমাইন্ডার";
    const showReminderActions = data.showActions === true || (data.type === "REMINDER" && data.showActions !== false);
    const actions = showReminderActions
      ? [
          { action: "taken", title: "খেয়েছি ✅" },
          { action: "snooze", title: "পরে খাবো ⏰" },
        ]
      : [];

    const options = {
      body: data.body || "আপনার নির্ধারিত ওষুধ খাওয়ার সময় হয়েছে।",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200, 100, 200],
      tag: data.tag || "medicine-reminder",
      renotify: true,
      data: {
        url: data.url || "/reminder",
        speakText: data.speakText || null,
        doseId: data.doseId || null,
      },
      actions,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Push event error:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

