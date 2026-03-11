#!/usr/bin/env bash
# [SessionStart Hook] Ensure call-doubao cli is executable
# No production dependencies needed — uses only Node.js built-in APIs (fetch, fs, path)

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -x "$PLUGIN_DIR/src/cli.js" ]; then
  chmod +x "$PLUGIN_DIR/src/cli.js"
  echo '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[call-doubao] auto-setup completed: cli executable."}}'
fi

exit 0
