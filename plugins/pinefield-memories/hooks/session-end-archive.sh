#!/bin/bash
# [Stop Hook] Archive unsummarized session logs (runs synchronously within hook timeout)

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MEM_CLI="${SCRIPT_DIR}/dist/cli.js"
LOG_FILE="${HOME}/.pinefield/memories/hook.log"

mkdir -p "$(dirname "$LOG_FILE")"

if ! command -v node &>/dev/null; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] session-end-archive: node not found, skipping" >> "$LOG_FILE"
  exit 0
fi

{
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] session-end-archive: triggered"
  node "$MEM_CLI" archive 2>&1
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] session-end-archive: completed"
} >> "$LOG_FILE" 2>&1

exit 0
