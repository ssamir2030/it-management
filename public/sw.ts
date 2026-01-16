/// <reference lib="webworker" />

const CACHE_NAME = 'it-portal-v1';
const OFFLINE_URL = '/portal/offline';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
    '/portal',
    '/portal/login',
    '/manifest.json',
    '/favicon.png',
];

// API routes التي لا يجب تخزينها
const API_ROUTES = [
    '/api/',
    '/_next/webpack-hmr',
];

declare const self: ServiceWorkerGlobalScope;

// تثبيت Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            // تخزين الصفحات الأساسية
            await cache.addAll(STATIC_ASSETS);
            // تفعيل فوري
            await self.skipWaiting();
        })()
    );
});

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        (async () => {
            // حذف الكاش القديم
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
            // السيطرة على جميع العملاء
            await self.clients.claim();
        })()
    );
});

// استراتيجية الشبكة أولاً مع fallback للكاش
self.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event;
    const url = new URL(request.url);

    // تجاهل طلبات API و non-GET
    if (
        request.method !== 'GET' ||
        API_ROUTES.some((route) => url.pathname.startsWith(route))
    ) {
        return;
    }

    // فقط للصفحات في /portal
    if (!url.pathname.startsWith('/portal')) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                // محاولة الشبكة أولاً
                const networkResponse = await fetch(request);

                // تخزين النسخة الجديدة
                if (networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                // إذا فشلت الشبكة، استخدم الكاش
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // إذا لم يوجد في الكاش، عرض صفحة offline
                if (request.mode === 'navigate') {
                    const offlineResponse = await caches.match(OFFLINE_URL);
                    if (offlineResponse) {
                        return offlineResponse;
                    }
                }

                throw error;
            }
        })()
    );
});

// استقبال رسائل من التطبيق
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Push Notifications
self.addEventListener('push', (event: PushEvent) => {
    if (!event.data) return;

    const data = event.data.json();

    const options: any = {
        body: data.body || 'إشعار جديد',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        dir: 'rtl',
        lang: 'ar',
        tag: data.tag || 'notification',
        data: data.url || '/portal',
        actions: data.actions || [],
        vibrate: [100, 50, 100],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'بوابة الموظفين', options)
    );
});

// التعامل مع النقر على الإشعارات
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    const urlToOpen = event.notification.data || '/portal';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // إذا كان هناك نافذة مفتوحة، استخدمها
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.focus();
                        if ('navigate' in client) {
                            return (client as WindowClient).navigate(urlToOpen);
                        }
                    }
                }
                // إذا لم توجد نافذة، افتح واحدة جديدة
                return self.clients.openWindow(urlToOpen);
            })
    );
});

export { };
