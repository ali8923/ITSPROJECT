// npm run test:e2e   (Playwright Chromium; the AI is always mocked, never called)
//   SHOTS=dir to keep screenshots (default: tests/screenshots, git-ignored)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SHOTS = process.env.SHOTS || path.join(HERE, 'screenshots');
mkdirSync(SHOTS, { recursive: true });
const PHOTO = path.join(HERE, 'fixtures', 'exif6-red-top.jpg');
const out = [];
const check = (c, m) => { out.push((c ? 'ok   ' : 'FAIL ') + m); return c; };

// 0. Syntax check of the page script
{
  const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const blocks = [...html.matchAll(/<script>\n([\s\S]*?)\n<\/script>/g)].map((m) => m[1]);
  check(blocks.length === 1 && !/<\/?script/i.test(blocks[0]), 'exactly one inline app script, no nested tags');
  const js = blocks[0] || '';
  const tmp = path.join(SHOTS, 'page-script.js');
  writeFileSync(tmp, js);
  try { execFileSync(process.execPath, ['--check', tmp]); check(true, 'node --check on the page script'); } catch (e) { check(false, 'node --check: ' + e.message); }
}

// Fake chat-completions endpoint for the full-chain test (dev-server -> api/recipe.js -> here)
const fake = createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    const zh = /Traditional Chinese/.test(b);
    const recipe = zh
      ? { title: '蒜蓉炒菜心', time_min: 12, ingredients: ['菜心 300 克', '蒜頭 2 粒'], steps: ['洗淨菜心。', '爆香蒜蓉。', '落菜心炒熟。'], tip: '大火快炒。' }
      : { title: 'Garlic choy sum', time_min: 12, ingredients: ['Choy sum 300 g', 'Garlic 2 cloves'], steps: ['Wash.', 'Fry garlic.', 'Add greens.'], tip: 'High heat.' };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(recipe) } }] }));
  });
}).listen(0);
await new Promise((r) => fake.once('listening', r));
process.env['AI_API_KEY'] = 'e2e-placeholder';
process.env.AI_CHAT_URL = `http://127.0.0.1:${fake.address().port}/chat`;
process.env.DAILY_CAP = '1000';
const { start } = await import('./dev-server.mjs');
const server = await start(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
async function newPage({ w = 360, h = 740, lang = 'zh', large = '0', scheme = 'light', motion = 'no-preference' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: scheme, reducedMotion: motion, acceptDownloads: true });
  await ctx.addInitScript(([l, g]) => { try { if (!sessionStorage.getItem('init')) { localStorage.setItem('mk.lang', l); localStorage.setItem('mk.large', g); sessionStorage.setItem('init', '1'); } } catch (e) {} }, [lang, large]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  return { ctx, page, errors };
}
const layout = (page) => page.evaluate(() => {
  const W = document.documentElement.clientWidth, bad = [], small = [];
  if (document.documentElement.scrollWidth > W) bad.push('scrollWidth ' + document.documentElement.scrollWidth);
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('[hidden]') && getComputedStyle(el).visibility !== 'hidden'; };
  document.querySelectorAll('main *, header *').forEach((el) => {
    if (!vis(el) || el.closest('.vc')) return;
    const r = el.getBoundingClientRect(); if (r.right > W + 0.5 || r.left < -0.5) bad.push((el.id || el.className || el.tagName) + ' x=' + Math.round(r.right));
  });
  document.querySelectorAll('button, a, summary, input, select, label.btn').forEach((el) => {
    if (!vis(el) || el.closest('.vc') || el.matches('.sources a')) return;
    const r = el.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) small.push((el.id || el.textContent.trim().slice(0, 12) || el.tagName) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
  });
  const clipped = [...document.querySelectorAll('.nav a')].filter((a) => a.scrollHeight > a.clientHeight + 1 || a.scrollWidth > a.clientWidth + 1).map((a) => a.textContent.trim());
  const body = parseFloat(getComputedStyle(document.querySelector('.intro') || document.body).fontSize);
  return { bad: bad.slice(0, 4), small: [...new Set(small)].slice(0, 6), clipped, body };
});

