# Claude Code Demo Marketplace

一个完整的 Claude Code 插件 Marketplace 示例，涵盖四种插件类型：**Skill**、**Command**、**Agent (Sub-agent)**、**Hook**。

## 包含的插件

| 插件 | 类型 | 说明 |
|------|------|------|
| `hello-skill` | Skill | 简单的打招呼 skill，Claude 会根据上下文自动调用 |
| `greet-command` | Command | `/greet` 命令，用户主动触发打招呼 |
| `code-explainer` | Agent + Command | 代码解释 sub-agent + `/explain` 命令 |
| `todo-reminder` | Hook | 编辑文件时自动检查 TODO/FIXME 注释并提醒 |

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
    │   │   └── plugin.json       # 插件元数据
    │   └── skills/
    │       └── hello/
    │           └── SKILL.md      # Skill 定义文件
    │
    ├── greet-command/            # Command 示例
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   └── commands/
    │       └── greet.md          # 命令定义文件
    │
    ├── code-explainer/           # Agent 示例
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   ├── agents/
    │   │   └── code-explainer.md # Sub-agent 定义
    │   └── commands/
    │       └── explain.md        # 配套的 /explain 命令
    │
    └── todo-reminder/            # Hook 示例
        ├── .claude-plugin/
        │   └── plugin.json
        └── hooks/
            ├── hooks.json        # Hook 事件注册
            └── check_todos.py    # Hook 处理脚本
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
