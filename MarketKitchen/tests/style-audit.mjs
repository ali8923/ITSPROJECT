// node tests/style-audit.mjs   Screenshots every tab at 360x740 and 412x915 (light/dark, zh/en, A+ off/on) and measures the
// contrast of every visible text element against its real background. AI is mocked.
// Card faces (.vc) are excluded: the VegCard designs are kept exactly as ported.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = process.env.SHOTS || path.join(HERE, 'screenshots', 'style');
mkdirSync(SHOTS, { recursive: true });
const PHOTO = path.join(HERE, 'fixtures', 'exif6-red-top.jpg');
const { start } = await import('./dev-server.mjs');
delete process.env['AI_API_KEY'];
const server = await start(0);
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();

const measure = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  const bgOf = (el) => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg);
    return bg;
  };
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode; const el = t.parentElement;
    if (!t.textContent.trim() || !el || seen.has(el) || el.closest('.vc, [hidden], script, style, [aria-hidden="true"] svg')) continue;
    seen.add(el);
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none' || el.closest('button[disabled]')) continue;
    const fg = parse(cs.color); const bg = bgOf(el);
    const ratio = (Math.max(lum(blend(fg, bg)), lum(bg)) + 0.05) / (Math.min(lum(blend(fg, bg)), lum(bg)) + 0.05);
    out.push({ text: t.textContent.trim().slice(0, 24), ratio: Math.round(ratio * 100) / 100, fg: cs.color, bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`, size: cs.fontSize });
  }
  return out;
};

const results = []; let worst = { ratio: 99 };
for (const [w, h] of [[360, 740], [412, 915]]) for (const scheme of ['light', 'dark']) for (const lang of ['zh', 'en']) for (const large of ['0', '1']) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme });
  await ctx.addInitScript(([l, g]) => { try { localStorage.setItem('mk.lang', l); localStorage.setItem('mk.large', g); } catch (e) {} }, [lang, large]);
  const page = await ctx.newPage();
  await page.route('**/api/recipe', (r) => r.fulfill({ json: { recipe: { title: lang === 'zh' ? '蒜蓉炒菜心' : 'Garlic choy sum', time_min: 12, ingredients: ['A', 'B'], steps: ['1', '2', '3'], tip: 'Tip' } } }));
  const states = [
    ['card', async () => {}],
    ['card-step3', async () => { await page.setInputFiles('#in-file', PHOTO); await page.waitForSelector('#st-2:not([hidden])'); await page.click('#name-chips [data-id="choysum"]'); await page.waitForSelector('#st-3:not([hidden])'); }],
    ['recipe', async () => { await page.click('#rc-veg [data-id="tomato"]'); await page.click('#btn-recipe'); await page.waitForSelector('.recipe'); }],
    ['qa', async () => { await page.click('details.qa summary'); }],
  ];
  for (const [name, act] of states) {
    await page.goto(BASE + '#' + name.split('-')[0]); await page.waitForTimeout(150);
    await act(); await page.waitForTimeout(300);
    const tag = `${w}-${scheme}-${lang}${large === '1' ? '-Aplus' : ''}-${name}`;
    await page.screenshot({ path: path.join(SHOTS, tag + '.png'), fullPage: true });
    const m = await page.evaluate(measure);
    const low = m.filter((x) => x.ratio < 4.5);
    const min = m.reduce((a, b) => (b.ratio < a.ratio ? b : a), { ratio: 99 });
    if (min.ratio < worst.ratio) worst = { ...min, tag };
    results.push(`${low.length ? 'FAIL' : 'ok  '} ${tag}: ${m.length} text elements, lowest ${min.ratio}:1 ("${min.text}")` + (low.length ? ' | below 4.5: ' + low.map((x) => `"${x.text}" ${x.ratio} ${x.fg} on ${x.bg}`).join('; ') : ''));
  }
  await ctx.close();
}
await browser.close(); server.close();
console.log(results.join('\n'));
console.log(`\nLowest anywhere: ${worst.ratio}:1 "${worst.text}" (${worst.tag}, ${worst.fg} on ${worst.bg})`);
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
