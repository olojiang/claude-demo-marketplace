#!/usr/bin/env bash
# [SessionStart Hook] Ensure pinefield-scheduler data dir and daemon

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${HOME}/.pinefield/scheduler"
CHANGED=0

if [ ! -d "$DATA_DIR" ]; then
  mkdir -p "$DATA_DIR"
  CHANGED=1
fi

if command -v pm2 &>/dev/null; then
  if ! pm2 describe pinefield-scheduler &>/dev/null; then
    pm2 start "$PLUGIN_DIR/dist/daemon.js" --name pinefield-scheduler --silent 2>/dev/null
    CHANGED=1
  fi
fi

if [ "$CHANGED" = "1" ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[pinefield-scheduler] auto-setup completed: data directory created, daemon started."}}'
fi

exit 0
