#!/bin/sh
# Stops a commit if the staged changes contain something that looks like an API key.
# Installed as a git pre-commit hook (see API_KEY_GUIDE.md); run by hand with: sh scripts/check-secrets.sh
# The embedded image data line in index.html is skipped (base64 can look like a key by chance).
set -u
here=$(cd "$(dirname "$0")/.." && pwd)
added=$(git diff --cached -U0 --no-color | grep '^+' | grep -v '^+++' | grep -v 'data:image/' || true)
found=0
check() {
  if printf '%s\n' "$added" | grep -Eq -- "$1"; then echo "check-secrets: possible $2 in staged changes" >&2; found=1; fi
}
check 'sk-[A-Za-z0-9_-]{20,}' 'OpenAI/Anthropic-style key'
check 'AIza[0-9A-Za-z_-]{30,}' 'Google API key'
check '(^|[^A-Fa-f0-9])[a-f0-9]{32}([^A-Fa-f0-9]|$)' '32-hex key (Azure style)'
check '(^|[^A-Za-z0-9])[A-Za-z0-9]{80,}([^A-Za-z0-9]|$)' 'long Azure-style key'
check '(AI_API_KEY|api-key)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9]' 'key assignment'
# The real key from your local .env, if there is one
if [ -f "$here/.env" ]; then
  key=$(sed -n 's/^AI_API_KEY=//p' "$here/.env" | tr -d '\r"'"'"' ')
  if [ -n "$key" ] && printf '%s\n' "$added" | grep -qF -- "$key"; then echo "check-secrets: your AI_API_KEY value is in the staged changes" >&2; found=1; fi
fi
if git diff --cached --name-only --diff-filter=ACMR | grep -E '(^|/)\.env($|\.)' | grep -qvE '(^|/)\.env\.example$'; then
  echo "check-secrets: a .env file is staged" >&2; found=1
fi
if [ "$found" -ne 0 ]; then echo "Commit stopped. Remove the secret, then commit again." >&2; exit 1; fi
exit 0
