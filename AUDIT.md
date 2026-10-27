# AUDIT (v3)

This covers branch `v3-three-features`. The v2 audit is in git history.

## How it was tested

| Suite | Command | Result (26 Oct 2026) |
|---|---|---|
| Function unit tests (fake AI endpoint, no real calls) | `npm run test:api` | **10 pass, 0 fail** |
| Playwright Chromium end to end, AI mocked | `npm run test:e2e` | **202 ok, 0 FAIL** |
| Page script syntax | inside `test:e2e` (`node --check` on the extracted script) | ok |
| Secret check | `sh scripts/check-secrets.sh` (pre-commit hook) | clean; blocks a planted 32-hex key, a key assignment, the local `.env` value, and a staged `.env` |

The e2e suite runs every tab at 360×740 and 412×915, in zh and en. For each it checks:
- no horizontal scroll;
- every visible target at least 48×48 px;
- nav labels not clipped;
- body text at 17 px or more;
- 3 tabs, each with an icon and a label;
- no console errors.

It also covers:
- the VegCard flow with an EXIF-rotated photo (pixel-checked upright), tap flip, 600 ms Ultra, and the PNG save;
- collection unlock and persistence after a reload, a typed alias, and an unknown name;
- recipes through the real `api/recipe.js` with a fake upstream, then mocked fallback, 500, invalid JSON, and a 15 s timeout (offline suggestion at 15.8 s);
- the double-tap guard, and all 10 Q&A items opening in the supplied order, with source lines and photo slots (Q1, Q8);
- dark theme, reduced motion, and blocked localStorage.

## Fixed during v3 work

| Severity | Problem | Fix |
|---|---|---|
| High | The assembled page had `<script>` twice, so no JavaScript ran. The old awk-based syntax check skipped both lines and missed it | Removed the duplicate. The e2e syntax check now extracts the script with a regex and asserts there is exactly one, with no nested tags |
| Medium | A request with no body crashed the function's body reader | Return 400 |
| Medium | The secret check didn't flag a staged `.env` when `.env.example` was staged too | Fixed the filter; tested |
| Low | The control-character regex was written with literal U+2028/2029 characters, which is a syntax error in Node | Escapes |

## Open (needs content, a decision or a real device)

| Severity | Item |
|---|---|
| High | `CONTENT_SOURCES.md` is a template: Q&A, nutrition, allergy wording and market hours show 待確認 |
| High | Card-face health claims from the VegCard app (NOTES §2) |
| High | Real AI not yet called. Needs your `.env` (API_KEY_GUIDE.md) |
| Medium | Daily cap and rate limit are per instance (best effort). Set a quota at the provider |
| Medium | iOS long-press callout, camera, HEIC and 48 MP photos need real phones (TODO.md) |
| Low | Source links: 0 present until section A is filled in. The tests check that every item has a source line |

## 40 VegCards (27 Oct)

- e2e: **183 ok, 0 FAIL**. New checks:
  - 40 "?" cards and the 1/40 counter;
  - Show all reveals all 40;
  - the yellow sweetcorn card with attack 45/95 from the data;
  - the 冬菇 alias;
  - Ultra art served from `art/` as `image/webp`;
  - an Ultra PNG for a new card;
  - the no-offline-recipe message for okra.
- Contrast audit: unchanged, lowest 4.6:1.
- Function tests: 10/10 with 40 ids.
- `index.html`: 978 KB → **116 KB**. The Ultra art (3.3 MB for 40 cards) is fetched one image at a time when a card is opened.

## Green identity + clay action style (27 Oct)

- e2e **279 ok, 0 FAIL** (adds A+ passes, 44 px target check, Q&A number badges, the new collection tiles and counter). Function tests 10/10.
- `node tests/style-audit.mjs`: **64 / 64 states pass 4.5:1**, lowest 4.76:1. Screenshots are in `tests/screenshots/style/`.
- No hard-coded colours outside the token blocks (VegCard design exempt).
- The long-press test was flaky in one run: it measured the card while the page was still smooth-scrolling to step 3, plus the new 6 px rise. A press that moves is cancelled by design, so the test now waits 700 ms, as a finger would. It was stable over 3 runs.
