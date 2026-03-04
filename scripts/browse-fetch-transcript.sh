#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

TITLE="$1"
[ -z "$TITLE" ] && exit 0

SAFE=$(sanitize_title "$TITLE")
CACHE_DIR=$(cache_dir)
CACHE_FILE="$CACHE_DIR/transcripts/${SAFE}.json"
LOADING_FILE="$CACHE_DIR/transcripts/${SAFE}.loading"

# Already cached — nothing to do
[ -f "$CACHE_FILE" ] && exit 0

# Mark as loading
touch "$LOADING_FILE"

# Fetch (slow)
cached_transcript "$TITLE" > /dev/null

# Clean up marker
rm -f "$LOADING_FILE"
