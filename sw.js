let staticCache = 'portfolio-v5'; // створення назви кешу
let dynamicCache = "d-app-v5";
let assets = [ // створення списку з файлів, які будуть кешуватися
	"/",
	"/manifest.json",
	"/img/android-icon-192x192.png",
	"/img/android-icon-144x144.png",
	"/img/apple-icon-120x120.png",
	"/img/apple-icon-180x180.png",
	"/index.html",
	"/offline.html",
	"/bundle.js",
	"/soundclick.js"
];


self.addEventListener("install", async e => { // інсталцяція server worker
	let cache = await caches.open(staticCache); // відкриваємо наш кеш
	await cache.addAll(assets); // записуємо нові файли у наш кеш
});

self.addEventListener("activate", async e => { // активація server worker
	let cache = await caches.keys(); // беремо всі кеші, які є на сайті

	await Promise.all( // чекаємо, коли кожеш кеш завантажиться
		cache // беремо ці кеші списком
			.filter(cache_name => cache_name != staticCache) // створюємо список із кешів, які застралі
			.filter(cache_name => cache_name != dynamicCache)
			.map(cache_data => caches.delete(cache_data)) // видаляємо застарілі кеші по черзі
	);
});


self.addEventListener("fetch", e => { // робимо запит на наш server worker (ось тут більшість коду та логіки буде створюватися)

	e.respondWith(checkCache(e.request));

	// e.respondWith(caches.match(e.request)); // робимо так, щоб наш сайт завантажувався з кешу, який ми знайшли по запуту
});


async function checkCache(request) {
	const cache = await caches.match(request);
	return cache ?? checkOnline(request);
};

async function checkOnline(request) {
	const cache = await caches.open(dynamicCache)

	try {
		const res = await fetch(request)
		await cache.put(request, res.clone())
		return res
	}
	catch (e) {
		const cachedRes = await cache.match(request);

		if (cachedRes) {
			return cachedRes;
		} else {
			return caches.match('./offline.html');
		}

	}
}