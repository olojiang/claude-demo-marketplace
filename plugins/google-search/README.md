# google-search

使用 Google Gemini 的 Grounding with Google Search 能力进行联网搜索的 Claude Code 插件。

## 工作原理

通过 `@google/genai` SDK 调用 Gemini 模型，利用其内置的 Google Search Grounding 能力实现联网搜索。整个流程：

1. 将用户查询发送给 Gemini 模型，附带 `googleSearch` grounding 工具配置
2. Gemini 自动执行 Google 搜索并基于搜索结果生成回答
3. 从 `groundingMetadata` 中提取引用来源，将引用链接注入回答文本
4. 返回带引用的搜索结果

## 安装

```bash
bash setup.sh
```

> **自动化**: 插件内置 `SessionStart` hook，每次 Claude 会话启动时自动检查 —— 如果依赖未安装或 cli.js 缺少执行权限，会自动修复，无需手动运行 `setup.sh`。

## 环境变量

| 变量 | 必须 | 说明 |
|------|------|------|
| `GEMINI_API_KEY` | 是 | Google AI 的 API Key，从 [Google AI Studio](https://aistudio.google.com) 获取 |

## CLI 使用

```bash
# 基础搜索
google-search search "Who won the euro 2024?"

# 指定模型
google-search search "latest AI news" --model gemini-2.5-pro-preview

# 显示帮助
google-search help
```

## 项目结构

```
google-search/
├── .claude-plugin/
│   └── plugin.json          # 插件元数据
├── hooks/
│   ├── hooks.json            # SessionStart hook 配置
│   └── ensure-setup.sh       # 自动安装依赖脚本
├── skills/
│   └── google-search-skill/
│       └── SKILL.md          # Skill 指令文件
├── src/
│   ├── cli.js                # CLI 入口
│   ├── cli.test.js           # CLI 参数解析测试
│   ├── client.js             # Gemini 客户端封装
│   ├── search.js             # 搜索逻辑 + 引用注入
│   └── search.test.js        # 搜索逻辑测试
├── package.json
├── setup.sh                  # 手动安装脚本
└── README.md
```

## 模块说明

| 模块 | 职责 |
|------|------|
| `client.js` | 创建 GoogleGenAI 客户端，导出默认模型和 grounding 工具配置 |
| `search.js` | 执行搜索请求，从 groundingMetadata 提取引用并注入文本 |
| `cli.js` | CLI 入口，解析参数，调用 search，输出结果 |
