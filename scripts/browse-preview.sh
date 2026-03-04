#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

TITLE="$1"
if [ -z "$TITLE" ]; then
  echo "No recording selected"
  exit 0
fi

SAFE=$(sanitize_title "$TITLE")
CACHE_DIR=$(cache_dir)

# Get recording metadata from cached list
DURATION=""
LOCATION=""
LIST_CACHE="$CACHE_DIR/recordings.json"
if [ -f "$LIST_CACHE" ]; then
  DURATION=$(jq -r --arg t "$TITLE" '.[] | select(.title == $t) | .duration' "$LIST_CACHE")
  LOCATION=$(jq -r --arg t "$TITLE" '.[] | select(.title == $t) | .location' "$LIST_CACHE")
fi

# Recording info
echo "  $TITLE"
echo "  ─────────────────────────────────────────"
[ -n "$DURATION" ] && echo "  Duration: $DURATION"
[ -n "$LOCATION" ] && [ "$LOCATION" != "null" ] && [ -n "$LOCATION" ] && echo "  Location: $LOCATION"
echo ""

# Transcript section
TRANSCRIPT_CACHE="$CACHE_DIR/transcripts/${SAFE}.json"
echo "  Transcript"
echo "  ─────────────────────────────────────────"
if [ -f "$TRANSCRIPT_CACHE" ]; then
  jq -r '.utterances[] | "  [\(.time)]  \(.text)"' "$TRANSCRIPT_CACHE"
else
  echo "  Press ctrl-t to load"
fi
echo ""

# Audio section
AUDIO_CACHE="$CACHE_DIR/audio/${SAFE}.m4a"
echo "  Audio"
echo "  ─────────────────────────────────────────"
if [ -f "$AUDIO_CACHE" ]; then
  SIZE=$(du -h "$AUDIO_CACHE" | cut -f1 | tr -d ' ')
  echo "  Cached ($SIZE) — press ctrl-p to play"
else
  echo "  Press ctrl-p to download and play"
fi

# Playback status
PIDFILE="$CACHE_DIR/.playback_pid"
if [ -f "$PIDFILE" ]; then
  PLAY_PID=$(head -1 "$PIDFILE")
  PLAY_TITLE=$(tail -1 "$PIDFILE")
  if kill -0 "$PLAY_PID" 2>/dev/null; then
    if [ "$PLAY_TITLE" = "$TITLE" ]; then
      echo "  ▶ Playing — press ctrl-p to stop"
    else
      echo "  ▶ Playing: $PLAY_TITLE"
    fi
  fi
fi
