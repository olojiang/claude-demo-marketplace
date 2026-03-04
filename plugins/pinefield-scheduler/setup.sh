#!/bin/bash
# Setup script for pinefield-scheduler plugin
# Installs dependencies, builds, and starts the daemon

set -e

PROJECT_DIR="/Users/hunter/Workspace/pinefield_scheduler"

echo "Setting up pinefield-scheduler..."
echo "Project directory: $PROJECT_DIR"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "ERROR: Source project not found at $PROJECT_DIR"
  exit 1
fi

cd "$PROJECT_DIR"

echo "Installing dependencies..."
pnpm install

echo "Building..."
pnpm build

echo "Creating scheduler data directory..."
mkdir -p "${HOME}/.pinefield/scheduler"

# Check if pm2 is available
if ! command -v pm2 &> /dev/null; then
  echo "WARNING: pm2 is not installed. Install it with: npm install -g pm2"
  echo "The daemon needs pm2 to run in the background."
  echo ""
  echo "After installing pm2, start the daemon with:"
  echo "  pm2 start $PROJECT_DIR/dist/daemon.js --name pinefield-scheduler"
  exit 0
fi

# Check if daemon is already running
if pm2 describe pinefield-scheduler &>/dev/null; then
  echo "Restarting existing daemon..."
  pm2 restart pinefield-scheduler
else
  echo "Starting scheduler daemon..."
  pm2 start "$PROJECT_DIR/dist/daemon.js" --name pinefield-scheduler
fi

echo ""
echo "Setup complete!"
echo "  Daemon status: pm2 status pinefield-scheduler"
echo "  Daemon logs:   pm2 logs pinefield-scheduler"
echo "  MCP server:    node $PROJECT_DIR/dist/mcp-server.js"
