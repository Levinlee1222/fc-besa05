import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{
  try {
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(path==='/'?'/index.html':path));
    if(!file.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden');}
    const content=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(content);
  }catch {res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<html lang="de"><title>FC Besa 05 · Nicht gefunden</title><body style="background:#181818;color:white;font-family:system-ui;padding:10%"><h1>Hier ist kein Ball im Spiel.</h1><p>Diese Seite wurde nicht gefunden.</p><a style="color:#ff6571" href="/">Zur Startseite</a></body></html>');}
}).listen(Number(process.env.PORT)||8080,'0.0.0.0',()=>console.log('FC Besa 05: http://localhost:'+(process.env.PORT||8080)));

