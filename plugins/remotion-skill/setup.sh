#!/usr/bin/env bash
# remotion-skill 前置检查

echo "[remotion-skill] Checking dependencies..."

if ! command -v node &>/dev/null; then
  echo "[remotion-skill] Node.js not found. Install Node.js 18+"
  exit 1
fi

if ! command -v ffmpeg &>/dev/null; then
  echo "[remotion-skill] FFmpeg not found. Install FFmpeg (required by Remotion)"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "[remotion-skill] Run: pnpm install"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_SCRIPT_DIR="$SCRIPT_DIR/skills/remotion-skill/scripts"

mkdir -p "$SKILL_SCRIPT_DIR"
find "$SKILL_SCRIPT_DIR" -maxdepth 1 -type f \( -name '*.js' -o -name '*.ts' -o -name '*.tsx' \) -delete
cp "$SCRIPT_DIR/src/cli.js" "$SKILL_SCRIPT_DIR/"
cp "$SCRIPT_DIR/src/index.ts" "$SCRIPT_DIR/src/Root.tsx" "$SCRIPT_DIR/src/ContentVideo.tsx" "$SKILL_SCRIPT_DIR/"
chmod +x "$SKILL_SCRIPT_DIR/cli.js"

echo "[remotion-skill] skill scripts synced -> $SKILL_SCRIPT_DIR"
echo "[remotion-skill] OK - Remotion + FFmpeg"
