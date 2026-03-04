# Claude Code Demo Marketplace

一个完整的 Claude Code 插件 Marketplace 示例，涵盖所有插件类型：**Skill**、**Command**、**Agent (Sub-agent)**、**Hook**、**MCP Server**。

## 包含的插件

| 插件                  | 类型            | 说明                                             |
| --------------------- | --------------- | ------------------------------------------------ |
| `hello-skill`         | Skill           | 简单的打招呼 skill，Claude 会根据上下文自动调用  |
| `greet-command`       | Command         | `/greet` 命令，用户主动触发打招呼                |
| `code-explainer`      | Agent + Command | 代码解释 sub-agent + `/explain` 命令             |
| `todo-reminder`       | Hook            | 编辑文件时自动检查 TODO/FIXME 注释并提醒         |
| `pinefield-memories`  | Skill + Hooks   | 长期记忆系统：自动回忆、AI 记忆提炼、会话归档    |
| `pinefield-scheduler` | Skill + MCP     | 定时任务调度器：通过 MCP 工具创建/管理 cron 任务 |

## 目录结构

```
olojiang-demo/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace 清单（注册所有插件）
├── README.md
├── .gitignore
└── plugins/
    ├── hello-skill/              # Skill 示例
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   └── skills/hello/SKILL.md
    │
    ├── greet-command/            # Command 示例
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   └── commands/greet.md
    │
    ├── code-explainer/           # Agent 示例
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   ├── agents/code-explainer.md
    │   └── commands/explain.md
    │
    ├── todo-reminder/            # Hook 示例
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   └── hooks/
    │       ├── hooks.json
    │       └── check_todos.py
    │
    ├── pinefield-memories/       # Skill + Hooks（需要构建）
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   ├── skills/memory-skill/SKILL.md
    │   ├── hooks/
    │   │   ├── hooks.json
    │   │   ├── session-start-recall.sh
    │   │   ├── prompt-recall.sh
    │   │   ├── stop-memorize.sh
    │   │   └── session-end-archive.sh
    │   └── setup.sh
    │
    └── pinefield-scheduler/      # Skill + MCP（需要构建 + PM2）
        ├── .claude-plugin/
        │   └── plugin.json
        ├── .mcp.json
        ├── skills/scheduler-skill/SKILL.md
        └── setup.sh
```

## 关键规则

> **重要：** `commands/`、`skills/`、`agents/`、`hooks/` 目录必须放在**插件根目录**下，不能放在 `.claude-plugin/` 内部。`.claude-plugin/` 目录内只放 `plugin.json`。

## 如何添加 Marketplace

### 方式一：通过 Git URL 添加

```bash
claude plugin marketplace add https://github.com/olojiang/claude-demo-marketplace.git
```

### 方式二：手动克隆到本地

```bash
cd ~/.claude/plugins/marketplaces/
git clone https://github.com/olojiang/claude-demo-marketplace.git olojiang-demo
```

添加后重启 Claude Code 即可生效。

### Marketplace 管理命令

```bash
# 列出已添加的 marketplace
claude plugin marketplace list

# 更新 marketplace（拉取最新版本）
claude plugin marketplace update olojiang-demo

# 更新所有 marketplace
claude plugin marketplace update

# 移除 marketplace
claude plugin marketplace remove olojiang-demo
```

## 如何安装插件

添加 Marketplace 后，使用以下命令安装和管理插件：

```bash
# 安装插件（自动从所有 marketplace 中查找）
claude plugin install hello-skill
claude plugin install greet-command
claude plugin install code-explainer
claude plugin install todo-reminder
claude plugin install pinefield-memories
claude plugin install pinefield-scheduler

# 指定从特定 marketplace 安装（plugin@marketplace 格式）
claude plugin install hello-skill@olojiang-demo

# 查看已安装的插件
claude plugin list

# 更新插件到最新版本（需重启生效）
claude plugin update hello-skill

# 禁用 / 启用插件
claude plugin disable hello-skill
claude plugin enable hello-skill

# 卸载插件
claude plugin uninstall hello-skill

# 验证插件或 marketplace 结构是否正确
claude plugin validate ./plugins/my-plugin
```

