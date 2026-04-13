#!/bin/bash
set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_SCRIPT_DIR="$PLUGIN_DIR/skills/physical-boss-hub-skill/scripts"

echo "Setting up physical-boss-hub..."

echo "Creating data directory..."
mkdir -p "${HOME}/.pinefield/physical-boss-hub/channels"

echo "Syncing skill scripts..."
mkdir -p "$SKILL_SCRIPT_DIR"
find "$SKILL_SCRIPT_DIR" -maxdepth 1 -type f -name '*.js' -delete
cp "$PLUGIN_DIR"/src/*.js "$SKILL_SCRIPT_DIR"/

echo "Making scripts executable..."
chmod +x "$SKILL_SCRIPT_DIR/cli.js"
chmod +x "$SKILL_SCRIPT_DIR/worker.js"
chmod +x "$SKILL_SCRIPT_DIR/daemon.js"

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
  pm2 start "$SKILL_SCRIPT_DIR/daemon.js" --name physical-boss-hub-daemon
fi

echo ""
echo "Setup complete!"
echo "  CLI:           node $SKILL_SCRIPT_DIR/cli.js --help"
echo "  Daemon status: pm2 status physical-boss-hub-daemon"
echo "  Daemon logs:   pm2 logs physical-boss-hub-daemon"
echo ""
echo "Register entities to auto-start workers:"
echo "  node $SKILL_SCRIPT_DIR/cli.js person register --name Alice --description 'Developer' --actions 'code-review'"
