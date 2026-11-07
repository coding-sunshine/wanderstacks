#!/bin/sh
# Re-prove a fact from a page that blocks scripts (Cloudflare): open it in headed Chrome, grep the visible text.
# Usage: scripts/ab-check.sh URL REGEX   (AB_SESSION picks the browser session; default ab-check)
set -e
S="agent-browser --session ${AB_SESSION:-ab-check}"
$S --headed --executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --args "--disable-blink-features=AutomationControlled" open "$1" >/dev/null
$S wait 5000 >/dev/null
T=$($S get text body)
[ -z "$AB_SESSION" ] && $S close >/dev/null 2>&1
printf '%s' "$T" | rg -q -- "$2"
