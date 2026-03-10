# kimi-search

使用 Kimi (Moonshot AI) 内置的 `$web_search` 能力进行联网搜索的 Claude Code 插件。

## 工作原理

通过 OpenAI 兼容 API 调用 Kimi 模型，利用其内置的 `$web_search` builtin function 实现联网搜索。整个流程：

1. 将用户查询发送给 Kimi 模型，附带 `$web_search` 工具定义
2. Kimi 自动判断是否需要联网搜索，如果需要则返回 `tool_calls`
3. 将工具调用结果回传给 Kimi，循环直到获得最终回答
4. 返回 Kimi 生成的搜索结果摘要

## 安装

```bash
bash setup.sh
```

> **自动化**: 插件内置 `SessionStart` hook，每次 Claude 会话启动时自动检查 —— 如果依赖未安装或 cli.js 缺少执行权限，会自动修复，无需手动运行 `setup.sh`。

## 环境变量

| 变量 | 必须 | 说明 |
|------|------|------|
| `KIMI_API_KEY` | 是 | Moonshot AI 的 API Key，从 [platform.moonshot.cn](https://platform.moonshot.cn) 获取 |

## CLI 使用

```bash
# 基本搜索
kimi-search search "2024年诺贝尔物理学奖得主是谁?"

# 指定模型
kimi-search search "latest AI news" --model kimi-k2.5

# 调整温度
kimi-search search "React 19 新特性" --temperature 0.3

# 查看帮助
kimi-search help
```

## 项目结构

```
kimi-search/
├── .claude-plugin/
│   └── plugin.json          # 插件清单
├── package.json
├── setup.sh                 # 手动安装脚本
├── README.md
├── hooks/
│   ├── hooks.json            # SessionStart hook 声明
│   └── ensure-setup.sh       # 幂等自动安装（检查依赖 + 权限）
├── skills/
│   └── kimi-search-skill/
│       └── SKILL.md         # Skill 指令
└── src/
    ├── cli.js               # CLI 入口
    ├── client.js             # Kimi API 客户端配置
    └── search.js             # 核心搜索逻辑
```

## 模块说明

| 模块 | 职责 |
|------|------|
| `client.js` | 创建 OpenAI 客户端，配置 Kimi API 地址、工具定义、系统提示词 |
| `search.js` | 核心搜索循环：发送请求 → 处理 tool_calls → 返回最终结果 |
| `cli.js` | CLI 入口，解析参数，调用 search 并输出结果 |
