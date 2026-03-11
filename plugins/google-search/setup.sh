#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "google-search: installing dependencies..."
cd "$SCRIPT_DIR"
npm install --omit=dev

chmod +x "$SCRIPT_DIR/src/cli.js"

echo ""
echo "google-search: setup complete"
echo ""
echo "Usage:"
echo "  google-search search \"<query>\""
echo ""
echo "Environment:"
echo "  export GEMINI_API_KEY=\"your-api-key\""
echo ""
