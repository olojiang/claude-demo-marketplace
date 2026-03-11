#!/bin/bash
# [UserPromptSubmit Hook] Search related memories when user submits a prompt

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MEM_CLI="${SCRIPT_DIR}/dist/cli.js"
LOG_FILE="${HOME}/.pinefield/memories/hook.log"

mkdir -p "$(dirname "$LOG_FILE")"

for cmd in jq node; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: $cmd not found, skipping" >> "$LOG_FILE"
    exit 0
  fi
done

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')

echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: triggered, prompt='${PROMPT:0:80}'" >> "$LOG_FILE"

if [ -z "$PROMPT" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: empty prompt, skip" >> "$LOG_FILE"
  exit 0
fi

case "$PROMPT" in
  "You are a memory management"*|"你是一个记忆管理"*)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: skipped internal judge prompt" >> "$LOG_FILE"
    exit 0
    ;;
esac

QUERY=$(printf '%s' "$PROMPT" | head -c 100)

if [ ${#QUERY} -lt 2 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: query too short (${#QUERY}), skip" >> "$LOG_FILE"
  exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: searching query='${QUERY:0:60}'" >> "$LOG_FILE"

export MEM_SEARCH_QUERY="$QUERY"
RESULTS=$(node -e 'const{execFileSync}=require("child_process");try{const r=execFileSync("node",[process.argv[1],"search","--query",process.env.MEM_SEARCH_QUERY],{encoding:"utf-8"});process.stdout.write(r)}catch(e){process.exit(1)}' "$MEM_CLI" 2>/dev/null)
unset MEM_SEARCH_QUERY

echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: search returned ${#RESULTS} bytes" >> "$LOG_FILE"

if [ -z "$RESULTS" ] || [ "$RESULTS" = "[]" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: no results found" >> "$LOG_FILE"
  exit 0
fi

RESULT_COUNT=$(echo "$RESULTS" | jq 'length' 2>/dev/null)
if [ "$RESULT_COUNT" = "0" ] || [ -z "$RESULT_COUNT" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: result count 0, skip" >> "$LOG_FILE"
  exit 0
fi

FORMATTED=$(echo "$RESULTS" | jq -r '.[0:5] | .[] | "- [\(.tags // [] | join(","))] \(.content[0:300])"' 2>/dev/null)

if [ -n "$FORMATTED" ]; then
  CONTEXT="[Pinefield Memory] 以下是从长期记忆中检索到的相关信息，请在回答时优先参考这些记忆，并在回答中注明「根据我的记忆」：

${FORMATTED}"

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] PromptRecall: injecting ${RESULT_COUNT} memories as context" >> "$LOG_FILE"

  jq -n --arg ctx "$CONTEXT" '{
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: $ctx
    }
  }'
fi

exit 0
