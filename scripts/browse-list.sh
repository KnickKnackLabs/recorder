#!/usr/bin/env bash
set -eo pipefail
source "$(dirname "$0")/cache.sh"

REFRESH="${1:-}"

if [ "$REFRESH" = "--refresh" ]; then
  json=$(cached_list --refresh)
else
  json=$(cached_list)
fi

echo "$json" | jq -r '.[] | "\(.title)\t\(.duration)\t\(.location)"'
