#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

TITLE="$1"
if [ -z "$TITLE" ]; then
  echo "No recording selected"
  exit 0
fi

SAFE=$(sanitize_title "$TITLE")
CACHE_FILE="$(cache_dir)/transcripts/${SAFE}.json"

# Fast path: cached
if [ -f "$CACHE_FILE" ]; then
  echo "  $TITLE"
  echo "  ─────────────────────────────────────────"
  echo ""
  jq -r '.utterances[] | "  [\(.time)]  \(.text)"' "$CACHE_FILE"
  exit 0
fi

# Slow path: fetch
echo "  Loading transcript..."
echo "  (fetching from Google Recorder, ~10s)"
echo ""

TRANSCRIPT=$(cached_transcript "$TITLE")
if [ -n "$TRANSCRIPT" ] && [ "$TRANSCRIPT" != "{}" ]; then
  printf '\033[2J'
  echo "  $TITLE"
  echo "  ─────────────────────────────────────────"
  echo ""
  echo "$TRANSCRIPT" | jq -r '.utterances[] | "  [\(.time)]  \(.text)"'
else
  echo "  (no transcript available)"
fi
