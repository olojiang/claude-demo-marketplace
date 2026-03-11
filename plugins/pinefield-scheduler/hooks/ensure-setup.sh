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
    if pm2 start "$PLUGIN_DIR/dist/daemon.js" --name pinefield-scheduler --silent; then
      CHANGED=1
    else
      echo "[pinefield-scheduler] ensure-setup: pm2 start failed" >&2
    fi
  fi
else
  echo "[pinefield-scheduler] ensure-setup: pm2 not found, daemon not started. Install with: npm install -g pm2" >&2
fi

if [ "$CHANGED" = "1" ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[pinefield-scheduler] auto-setup completed: data directory created, daemon started."}}'
fi

exit 0
