// POST /api/recipe  {vegIds:[...], extra?:"<=60 chars", lang:"zh"|"en"}
//   200 {recipe:{title,time_min,ingredients[],steps[],tip}}   AI answer, validated
//   200 {fallback:true}   AI not configured, daily cap reached, timeout, or invalid answer:
//                         the page shows its built-in "Offline suggestion"
//   429 {fallback:true}   more than 5 requests from this IP in 10 minutes
//   400 / 403 / 405       bad body / origin not allowed / wrong method
// Nothing is stored and no personal data is logged (only an outcome code).
import { buildMessages, createLimiter, originAllowed, parseRecipe, validateBody } from './_lib/core.js';
import { callModel, providerConfigured } from './_lib/provider.js';

const limiter = createLimiter({ dailyCap: Number.parseInt(process.env.DAILY_CAP, 10) || 300 });

function log(outcome) {
  console.log(JSON.stringify({ route: 'recipe', outcome }));
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || String(req.headers['x-real-ip'] || '') || req.socket?.remoteAddress || 'unknown';
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body; // Vercel parsed it
  let raw = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString('utf8') : null;
  if (raw === null) {
    if (typeof req[Symbol.asyncIterator] !== 'function') return null;
    raw = '';
    for await (const chunk of req) { raw += chunk; if (raw.length > 4096) return null; }
  }
  if (raw.length > 4096) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (!originAllowed(origin, req.headers.host, process.env.ALLOWED_ORIGIN)) {
    log('origin_blocked');
    return res.status(403).json({ error: 'origin' });
  }
  if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

  const parsed = validateBody(await readJson(req));
  if (!parsed.ok) { log('bad_request'); return res.status(400).json({ error: 'bad_request' }); }

  if (!limiter.allowIp(clientIp(req))) { log('rate_limited'); return res.status(429).json({ fallback: true }); }
  if (!providerConfigured()) { log('not_configured'); return res.status(200).json({ fallback: true }); }
  if (!limiter.takeDaily()) { log('daily_cap'); return res.status(200).json({ fallback: true }); }

  try {
    const text = await callModel(buildMessages(parsed.value));
    const recipe = parseRecipe(text, parsed.value.lang);
    if (!recipe) { log('invalid_answer'); return res.status(200).json({ fallback: true }); }
    log('ok');
    return res.status(200).json({ recipe });
  } catch (e) {
    log(e.code || 'error');
    return res.status(200).json({ fallback: true });
  }
}
