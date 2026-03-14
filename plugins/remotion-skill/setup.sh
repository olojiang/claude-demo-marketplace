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

echo "[remotion-skill] OK - Remotion + FFmpeg"
