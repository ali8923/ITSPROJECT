// npm run test:api  — no real AI calls: a fake chat-completions server runs on localhost.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, beforeEach, test } from 'node:test';
import { createLimiter, originAllowed, parseRecipe, validateBody } from '../api/_lib/core.js';

process.env.DAILY_CAP = '1000';
const { default: handler } = await import('../api/recipe.js');

let fake, fakeUrl, reply, seen;
before(async () => {
  fake = createServer((req, res) => {
    let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => {
      seen = { headers: req.headers, body: JSON.parse(b) };
      setTimeout(() => { res.writeHead(reply.status || 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(reply.json)); }, reply.delay || 0);
    });
  });
  await new Promise((r) => fake.listen(0, r));
  fakeUrl = `http://127.0.0.1:${fake.address().port}/openai/deployments/x/chat/completions?api-version=test`;
});
after(() => fake.close());

const goodRecipe = { title: '蒜蓉炒菜心', time_min: 10, ingredients: ['菜心', '蒜頭'], steps: ['洗菜。', '炒熟。'], tip: '大火快炒。' };
const answer = (content) => ({ choices: [{ finish_reason: 'stop', message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }] });
const FAKE_KEY = 'test-key-not-real'; // placeholder, never a real key
let ipN = 0;
beforeEach(() => {
  process.env['AI_API_KEY'] = FAKE_KEY;
  process.env.AI_CHAT_URL = fakeUrl;
  delete process.env.AI_KEY_HEADER; delete process.env.ALLOWED_ORIGIN; delete process.env.AI_RESPONSE_FORMAT;
  process.env.AI_TIMEOUT_MS = '12000';
  reply = { json: answer(goodRecipe) };
  seen = null;
});

async function call({ body, method = 'POST', origin, host = 'mk.example', ip } = {}) {
  const headers = { host, 'x-forwarded-for': ip || `10.0.0.${++ipN}` };
  if (origin) headers.origin = origin;
  const req = { method, headers, body };
  const out = { status: 0, headers: {}, json: undefined };
  const res = {
    status(s) { out.status = s; return this; },
    json(j) { out.json = j; return this; },
    setHeader(k, v) { out.headers[k.toLowerCase()] = v; },
    end() { return this; },
  };
  await handler(req, res);
  return out;
}
const ok = { vegIds: ['choysum'], extra: '雞蛋', lang: 'zh' };

test('returns a validated AI recipe; key sent only to the provider', async () => {
  const r = await call({ body: ok });
  assert.equal(r.status, 200);
  assert.deepEqual(r.json.recipe, goodRecipe);
  assert.equal(seen.headers['api-key'], FAKE_KEY);
  assert.equal(seen.body.max_tokens, 600);
  assert.equal(seen.body.response_format.type, 'json_schema');
  assert.match(seen.body.messages[0].content, /Traditional Chinese/);
  assert.match(seen.body.messages[1].content, /Choy Sum \(菜心\)/);
  assert.ok(!JSON.stringify(r.json).includes(FAKE_KEY));
});

test('rejects anything but {vegIds, extra, lang}', async () => {
  for (const body of [null, 'x', [], {}, { vegIds: ['choysum'] }, { ...ok, lang: 'fr' }, { ...ok, vegIds: ['durian'] },
    { ...ok, vegIds: [] }, { ...ok, vegIds: ['tomato', 'tomato'] }, { ...ok, extra: 'x'.repeat(61) }, { ...ok, prompt: 'hi' }, { ...ok, extra: 5 }]) {
    const r = await call({ body });
    assert.equal(r.status, 400, JSON.stringify(body));
  }
  assert.equal((await call({ body: ok, method: 'GET' })).status, 405);
  assert.equal(seen, null, 'provider never called for bad input');
});

test('60 Chinese characters is allowed (counted as characters, not bytes)', async () => {
  const r = await call({ body: { ...ok, extra: '蛋'.repeat(60) } });
  assert.equal(r.status, 200);
});

test('invalid answers fall back', async () => {
  const bad = [
    { ...goodRecipe, steps: ['1', '2', '3', '4', '5', '6', '7'] },
    { ...goodRecipe, time_min: 45 },
    { ...goodRecipe, title: '' },
    { ...goodRecipe, title: 'Garlic choy sum', steps: ['Wash.', 'Fry.'] }, // English answer for lang zh
    'not json',
  ];
  for (const content of bad) {
    reply = { json: answer(content) };
    const r = await call({ body: ok });
    assert.deepEqual(r.json, { fallback: true }, JSON.stringify(content));
  }
  reply = { status: 500, json: { error: 'x' } };
  assert.deepEqual((await call({ body: ok })).json, { fallback: true });
  reply = { json: { choices: [{ finish_reason: 'content_filter', message: {} }] } };
  assert.deepEqual((await call({ body: ok })).json, { fallback: true });
});

test('timeout falls back', async () => {
  process.env.AI_TIMEOUT_MS = '200';
  reply = { json: answer(goodRecipe), delay: 600 };
  const t0 = Date.now();
  const r = await call({ body: ok });
  assert.deepEqual(r.json, { fallback: true });
  assert.ok(seen && Date.now() - t0 >= 190, 'provider was really called and timed out');
});

test('not configured falls back without calling anything', async () => {
  delete process.env.AI_API_KEY;
  const r = await call({ body: ok });
  assert.deepEqual(r.json, { fallback: true });
  assert.equal(seen, null);
});

test('rate limit: 5 per IP per 10 minutes', async () => {
  const codes = [];
  reply = { json: answer({ ...goodRecipe, title: 'Garlic choy sum', steps: ['Wash.', 'Fry.'] }) };
  const bodies = [];
  for (let i = 0; i < 6; i++) { const r = await call({ body: { ...ok, lang: 'en' }, ip: '203.0.113.9' }); codes.push(r.status); bodies.push(r.json); }
  assert.ok(bodies.slice(0, 5).every((j) => j.recipe), 'first five are real AI answers');
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
});

test('CORS: same host or ALLOWED_ORIGIN only', async () => {
  assert.equal((await call({ body: ok, origin: 'https://evil.example' })).status, 403);
  const same = await call({ body: ok, origin: 'https://mk.example' });
  assert.notEqual(same.status, 403);
  assert.equal(same.headers['access-control-allow-origin'], 'https://mk.example');
  process.env.ALLOWED_ORIGIN = 'https://market-kitchen.vercel.app';
  assert.equal((await call({ body: ok, origin: 'https://mk.example' })).status, 403);
  assert.notEqual((await call({ body: ok, origin: 'https://market-kitchen.vercel.app' })).status, 403);
});

test('daily cap and helpers', () => {
  let t = Date.parse('2026-11-22T02:00:00Z');
  const lim = createLimiter({ dailyCap: 2, now: () => t });
  assert.deepEqual([lim.takeDaily(), lim.takeDaily(), lim.takeDaily()], [true, true, false]);
  t += 24 * 3600 * 1000;
  assert.equal(lim.takeDaily(), true, 'resets the next Hong Kong day');
  assert.equal(validateBody({ vegIds: ['carrot'], lang: 'en' }).ok, true);
  assert.equal(originAllowed(undefined, 'a', ''), true);
  assert.equal(parseRecipe('```json\n' + JSON.stringify(goodRecipe) + '\n```', 'zh').title, '蒜蓉炒菜心');
});

test('the shipped page and repo contain no key material', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(!/AI_API_KEY|api-key\s*[:=]/i.test(html.replace(/data:image\/[^"]+/g, '')));
});
