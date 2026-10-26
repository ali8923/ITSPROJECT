# How to apply your AI API key (HKBU GenAI / Azure OpenAI)

**The golden rule:** the key goes only in (a) a local `.env` file that git ignores, and (b) Vercel's Environment Variables. Never put it in `index.html`, any `.js` file, a chat message, a screenshot, or a commit.

You need **two** things from the platform, not just the key:

| Setting | What it is | Where to find it |
|---|---|---|
| `AI_API_KEY` | your secret key | the platform's API / key page |
| `AI_CHAT_URL` | the full **chat completions** web address, including the model ("deployment") and `api-version` | the same API page, or its sample code |

If you only have the key, open the page where you got it (for HKBU: the HKBU GenAI platform's API section) and look for a "REST", "cURL" or "sample code" example. The URL in that example is your `AI_CHAT_URL`.

- An Azure OpenAI URL looks like `https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=<version>`.
- HKBU's is shaped similarly but on its own domain.

Copy it exactly. Also check which **header** the example puts the key in:

- `api-key: …` (the Azure and usual HKBU style) means `AI_KEY_HEADER=api-key`, the default.
- `Authorization: Bearer …` means `AI_KEY_HEADER=Authorization`.

Choose a **small, cheap model** such as a "mini" model, for example a gpt-4o-mini deployment. A recipe needs at most 600 output tokens.

---

## Step 1: try it on your computer

1. In the `MarketKitchen` folder, copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor and fill in `AI_API_KEY=` and `AI_CHAT_URL=`, plus `AI_KEY_HEADER=` if needed. Save it. Git ignores `.env`, and the pre-commit check refuses to commit it.
3. Start the local server (it reads `.env`):

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000/#recipe>, tap a vegetable and press **✨ 幫我諗食譜**. A recipe with the **AI 建議** badge means it works. **離線建議** means the AI call failed; the terminal shows a short outcome code, explained below.

If the platform rejects `response_format` (older `api-version`), set `AI_RESPONSE_FORMAT=json_object` in `.env`, or `none` as a last resort. The server still validates every answer.

## Step 2: put the site on Vercel

1. Sign in at <https://vercel.com> with GitHub (the free **Hobby** plan is enough).
2. **Add New → Project →** import `ali8923/ITSPROJECT`.
3. **Root Directory: `MarketKitchen`** (important). Framework preset: **Other**. Leave the build command empty.
4. Before the first deploy, open **Environment Variables** and add (for Production and Preview):

   | Name | Value |
   |---|---|
   | `AI_API_KEY` | your key |
   | `AI_CHAT_URL` | your chat-completions URL |
   | `AI_KEY_HEADER` | `api-key` (or `Authorization`) |
   | `DAILY_CAP` | `300` (or lower) |
   | `ALLOWED_ORIGIN` | your site, e.g. `https://market-kitchen.vercel.app` (add it after the first deploy, then redeploy) |

5. **Deploy.** Every push to the connected branch redeploys automatically. After changing a variable, use **Deployments → ⋯ → Redeploy** so it takes effect.
6. Test the live site the same way as in Step 1.

## Step 3: protect your budget

- `DAILY_CAP` and the 5-per-10-minutes limit are **best effort**: Vercel can run several copies of the function, and each one counts separately.
- **The real hard cap is a spending or quota limit on the AI platform itself.** On Azure, set a budget alert or quota on the resource. On HKBU, check your account's usage quota. Set it before 22 Nov.
- The function region is pinned to `iad1` (Washington, D.C.) in `vercel.json`. Check the platform's terms of use for serving visitors in Hong Kong, and whether an HKBU key may be used for a public stall page.

## If the key leaks

If the key was pasted somewhere public, or committed by mistake:

1. **Regenerate or revoke it on the platform immediately.**
2. Put the new key in `.env` and in Vercel, then redeploy.

Deleting a commit is not enough, because the old key stays in git history and caches.

## Outcome codes in the logs

Vercel → Project → **Logs** shows one line per request, like `{"route":"recipe","outcome":"ok"}`. No personal data is logged.

| outcome | meaning | what to do |
|---|---|---|
| `ok` | AI answered with a valid recipe | none |
| `not_configured` | `AI_API_KEY` or `AI_CHAT_URL` missing | add the variables, redeploy |
| `http_401` / `http_403` | key wrong, or not allowed for this model | check the key and `AI_KEY_HEADER` |
| `http_404` | URL, deployment name or `api-version` wrong | copy `AI_CHAT_URL` again |
| `http_400` | platform rejected the request (often `response_format`) | try `AI_RESPONSE_FORMAT=json_object` |
| `http_429` | platform rate limit or quota | wait, or raise the quota |
| `timeout` | no answer within 12 s | try again; check the platform status |
| `invalid_answer` | answer broke the rules (e.g. more than 6 steps, wrong language) | none; visitors see the offline suggestion |
| `rate_limited` / `daily_cap` | our own limits | none |
| `origin_blocked` | request from another website | check `ALLOWED_ORIGIN` |
