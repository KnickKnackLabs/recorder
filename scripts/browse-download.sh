#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

TITLE="$1"
SAFE=$(sanitize_title "$TITLE")
DEST="$HOME/Downloads/${SAFE}.m4a"

AUDIO=$(cached_audio "$TITLE")
if [ -n "$AUDIO" ] && [ -f "$AUDIO" ]; then
  cp "$AUDIO" "$DEST"
  echo "Saved: $DEST"
else
  echo "Failed to download recording."
fi

echo ""
echo "Press any key to return..."
read -n 1
