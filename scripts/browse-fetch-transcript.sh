#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

TITLE="$1"
[ -z "$TITLE" ] && exit 0

SAFE=$(sanitize_title "$TITLE")
CACHE_FILE="$(cache_dir)/transcripts/${SAFE}.json"

# Already cached — nothing to do
[ -f "$CACHE_FILE" ] && exit 0

# Fetch (slow)
cached_transcript "$TITLE" > /dev/null
