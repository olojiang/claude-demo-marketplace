#!/bin/bash
# [Stop Hook] Archive unsummarized session logs (runs async, non-blocking)

MEM_CLI="/Users/hunter/Workspace/pinefield_memories/dist/cli.js"
LOG_FILE="${HOME}/.pinefield/memories/hook.log"

mkdir -p "$(dirname "$LOG_FILE")"

{
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Session archive triggered"
  node "$MEM_CLI" archive 2>&1
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Archive completed"
} >> "$LOG_FILE" 2>&1

exit 0
