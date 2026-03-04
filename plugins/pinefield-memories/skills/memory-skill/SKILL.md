---
name: memory-skill
description: |
  Manage long-term memory for Claude Code. Use this skill to save important information,
  retrieve past context, delete outdated memories, or archive session logs.

  <example>
  user: "记住我喜欢用 dark mode"
  assistant: Calls save with content and tags
  </example>

  <example>
  user: "我之前存过哪些记忆？"
  assistant: Calls list to show all memories
  </example>

  <example>
  user: "搜索一下和春节相关的记忆"
  assistant: Calls search with query
  </example>

  <example>
  user: "删掉那条关于天气的记忆"
  assistant: Calls list to find the memory, then calls delete with the ID
  </example>

  <example>
  user: "把那条记忆里的 MySQL 改成 PostgreSQL"
  assistant: Calls list/search to find the memory, calls delete to remove the old one, then calls save with updated content
  </example>
---

# Memory Skill

This skill provides persistent memory capabilities for the agent.
It allows you to store important facts, retrieve them later by ID or search query, delete outdated memories, and archive entire conversation sessions.

The CLI is bundled at `${CLAUDE_PLUGIN_ROOT}/dist/cli.js` (no build step required).

## Usage

### 1. Save a Memory

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js save --content "The user prefers dark mode" --tags "preference,ui"
```

### 2. Retrieve a Memory by ID

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js get --id <memory-id>
```

### 3. Search Memories

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js search --query "dark mode"
```

### 4. List All Memories

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js list
```

### 5. Delete a Memory

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js delete --id <memory-id>
```

Supports both full UUID and short ID prefix (e.g. first 6-8 characters).

### 6. Edit a Memory (delete + re-save)

There is no direct `update` command. To edit a memory:
1. Use `list` or `search` to find the memory and its ID
2. Use `delete --id <id>` to remove the old version
3. Use `save --content "..." --tags "..."` to save the corrected version

### 7. Archive Sessions

```bash
node ${CLAUDE_PLUGIN_ROOT}/dist/cli.js archive
```

Note: Archive requires `claude` CLI to be installed and authenticated.

## Configuration

By default, memories are stored in `~/.pinefield/memories`.
You can override this by setting `PINEFIELD_MEMORY_DIR` environment variable.
