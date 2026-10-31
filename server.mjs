import http from 'node:http';
import {readdir, readFile} from 'node:fs/promises';
import {resolve, relative, extname, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {brotliCompressSync, gzipSync, constants as zlib} from 'node:zlib';

const root = resolve('public');
const port = Number(process.env.PORT) || 8080;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};
const compressible = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.txt', '.xml', '.svg', '.ico']);
// HTML, CSS und JS werden bei jedem Aufruf per ETag geprüft, damit ein neues Deployment sofort ankommt.
const revalidate = new Set(['.html', '.css', '.js', '.webmanifest', '.txt', '.xml']);

const security = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes: true});
  const files = await Promise.all(entries.map(entry => {
    const full = resolve(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return files.flat();
}

// Die Website ist klein und unveränderlich im Image: alles einmal laden und vorkomprimieren.
const files = new Map();
for (const file of await walk(root)) {
  const ext = extname(file);
  if (!types[ext]) continue;
  const body = await readFile(file);
  const entry = {
    body,
    type: types[ext],
    etag: '"' + createHash('sha1').update(body).digest('base64url').slice(0, 22) + '"',
    cache: revalidate.has(ext) ? 'no-cache' : 'public, max-age=604800, stale-while-revalidate=86400'
  };
  if (compressible.has(ext) && body.length > 512) {
    entry.br = brotliCompressSync(body, {params: {[zlib.BROTLI_PARAM_QUALITY]: 11}});
    entry.gzip = gzipSync(body, {level: 9});
  }
  files.set('/' + relative(root, file).split(sep).join('/'), entry);
}
const notFound = files.get('/404.html');

function send(req, res, entry, status = 200) {
  const headers = {...security, 'Content-Type': entry.type, 'Cache-Control': status === 200 ? entry.cache : 'no-cache', Vary: 'Accept-Encoding'};
  if (status === 200) {
    headers.ETag = entry.etag;
    const match = req.headers['if-none-match'];
    if (match && match.split(',').some(tag => tag.trim().replace(/^W\//, '') === entry.etag)) {
      res.writeHead(304, headers);
      return res.end();
    }
  }
  const accept = req.headers['accept-encoding'] || '';
  let body = entry.body;
  if (entry.br && /\bbr\b/.test(accept)) { body = entry.br; headers['Content-Encoding'] = 'br'; }
  else if (entry.gzip && /\bgzip\b/.test(accept)) { body = entry.gzip; headers['Content-Encoding'] = 'gzip'; }
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {...security, Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8'});
    return res.end('Methode nicht erlaubt');
  }
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400, security); return res.end(); }
  if (path === '/healthz') { res.writeHead(200, {'Content-Type': 'text/plain', 'Cache-Control': 'no-store'}); return res.end('ok'); }
  if (path === '/index.html') { res.writeHead(301, {...security, Location: '/'}); return res.end(); }
  const entry = files.get(path === '/' ? '/index.html' : path);
  if (entry && path !== '/404.html') return send(req, res, entry);
  if (notFound) return send(req, res, notFound, 404);
  res.writeHead(404, security);
  res.end();
});
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;
server.requestTimeout = 30_000;
server.listen(port, '0.0.0.0', () => console.log(`FC Besa 05: ${files.size} Dateien geladen, http://localhost:${port}`));

function shutdown(signal) {
  console.log(`${signal} empfangen, beende Server`);
  server.close(() => process.exit(0));
  server.closeIdleConnections();
  setTimeout(() => process.exit(0), 5000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
