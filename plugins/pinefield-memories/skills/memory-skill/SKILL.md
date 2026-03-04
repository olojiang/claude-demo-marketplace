---
name: memory-skill
description: Manage long-term memory for Claude Code. Use this skill to save important information, retrieve past context, or archive session logs.
---

# Memory Skill

This skill provides persistent memory capabilities for the agent.
It allows you to store important facts, retrieve them later by ID or search query, and archive entire conversation sessions.

## Prerequisites

Run the setup script first to install dependencies and build:

```bash
bash ${CLAUDE_PLUGIN_ROOT}/setup.sh
```

## Usage

All commands use the CLI at the source project location.

### 1. Save a Memory
Save a piece of information with optional tags.

```bash
node /Users/hunter/Workspace/pinefield_memories/dist/cli.js save --content "The user prefers dark mode" --tags "preference,ui"
```

### 2. Retrieve a Memory
Get a specific memory by its ID.

```bash
node /Users/hunter/Workspace/pinefield_memories/dist/cli.js get --id <memory-id>
```

### 3. Search Memories
Search for memories containing specific text.

```bash
node /Users/hunter/Workspace/pinefield_memories/dist/cli.js search --query "dark mode"
```

### 4. List Memories
List all stored memories (most recent first).

```bash
node /Users/hunter/Workspace/pinefield_memories/dist/cli.js list
```

### 5. Archive Sessions
Automatically archive all unsummarized sessions in the current project.

```bash
node /Users/hunter/Workspace/pinefield_memories/dist/cli.js archive
```

Note: Requires `claude` CLI to be installed and authenticated.

## Configuration

By default, memories are stored in `~/.pinefield/memories`.
You can override this by setting `PINEFIELD_MEMORY_DIR` environment variable.