## 清理 cache

```
rm -rf ~/.claude/plugins/cache/olojiang-demo
```

## 如何使用

### 使用 Skill

Skill 由 Claude 根据上下文**自动调用**，无需手动触发。安装 `hello-skill` 后，当对话涉及打招呼场景时，Claude 会自动应用该 skill。

### 使用 Command

在 Claude Code 中输入斜杠命令即可触发：

```
/greet Hunter          # 触发 greet 命令
/explain src/index.ts  # 触发代码解释命令
```

### 使用 Agent

Agent 由 Claude 自动判断是否需要生成子代理来处理任务。安装 `code-explainer` 后，当需要深入解释代码时，Claude 会自动生成 `code-explainer` 子代理。

### 使用 Hook

Hook 在特定事件发生时**自动执行**。安装 `todo-reminder` 后，每当 Claude 写入或编辑文件时，会自动检查是否包含 TODO/FIXME 注释并给出提醒。

### 使用 pinefield-memories

#### 第 1 步：安装后运行 setup

```bash
bash ~/.claude/plugins/cache/olojiang-demo/pinefield-memories/*/setup.sh
```

CLI 已预编译打包在插件内，**无需编译**。setup 只创建存储目录并设置脚本权限。

#### 第 2 步：验证 CLI 可用

找到插件安装路径，运行测试命令：

```bash
# 找到插件路径
PLUGIN_DIR=$(ls -d ~/.claude/plugins/cache/olojiang-demo/pinefield-memories/*)

# 保存一条测试记忆
node "$PLUGIN_DIR/dist/cli.js" save --content "我喜欢用 dark mode" --tags "preference,test"

# 查看记忆列表（应能看到刚才保存的）
node "$PLUGIN_DIR/dist/cli.js" list

# 搜索记忆
node "$PLUGIN_DIR/dist/cli.js" search --query "dark mode"
```

#### 第 3 步：自然语言交互测试

安装完成后，可以在 Claude Code 中直接用自然语言操作记忆。以下是按顺序的测试用例：

**测试 A：存储记忆**

```
❯ 记住：我的项目用 TypeScript + React，数据库是 PostgreSQL
```

预期：Claude 调用 `save` 命令，返回 "Memory saved: \<id\>"

**测试 B：再存一条**

```
❯ 帮我记一下，我们团队每周三下午 3 点开 standup 会议
```

预期：Claude 保存这条记忆，自动推断合适的 tags

**测试 C：罗列所有记忆**

```
❯ 我之前存过哪些记忆？列出来看看
```

预期：Claude 调用 `list`，展示所有记忆条目（含 ID、时间、内容、标签）

**测试 D：搜索记忆**

```
❯ 搜索一下和数据库相关的记忆
```

预期：Claude 调用 `search --query "数据库"`，返回包含 PostgreSQL 的那条

**测试 E：编辑记忆（删除 + 重建）**

```
❯ 把那条关于数据库的记忆改一下，PostgreSQL 改成 MySQL
```

预期：Claude 先找到该记忆的 ID，调用 `delete` 删除旧版本，再用 `save` 保存修改后的内容

**测试 F：删除记忆**

```
❯ 删掉关于 standup 会议的那条记忆
```

预期：Claude 先 `search` 或 `list` 找到 ID，然后调用 `delete` 删除

**测试 G：验证自动回忆（重启后）**

```
❯ 我们项目用的什么技术栈？
```

预期：Claude 回答时标注"根据我的记忆"，并引用之前保存的技术栈信息

#### 第 4 步：验证 Hooks 自动生效

安装后有 3 类 hook 在 Claude Code 中自动运行：

**SessionStart hook** — 在第 3 步的「测试 G」中已覆盖（重启后自动注入记忆）

**UserPromptSubmit hook** — 可通过 hook 日志验证：

```bash
grep "PromptRecall" ~/.pinefield/memories/hook.log | tail -10
```

预期：看到 `triggered → searching → search returned → injecting` 的完整日志链

