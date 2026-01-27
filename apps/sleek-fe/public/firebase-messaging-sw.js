self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
	apiKey: "AIzaSyC7n7svNE0bZKqI5oLubUbFNL25oXKOJN4",
	authDomain: "civia-ad50a.firebaseapp.com",
	projectId: "civia-ad50a",
	storageBucket: "civia-ad50a.firebasestorage.app",
	messagingSenderId: "654111367063",
	appId: "1:654111367063:web:bf1a1544339f30624deed2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	const title = payload?.notification?.title || 'New message';
	const options = {
		body: payload?.notification?.body || 'You have a new message',
		icon: '/logo.png',
		data: payload?.data || {},
	};
	self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const data = event.notification.data || {};
	const params = new URLSearchParams();
	if (data.productId) params.set('productId', data.productId);
	if (data.sellerId) params.set('sellerId', data.sellerId);
	if (data.buyerId) params.set('buyerId', data.buyerId);
	const url = `/chat?${params.toString()}`;

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if ('focus' in client) {
					client.navigate(url);
					return client.focus();
				}
			}
			if (self.clients.openWindow) {
				return self.clients.openWindow(url);
			}
		})
	);
});