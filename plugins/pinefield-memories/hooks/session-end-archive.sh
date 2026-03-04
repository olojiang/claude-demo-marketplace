#!/bin/bash
# [Stop Hook] Archive unsummarized session logs (runs async, non-blocking)

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MEM_CLI="${SCRIPT_DIR}/dist/cli.js"
LOG_FILE="${HOME}/.pinefield/memories/hook.log"

mkdir -p "$(dirname "$LOG_FILE")"

{
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Session archive triggered"
  node "$MEM_CLI" archive 2>&1
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Archive completed"
} >> "$LOG_FILE" 2>&1

exit 0