**Stop hook（AI 自动记忆提炼）：**

1. 在 Claude Code 中进行一次有「记忆价值」的对话，例如：
   ```
   我们项目决定使用 PostgreSQL 而不是 MySQL，因为需要 JSONB 支持
   ```
2. 等 Claude 回答完毕
3. 检查是否自动保存了新记忆（在终端中）：
   ```bash
   PLUGIN_DIR=$(ls -d ~/.claude/plugins/cache/olojiang-demo/pinefield-memories/*)
   node "$PLUGIN_DIR/dist/cli.js" list
   ```
4. **预期**：列表中出现一条自动保存的记忆，标签包含 `auto-memory`
5. 也可以查看 hook 日志确认：
   ```bash
   cat ~/.pinefield/memories/hook.log
   ```

#### 第 4 步（可选）：清理测试数据

```bash
# 查看存储目录
ls ~/.pinefield/memories/

# 如需清理所有记忆（谨慎操作）
rm ~/.pinefield/memories/*.json
```

---

### 使用 pinefield-scheduler

#### 第 1 步：安装后运行 setup

```bash
bash ~/.claude/plugins/cache/olojiang-demo/pinefield-scheduler/*/setup.sh
```

Daemon 和 MCP Server 已全量打包（含所有依赖），**无需 npm install**。setup 只创建数据目录并通过 PM2 启动 daemon。

> 前置条件：需要全局安装 PM2（`npm install -g pm2`）。

#### 第 2 步：验证 Daemon 运行状态

```bash
pm2 status pinefield-scheduler
```

**预期**：状态显示 `online`。

#### 第 3 步：在 Claude Code 中测试 MCP 工具

**测试 create_task（创建任务）：**

在 Claude Code 中输入：

```
帮我创建一个定时任务，每分钟执行一次，类型是 shell，命令是 echo "hello from scheduler" >> /tmp/scheduler-test.log
```

**预期**：Claude 调用 `create_task` MCP 工具，返回任务创建成功及任务 ID。

**测试 list_tasks（列出任务）：**

```
列出当前所有定时任务
```

**预期**：Claude 调用 `list_tasks`，返回一个任务列表，包含刚才创建的任务及其 cron 表达式、下次执行时间。

**验证任务确实在执行：**

等待 1-2 分钟后，在终端中检查：

```bash
cat /tmp/scheduler-test.log
```

**预期**：文件中有一行或多行 `hello from scheduler`。

**测试 delete_task（删除任务）：**

```
删除刚才创建的定时任务
```

**预期**：Claude 调用 `delete_task`，返回删除成功。再次执行 `列出所有任务` 确认列表为空。

**测试 create_task — claude_code 类型（AI 定时任务）：**

`claude_code` 类型的任务会通过 `claude -p` 调用 Claude CLI 来执行 AI 推理。

前置验证 — 先确认 `claude -p` 可用：

```bash
echo "回复 OK" | claude -p
# 预期输出：OK
```

在 Claude Code 中输入：

```
帮我创建一个定时任务，每 5 分钟执行一次，类型是 claude_code，命令是 "检查当前时间并用一句话总结现在的时间段（凌晨/早上/上午/下午/晚上）"
```

**预期**：Claude 调用 `create_task`，`type` 为 `claude_code`，返回任务 ID。

等待 5 分钟后验证执行结果：

```bash
# 查看执行历史，找到该任务的输出
cat ~/.pinefield/scheduler/tasks_execute_history.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
for r in data[-5:]:
    print(f\"[{r.get('status')}] {r.get('startTime','')[:19]}  stdout: {(r.get('stdout','') or '')[:100]}\")
"
```

**预期**：最近的条目中 status 为 `success`，stdout 包含 Claude 的时间描述。

**测试 push_event + trigger_heartbeat（事件与心跳）：**

心跳任务会消费 `system_events.json` 中的事件，通过 `claude -p` 分析后返回处理建议。

完整流程分 3 步：

**步骤 1 — 推送事件：**

在 Claude Code 中输入：

