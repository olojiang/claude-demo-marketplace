#!/bin/bash
set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Setting up physical-boss-hub..."

echo "Creating data directory..."
mkdir -p "${HOME}/.pinefield/physical-boss-hub/channels"

echo "Making scripts executable..."
chmod +x "$PLUGIN_DIR/src/cli.js"
chmod +x "$PLUGIN_DIR/src/worker.js"
chmod +x "$PLUGIN_DIR/src/daemon.js"

if ! command -v pm2 &> /dev/null; then
  echo ""
  echo "WARNING: pm2 is required for worker processes."
  echo "  Install: npm install -g pm2"
  echo ""
  echo "After installing pm2, re-run this setup script."
  exit 0
fi

if pm2 describe physical-boss-hub-daemon &>/dev/null; then
  echo "Restarting memory-channel daemon..."
  pm2 restart physical-boss-hub-daemon
else
  echo "Starting memory-channel daemon..."
  pm2 start "$PLUGIN_DIR/src/daemon.js" --name physical-boss-hub-daemon
fi

echo ""
echo "Setup complete!"
echo "  CLI:           node $PLUGIN_DIR/src/cli.js --help"
echo "  Daemon status: pm2 status physical-boss-hub-daemon"
echo "  Daemon logs:   pm2 logs physical-boss-hub-daemon"
echo ""
echo "Register entities to auto-start workers:"
echo "  node $PLUGIN_DIR/src/cli.js person register --name Alice --description 'Developer' --actions 'code-review'"