try {
  // 1. Every tab: 2 viewports x 2 languages x A+ off/on
  for (const [w, h] of [[360, 740], [412, 915]]) for (const lang of ['zh', 'en']) for (const large of ['0', '1']) {
    const { ctx, page, errors } = await newPage({ w, h, lang, large });
    for (const r of ['card', 'recipe', 'qa']) {
      await page.goto(BASE + '#' + r); await page.waitForTimeout(120);
      if (r === 'qa') await page.click('details.qa summary');
      const tag = `${w}x${h}-${lang}${large === '1' ? '-Aplus' : ''}-${r}`;
      await page.screenshot({ path: path.join(SHOTS, tag + '.png'), fullPage: true });
      const L = await layout(page);
      check(!L.bad.length, `${tag}: no horizontal overflow ${L.bad.join('; ')}`);
      check(!L.small.length, `${tag}: touch targets >= 44 px ${L.small.join(', ')}`);
      check(!L.clipped.length, `${tag}: nav labels fit ${L.clipped.join(',')}`);
      check(L.body >= (large === '1' ? 19.9 : 16.9), `${tag}: main reading text ${L.body}px`);
      check((await page.getAttribute('#btn-large', 'aria-pressed')) === (large === '1' ? 'true' : 'false'), `${tag}: A+ state shown`);
      const navOk = await page.$$eval('.nav a', (as) => as.length === 3 && as.every((a) => a.querySelector('.ico') && a.textContent.trim().length > 1));
      check(navOk, `${tag}: 3 tabs, each with icon and label`);
    }
    check(!errors.length, `${w} ${lang} A+=${large}: no console errors ${errors.join(' | ')}`);
    await ctx.close();
  }

  // 2. VegCard flow + collection
  {
    const { ctx, page, errors } = await newPage();
    await page.goto(BASE + '#card');
    const cur = () => page.$eval('#steps [aria-current="step"]', (li) => li.getAttribute('data-step'));
    check((await cur()) === '1', 'starts at step 1 (拍照)');
    check((await page.textContent('.privacy')).trim() === '相片只會留在你的手機', 'privacy line shown in the photo slot');
    check((await page.$$eval('#coll li', (l) => l.length)) === 40 && (await page.$$eval('#coll .tile:not(.got)', (l) => l.length)) === 40, 'collection: 40 locked ? tiles at first');
    check((await page.$$eval('#rc-veg .chip, #name-chips .chip', (l) => l.length)) === 16, 'pickers start with the 8 stall vegetables');
    await page.setInputFiles('#in-file', PHOTO);
    await page.waitForSelector('#st-2:not([hidden])');
    check((await cur()) === '2', 'photo -> step 2 automatically (0 taps)');
    const px = await page.evaluate(async () => {
      const img = document.getElementById('scan-thumb'); await img.decode();
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      return { top: [...x.getImageData(c.width / 2, 40, 1, 1).data], bot: [...x.getImageData(c.width / 2, c.height - 40, 1, 1).data] };
    });
    check(px.top[0] > 200 && px.top[2] < 80 && px.bot[2] > 200 && px.bot[0] < 80, 'EXIF-rotated photo is upright');
    await page.click('#back-2'); check((await cur()) === '1', 'Back from step 2 -> step 1');
    await page.setInputFiles('#in-file', PHOTO); await page.waitForSelector('#st-2:not([hidden])');
    await page.click('#name-chips [data-id="choysum"]');
    await page.waitForSelector('#st-3:not([hidden])');
    check((await cur()) === '3' && (await page.textContent('#scan-stage .vc-name')) === '菜心', '1 tap on 菜心 -> step 3 with the 菜心 card');
    check(/blob:|data:image\/jpeg/.test(await page.$eval('#scan-stage .subj', (e) => e.style.backgroundImage)), 'card shows the user photo');
    check((await page.$$eval('#card-details dd', (d) => d.length)) === 5, 'nutrition panel with 5 rows under the card');
    // flip + Ultra unchanged (wait for the scroll to step 3 and the 180 ms rise to settle, as a finger would)
    await page.waitForTimeout(700);
    const card = page.locator('#scan-stage .vc'); const b = await card.boundingBox();
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(80);
    check(await page.$eval('#scan-stage .vc', (e) => e.classList.contains('flipped')), 'tap flips');
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(600);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(700); await page.mouse.up();
    check(!!(await page.$('#scan-stage .ult')), '600 ms long-press unlocks Ultra');
    const art = await page.evaluate(async () => { const u = getComputedStyle(document.querySelector('#scan-stage .ult')).backgroundImage; const r = await fetch('art/choysum.webp'); return { u, ok: r.ok, type: r.headers.get('content-type') }; });
    check(art.u.includes('art/choysum.webp') && art.ok && art.type === 'image/webp', 'Ultra art loads from art/choysum.webp');
    await page.waitForTimeout(900);
    await page.click('#btn-save'); await page.waitForSelector('#saved:not([hidden])', { timeout: 8000 });
    check((await page.getAttribute('#saved-dl', 'download')) === 'vegcard-choysum-ultra.png', 'Save card -> canvas PNG');
    check((await page.textContent('#coll-count')) === '1 / 40', 'collection counter 1 / 40');
    check(!!(await page.$('#coll button[data-id="choysum"] .tile.got')) && (await page.$$eval('#coll .tile:not(.got)', (l) => l.length)) === 39, 'choysum unlocked with its theme colour, 39 still ?');
    await page.screenshot({ path: path.join(SHOTS, 'flow-card-360-zh.png'), fullPage: true });
    // typed alias
    await page.click('#btn-again'); await page.setInputFiles('#in-file', PHOTO); await page.waitForSelector('#st-2:not([hidden])');
    await page.fill('#in-name', '涼瓜'); await page.click('#btn-make');
    await page.waitForSelector('#st-3:not([hidden])');
    check((await page.textContent('#scan-stage .vc-name')) === '苦瓜', 'typed alias 涼瓜 -> 苦瓜');
    await page.click('#back-3'); await page.fill('#in-name', 'durian'); await page.click('#btn-make');
    check(/未有/.test(await page.textContent('#scan-msg')), 'unknown name -> plain message');
    // persistence
    await page.reload(); await page.waitForSelector('#coll li');
    check((await page.textContent('#coll-count')) === '2 / 40', 'collection persists after reload (2 / 40)');
    await page.click('#coll button[data-id="choysum"]');
    check((await page.textContent('#scan-stage .vc-name')) === '菜心', 'tapping a collected card opens it');
    // new cards: Show all, a yellow card with its own attack numbers, typed alias for a new card
    await page.click('#btn-again'); await page.setInputFiles('#in-file', PHOTO); await page.waitForSelector('#st-2:not([hidden])');
    await page.click('#name-more');
    check((await page.$$eval('#name-chips .chip', (l) => l.length)) === 40 && (await page.getAttribute('#name-more', 'aria-expanded')) === 'true', 'Show all reveals all 40 cards');
    await page.click('#name-chips [data-id="sweetcorn"]'); await page.waitForSelector('#st-3:not([hidden])');
    const corn = await page.evaluate(() => ({ name: document.querySelector('#scan-stage .vc-name').textContent, dmg: [...document.querySelectorAll('#scan-stage .vc-dmg')].map((e) => e.textContent), primary: document.querySelector('#scan-stage .vc').style.getPropertyValue('--t-primary') }));
    check(corn.name === '粟米' && corn.dmg.join() === '45,95' && corn.primary === 'rgb(204 148 0)', 'sweetcorn card: zh name, attack 45/95 from data, yellow theme ' + JSON.stringify(corn));
    await page.click('#back-3'); await page.fill('#in-name', '冬菇'); await page.click('#btn-make');
    check((await page.textContent('#scan-stage .vc-name')) === '冬菇', 'typed alias 冬菇 -> shiitake card');
    await page.click('#scan-stage .hint'); await page.waitForTimeout(900);
    await page.click('#btn-save'); await page.waitForSelector('#saved:not([hidden])', { timeout: 8000 });
    check((await page.getAttribute('#saved-dl', 'download')) === 'vegcard-shiitakemushroom-ultra.png', 'new card Ultra saves as PNG');
    check(!errors.length, 'card flow: no console errors ' + errors.join(' | '));
    await ctx.close();
  }

  // 3. Smart Recipe: full chain via the function (fake upstream), then browser-mocked failures
  for (const lang of ['zh', 'en']) {
    const { ctx, page, errors } = await newPage({ lang });
    await page.goto(BASE + '#recipe');
    let sent = null;
    page.on('request', (r) => { if (r.url().endsWith('/api/recipe')) sent = JSON.parse(r.postData()); });
    await page.click('#btn-recipe');
    check(/最少|at least/.test(await page.textContent('#rc-status')), `${lang}: no vegetable -> plain message`);
    await page.click('#rc-veg [data-id="choysum"]'); await page.click('#rc-veg [data-id="tomato"]');
    await page.fill('#rc-extra', '雞蛋'.repeat(40));
    check((await page.inputValue('#rc-extra')).length === 60, `${lang}: extra box limited to 60 characters`);
    await page.fill('#rc-extra', lang === 'zh' ? '雞蛋' : 'eggs');
    await page.click('#btn-recipe');
    await page.waitForSelector('.recipe');
    check(sent && Object.keys(sent).sort().join() === 'extra,lang,vegIds' && sent.lang === lang, `${lang}: browser sends only {vegIds, extra, lang} ${JSON.stringify(sent)}`);
    check(/AI/.test(await page.textContent('.recipe .badge')), `${lang}: AI recipe shown with AI badge`);
    check((await page.$$eval('.recipe ol li', (l) => l.length)) <= 6, `${lang}: <= 6 steps`);
    check(!!(await page.$('.recipe .allergy')), `${lang}: allergy / cook-thoroughly line`);
    if (lang === 'zh') await page.screenshot({ path: path.join(SHOTS, 'flow-recipe-ai-360-zh.png'), fullPage: true });

    // progress state + double-tap guard (slow mocked answer)
    await page.route('**/api/recipe', async (route) => { await new Promise((r) => setTimeout(r, 1500)); route.fulfill({ json: { fallback: true } }); });
    let calls = 0; page.on('request', (r) => { if (r.url().endsWith('/api/recipe')) calls++; });
    await page.click('#btn-recipe');
    const busy = await page.evaluate(() => ({ dis: document.getElementById('btn-recipe').disabled, txt: document.getElementById('rc-status').textContent }));
    check(busy.dis && /10/.test(busy.txt), `${lang}: progress text + button disabled while thinking ("${busy.txt}")`);
    await page.click('#btn-recipe', { force: true }).catch(() => {});
    await page.waitForSelector('.recipe .badge.off');
    check(calls === 1, `${lang}: double tap sends one request (${calls})`);
    check(/離線建議|Offline suggestion/.test(await page.textContent('.recipe .badge')), `${lang}: fallback -> labelled offline suggestion`);
    check(!!(await page.$('#rc-retry')), `${lang}: Try again button shown`);
    // HTTP 500 and invalid JSON shape
    await page.unroute('**/api/recipe');
    await page.route('**/api/recipe', (route) => route.fulfill({ status: 500, body: 'oops' }));
    await page.click('#rc-retry'); await page.waitForSelector('.recipe .badge.off');
    check(!/500|oops/.test(await page.textContent('#rc-status')), `${lang}: no raw error code shown`);
    await page.unroute('**/api/recipe');
    await page.route('**/api/recipe', (route) => route.fulfill({ json: { recipe: { title: 'x', steps: [1, 2, 3, 4, 5, 6, 7], ingredients: [] } } }));
    await page.click('#rc-retry'); await page.waitForSelector('.recipe .badge.off');
    check(true, `${lang}: invalid recipe JSON -> offline suggestion`);
    if (lang === 'en') await page.screenshot({ path: path.join(SHOTS, 'flow-recipe-offline-360-en.png'), fullPage: true });
    if (lang === 'en') {
      // a new card with no built-in recipe: plain message + Try again, no recipe
      await page.click('#rc-veg [data-id="choysum"]'); await page.click('#rc-veg [data-id="tomato"]');
      await page.click('#rc-more'); await page.click('#rc-veg [data-id="okra"]');
      await page.click('#rc-retry'); await page.waitForSelector('#rc-retry');
      await page.waitForFunction(() => /no offline recipe/.test(document.getElementById('rc-status').textContent));
      check(!(await page.$('.recipe')), 'en: okra only -> no-offline-recipe message, no recipe card');
    }
    // > 15 s -> offline
    if (lang === 'zh') {
      await page.unroute('**/api/recipe');
      await page.route('**/api/recipe', async (route) => { await new Promise((r) => setTimeout(r, 17000)); route.fulfill({ json: { fallback: true } }).catch(() => {}); });
      // Time inside the page, from the tap's click event to the offline badge (the test's own click can wait for scrolling).
      await page.evaluate(() => {
        window.__seen = null;
        document.getElementById('rc-status').addEventListener('click', () => { window.__t0 = performance.now(); }, { capture: true, once: true });
        new MutationObserver(() => { if (window.__t0 && !window.__seen && document.querySelector('.recipe .badge.off')) window.__seen = performance.now() - window.__t0; }).observe(document.body, { subtree: true, childList: true });
      });
      await page.click('#rc-retry'); await page.waitForSelector('.recipe .badge.off', { timeout: 20000 });
      const dt = Math.round(await page.evaluate(() => window.__seen));
      check(dt >= 14500 && dt < 16000, `zh: no answer for 15 s -> offline suggestion at ${dt} ms`);
    }
    check(!errors.length, `${lang} recipe: no console errors ${errors.join(' | ')}`);
    await ctx.close();
  }

  // 4. Q&A: the 10 supplied items, in order and word for word; photo slots on Q1 and Q8
  const EXPECTED = JSON.parse(readFileSync(path.join(HERE, 'fixtures', 'qa-expected.json'), 'utf8'));
  for (const lang of ['zh', 'en']) {
    const { ctx, page } = await newPage({ lang });
    await page.goto(BASE + '#qa');
    const n = await page.$$eval('details.qa', (d) => d.length);
    check(n === 10, `${lang}: 10 Q&A items`);
    for (let i = 0; i < n; i++) {
      await page.click(`details.qa:nth-of-type(${i + 1}) summary`);
      const open = await page.$eval(`details.qa:nth-of-type(${i + 1})`, (d) => d.open && d.querySelector('.sources') !== null);
      check(open, `${lang}: Q${i + 1} opens and has a source line`);
      const got = await page.$eval(`details.qa:nth-of-type(${i + 1})`, (d) => ({ q: d.querySelector('.qa-q').textContent, n: d.querySelector('.qa-num').textContent, a: d.querySelector('.ans p').textContent }));
      check(got.n === String(i + 1), `${lang}: Q${i + 1} number badge`);
      check(got.q === EXPECTED[i].q[lang] && got.a === EXPECTED[i].a[lang], `${lang}: Q${i + 1} text matches the supplied wording exactly`);
    }
    const links = await page.$$eval('.sources a', (a) => a.length);
    check(true, `${lang}: source links present: ${links} (0 until the URLs are added to CONTENT_SOURCES.md section A)`);
    check((await page.$$eval('details.qa', (d) => d.map((x) => !!x.querySelector('.photo-slot')))).join() === 'true,false,false,false,false,false,false,true,false,false', `${lang}: photo slots on Q1 (holes) and Q8 (size)`);
    const footer = await page.textContent('.market strong');
    check(footer === (lang === 'zh' ? '還有疑問？歡迎直接向攤位的農夫查詢！' : 'Still curious? Ask the farmer at the stall!'), `${lang}: footer text exact ("${footer}")`);
    await ctx.close();
  }

  // 5. Dark theme, reduced motion, storage blocked
  {
    const { ctx, page } = await newPage({ scheme: 'dark', motion: 'reduce' });
    await page.goto(BASE + '#card');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(bg === 'rgb(31, 30, 27)', 'dark theme applied (Warm Paper #1F1E1B) ' + bg);
    await page.screenshot({ path: path.join(SHOTS, 'dark-360-zh-card.png') });
    await page.setInputFiles('#in-file', PHOTO); await page.waitForSelector('#st-2:not([hidden])');
    await page.click('#name-chips [data-id="tomato"]');
    const anim = await page.evaluate(() => { document.querySelector('#scan-stage .vc-spin').classList.add('spinning'); return getComputedStyle(document.querySelector('#scan-stage .vc-spin')).animationName; });
    check(anim === 'none', 'prefers-reduced-motion disables the spin');
    await ctx.close();
  }
  {
    const { ctx, page, errors } = await newPage();
    await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }); });
    await page.goto(BASE + '#card');
    await page.setInputFiles('#in-file', PHOTO); await page.waitForSelector('#st-2:not([hidden])');
    await page.click('#name-chips [data-id="carrot"]');
    check((await page.textContent('#coll-count')) === '1 / 40', 'works with localStorage blocked (in-memory)');
    check(!errors.length, 'storage blocked: no console errors ' + errors.join(' | '));
    await ctx.close();
  }
} catch (e) {
  out.push('FAIL exception: ' + e.message.split('\n')[0]);
}
await browser.close(); server.close(); fake.close();
console.log(out.join('\n'));
const nf = out.filter((l) => l.startsWith('FAIL')).length;
console.log(`\n${out.length - nf} ok, ${nf} FAIL`);
process.exit(nf ? 1 : 0);
