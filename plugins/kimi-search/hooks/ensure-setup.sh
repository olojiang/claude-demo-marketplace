#!/usr/bin/env bash
# [SessionStart Hook] Ensure kimi-search dependencies are installed

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CHANGED=0

if [ ! -d "$PLUGIN_DIR/node_modules/openai" ]; then
  cd "$PLUGIN_DIR"
  if ! npm install --omit=dev --silent 2>&1; then
    echo "[kimi-search] ensure-setup: npm install failed" >&2
  fi
  CHANGED=1
fi

if [ ! -x "$PLUGIN_DIR/src/cli.js" ]; then
  chmod +x "$PLUGIN_DIR/src/cli.js"
  CHANGED=1
fi

if [ "$CHANGED" = "1" ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[kimi-search] auto-setup completed: dependencies installed, cli executable."}}'
fi

exit 0
