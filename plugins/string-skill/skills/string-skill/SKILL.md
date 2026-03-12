---
name: string_skill
description: 字符串模版管理工具，支持 {variable} 变量替换和智能搜索。当用户需要管理、渲染字符串模版时使用。
---

# String Skill

字符串模版管理工具，支持添加、更新、删除、列出和渲染字符串模版。模版支持 `{variable}` 格式的变量占位符。

## 使用场景

- 用户需要保存常用的字符串模版（如 URL、命令行、配置片段）
- 用户需要渲染模版并替换变量
- 用户需要搜索已有的模版

## 前置条件

无需特殊环境变量。模版存储在 `~/.string-skill/templates.json`。

## CLI 用法

通过 `${CLAUDE_PLUGIN_ROOT}/src/cli.ts` 调用（需 tsx 或构建后使用 dist）。

### 添加模版

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts add <key> <content> <name>
```

### 更新模版

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts update <key> [-c content] [-n name]
```

### 删除模版

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts delete <key>
```

### 列出模版

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts list
```

### 渲染模版

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts render <key-or-name> [key=value...]
```

<example>
用户: 帮我保存一个 spacetop 链接模版
助手: 执行 `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts add spacetop 'https://test.sheepwall.com/?encId={encId}&userId={userId}' 'spacetop链接'`
</example>

<example>
用户: 渲染 spacetop 模版，encId=abc123, userId=user1
助手: 执行 `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts render spacetop encId=abc123 userId=user1`
</example>
