# code-explainer

一个 Agent + Command 示例插件。包含 `code-explainer` Sub-agent 和 `/explain` 命令，用于以初学者友好的方式解释代码。

## 类型

- Agent（Claude 自动判断是否需要生成子代理）
- Command（用户通过 `/explain` 命令触发）

## 使用

```
/explain src/index.ts
```

Claude 会生成 code-explainer 子代理，读取文件并输出结构化的代码解释。

## 文件结构

```
code-explainer/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   └── code-explainer.md
└── commands/
    └── explain.md
```
