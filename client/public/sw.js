// Retire a service worker left by an earlier website version. V1 is served online
// so cached HTML and client bundles cannot disagree after a deployment.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) await caches.delete(name);
      await self.registration.unregister();
      const pages = await self.clients.matchAll({ type: "window" });
      for (const page of pages) await page.navigate(page.url);
    })(),
  );
});
