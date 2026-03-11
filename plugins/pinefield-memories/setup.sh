#!/bin/bash
# Setup script for pinefield-memories plugin
# The CLI is pre-built and bundled — no compilation needed.

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Setting up pinefield-memories..."

MISSING_DEPS=""
for cmd in node jq; do
  if ! command -v "$cmd" &>/dev/null; then
    MISSING_DEPS="${MISSING_DEPS} $cmd"
  fi
done

if [ -n "$MISSING_DEPS" ]; then
  echo "WARNING: missing dependencies:${MISSING_DEPS}"
  echo "  Hook scripts require node and jq to function properly."
fi

if ! command -v claude &>/dev/null; then
  echo "WARNING: claude CLI not found"
  echo "  stop-memorize hook requires 'claude -p' for AI memory extraction."
fi

echo "Creating memory storage directory..."
mkdir -p "${HOME}/.pinefield/memories"

echo "Making hook scripts executable..."
chmod +x "$PLUGIN_DIR/hooks/"*.sh

echo ""
echo "Setup complete!"
echo "  CLI location: $PLUGIN_DIR/dist/cli.js"
echo ""
echo "Quick test:"
echo "  node $PLUGIN_DIR/dist/cli.js list"
