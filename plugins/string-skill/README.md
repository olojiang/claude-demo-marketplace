# String Skill Plugin

字符串模版管理 Skill，支持 `{variable}` 变量占位符的模版 CRUD 和渲染。

## 功能

- **添加模版**: 创建新模版，自动提取变量
- **更新模版**: 修改模版内容或名称
- **删除模版**: 按 key 删除
- **列出模版**: 展示所有已保存的模版
- **渲染模版**: 替换变量后输出结果
- **搜索模版**: 按 key 或名称模糊匹配

## 存储位置

模版持久化存储在 `~/.string-skill/templates.json`，无需外部服务。

## 项目结构

```
plugins/string-skill/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── string-skill/
│       └── SKILL.md
├── src/
│   ├── cli.ts
│   ├── index.ts
│   └── lib/
│       ├── types.ts
│       ├── storage.ts
│       ├── storage.test.ts
│       ├── template-renderer.ts
│       ├── template-renderer.test.ts
│       ├── template-manager.ts
│       └── template-manager.test.ts
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

## 运行测试

```bash
pnpm install
pnpm test
```

## CLI 命令

| 命令     | 说明       | 示例                                            |
| -------- | ---------- | ----------------------------------------------- |
| `add`    | 添加模版   | `add greeting 'Hello {name}!' '问候模版'`      |
| `update` | 更新模版   | `update greeting -c 'Hi {name}!'`              |
| `delete` | 删除模版   | `delete greeting`                               |
| `list`   | 列出模版   | `list`                                          |
| `render` | 渲染模版   | `render greeting name=Hunter`                   |
