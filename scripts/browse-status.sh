#!/usr/bin/env bash
source "$(dirname "$0")/cache.sh"

CACHE_DIR=$(cache_dir)
PIDFILE="$CACHE_DIR/.playback_pid"
KEYS="ctrl-p: play | ctrl-s: stop | ctrl-t: transcript | ctrl-d: download | ctrl-r: refresh"

if [ -f "$PIDFILE" ]; then
  PID=$(head -1 "$PIDFILE")
  TITLE=$(tail -1 "$PIDFILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "▶ $TITLE | $KEYS"
    exit 0
  else
    rm -f "$PIDFILE"
  fi
fi

echo "$KEYS"
