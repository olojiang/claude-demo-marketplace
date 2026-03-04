#!/bin/bash
# [SessionStart Hook] Inject recent memories as context when session starts

MEM_CLI="/Users/hunter/Workspace/pinefield_memories/dist/cli.js"

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
