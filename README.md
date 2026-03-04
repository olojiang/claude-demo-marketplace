# Claude Code Demo Marketplace

一个完整的 Claude Code 插件 Marketplace 示例，涵盖所有插件类型：**Skill**、**Command**、**Agent (Sub-agent)**、**Hook**、**MCP Server**。

## 包含的插件

| 插件 | 类型 | 说明 |
|------|------|------|
| `hello-skill` | Skill | 简单的打招呼 skill，Claude 会根据上下文自动调用 |
| `greet-command` | Command | `/greet` 命令，用户主动触发打招呼 |
| `code-explainer` | Agent + Command | 代码解释 sub-agent + `/explain` 命令 |
| `todo-reminder` | Hook | 编辑文件时自动检查 TODO/FIXME 注释并提醒 |
| `pinefield-memories` | Skill + Hooks | 长期记忆系统：自动回忆、AI 记忆提炼、会话归档 |
| `pinefield-scheduler` | Skill + MCP | 定时任务调度器：通过 MCP 工具创建/管理 cron 任务 |

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
claude marketplace add https://github.com/olojiang/claude-demo-marketplace.git
```

### 方式二：手动克隆到本地

```bash
cd ~/.claude/plugins/marketplaces/
git clone https://github.com/olojiang/claude-demo-marketplace.git olojiang-demo
```

添加后重启 Claude Code 即可生效。

## 如何安装插件

添加 Marketplace 后，使用以下命令浏览和安装插件：

```bash
# 列出可用的 marketplace
claude marketplace list

# 浏览 marketplace 中的插件
claude marketplace browse olojiang-demo

# 安装单个插件
claude plugin install olojiang-demo/hello-skill
claude plugin install olojiang-demo/greet-command
claude plugin install olojiang-demo/code-explainer
claude plugin install olojiang-demo/todo-reminder
claude plugin install olojiang-demo/pinefield-memories
claude plugin install olojiang-demo/pinefield-scheduler

# 查看已安装的插件
claude plugin list
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
安装后需要先运行 setup 构建项目：

```bash
# 找到插件安装路径并运行 setup
bash ~/.claude/plugins/cache/olojiang-demo/pinefield-memories/*/setup.sh
```

安装后 hooks 会自动生效：
- **SessionStart**: 会话开始时自动注入最近的记忆
- **UserPromptSubmit**: 用户提问时自动搜索相关记忆
- **Stop**: Claude 回答后 AI 判断是否有值得记忆的内容

### 使用 pinefield-scheduler
安装后需要先运行 setup 构建项目并启动 daemon：

```bash
# 找到插件安装路径并运行 setup
bash ~/.claude/plugins/cache/olojiang-demo/pinefield-scheduler/*/setup.sh
```

安装后可通过 MCP 工具管理定时任务：
- `create_task`: 创建定时任务（支持 cron 表达式）
- `list_tasks`: 列出所有任务
- `delete_task`: 删除任务
- `trigger_heartbeat`: 手动触发心跳检查
- `push_event`: 推送事件到事件队列

---

## 安装验证

安装插件后，可以用以下方式快速确认插件是否正常工作。

| 插件 | 验证方式 | 预期结果 |
|------|----------|----------|
| `hello-skill` | 在 Claude Code 中说「你好，打个招呼」 | Claude 以友好方式打招呼 |
| `greet-command` | 输入 `/greet World` | 输出包含 "World" 的问候 |
| `code-explainer` | 输入 `/explain package.json` | 生成 sub-agent 对文件做结构化解释 |
| `todo-reminder` | 让 Claude 写一个包含 `// TODO` 的文件 | 写入时控制台显示 TODO 提醒 |
| `pinefield-memories` | 重启 Claude Code，开始新对话 | 如果有历史记忆，SessionStart hook 会自动注入 |
| `pinefield-scheduler` | 在 Claude Code 中说「列出所有定时任务」 | Claude 调用 `list_tasks` MCP 工具并返回结果 |

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

### 运行 pinefield-memories 单元测试

```bash
cd /Users/hunter/Workspace/pinefield_memories
pnpm install && pnpm test
```

调试 hook 日志：`cat ~/.pinefield/memories/hook.log`

### 运行 pinefield-scheduler 单元测试

```bash
cd /Users/hunter/Workspace/pinefield_scheduler
pnpm install && pnpm test
```

Daemon 日志：`pm2 logs pinefield-scheduler`
任务存储：`cat ~/.pinefield/scheduler/tasks.json`

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

| 目录 | 类型 | 必需文件 |
|------|------|----------|
| `skills/<name>/` | Skill | `SKILL.md`（需要 YAML frontmatter：`name` + `description`） |
| `commands/` | Command | `<name>.md`（YAML frontmatter 可含 `description`、`argument-hint`、`allowed-tools`） |
| `agents/` | Agent | `<name>.md`（YAML frontmatter 需含 `name`、`description`，可选 `model`、`color`、`tools`） |
| `hooks/` | Hook | `hooks.json` + 处理脚本 |
| `.mcp.json` | MCP Server | 根目录下的 MCP 配置文件 |

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
claude plugin uninstall olojiang-demo/hello-skill

# 移除整个 marketplace
claude marketplace remove olojiang-demo
```
