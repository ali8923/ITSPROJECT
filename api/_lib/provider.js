// HKBU GenAI / Azure OpenAI chat completions (REST). Configured only by environment variables:
//   AI_API_KEY           secret key (required)
//   AI_CHAT_URL          full chat-completions URL including deployment and api-version (required), e.g.
//                        https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=<version>
//                        (HKBU: use the URL from the HKBU GenAI platform's API page)
//   AI_KEY_HEADER        header carrying the key (default "api-key", the Azure convention;
//                        use "Authorization" to send "Bearer <key>")
//   AI_MODEL             optional "model" field, only for platforms that require it in the body
//   AI_RESPONSE_FORMAT   "json_schema" (default, structured output), "json_object", or "none"
//   AI_TIMEOUT_MS        default 12000 (the page gives up at 15 s)
import { LIMITS, RECIPE_SCHEMA } from './core.js';

export function providerConfigured(env = process.env) {
  return Boolean(env.AI_API_KEY && env.AI_CHAT_URL);
}

export function buildRequest(messages, env = process.env) {
  const header = env.AI_KEY_HEADER || 'api-key';
  const headers = { 'Content-Type': 'application/json' };
  headers[header] = header.toLowerCase() === 'authorization' ? `Bearer ${env.AI_API_KEY}` : env.AI_API_KEY;
  const body = { messages, max_tokens: LIMITS.maxOutputTokens };
  if (env.AI_MODEL) body.model = env.AI_MODEL;
  const fmt = env.AI_RESPONSE_FORMAT || 'json_schema';
  if (fmt === 'json_schema') body.response_format = { type: 'json_schema', json_schema: { name: 'recipe', strict: true, schema: RECIPE_SCHEMA } };
  else if (fmt === 'json_object') body.response_format = { type: 'json_object' };
  return { url: env.AI_CHAT_URL, init: { method: 'POST', headers, body: JSON.stringify(body) } };
}

// Returns the model's text, or throws an Error whose .code is safe to log (no content, no key).
export async function callModel(messages, env = process.env, fetchImpl = fetch) {
  const { url, init } = buildRequest(messages, env);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), Number(env.AI_TIMEOUT_MS) || 12000);
  try {
    const res = await fetchImpl(url, { ...init, signal: ctl.signal });
    if (!res.ok) { const e = new Error('upstream'); e.code = `http_${res.status}`; throw e; }
    const json = await res.json();
    const choice = json?.choices?.[0];
    if (choice?.finish_reason === 'content_filter') { const e = new Error('filtered'); e.code = 'content_filter'; throw e; }
    const text = choice?.message?.content;
    if (typeof text !== 'string') { const e = new Error('shape'); e.code = 'bad_shape'; throw e; }
    return text;
  } catch (e) {
    if (e.name === 'AbortError') { const t = new Error('timeout'); t.code = 'timeout'; throw t; }
    if (!e.code) e.code = 'network';
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
