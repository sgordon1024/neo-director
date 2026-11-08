const CACHE='neo-director-recognition-v4';
const ASSETS=["./", "./index.html", "./studio.html", "./project.html", "./timeline.css", "./timeline.js", "./style.css", "./app.js", "./director.js", "./route.js", "./status.json", "./foundation.html", "./director.html", "./perception.html", "./validation.html", "./campsite.html", "./van.html"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||new Response('Unavailable offline',{status:503}))));});
