#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_SCRIPT_DIR="$SCRIPT_DIR/skills/google-search-skill/scripts"

echo "google-search: installing dependencies..."
cd "$SCRIPT_DIR"
npm install --omit=dev

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
echo "google-search: setup complete"
echo ""
echo "Usage:"
echo "  google-search search \"<query>\""
echo ""
echo "Environment:"
echo "  export GEMINI_API_KEY=\"your-api-key\""
echo ""
