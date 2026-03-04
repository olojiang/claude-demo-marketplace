---
name: scheduler-skill
description: Create and manage scheduled tasks for Claude Code. Use this skill when the user wants to set up cron jobs, periodic tasks, heartbeat checks, or any automated scheduling via MCP tools (create_task, list_tasks, delete_task, trigger_heartbeat, push_event).
---

# Pinefield Scheduler Skill

A cron-based task scheduler that runs as a PM2 daemon with an MCP interface. Claude Code can create, list, and delete scheduled tasks through MCP tools.

## Prerequisites

Run the setup script once after installation:

```bash
bash ${CLAUDE_PLUGIN_ROOT}/setup.sh
```

This installs runtime dependencies and starts the PM2 daemon. Requires Node.js and PM2 (`npm install -g pm2`).

## Architecture

Two components work together:

1. **Scheduler Daemon** (PM2): Runs 24/7, watches `tasks.json`, executes tasks on schedule
2. **MCP Server** (stdio): Exposes tools to Claude Code for task management

The daemon is the "alarm clock", the MCP server is the "button to set it".

## MCP Tools

### create_task
Create a new scheduled task.

Parameters:
- `name` (string, required): Task name
- `schedule_value` (string, required): Cron expression (e.g. `*/5 * * * *`) or interval
- `type` (string): Task type - `claude_code` (default), `shell`, `node`, `python`, `http`, `heartbeat`
- `command` (string): The command/prompt to execute
- `url` (string): URL for `http` type only
- `method` (string): HTTP method (`GET`, `POST`, etc.)
- `body` (string): HTTP request body

### list_tasks
List all scheduled tasks with their IDs, schedules, and next run times.

### delete_task
Delete a task by ID.
- `id` (string, required): Task ID to delete

### trigger_heartbeat
Manually trigger a one-off heartbeat check when idle.

### push_event
Push an event to the system event queue for the next heartbeat to consume.

## Task Types

| Type | Command Field | Description |
|------|---------------|-------------|
| `claude_code` | Prompt text | Spawns `claude -p <prompt>` |
| `shell` | Shell command | Runs via `/bin/sh -c` |
| `node` | JS code | Runs via `node -e` |
| `python` | Python code | Runs via `python3 -c` |
| `http` | URL + method | Makes HTTP request |
| `heartbeat` | Check prompt | Low-priority system health check |

## Heartbeat System

Heartbeat tasks only run when the system is idle (no other tasks running). They consume events from `system_events.json` and can respond silently (`HEARTBEAT_OK`) or with an active report.

## Storage

All data is stored in `~/.pinefield/scheduler/`:
- `tasks.json` - Task definitions
- `tasks_execute_history.json` - Execution history
- `task_execute_error.json` - Error log
- `system_events.json` - Event queue

## Example Usage

Create a task that runs every 5 minutes:
```
Use the create_task MCP tool with:
  name: "check-disk-space"
  schedule_value: "*/5 * * * *"
  type: "shell"
  command: "df -h / | tail -1"
```

## Daemon Management

```bash
pm2 start ${CLAUDE_PLUGIN_ROOT}/dist/daemon.js --name pinefield-scheduler
pm2 stop pinefield-scheduler
pm2 restart pinefield-scheduler
pm2 logs pinefield-scheduler
```
