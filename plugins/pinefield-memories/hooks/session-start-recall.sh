#!/bin/bash
# [SessionStart Hook] Inject recent memories as context when session starts

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MEM_CLI="${SCRIPT_DIR}/dist/cli.js"
LOG_FILE="${HOME}/.pinefield/memories/hook.log"

for cmd in jq node; do
  if ! command -v "$cmd" &>/dev/null; then
    mkdir -p "$(dirname "$LOG_FILE")"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] session-start-recall: $cmd not found, skipping" >> "$LOG_FILE"
    exit 0
  fi
done

MEMORIES=$(node "$MEM_CLI" list 2>/dev/null)

if [ -z "$MEMORIES" ] || [ "$MEMORIES" = "[]" ]; then
  exit 0
fi

ENTRY_COUNT=$(echo "$MEMORIES" | jq 'length' 2>/dev/null)
if [ "$ENTRY_COUNT" = "0" ] || [ -z "$ENTRY_COUNT" ]; then
  exit 0
fi

RECENT=$(echo "$MEMORIES" | jq -r '.[0:10] | .[] | "- [\(.timestamp)] [\(.tags // [] | join(","))] \(.content[0:200])"' 2>/dev/null)

if [ -n "$RECENT" ]; then
  CONTEXT="[Pinefield Memory] Recent memories (${ENTRY_COUNT} total, showing latest 10):

${RECENT}"

  jq -n --arg ctx "$CONTEXT" '{
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: $ctx
    }
  }'
fi

exit 0
