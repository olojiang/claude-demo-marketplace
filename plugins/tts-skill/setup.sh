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

echo "[tts-skill] OK - Edge TTS (no API key required)"
