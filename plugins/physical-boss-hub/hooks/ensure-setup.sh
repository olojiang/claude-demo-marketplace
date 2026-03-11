#!/usr/bin/env bash
# [SessionStart Hook] Ensure physical-boss-hub data dirs, permissions, and daemon

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${HOME}/.pinefield/physical-boss-hub/channels"
CHANGED=0

if [ ! -d "$DATA_DIR" ]; then
  mkdir -p "$DATA_DIR"
  CHANGED=1
fi

for script in cli.js worker.js daemon.js; do
  if [ -f "$PLUGIN_DIR/src/$script" ] && [ ! -x "$PLUGIN_DIR/src/$script" ]; then
    chmod +x "$PLUGIN_DIR/src/$script"
    CHANGED=1
  fi
done

if command -v pm2 &>/dev/null; then
  if ! pm2 describe physical-boss-hub-daemon &>/dev/null; then
    if pm2 start "$PLUGIN_DIR/src/daemon.js" --name physical-boss-hub-daemon --silent; then
      CHANGED=1
    else
      echo "[physical-boss-hub] ensure-setup: pm2 start failed" >&2
    fi
  fi
else
  echo "[physical-boss-hub] ensure-setup: pm2 not found, daemon not started. Install with: npm install -g pm2" >&2
fi

if [ "$CHANGED" = "1" ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[physical-boss-hub] auto-setup completed: data dirs created, scripts executable, daemon started."}}'
fi

exit 0
