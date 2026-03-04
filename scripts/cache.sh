#!/usr/bin/env bash
# Cache library for recorder. Source this, don't execute it.

cache_dir() {
  local dir="${XDG_CACHE_HOME:-$HOME/.cache}/recorder"
  mkdir -p "$dir" "$dir/transcripts" "$dir/audio"
  echo "$dir"
}

sanitize_title() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | sed 's/__*/_/g' | sed 's/^_//;s/_$//'
}

repo_dir() {
  echo "${RECORDER_ROOT:?RECORDER_ROOT not set}"
}

cached_list() {
  local cache="$(cache_dir)/recordings.json"
  if [ "$1" = "--refresh" ] || [ ! -f "$cache" ]; then
    local script="$(repo_dir)/scripts/list-recordings.mjs"
    local result
    result=$(shimmer browser:run "$script" 2>/dev/null | grep '^\[')
    if [ -n "$result" ]; then
      echo "$result" > "$cache"
    fi
  fi
  if [ -f "$cache" ]; then
    cat "$cache"
  else
    echo "[]"
  fi
}

cached_transcript() {
  local title="$1"
  local safe=$(sanitize_title "$title")
  local cache="$(cache_dir)/transcripts/${safe}.json"
  if [ ! -f "$cache" ]; then
    local script="$(repo_dir)/scripts/get-transcript.mjs"
    local result
    result=$(shimmer browser:run "$script" -- "$title" 2>/dev/null | grep '^{')
    if [ -n "$result" ]; then
      echo "$result" > "$cache"
    fi
  fi
  if [ -f "$cache" ]; then
    cat "$cache"
  else
    echo "{}"
  fi
}

cached_audio() {
  local title="$1"
  local safe=$(sanitize_title "$title")
  local cache="$(cache_dir)/audio/${safe}.m4a"
  if [ ! -f "$cache" ]; then
    local script="$(repo_dir)/scripts/get-recording.mjs"
    shimmer browser:run "$script" -- "$title" "$cache" 2>/dev/null | grep '^{' > /dev/null
  fi
  if [ -f "$cache" ]; then
    echo "$cache"
  fi
}

playback_pidfile() {
  echo "$(cache_dir)/.playback_pid"
}
