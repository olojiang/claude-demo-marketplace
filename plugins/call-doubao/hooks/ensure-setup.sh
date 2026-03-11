#!/usr/bin/env bash
# [SessionStart Hook] Ensure call-doubao dependencies are installed

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CHANGED=0

if [ ! -d "$PLUGIN_DIR/node_modules" ]; then
  cd "$PLUGIN_DIR"
  npm install --omit=dev --silent 2>/dev/null
  CHANGED=1
fi

if [ ! -x "$PLUGIN_DIR/src/cli.js" ]; then
  chmod +x "$PLUGIN_DIR/src/cli.js"
  CHANGED=1
fi

if [ "$CHANGED" = "1" ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[call-doubao] auto-setup completed: dependencies installed, cli executable."}}'
fi

exit 0
