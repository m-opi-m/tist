// Service Worker for MahWAY
const CACHE_NAME = 'mahway-v1.0.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/about.html',
    '/services.html',
    '/payment.html',
    '/contact.html',
    '/faq.html',
    '/request-form.html',
    '/css/style.css',
    '/css/responsive.css',
    '/js/main.js',
    '/js/form-validation.js',
    '/images/logo.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip Chrome extensions
    if (event.request.url.startsWith('chrome-extension://')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                // Make network request
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache the new response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // If offline and request is for a page, return offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        
                        // For other requests, return fallback
                        return new Response('عذراً، أنت غير متصل بالإنترنت', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain; charset=utf-8'
                            })
                        });
                    });
            })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncForms());
    }
});

async function syncForms() {
    const db = await openFormDatabase();
    const forms = await db.getAll('pending-forms');
    
    for (const form of forms) {
        try {
            const response = await fetch(form.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form.data)
            });
            
            if (response.ok) {
                await db.delete('pending-forms', form.id);
                console.log('Form synced successfully:', form.id);
            }
        } catch (error) {
            console.error('Failed to sync form:', error);
        }
    }
}

function openFormDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MahWAYForms', 1);
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pending-forms')) {
                db.createObjectStore('pending-forms', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onerror = event => {
            reject(event.target.error);
        };
    });
}

// Push notifications
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'view',
                title: 'عرض'
            },
            {
                action: 'close',
                title: 'إغلاق'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
});

// Periodic sync for updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const updatedAssets = ASSETS_TO_CACHE.filter(url => 
            !url.startsWith('http') || url.includes('mahway.com')
        );
        
        for (const url of updatedAssets) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                }
            } catch (error) {
                console.error('Failed to update:', url, error);
            }
        }
        
        console.log('Content updated successfully');
    } catch (error) {
        console.error('Periodic sync failed:', error);
    }
}