#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_SCRIPT_DIR="$SCRIPT_DIR/skills/call-doubao-skill/scripts"

mkdir -p "$SKILL_SCRIPT_DIR"
find "$SKILL_SCRIPT_DIR" -maxdepth 1 -type f -name '*.js' -delete
for file in "$SCRIPT_DIR"/src/*.js; do
  case "$file" in
    *.test.js) continue ;;
  esac
  cp "$file" "$SKILL_SCRIPT_DIR"/
done
chmod +x "$SKILL_SCRIPT_DIR/cli.js"

echo ""
echo "call-doubao: setup complete (no npm dependencies needed)"
echo ""
echo "Usage:"
echo "  call-doubao chat \"<text>\""
echo "  call-doubao chat \"<text>\" --image <url|path>"
echo "  call-doubao image \"<prompt>\" --ratio 1:1 --style 写实"
echo "  call-doubao image \"<prompt>\" --image <url|path>"
echo "  call-doubao token-check <token>"
echo ""
echo "Environment:"
echo "  export DOUBAO_API_KEY=\"your-api-key\""
echo ""
