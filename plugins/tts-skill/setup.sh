#!/usr/bin/env bash
# tts-skill 前置检查

echo "[tts-skill] Checking dependencies..."

if ! command -v node &>/dev/null; then
  echo "[tts-skill] Node.js not found. Install Node.js 18+"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "[tts-skill] Run: pnpm install"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_SCRIPT_DIR="$SCRIPT_DIR/skills/tts-skill/scripts"

mkdir -p "$SKILL_SCRIPT_DIR"
find "$SKILL_SCRIPT_DIR" -maxdepth 1 -type f -name '*.js' -delete
cp "$SCRIPT_DIR"/src/*.js "$SKILL_SCRIPT_DIR"/
chmod +x "$SKILL_SCRIPT_DIR/cli.js"

echo "[tts-skill] skill scripts synced -> $SKILL_SCRIPT_DIR"
echo "[tts-skill] OK - Edge TTS (no API key required)"
