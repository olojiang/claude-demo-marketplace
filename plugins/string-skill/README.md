# String Skill Plugin

字符串模版管理 Skill，支持 `{variable}` 变量占位符的模版 CRUD 和渲染，支持围栏(id-name)解析与按 tag 批量渲染。

## 功能

- **添加模版**: 创建新模版，自动提取变量，可选标签(tags)
- **更新模版**: 修改模版内容、名称或标签
- **删除模版**: 按 key 删除
- **列出模版**: 展示所有已保存的模版（含标签）
- **渲染模版**: 替换变量后输出结果
- **按 encId 渲染**: 模版含 `{encId}` 时，可用 `--enc <围栏名称部分>` 自动解析 encId 并渲染（如 `--enc 防汛` 匹配「上海防汛」）
- **按 tag + 围栏批量渲染**: 使用 `--by-tag <tag> --enc <围栏名称部分>` 输出该 tag 下所有模版针对该围栏的渲染结果（多条）
- **搜索模版**: 按 key 或名称模糊匹配；按 tag 筛选
- **围栏(enclosure) CRUD**: 维护 id-name 对，供 encId 解析；内置默认围栏（进博会、东方枢纽、漕河泾临港等）

## 存储位置

- 模版: `~/.string-skill/templates.json`
- 围栏: `~/.string-skill/enclosures.json`（不存在时使用内置默认列表）

可通过环境变量 `STRING_SKILL_CONFIG_DIR` 指定配置目录。

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
│       ├── enclosure-storage.ts
│       ├── enclosure-storage.test.ts
│       ├── enclosure-manager.ts
│       ├── enclosure-manager.test.ts
│       ├── default-enclosures.ts
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

| 命令 | 说明 | 示例 |
| -------- | ---------- | ----------------------------------------------- |
| `add` | 添加模版 | `add greeting 'Hello {name}!' '问候模版'`、`add link 'https://a.com/{encId}' '链接' -t link,防汛` |
| `update` | 更新模版 | `update greeting -c 'Hi {name}!'`、`update link -t link,url` |
| `delete` | 删除模版 | `delete greeting` |
| `list` | 列出模版 | `list` |
| `render` | 渲染模版 | `render greeting name=Hunter` |
| `render --enc` | 按围栏名称解析 encId | `render link --enc 防汛` |
| `render --by-tag --enc` | 按 tag 批量渲染 | `render x --by-tag link --enc 防汛` |
| `enclosure add` | 添加围栏 | `enclosure add '进博会' 6fM8Y6KTl5oAj1rv00lZmI` |
| `enclosure list` | 列出围栏 | `enclosure list` |
| `enclosure delete` | 删除围栏 | `enclosure delete <id>` |
| `enclosure update` | 更新围栏名称 | `enclosure update <id> -n '新名称'` |
