const CACHE_PREFIX='joju-study:'+self.registration.scope+':';
const CACHE=CACHE_PREFIX+'20261107-v14';
const ASSETS=['./','./index.html','./styles.css','./data.js','./core.js','./art.js','./app.js','./offline.js','./icon.svg','./manifest.webmanifest','./fonts/PretendardVariable.woff2','./memory.html','./memory.css','./memory.js','./memory-quiz.js','./memory-drill.js','./memory-drill.css','./memory-catalog.js','./memory-expansion.css','./fonts/KNPSKkomi.otf','./memory-notes.css'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin||url.pathname.startsWith('/__'))return;
 event.respondWith(fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;
 }).catch(async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(event.request,{ignoreSearch:true});if(hit)return hit;if(event.request.mode==='navigate'){const page=await cache.match(new URL('./index.html',self.registration.scope).href);if(page)return page;}return Response.error();}));
});
