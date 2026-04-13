---
name: string_skill
description: 字符串模版管理工具，支持 {variable} 变量替换、{encId} 围栏名称解析、按 tag 批量渲染和智能搜索。当用户需要管理、渲染字符串模版时使用。
---

# String Skill

字符串模版管理工具，支持添加、更新、删除、列出和渲染字符串模版。模版支持 `{variable}` 格式的变量占位符。当模版含 `{encId}` 时，可通过围栏名称部分（如「防汛」）自动解析 encId。支持为模版打 tag，按 tag + 围栏名称一次性输出多条渲染结果。

## 使用场景

- 用户需要保存常用的字符串模版（如 URL、命令行、配置片段）
- 用户需要渲染模版并替换变量
- 模版含 `{encId}` 时，用户可通过围栏名称部分（如「输出防汛的 link」）自动解析 encId 并渲染
- 用户要求「输出防汛的 link」：可查找带 tag `link` 的模版，解析围栏「防汛」的 encId，生成多条字符串
- 用户需要搜索已有模版或按 tag 筛选
- 用户需要维护围栏(id-name)列表（enclosure CRUD）

## 前置条件

无需特殊环境变量。模版存储在 `~/.string-skill/templates.json`，围栏存储在 `~/.string-skill/enclosures.json`（不存在时使用内置默认围栏：进博会、东方枢纽、漕河泾临港等）。

## CLI 用法

通过 `node ./scripts/cli.js` 调用。

### 添加模版（可选 tags）

```bash
string-skill add <key> <content> <name> [-t tag1,tag2]
```

### 更新模版

```bash
string-skill update <key> [-c content] [-n name] [-t tags]
```

### 删除模版

```bash
string-skill delete <key>
```

### 列出模版

```bash
string-skill list
```

### 渲染模版

```bash
string-skill render <key-or-name> [key=value...]
```

### 按围栏名称解析 encId 并渲染（模版含 {encId} 时）

```bash
string-skill render <key-or-name> --enc <围栏名称部分> [key=value...]
```

### 按 tag 查找模版并用围栏名称批量渲染（输出多条）

```bash
string-skill render <占位key> --by-tag <tag> --enc <围栏名称部分> [key=value...]
```

### 围栏 CRUD

```bash
string-skill enclosure add <name> <id>
string-skill enclosure list
string-skill enclosure delete <id>
string-skill enclosure update <id> -n <新名称>
```

<example>
用户: 帮我保存一个 spacetop 链接模版，tag 为 link
助手: 执行 `string-skill add spacetop 'https://test.sheepwall.com/?encId={encId}&userId={userId}' 'spacetop链接' -t link`
</example>

<example>
用户: 渲染 spacetop 模版，encId=abc123, userId=user1
助手: 执行 `string-skill render spacetop encId=abc123 userId=user1`
</example>

<example>
用户: 输出防汛的 link（模版含 {encId}，且带 link tag）
助手: 先查找带 tag link 的模版，再按围栏名称「防汛」解析 encId，执行 `string-skill render x --by-tag link --enc 防汛`，将输出的多条链接呈现给用户。
</example>
