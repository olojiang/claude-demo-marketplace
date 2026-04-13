#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DAEMON_SCRIPT="$SCRIPT_DIR/daemon.js"

echo "Setting up pinefield-scheduler..."
mkdir -p "${HOME}/.pinefield/scheduler"
chmod +x "$DAEMON_SCRIPT"

if ! command -v pm2 >/dev/null 2>&1; then
  echo ""
  echo "WARNING: pm2 is not installed. Install it with: npm install -g pm2"
  echo "After installing pm2, start the daemon with:"
  echo "  pm2 start $DAEMON_SCRIPT --name pinefield-scheduler"
  exit 0
fi

if pm2 describe pinefield-scheduler >/dev/null 2>&1; then
  echo "Restarting existing daemon..."
  pm2 restart pinefield-scheduler
else
  echo "Starting scheduler daemon..."
  pm2 start "$DAEMON_SCRIPT" --name pinefield-scheduler
fi

echo ""
echo "Setup complete!"
echo "  Daemon status: pm2 status pinefield-scheduler"
echo "  Daemon logs:   pm2 logs pinefield-scheduler"
