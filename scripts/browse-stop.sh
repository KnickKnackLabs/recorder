#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

PIDFILE=$(playback_pidfile)
if [ -f "$PIDFILE" ]; then
  PID=$(head -1 "$PIDFILE")
  kill "$PID" 2>/dev/null || true
  rm -f "$PIDFILE"
fi
