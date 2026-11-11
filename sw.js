// Riff Studio — guarda a app no computador para abrir mais depressa e sem internet
const CACHE='riff-studio-v1.0';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url), same=u.origin===location.origin;
  if(same&&(r.mode==='navigate'||u.pathname.endsWith('/index.html'))){ // página: primeiro a internet, senão a cópia guardada
    e.respondWith(fetch(r).then(res=>{const c=res.clone(); caches.open(CACHE).then(x=>x.put(r,c)); return res;}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html')))); return;}
  // sons, modelos, bibliotecas e letras: usa a cópia guardada e atualiza por trás
  e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone()); return res;}).catch(()=>m); return m||net;})));
});
