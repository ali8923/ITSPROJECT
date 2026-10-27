# NOTES: judgement calls (v3)

Each item is a decision the brief left open, made on branch `v3-three-features`. Each one is easy to change. The v2 notes are in git history.

## Content

1. **`CONTENT_SOURCES.md` did not exist**, so I added a template. Until it is filled in:
   - the Q&A source lines show 資料來源：待確認, because the 10 supplied answers came without URLs;
   - the nutrition table shows 待確認;
   - the allergy line under recipes is a placeholder;
   - market opening hours show 待確認.

   No facts were invented. The market name and place (KFBG Central Farmers' Market, Star Ferry Central Pier 7) come from the brief itself.
2. **Health claims on the card faces.** The card "moves" are still the VegCard app's own text, e.g. "Charantin & Vitamin C cleanse your system". The brief says to keep the card designs and to make no health claims, so I left them unchanged. Section B's no-health-claims rule covers the AI recipe only. **Decide with the VegCard team** whether to reword `humanBenefits` in the `VEG` data.
3. **Built-in offline recipes** (the `RECIPES` array) are the 10 written for v2. The brief names them as the fallback, but they are not in `CONTENT_SOURCES.md` yet. They are listed in VERIFY.md.
4. **Pick/keep tips and the farmer line** from v2 were removed. They aren't part of the 3 v3 features, and their text had no source.

## VegCard tab

5. **Nutrition is shown in a panel under the card, not on the card back.** The brief says "photo plus the real nutrition back" and also "do not change card designs". Putting numbers on the VEGCARD back would change the design, so the panel sits directly under the card on step 3.
6. **Tap count:** photo → step 2 opens by itself → one tap on a chip → card. That's 1 tap after the photo. Typing a name takes a second tap on 整卡.
7. **Collection storage:** `mk.coll` in localStorage keeps which cards were found, plus a 200×200 JPEG thumbnail each (about 10 KB), so the colour card shows your photo after a reload. If storage is full or blocked, only the "found" flags are kept (blocked storage → memory only). The full photo is never stored.
8. **The "?" cards show the vegetable name below them**, so visitors know what they can still find at the stall. Hide the names if you'd rather keep it a surprise.
9. **Tapping a collected card** reopens it on step 3, with the small thumbnail as its photo, so it can be saved again.

## Smart Recipe

10. **Provider:** HKBU GenAI / Azure OpenAI chat completions. The URL, header and model are environment variables, so nothing in code changes if HKBU gives a different endpoint (API_KEY_GUIDE.md).
11. **Structured output** uses `response_format: json_schema` by default. If the platform's `api-version` doesn't support it, `AI_RESPONSE_FORMAT=json_object` or `none` still works, because the server validates every answer: 1–6 steps, 1–30 minutes, string fields, and the right language for zh. Any failure → `{fallback:true}`.
12. **Limits:**
    - 5 requests per IP per 10 minutes and `DAILY_CAP` are in-memory, per function instance. With "store nothing" there is no shared counter, so they are best effort.
    - **The hard cap must be a quota or budget on the AI platform** (API_KEY_GUIDE.md, Step 3).
    - Rate-limited requests return 429 with `{fallback:true}`, so visitors still get the offline suggestion.
13. **Timeouts:** the function gives the AI 12 s and the page gives up at 15 s. Either way the visitor sees 「AI 暫時用唔到，以下係離線建議。」 with a 再試一次 button. Measured in the test: 15.8 s from tap to offline suggestion when the API never answers.
14. **CORS:** with `ALLOWED_ORIGIN` empty, only the same host is accepted. Set it to the Vercel URL (and any custom domain) after the first deploy.
15. **Region `iad1`** as required. Requests go from Washington, D.C. to the AI platform. Check the platform's terms for HK visitors, and whether an HKBU key may serve a public page.

## Engineering

16. **`vercel dev` was not run.** It needs your Vercel login and a linked project. `tests/dev-server.mjs` runs the same `api/recipe.js` handler with Vercel-style `req`/`res` and reads `.env`. The real-API check is set up to use it (`npm run dev`). Run `vercel dev` yourself once you have linked the project.
17. **Pushing:** this Mac has no GitHub login, so the branch is committed locally and you push it. The PR text is provided separately.
18. **`package.json`** lists Playwright as a dev dependency for the tests. Vercel installs it on deploy, which only adds a few seconds and has no runtime effect. `tests/`, `tools/` and `scripts/` are excluded from the deployment by `.vercelignore`.
19. **The secret check** (`scripts/check-secrets.sh`) runs as a git pre-commit hook in this clone. Hooks aren't shared through git, so each teammate installs it once (README). It skips the embedded image line, where base64 can resemble a key by chance.
20. **This branch is based on the latest `main`** (commit 8243137). My earlier `vegcard-features` branch for the React app is separate and still unpushed.

## Changes on 26 Oct (your request)

21. **A+ removed.** You asked for it, overriding the brief's "keep the A+ toggle". Body text stays at 17 px. Any saved `mk.large` setting is simply ignored. Phone zoom and the system text size still work, because the viewport doesn't block zooming.
22. **Q&A now has the 10 questions you supplied**, in your order and word for word, in place of the brief's 7. They are recorded in `CONTENT_SOURCES.md` section A, which remains the single source.
23. **The `size` photo moved from Q4 to Q8.** Q4 is now about eating leaves with holes, while Q8 is about small or odd-shaped vegetables, which matches the small/large photo. `holes` stays on Q1.
24. **Source links:** the answers name their sources (AFCD, HKORC, CFS, the 2012 Stanford review, FAO) but no URLs were supplied. I didn't guess URLs, so each item shows 資料來源：待確認 until you add them.
25. **Q5 keeps 「（請農夫補充實際原因。）」 / "(Farmer to add the real reasons.)"** exactly as written, so visitors will see it. Replace it once the farmers reply.
26. **Wording style:** the supplied Q&A is in written Chinese (書面語), while the rest of the interface uses Cantonese (e.g. 揀菜名). I left both as they are; see whether the mix reads well.
27. **Footer** is now your exact text: 還有疑問？歡迎直接向攤位的農夫查詢！/ Still curious? Ask the farmer at the stall!

## Warm Paper Kitchen style (26 Oct)

28. **Styling only.** Content and behaviour are unchanged. The VegCard rules (card faces, flip, Ultra spin) are carried over byte for byte. The cards keep their own light colours in dark mode.
29. **Decorative emoji removed** from buttons and labels (📷 🖼️ 🔒 ✨ ⚠️ ⏱), and the tab icons are now simple line SVGs. The words are unchanged. This includes the Ultra hint, which loses its 🔒/✨ (the hint sits outside the card design).
30. **Clay `#B4562F` is 4.43:1 on the page background**, so it is used only as a button fill. All clay-coloured text uses `--accent-text` `#A34C2A` (5.27:1).
31. **Photo buttons now stack.** 影相 is the full-width clay primary and 揀相 a quiet secondary below it, so each screen has one primary button.
32. **The "?" collection cards are flat sand with a dashed edge.** The striped pattern is gone, because the rule says no patterns behind text.
33. **Contrast audit:** run `node tests/style-audit.mjs`. It measures every visible text element against its real background at 360 px, in light and dark, zh and en, over 4 states. The lowest is 4.6:1 (clay text on the current step's tinted pill).

## 40 VegCards (27 Oct)

34. **Source:** `public/vegetables.json` and `src/assets/*_secret.jpg` on `main` (ali8923, "40 Vegcards" and "Add files via upload", 27 Oct). The original 20 entries are unchanged there; 20 are new.
35. **All 40 are available everywhere:** typing a name (aliases in zh and en), the collection grid (n/40), Smart Recipe, and `api/recipe.js`. To keep the screens short, the name and recipe pickers show the **8 stall vegetables first**, with a full-width 「顯示全部 40 款蔬菜 / Show all 40 vegetables」 button.
36. **Chinese names** are each card's first Chinese alias in the team's data, except 苦瓜, where I kept the stall name (the data lists 涼瓜 first). The **Chinese benefit text for the 32 non-stall cards is my translation**. It's listed in VERIFY.md for a native-speaker check.
37. **Attack numbers** now come from the data (`humanDamage` / `ecoDamage`, e.g. tomato 40 / 85). The iOS app had fixed 30 / 100, and the layout is unchanged.
38. **Yellow theme:** three new cards (sweet corn, water chestnut, lotus root) use `"yellow"`, which the iOS ThemeProvider doesn't define; it would fall back to green. I added a gold palette in the same 4-colour structure. **Ask the VegCard team** to confirm it or send their own values.
39. **Ultra art now lives in `art/<id>.webp`** (40 files, about 84 KB each, 3.3 MB total) and loads only when a card is opened. `index.html` went from 0.98 MB to 116 KB, so the page opens much faster on 4G. Both files the team named oddly (`malabarspinac_secret.jpg`, `chineseamaranth.jpg`) are mapped to their cards. `main`'s tomato art (a newer JPEG) replaces the earlier PNG version.
40. **More health claims.** Several new card texts make medical claims, e.g. okra "lower blood sugar", garlic "blood pressure regulator", coriander "detoxify heavy metals", shiitake "significantly boost immune defense". They are shown as written (team data), but **this needs the same decision as §2 before the stall.**
41. **Offline recipes still cover only the 8 stall vegetables.** If the AI is unavailable and only new cards are chosen, the page says so plainly with a Try again button (no recipe is invented).
42. **Nutrition** for the 32 new cards shows 待確認 like the others.

## Green identity + clay action style (27 Oct, replaces the earlier style)

43. **Styling plus the changes the brief itself asks for.** Content, features and behaviour are otherwise unchanged. The VegCard CSS is byte-identical apart from one blank line (checked against the previous commit). Under reduced motion, the flip stays instant as before.
44. **A+ is back** because this brief asks for it in the header and for screenshots with A+ on. This reverses §21. It's remembered per phone and scales the whole page to 20 px body text.
45. **All Chinese UI text is now standard written Chinese (書面語)**: buttons and labels (e.g. 揀菜名 → 選擇菜名, 整卡 → 製作, AI 諗緊食譜 → AI 正在構思食譜……約需 10 秒), my translations of the 40 cards' benefit lines, and the 10 offline recipe steps. The supplied Q&A was already 書面語 and is untouched. The AI prompt now asks for 書面語, not Cantonese. A native-speaker check is still worthwhile.
46. **Page titles changed** to fit the price-tag labels: 製作你專屬的蔬菜卡 / 用手上的蔬菜做一道菜 / 常見問題, under the tags 今日蔬菜卡 / 智能食譜 / 今日問答.
47. **Step 1 layout:** the dashed photo slot is the "choose a photo" target; the clay **拍照** button below opens the camera. That keeps one primary button on the screen.
48. **Collection:** the brief describes "3 / 8", but there are now 40 cards, so it reads "n / 40". Unlocked tiles use the card's own theme colour (border and pale fill) and show your photo thumbnail. These colours come from the VegCard theme data, as the brief asks.
49. **Header height:** at 360 px the full subtitle doesn't fit beside the language pill and A+, so the header grows to about 85 px in zh (110 px in en, where "Market Kitchen" also wraps) instead of truncating the text. From about 412 px it's closer to the 72 px target.
50. **Type scale:** the brief gives the header subtitle as 12 px but also says "28 / 24 / 20 / 17 / 15 / 13 only". I used 13 px.
51. **Hard-coded colours:** none in the page CSS or markup outside the token blocks (checked by script). The remaining literal colours are inside the VegCard block, the card-drawing canvas code and the card theme data. These are the card designs, which must not change.
52. **Contrast:** 64 page states (360 and 412 px, light and dark, zh and en, A+ off and on, 4 screens each) all pass 4.5:1. The lowest is 4.76:1 (muted draft text on the sand strip).
