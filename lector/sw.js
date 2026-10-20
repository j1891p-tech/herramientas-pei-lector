// Lector PEI · funciona sin conexión después de la primera carga
const CACHE='lector-pei-v6';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./vendor/xlsx.full.min.js','./vendor/jspdf.umd.min.js','./vendor/jspdf.plugin.autotable.min.js','./vendor/pdf.min.js','./vendor/pdf.worker.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // la app: primero red (para recibir actualizaciones), si no hay red, la copia guardada
  if(u.origin===location.origin){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put(e.request,c));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));return}
  // la nube (Google Apps Script) nunca se guarda en caché
});
