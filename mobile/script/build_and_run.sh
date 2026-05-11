#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

RUNNER="npx expo"
if command -v npm >/dev/null 2>&1; then
  RUNNER="npx expo"
fi

case "${1:-}" in
  --android)
    $RUNNER start --android
    ;;
  --ios)
    $RUNNER start --ios
    ;;
  --web)
    $RUNNER start --web
    ;;
  --tunnel)
    $RUNNER start --tunnel
    ;;
  --export-web)
    $RUNNER export -p web
    ;;
  --help)
    echo "Usage: ./script/build_and_run.sh [--android|--ios|--web|--tunnel|--export-web]"
    ;;
  *)
    $RUNNER start
    ;;
esac
