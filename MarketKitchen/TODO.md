# TODO (v3): by hand, before 22 Nov 2026

## Content (the page shows 待確認 until done)
- [ ] Write **CONTENT_SOURCES.md**:
  - A: Q&A text is in (10 items); **add the source URL(s) for each item**;
  - B: confirm the recipe rules and give the exact allergy line;
  - C: nutrition figures with sources;
  - D: market days and hours.
- [ ] Then ask for those sections to be copied into `index.html` and `api/_lib/core.js`.
- [ ] Decide on the card-face health claims (NOTES.md §2).
- [ ] Have a native speaker check all Traditional Chinese (HK) text.
- [ ] Farmer checks done → only then set `DRAFT = false`.

## Photos
- [ ] Take and embed the `holes` (Q1) and `size` (Q8) photos (PHOTOS_README.md).
- [ ] Q5 still says 「（請農夫補充實際原因。）」 on the page: get the farmers' reasons.

## AI key and hosting (API_KEY_GUIDE.md)
- [ ] Get the chat-completions URL and model for your HKBU / Azure key.
- [ ] Local test: `.env` + `npm run dev`, one recipe shows the **AI 建議** badge.
- [ ] Push branch `v3-three-features` and open the PR into `main`.
- [ ] Vercel: import the repo, Root Directory `MarketKitchen`, add `AI_API_KEY`, `AI_CHAT_URL`, `AI_KEY_HEADER`, `DAILY_CAP`, then `ALLOWED_ORIGIN`, then redeploy.
- [ ] Set a spending or quota limit on the AI platform (the real hard cap).
- [ ] Check the platform's terms for serving visitors in Hong Kong from region `iad1`.
- [ ] Merge the PR.
- [ ] Put the live URL in README.md, make the QR code, and print `print.html`.

## Real-device tests
- [ ] iPhone Safari and Android Chrome:
  - camera and library photo come out upright;
  - long-press the card: no text-selection bubble, and Ultra unlocks;
  - press and hold the saved image → "Add to Photos";
  - HEIC photo;
  - collection survives closing the browser.
- [ ] Smart Recipe on 4G at the pier: about 10 s, and the offline suggestion when in airplane mode.
- [ ] An older visitor tries all three tabs one-handed (A+ was removed; check the text size is still comfortable).
- [ ] VoiceOver / TalkBack: step bar, chips, card label, Q&A.
