#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "call-doubao: installing dependencies..."
cd "$SCRIPT_DIR"
npm install --omit=dev

chmod +x "$SCRIPT_DIR/src/cli.js"

echo ""
echo "call-doubao: setup complete"
echo ""
echo "Usage:"
echo "  call-doubao chat \"<text>\""
echo "  call-doubao chat \"<text>\" --image <url>"
echo "  call-doubao image \"<prompt>\" --ratio 1:1 --style 写实"
echo "  call-doubao token-check <token>"
echo ""
echo "Environment:"
echo "  export DOUBAO_API_KEY=\"your-api-key\""
echo ""
