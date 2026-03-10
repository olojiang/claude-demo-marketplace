#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "kimi-search: installing dependencies..."
cd "$SCRIPT_DIR"
npm install --omit=dev

chmod +x "$SCRIPT_DIR/src/cli.js"

echo ""
echo "kimi-search: setup complete"
echo ""
echo "Usage:"
echo "  kimi-search search \"<query>\""
echo ""
echo "Environment:"
echo "  export KIMI_API_KEY=\"your-api-key\""
echo ""