```
推送一个系统事件，内容是 "磁盘空间不足警告"
```

**预期**：Claude 调用 `push_event` MCP 工具，返回事件 ID。

验证事件已入队：

```bash
cat ~/.pinefield/scheduler/system_events.json
# 预期：数组中有一条 disk_space_warning 事件
```

**步骤 2 — 触发心跳：**

```
触发一次心跳检查
```

**预期**：Claude 调用 `trigger_heartbeat`，返回 heartbeat 任务 ID。

**步骤 3 — 验证心跳结果：**

等待 10-30 秒（心跳需要调用 `claude -p` 处理事件，耗时较长），然后检查：

```bash
# 检查事件是否被消费（心跳执行后会清空事件队列）
cat ~/.pinefield/scheduler/system_events.json
# 预期：空数组 [] 表示事件已被消费

# 检查心跳执行结果
cat ~/.pinefield/scheduler/tasks_execute_history.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
for r in data[-3:]:
    print(f\"[{r.get('status')}] {r.get('startTime','')[:19]}\")
    if r.get('stdout'):
        print(f\"  输出: {r['stdout'][:200]}\")
"
# 预期：status 为 success，输出中包含对 "磁盘空间不足" 事件的分析

# 也可以查看 daemon 日志
pm2 logs pinefield-scheduler --lines 20 --nostream
# 预期：看到 [Executor] Heartbeat Active Response 或 Heartbeat Silent
```

> **提示**：如果 heartbeat 没有可处理的事件且 `HEARTBEAT.md` 为空，会返回 `HEARTBEAT_OK`（静默跳过）。

**测试 delete_task（清理测试任务）：**

```
删除所有定时任务
```

**预期**：Claude 依次删除 claude_code 任务和其他测试任务。

#### 第 4 步：查看日志和数据

```bash
# 查看 daemon 实时日志
pm2 logs pinefield-scheduler --lines 20

# 查看任务定义
cat ~/.pinefield/scheduler/tasks.json

# 查看执行历史
cat ~/.pinefield/scheduler/tasks_execute_history.json

# 查看错误记录
cat ~/.pinefield/scheduler/task_execute_error.json
```

#### 第 5 步：清理测试环境

```bash
# 停止 daemon
pm2 stop pinefield-scheduler

# 清理测试日志
rm -f /tmp/scheduler-test.log

# 如需彻底清理任务数据（谨慎操作）
rm ~/.pinefield/scheduler/tasks.json
```

---

## 安装验证

安装插件后，可以用以下方式快速确认插件是否正常工作。

| 插件                  | 验证方式                                        | 预期结果                                                           |
| --------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| `hello-skill`         | 在 Claude Code 中说「你好，打个招呼」           | Claude 以友好方式打招呼                                            |
| `greet-command`       | 输入 `/greet World`                             | 输出包含 "World" 的问候                                            |
| `code-explainer`      | 输入 `/explain package.json`                    | 生成 sub-agent 对文件做结构化解释                                  |
| `todo-reminder`       | 让 Claude 写一个包含 `// TODO` 的文件           | 写入时控制台显示 TODO 提醒                                         |
| `pinefield-memories`  | 说「记住我喜欢 dark mode」，再问「我喜欢什么？」 | 自然语言存储 + 搜索回忆（支持存/查/搜/删/改，详见上方测试用例）   |
| `pinefield-scheduler` | 告诉 Claude「创建一个每分钟执行的 shell 任务」  | `create_task` 成功，1 分钟后 `/tmp` 下出现日志（详见上方完整流程） |

> **注意**: `pinefield-memories` 和 `pinefield-scheduler` 安装后需要先运行 `setup.sh` 完成构建（见上方「如何使用」），否则底层 CLI / MCP Server 不可用。

---

## 关于自动化测试

Claude Code 的 Marketplace 插件系统**不支持自动化测试**，原因如下：

