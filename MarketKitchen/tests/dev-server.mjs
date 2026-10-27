// Local stand-in for `vercel dev`: serves index.html and runs api/recipe.js with Vercel-style
// req/res helpers. Reads MarketKitchen/.env if present (never printed).
//   node tests/dev-server.mjs            -> http://localhost:3000
//   PORT=3100 node tests/dev-server.mjs
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(ROOT, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const { default: handler } = await import('../api/recipe.js');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg' };

export function start(port = Number(process.env.PORT) || 3000) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/recipe') {
      let raw = '';
      for await (const c of req) { raw += c; if (raw.length > 8192) break; }
      let body = raw;
      if ((req.headers['content-type'] || '').includes('application/json')) { try { body = raw ? JSON.parse(raw) : undefined; } catch { body = raw; } }
      const vreq = { method: req.method, headers: req.headers, body, socket: req.socket };
      const vres = {
        status(s) { res.statusCode = s; return vres; },
        json(j) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(j)); return vres; },
        setHeader(k, v) { res.setHeader(k, v); },
        end(b) { res.end(b); return vres; },
      };
      return handler(vreq, vres);
    }
    const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const file = path.normalize(path.join(ROOT, rel));
    if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); return res.end(); }
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    } catch { res.writeHead(404); res.end('not found'); }
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const s = await start();
  console.log(`Market Kitchen dev server: http://localhost:${s.address().port}`);
  console.log(process.env.AI_API_KEY && process.env.AI_CHAT_URL ? `AI: ${new URL(process.env.AI_CHAT_URL).host}` : 'AI not configured: recipes use the offline suggestion');
}
