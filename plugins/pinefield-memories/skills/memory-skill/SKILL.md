---
name: memory-skill
description: Manage long-term memory for Claude Code. Use this skill to save important information, retrieve past context, or archive session logs.
---

# Memory Skill

This skill provides persistent memory capabilities for the agent.
It allows you to store important facts, retrieve them later by ID or search query, and archive entire conversation sessions.

The CLI is bundled at `${CLAUDE_PLUGIN_ROOT}/dist/cli.js` (no build step required).

## Usage

### 1. Save a Memory

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js save --content "The user prefers dark mode" --tags "preference,ui"
```

### 2. Retrieve a Memory

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js get --id <memory-id>
```

### 3. Search Memories

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js search --query "dark mode"
```

### 4. List Memories

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js list
```

### 5. Archive Sessions

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js archive
```

Note: Archive requires `claude` CLI to be installed and authenticated.

## Configuration

By default, memories are stored in `~/.pinefield/memories`.
You can override this by setting `PINEFIELD_MEMORY_DIR` environment variable.
