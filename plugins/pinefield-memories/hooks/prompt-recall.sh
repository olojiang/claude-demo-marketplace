#!/bin/bash
# [UserPromptSubmit Hook] Search related memories when user submits a prompt

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MEM_CLI="${SCRIPT_DIR}/dist/cli.js"

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

if [ -z "$PROMPT" ]; then
  exit 0
fi

QUERY=$(echo "$PROMPT" | cut -c1-100)

if [ ${#QUERY} -lt 2 ]; then
  exit 0
fi

RESULTS=$(node "$MEM_CLI" search --query "$QUERY" 2>/dev/null)

if [ -z "$RESULTS" ] || [ "$RESULTS" = "[]" ]; then
  exit 0
fi

RESULT_COUNT=$(echo "$RESULTS" | jq 'length' 2>/dev/null)
if [ "$RESULT_COUNT" = "0" ] || [ -z "$RESULT_COUNT" ]; then
  exit 0
fi

FORMATTED=$(echo "$RESULTS" | jq -r '.[0:5] | .[] | "- [\(.tags // [] | join(","))] \(.content[0:300])"' 2>/dev/null)

if [ -n "$FORMATTED" ]; then
  CONTEXT="[Pinefield Memory] Related memories (${RESULT_COUNT} matches, showing top 5):

${FORMATTED}"

  jq -n --arg ctx "$CONTEXT" '{
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: $ctx
    }
  }'
fi

exit 0
