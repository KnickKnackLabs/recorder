#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

TITLE="$1"
PIDFILE=$(playback_pidfile)

stop_playback() {
  if [ -f "$PIDFILE" ]; then
    local pid
    pid=$(head -1 "$PIDFILE")
    kill "$pid" 2>/dev/null || true
    rm -f "$PIDFILE"
  fi
}

start_playback() {
  local audio
  audio=$(cached_audio "$TITLE")
  if [ -n "$audio" ] && [ -f "$audio" ]; then
    afplay "$audio" &
    printf '%s\n%s\n' "$!" "$TITLE" > "$PIDFILE"
  fi
}

# Check current state
if [ -f "$PIDFILE" ]; then
  OLD_PID=$(head -1 "$PIDFILE")
  OLD_TITLE=$(tail -1 "$PIDFILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    if [ "$OLD_TITLE" = "$TITLE" ]; then
      stop_playback
      exit 0
    else
      stop_playback
      start_playback
      exit 0
    fi
  else
    rm -f "$PIDFILE"
  fi
fi

start_playback
