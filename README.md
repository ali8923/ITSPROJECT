# 農墟廚房 / Market Kitchen (v3)

A mobile page for the KFBG Central Farmers' Market stall (Star Ferry Central Pier 7), university showcase on **22 Nov 2026**. Visitors scan the QR code at the stall. There are three tabs:

1. **蔬菜卡 VegCard:** photo → name → your card (flip, long-press Ultra, save PNG), plus a collection of 8 cards.
2. **智能食譜 Smart Recipe:** tap your vegetables and get one AI recipe, or an offline suggestion.
3. **問與答 Q&A:** the 10 questions from `CONTENT_SOURCES.md` section A, in that order.

**Live URL:** 待確認 / to be confirmed (after the Vercel deploy). Put it here and in `print.html`.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page: HTML, CSS, one script IIFE, and embedded images at the end |
| `api/recipe.js`, `api/_lib/` | Vercel serverless function (Node) that calls the AI. The key lives only in env vars |
| `vercel.json` | Region `iad1`, function limits, security headers |
| `.env.example` | Names of the settings, with no values. Copy to `.env` (git-ignored) |
| `API_KEY_GUIDE.md` | **How to apply your API key**, locally and on Vercel |
| `CONTENT_SOURCES.md` | The only allowed source of facts (template to fill in) |
| `NOTES.md` | Judgement calls to review |
| `TODO.md` | What still has to be done by hand |
| `VERIFY.md` | Every factual claim on the page, to check |
| `PHOTOS_README.md`, `tools/embed.py` | Adding the two Q&A photos |
| `print.html` | A5 booth sign with QR placeholder |
| `tests/` | `api.test.js` (function), `e2e.mjs` (Playwright), `dev-server.mjs` (local stand-in for `vercel dev`) |
| `scripts/check-secrets.sh` | Stops commits that contain a key |

## Run and test locally

```bash
npm install
```

```bash
npx playwright install chromium
```

```bash
npm run dev
```

`npm run dev` serves the page on http://localhost:3000. It uses `.env` if present; otherwise recipes come from the offline suggestions.

```bash
npm run test:api
```

```bash
npm run test:e2e
```

Neither test command calls the real AI.

## Install the secret check (once per clone)

```bash
printf '#!/bin/sh\nsh "$(git rev-parse --show-toplevel)/MarketKitchen/scripts/check-secrets.sh"\n' > "$(git rev-parse --git-path hooks)/pre-commit" && chmod +x "$(git rev-parse --git-path hooks)/pre-commit"
```

## Editing basics

- Strings: the `T` table (`T.zh` / `T.en`), read through `L("key")`. There is no hard-coded text.
- Vegetables and nutrition: `VEG`. Offline recipes: `RECIPES`. Q&A: `QA`.
- `DRAFT = true` shows the yellow banner. Leave it on until the farmer checks are done.
