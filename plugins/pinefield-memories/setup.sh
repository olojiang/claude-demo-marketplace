#!/bin/bash
# Setup script for pinefield-memories plugin
# The CLI is pre-built and bundled — no compilation needed.

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Setting up pinefield-memories..."

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
