# Physical Boss Hub

设备/人员注册 + Channel 委派通信系统。注册的每个 person/device 拥有独立的 PM2 worker 进程，能自主接收消息、用 AI 处理任务并回复。Agent 分析用户意图后，自动匹配合适的 person 或 device 完成任务。

## 核心数据结构

### Entity（Person / Device）

```json
{
  "id": "uuid",
  "name": "韩啸",
  "description": "空间智能机项目负责人，擅长撰写技术日报",
  "tags": ["空间智能机", "项目管理"],
  "actions": ["write-daily-report", "project-status"],
  "type": "person",
  "createdAt": "2026-03-10T08:00:00.000Z"
}
```

`tags` 描述实体的领域标签，`actions` 描述实体能执行的具体动作。Agent 通过这两个字段匹配最合适的执行者。

### Channel

```json
{
  "name": "hub",
  "type": "memory",
  "subscribers": [
    {
      "id": "uuid",
      "role": "person",
      "subscribedAt": "...",
      "lastPollAt": null
    }
  ],
  "createdAt": "2026-03-10T08:00:00.000Z"
}
```

Channel 是消息的传输通道。`type: "memory"` 表示内存型通道（PM2 daemon 定期持久化到磁盘）。

### Message

```json
{
  "id": "msg-uuid",
  "channel": "hub",
  "from": { "id": "agent-main", "role": "agent" },
  "to": { "id": "person-uuid", "role": "person" },
  "content": "请撰写今日日报",
  "replyTo": null,
  "timestamp": "2026-03-10T08:05:00.000Z"
}
```

| 字段      | 说明                                                     |
| --------- | -------------------------------------------------------- |
| `to`      | `null` = 广播（所有订阅者可见），有值 = 定向消息         |
| `replyTo` | `null` = 原始消息，有值 = 对某条消息的回复（构成回复链） |

## 核心数据流

```
~/.pinefield/physical-boss-hub/
├── devices.json              # 所有已注册设备
├── persons.json              # 所有已注册人员
└── channels/
    └── hub/                  # 默认通道（注册时自动创建）
        ├── meta.json         # 通道元信息 + 订阅者列表
        └── messages.json     # 该通道的所有消息
```

## 流程图

### 注册流程

```
用户 ──> CLI register ──> 写入 persons/devices.json
                      ──> 创建 hub channel（若不存在）
                      ──> 订阅 hub channel
                      ──> PM2 启动 worker 进程
```

### 委派任务流程

```
用户："帮我写日报"
    │
    ▼
Agent 分析意图
    │
    ├──> person list / device list   ← 查找已注册实体
    ▼
匹配到 韩啸 (actions 含 write-daily-report)
    │
    ▼
message publish ──> hub channel ──> messages.json
    │                                    │
    │                          Worker(韩啸) 轮询检测到新消息
    │                                    │
    │                          claude -p 生成回复内容
    │                                    │
    │                          publish reply ──> messages.json
    ▼
message wait-reply ──> 检测到回复
    │
    ▼
Agent 呈现结果给用户，注明 "此日报由韩啸撰写"
```

### Worker 消息处理流程

```
Worker 进程 (PM2, 每 3 秒轮询)
    │
    ▼
pendingFor(channel, entityId)
    ├── 筛选 to.id === 自己 且 from.id !== 自己
    ├── 排除已有 reply 的消息
    ▼
processMessage()
    ├── Person: claude -p 模拟角色回复
    ├── Device: claude -p 模拟设备数据（失败时 fallback 模板）
    ▼
publish reply (replyTo 指向原始消息 ID)
```

## 如何注册用户（Person）

```bash
node "$BOSS_CLI" person register \
  --name "韩啸" \
  --description "空间智能机项目负责人，擅长撰写技术日报" \
  --tags "空间智能机,项目管理" \
  --actions "write-daily-report,project-status"

node "$BOSS_CLI" person list                  # 查看所有人员
node "$BOSS_CLI" person get --id <id或前缀>    # 查看详情
node "$BOSS_CLI" person remove --id <id>      # 删除 + 停止 worker
```

## 如何注册设备（Device）

```bash
node "$BOSS_CLI" device register \
  --name "temp-sensor-01" \
  --description "办公室温度传感器" \
  --tags "传感器,温度,办公室" \
  --actions "read-temperature,read-humidity,calibrate"

node "$BOSS_CLI" device list / get / remove   # 同 person
```

## 如何广播消息

不指定 `--to`，消息发给 channel 的所有订阅者：

```bash
node "$BOSS_CLI" message publish \
  --channel hub \
  --from agent-main --from-role agent \
  --content "全体注意：系统将在 10 分钟后维护"
```

## 如何订阅消息

```bash
# 订阅（注册时已自动订阅 hub，此为手动订阅其他 channel）
node "$BOSS_CLI" channel subscribe --channel hub --subscriber <id> --role person

# 轮询新消息
node "$BOSS_CLI" message poll --channel hub --subscriber <id>

# 查看 channel 所有消息
node "$BOSS_CLI" message list --channel hub --limit 20
```

## 如何点对点发送消息

```bash
# Agent → Person 定向发送
node "$BOSS_CLI" message publish \
  --channel hub \
  --from agent-main --from-role agent \
  --to <person-id> --to-role person \
  --content "请撰写今日日报"

# 查看回复
node "$BOSS_CLI" message replies --channel hub --message-id <msg-id>

# 阻塞等待回复（Worker 自动处理，无需手动回复）
node "$BOSS_CLI" message wait-reply --channel hub --message-id <msg-id> --timeout 60
```

> `$BOSS_CLI` = `<plugin-path>/src/cli.js`，安装后替换为实际路径。初始化方式见下方安装说明。

## 安装与 Setup

```bash
claude plugin install physical-boss-hub
BOSS_HUB_DIR=$(ls -d ~/.claude/plugins/cache/olojiang-demo/physical-boss-hub/*)
bash "$BOSS_HUB_DIR/setup.sh"

# 初始化 CLI 路径变量（后续命令中使用）
BOSS_CLI="$BOSS_HUB_DIR/src/cli.js"
```

> 前置条件：需要 PM2（`npm install -g pm2`）和 Claude CLI。

> **自动化**: 插件内置 `SessionStart` hook，每次 Claude 会话启动时自动检查 —— 如果数据目录不存在、脚本缺少执行权限或 PM2 daemon 未运行，会自动修复，无需手动运行 `setup.sh`。

## 样例

详见 [docs/EXAMPLES.md](docs/EXAMPLES.md)，包含 3 个完整的端到端测试场景：

1. **委派日报撰写** — Person 接收任务 → AI 生成日报 → Agent 呈现结果
2. **查询设备数据** — Device 接收指令 → 模拟传感器数据 → Agent 呈现数据
3. **多实体协作** — Person + Device 同时接收不同任务 → 各自回复 → Agent 汇总

## 单元测试

```bash
pnpm install && pnpm test   # 4 文件 61 case
```

| 文件                     | 覆盖范围                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| `tests/store.test.js`    | 文件存储工具：ensureDir、readJSON、writeJSON、listDirs、getDataDir |
| `tests/registry.test.js` | Device/Person 注册、查询、删除、字段解析、name 校验                |
| `tests/channel.test.js`  | Channel 生命周期、订阅、消息发布/过滤、toRole 推断、pendingFor、poll |
| `tests/scenario.test.js` | 完整委派链路：意图匹配 → 发送 → 回复 → 验证                        |
