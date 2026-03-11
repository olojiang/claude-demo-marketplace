# todo-reminder

一个 Hook 示例插件。在 Claude 写入或编辑文件时，自动检查代码中的 TODO/FIXME/HACK/XXX 注释并给出提醒。

## 类型

Hook（`PreToolUse` 事件自动触发）

## 工作原理

当 Claude 执行 `Write`、`Edit` 或 `MultiEdit` 工具时，hook 脚本会：

1. 从 stdin 读取工具输入的 JSON
2. 提取将要写入的代码内容
3. 扫描 `TODO`、`FIXME`、`HACK`、`XXX` 等标记
4. 如发现匹配项，通过 stderr 输出提醒

Hook 只做提醒（exit 0），不会阻止写入操作。

## 文件结构

```
todo-reminder/
├── .claude-plugin/
│   └── plugin.json
└── hooks/
    ├── hooks.json
    └── check_todos.py
```
