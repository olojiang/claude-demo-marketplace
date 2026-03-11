---
name: physical-boss-hub-skill
description: |
  消息中枢 Skill。当用户提出请求时，先分析目标，判断是否需要委派给已注册的 person 或 device 执行。
  如果需要委派：通过 channel 发送消息 → 等待 worker 回复 → 将结果呈现给用户。
  如果可以直接响应：直接回复用户。

  <example>
  user: "特别关注空间智能机的进展，希望得到日报"
  assistant:
    1. person list → 找到韩啸 (actions 包含 write-daily-report)
    2. message publish → 向 hub channel 发送任务给韩啸
    3. message wait-reply → 等待韩啸的 worker 回复日报内容
    4. 向用户呈现日报，说明 "此日报由韩啸撰写"
  </example>

  <example>
  user: "查一下服务器当前 CPU 使用率"
  assistant:
    1. device list → 找到 server-monitor (actions 包含 read-cpu)
    2. message publish → 向 hub channel 发送查询指令
    3. message wait-reply → 等待设备回复数据
    4. 向用户呈现 CPU 数据，说明 "数据由设备 server-monitor 提供"
  </example>

  <example>
  user: "注册一个新设备叫空气质量监测仪"
  assistant: 直接调用 device register（无需委派，直接执行注册操作）
  </example>
---

# Physical Boss Hub Skill

消息中枢：设备/人员注册 + Channel 委派通信。每个注册的 person/device 拥有独立的 PM2 worker 进程，能自主接收消息并回复。

CLI 路径：`${CLAUDE_PLUGIN_ROOT}/src/cli.js`

---

## 核心工作流：分析 → 匹配 → 委派 → 回复

当用户提出需要协作的请求时，按以下步骤执行：

### 步骤 1：分析用户意图

判断用户的请求是否需要委派给已注册的 person 或 device。

- 如果是注册/管理操作 → 直接执行 CLI 命令
- 如果需要特定角色/设备完成任务 → 进入步骤 2

### 步骤 2：查找匹配的实体

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js person list
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js device list
```

分析每个实体的 `description`、`tags`、`actions`，找到最适合执行此任务的实体。

### 步骤 3：发送委派消息

通过 hub channel 向目标实体发送消息。使用 `agent-main` 作为 agent 的固定 ID。

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js message publish \
  --channel hub \
  --from agent-main --from-role agent \
  --to <entity-id> --to-role <person|device> \
  --content "请完成xxx任务"
```

记录返回的 message `id`，用于后续查询回复。

### 步骤 4：等待回复

使用 `wait-reply` 阻塞等待（默认 60 秒超时）：

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js message wait-reply \
  --channel hub \
  --message-id <上一步返回的 msg id> \
  --timeout 60
```

返回值是回复消息数组。如果为空数组 `[]`，说明超时未收到回复。

### 步骤 5：呈现结果

将回复内容整理后呈现给用户，**必须说明**：

- 中途调用了谁（实体名称 + 角色）
- 是谁具体执行的任务
- 任务的完整结果

---

## 注册管理

### 注册 Person（自动启动 worker + 订阅 hub channel）

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js person register \
  --name "韩啸" \
  --description "空间智能机项目负责人，擅长撰写技术日报和项目进展报告" \
  --tags "空间智能机,项目管理,技术报告" \
  --actions "write-daily-report,write-weekly-summary,project-status"
```

### 注册 Device（自动启动 worker + 订阅 hub channel）

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js device register \
  --name "server-monitor" \
  --description "服务器监控设备，实时采集 CPU、内存、磁盘数据" \
  --tags "监控,服务器,性能" \
  --actions "read-cpu,read-memory,read-disk,health-check"
```

### 查看 / 删除（删除时自动停止 worker）

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js person list
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js device list
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js person remove --id <id>
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js device remove --id <id>
```

## Worker 管理

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js worker status
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js worker start --id <entity-id>
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js worker stop --id <entity-id>
```

## Channel 管理

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js channel create --name <n> [--type memory]
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js channel list
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js channel subscribe --channel <n> --subscriber <id> --role <role>
```

## 消息操作

```bash
# 发布消息（广播/定向）
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js message publish --channel <n> --from <id> --from-role <role> --content <msg> [--to <id>] [--to-role <role>]

# 等待指定消息的回复（阻塞）
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js message wait-reply --channel <n> --message-id <id> [--timeout 60]

# 查看回复 / 消息列表
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js message replies --channel <n> --message-id <id>
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js message list --channel <n> [--limit 20]
```

## 数据目录

`~/.pinefield/physical-boss-hub/`，可通过 `BOSS_HUB_DIR` 环境变量覆盖。
