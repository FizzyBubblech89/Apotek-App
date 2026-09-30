/* ============================================================
   Service worker för pushnotiser — Apoteks App.
   Läggs i SAMMA MAPP som apotek-app-supabase.html (samma origin +
   samma katalog = scope). Gör i övrigt ingenting (ingen caching/
   offline-stöd) — bara pushnotiser.
   ============================================================ */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "Apoteks App", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Apoteks App";
  const options = {
    body: data.body || "",
    icon: data.icon || "icon-192.png",
    badge: data.badge || "icon-192.png",
    tag: data.tag || undefined,
    data: { url: data.url || "./" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        // Finns appen redan öppen i en flik — fokusera den istället för
        // att öppna en ny.
        if ("focus" in client) {
          client.focus();
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
