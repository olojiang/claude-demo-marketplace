#!/bin/bash
# Setup script for pinefield-scheduler plugin
# All dependencies are bundled — no npm install needed.

set -e

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_SCRIPT_DIR="$PLUGIN_DIR/skills/scheduler-skill/scripts"

echo "Setting up pinefield-scheduler..."

echo "Creating scheduler data directory..."
mkdir -p "${HOME}/.pinefield/scheduler"

echo "Syncing skill scripts..."
mkdir -p "$SKILL_SCRIPT_DIR"
find "$SKILL_SCRIPT_DIR" -maxdepth 1 -type f -name '*.js' -delete
cp "$PLUGIN_DIR"/dist/*.js "$SKILL_SCRIPT_DIR"/
chmod +x "$SKILL_SCRIPT_DIR/daemon.js"

if ! command -v pm2 &> /dev/null; then
  echo ""
  echo "WARNING: pm2 is not installed. Install it with: npm install -g pm2"
  echo "The daemon needs pm2 to run in the background."
  echo ""
  echo "After installing pm2, start the daemon with:"
  echo "  pm2 start $SKILL_SCRIPT_DIR/daemon.js --name pinefield-scheduler"
  exit 0
fi

if pm2 describe pinefield-scheduler &>/dev/null; then
  echo "Restarting existing daemon..."
  pm2 restart pinefield-scheduler
else
  echo "Starting scheduler daemon..."
  pm2 start "$SKILL_SCRIPT_DIR/daemon.js" --name pinefield-scheduler
fi

echo ""
echo "Setup complete!"
echo "  Daemon status: pm2 status pinefield-scheduler"
echo "  Daemon logs:   pm2 logs pinefield-scheduler"
