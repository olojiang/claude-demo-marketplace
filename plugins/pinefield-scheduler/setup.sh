#!/bin/bash
# Setup script for pinefield-scheduler plugin
# Installs runtime dependencies and starts the PM2 daemon.
# The server and daemon are pre-built — no compilation needed.

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Setting up pinefield-scheduler..."

echo "Installing runtime dependencies..."
cd "$PLUGIN_DIR"
npm install --production 2>&1

echo "Creating scheduler data directory..."
mkdir -p "${HOME}/.pinefield/scheduler"

if ! command -v pm2 &> /dev/null; then
  echo ""
  echo "WARNING: pm2 is not installed. Install it with: npm install -g pm2"
  echo "The daemon needs pm2 to run in the background."
  echo ""
  echo "After installing pm2, start the daemon with:"
  echo "  pm2 start $PLUGIN_DIR/dist/daemon.js --name pinefield-scheduler"
  exit 0
fi

if pm2 describe pinefield-scheduler &>/dev/null; then
  echo "Restarting existing daemon..."
  pm2 restart pinefield-scheduler
else
  echo "Starting scheduler daemon..."
  pm2 start "$PLUGIN_DIR/dist/daemon.js" --name pinefield-scheduler
fi

echo ""
echo "Setup complete!"
echo "  Daemon status: pm2 status pinefield-scheduler"
echo "  Daemon logs:   pm2 logs pinefield-scheduler"
