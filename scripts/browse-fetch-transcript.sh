#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

TITLE="$1"
[ -z "$TITLE" ] && exit 0

SAFE=$(sanitize_title "$TITLE")
CACHE_FILE="$(cache_dir)/transcripts/${SAFE}.json"

# Already cached
if [ -f "$CACHE_FILE" ]; then
  echo "Transcript already cached."
  sleep 1
  exit 0
fi

echo "Fetching transcript for: $TITLE"
echo ""
cached_transcript "$TITLE" > /dev/null
echo "Done."
sleep 1