1. **插件是指令文件，不是可执行代码** — Skill / Command / Agent 本质上是 Markdown 文本，Claude 读取后作为行为指令，没有可执行的测试入口。
2. **Hooks 是事件驱动的** — 只在 Claude Code 实际执行 Edit/Write/Stop 等操作时才触发，无法脱离运行环境独立测试。
3. **MCP Server 需要运行时基础设施** — pinefield-scheduler 需要 PM2 + Node.js，不是安装就能自动验证的。
4. **插件系统无内置 test runner** — 与 npm/vitest 不同，Marketplace 安装流程只负责复制文件和注册插件，没有 `test` 生命周期钩子。
5. **Skill 触发依赖 AI 判断** — 无法确定性地触发和验证。

> `pinefield-memories` 和 `pinefield-scheduler` 的底层代码各自有完整的 vitest 单元测试，但那测试的是代码逻辑本身，不属于 Marketplace 插件的范畴。如需运行，请参考下方开发者指南。

---

## 开发者指南

> 以下内容面向本 Marketplace 的维护者/贡献者，普通用户无需阅读。

### 重新打包 pinefield 插件

如果修改了 pinefield 源项目的代码，需要重新编译并更新插件中的编译产物：

```bash
# pinefield-memories（自包含 bundle，无外部依赖）
cd <pinefield_memories 源项目路径>
pnpm install && pnpm build
cp dist/cli.js <marketplace>/plugins/pinefield-memories/dist/

# pinefield-scheduler（需要 node_modules 运行时依赖）
cd <pinefield_scheduler 源项目路径>
pnpm install && pnpm build
cp dist/daemon.js dist/mcp-server.js <marketplace>/plugins/pinefield-scheduler/dist/
```

### 运行源项目单元测试

```bash
# pinefield-memories
cd <pinefield_memories 源项目路径>
pnpm install && pnpm test

# pinefield-scheduler
cd <pinefield_scheduler 源项目路径>
pnpm install && pnpm test
```

### 调试日志

- Hook 日志：`cat ~/.pinefield/memories/hook.log`
- Daemon 日志：`pm2 logs pinefield-scheduler`
- 任务存储：`cat ~/.pinefield/scheduler/tasks.json`

---

## 如何创建自己的插件

### 1. 创建插件目录

```bash
mkdir -p plugins/my-plugin/.claude-plugin
```

### 2. 创建 plugin.json

```json
{
  "name": "my-plugin",
  "description": "My awesome plugin",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  }
}
```

### 3. 添加插件组件

根据需要添加以下目录：

| 目录             | 类型       | 必需文件                                                                                   |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `skills/<name>/` | Skill      | `SKILL.md`（需要 YAML frontmatter：`name` + `description`）                                |
| `commands/`      | Command    | `<name>.md`（YAML frontmatter 可含 `description`、`argument-hint`、`allowed-tools`）       |
| `agents/`        | Agent      | `<name>.md`（YAML frontmatter 需含 `name`、`description`，可选 `model`、`color`、`tools`） |
| `hooks/`         | Hook       | `hooks.json` + 处理脚本                                                                    |
| `.mcp.json`      | MCP Server | 根目录下的 MCP 配置文件                                                                    |

### 4. 注册到 marketplace.json

在 `.claude-plugin/marketplace.json` 的 `plugins` 数组中添加：

```json
{
  "name": "my-plugin",
  "source": "./plugins/my-plugin",
  "description": "My awesome plugin"
}
```

### 5. 清除缓存并重启

```bash
rm -rf ~/.claude/plugins/cache/olojiang-demo
# 重启 Claude Code
```

## hooks.json 参考

```json
{
  "description": "Hook description",
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/my_hook.py",
            "timeout": 10
          }
        ],
        "matcher": "Edit|Write"
      }
    ]
  }
}
```

支持的事件类型：`PreToolUse`、`PostToolUse`、`Stop`、`UserPromptSubmit`、`SessionStart`

Hook 脚本通过 stdin 接收 JSON 输入，通过 stderr 输出警告，退出码 0 表示允许，2 表示阻止。

## 卸载

```bash
# 卸载单个插件
claude plugin uninstall hello-skill

# 移除整个 marketplace
claude plugin marketplace remove olojiang-demo
```
