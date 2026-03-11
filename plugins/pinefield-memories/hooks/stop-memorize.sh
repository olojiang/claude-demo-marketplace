#!/bin/bash
# [Stop Hook] Use AI to judge if the response contains info worth remembering

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MEM_CLI="${SCRIPT_DIR}/dist/cli.js"
LOG_FILE="${HOME}/.pinefield/memories/hook.log"

mkdir -p "$(dirname "$LOG_FILE")"

for cmd in jq node; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] stop-memorize: $cmd not found, skipping" >> "$LOG_FILE"
    exit 0
  fi
done

INPUT=$(cat)

STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // empty')
if [ -z "$LAST_MSG" ]; then
  exit 0
fi

MSG_LEN=${#LAST_MSG}
if [ "$MSG_LEN" -lt 100 ]; then
  exit 0
fi

TRUNCATED_MSG=$(echo "$LAST_MSG" | head -c 8000)

JUDGE_PROMPT="You are a memory management assistant. Analyze the following AI assistant response and determine if it contains information worth saving to long-term memory.

Worth remembering:
1. User preferences, habits, workflows
2. Architecture decisions, tech choices, important conventions
3. Solutions to tricky bugs
4. Content user explicitly asked to remember
5. Important config or environment info

Not worth remembering:
- Simple code generation/modification
- Pure information queries
- Routine operations

Output strict JSON only:
{
  \"worth_remembering\": true/false,
  \"summary\": \"distilled memory (1-2 sentences)\",
  \"tags\": [\"tag1\", \"tag2\"]
}

---

AI response:
${TRUNCATED_MSG}"

if ! command -v claude &>/dev/null; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] stop-memorize: claude CLI not found, skipping" >> "$LOG_FILE"
  exit 0
fi

RESULT=$(echo "$JUDGE_PROMPT" | claude -p --output-format json 2>/dev/null)

if [ -z "$RESULT" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] stop-memorize: claude judge returned empty" >> "$LOG_FILE"
  exit 0
fi

WORTH=$(echo "$RESULT" | jq -r '.worth_remembering // false' 2>/dev/null)

if [ "$WORTH" = "true" ]; then
  SUMMARY=$(echo "$RESULT" | jq -r '.summary // empty' 2>/dev/null)
  TAGS=$(echo "$RESULT" | jq -r '.tags // [] | join(",")' 2>/dev/null)

  if [ -n "$SUMMARY" ]; then
    SAVE_TAGS="auto-memory"
    if [ -n "$TAGS" ]; then
      SAVE_TAGS="${SAVE_TAGS},${TAGS}"
    fi

    export MEM_SAVE_CONTENT="$SUMMARY"
    export MEM_SAVE_TAGS="$SAVE_TAGS"
    node -e 'const{execFileSync}=require("child_process");try{execFileSync("node",[process.argv[1],"save","--content",process.env.MEM_SAVE_CONTENT,"--tags",process.env.MEM_SAVE_TAGS],{stdio:"inherit"})}catch(e){process.exit(1)}' "$MEM_CLI" 2>/dev/null \
      && echo "[$(date '+%Y-%m-%d %H:%M:%S')] stop-memorize: saved memory - ${SUMMARY:0:80}" >> "$LOG_FILE" \
      || echo "[$(date '+%Y-%m-%d %H:%M:%S')] stop-memorize: save failed" >> "$LOG_FILE"
    unset MEM_SAVE_CONTENT MEM_SAVE_TAGS
  fi
fi

exit 0
