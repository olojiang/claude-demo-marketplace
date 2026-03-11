---
name: scheduler-skill
description: |
  Create and manage scheduled tasks for Claude Code. Use this skill when the user wants to set up cron jobs, periodic tasks, heartbeat checks, or any automated scheduling via MCP tools (create_task, list_tasks, delete_task, trigger_heartbeat, push_event).

  When creating tasks, infer the best task type from the user's intent:
  - If the task involves system commands, file operations, or CLI tools → type: "shell"
  - If the task involves JavaScript/Node.js logic → type: "node"  
  - If the task involves Python scripting → type: "python"
  - If the task involves checking a URL or API endpoint → type: "http"
  - If the task requires AI reasoning, summarization, natural language generation, or creative content → type: "claude_code"
  - If the task is about system health monitoring with event consumption → type: "heartbeat"

  <example>
  user: "每小时检查一下磁盘使用率，写入日志"
  assistant: Creates task with type "shell", command "df -h / >> ~/.pinefield/scheduler/disk-usage.log"
  </example>

  <example>
  user: "每天早上 9 点给我写一句今日激励语，保存到桌面"
  assistant: Creates task with type "claude_code", command includes prompt for generating motivational quote and saving to file
  </example>

  <example>
  user: "每 10 分钟用 Node 检查一下 package.json 里有没有过期的依赖"
  assistant: Creates task with type "node", command is JS code that reads package.json
  </example>

  <example>
  user: "每 5 分钟 ping 一下我们的生产环境 API"
  assistant: Creates task with type "http", url set to the API endpoint
  </example>

  <example>
  user: "每周一早上帮我总结上周的 git 提交记录"
  assistant: Creates task with type "claude_code", because summarization requires AI reasoning
  </example>

  <example>
  user: "用 Python 每小时统计一下某个目录下的文件数量"
  assistant: Creates task with type "python", command is Python code
  </example>
---

# Pinefield Scheduler Skill

A cron-based task scheduler that runs as a PM2 daemon with an MCP interface. Claude Code can create, list, and delete scheduled tasks through MCP tools.

## Prerequisites

Run the setup script once after installation:

```bash
bash ${CLAUDE_PLUGIN_ROOT}/setup.sh
```

This installs runtime dependencies and starts the PM2 daemon. Requires Node.js and PM2 (`npm install -g pm2`).

> **自动化**: 插件内置 `SessionStart` hook，每次会话启动时自动检查数据目录和 PM2 daemon，缺失则自动创建/启动。

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

Parameters:
- `type` (string, required): Event type identifier (e.g. `disk_space_warning`, `high_cpu`)
- `message` (string, required): Human-readable event description
- `source` (string): Event source identifier (e.g. `monitor`, `user`)
- `data` (object): Additional structured data attached to the event

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
