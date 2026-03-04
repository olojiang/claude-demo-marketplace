#!/bin/bash
# Setup script for pinefield-memories plugin
# Installs dependencies and builds the CLI tool

set -e

PROJECT_DIR="/Users/hunter/Workspace/pinefield_memories"

echo "Setting up pinefield-memories..."
echo "Project directory: $PROJECT_DIR"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "ERROR: Source project not found at $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

echo "Installing dependencies..."
pnpm install

echo "Building CLI..."
pnpm build

echo "Creating memory storage directory..."
mkdir -p "${HOME}/.pinefield/memories"

echo "Making hook scripts executable..."
PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
chmod +x "$PLUGIN_DIR/hooks/"*.sh

echo "Setup complete! Memory CLI is ready at: $PROJECT_DIR/dist/cli.js"
echo ""
echo "Quick test:"
echo "  node $PROJECT_DIR/dist/cli.js list"
