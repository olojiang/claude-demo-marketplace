# greet-command

一个 Command 示例插件。提供 `/greet` 斜杠命令，用户主动触发个性化问候。

## 类型

Command（用户通过斜杠命令触发）

## 使用

```
/greet Hunter
```

Claude 会输出包含指定名字的问候语。

## 文件结构

```
greet-command/
├── .claude-plugin/
│   └── plugin.json
└── commands/
    └── greet.md
```
