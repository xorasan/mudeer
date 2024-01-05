var dataCacheName = 'def-vBUILDNUMBER';
var cacheName = 'def';
var filesToCache = [
	'/',
	'/manifest.json',
	'/e.png',
	'/index.html',
	'/a.js',
];

self.addEventListener('install', function(e) {
//	console.log('sw install');
	console.log('sw BUILDNUMBER');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
//			console.log('sw caches.open');
			return cache.addAll(filesToCache);
		}).then(function () {
//			console.log('sw skipWaiting');
			return self.skipWaiting();
		})
	);
});

self.addEventListener('activate', function(e) {
//	console.log('sw activate');
	e.waitUntil(
		caches.keys().then(function(keyList) {
//			console.log('sw caches.keys');
			self.clients.matchAll().then(function (clients) {
				clients.forEach(function (client) {
					client.postMessage(BUILDNUMBER);
				});
			});
			return Promise.all(keyList.map(function(key) {
				if (key !== cacheName && key !== dataCacheName) {
//					console.log('swjs removing old cache ', key);
					return caches.delete(key);
				}
			}));
		})
	);
	/*
	 * Fixes a corner case in which the app wasn't returning the latest data.
	 * You can reproduce the corner case by commenting out the line below and
	 * then doing the following steps: 1) load app for first time so that the
	 * initial New York City data is shown 2) press the refresh button on the
	 * app 3) go offline 4) reload the app. You expect to see the newer NYC
	 * data, but you actually see the initial data. This happens because the
	 * service worker is not yet activated. The code below essentially lets
	 * you activate the service worker faster.
	 */
//	console.log('sw clients.claim');
	return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
//	console.log( e.request.method );
	if (e.request.method === 'POST')
		return;
	
	/*
	 * always get these files from the server, no interceptions
	 * */
	var fulluri = new URL(e.request.url);
	/*
	 * never cache or intercept requests to other hosts
	 * */
	if (self.location.host !== fulluri.host)
		return;

	var pathname = fulluri.pathname;
	
	if (
		pathname.startsWith('/uploads/')
	||	pathname.startsWith('/_.js')
	||	pathname.startsWith('/qr.js')
	)
		return;
	else {
		if (
			!pathname.startsWith('/manifest.json')
		&&	!pathname.startsWith('/a.js')
		&&	!pathname.startsWith('/e.png')
		) {
			pathname = '/';
		}
		e.respondWith(
			caches.match(pathname).then(function(response) {
				return response || fetch(e.request).then(function (response) {
					return response;
				}, function () {
					return new Response('', {
						status: 502,
					});
				});
			})
		);
	}
		

});
