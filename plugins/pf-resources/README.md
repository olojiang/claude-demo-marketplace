# PF Resources Plugin

Pinefield 应用资源管理 Skill，支持上传文件到 CDN 并获取 URL，以及列出指定应用下的所有资源。

## 功能

- **上传资源**: 将本地文件上传到 Pinefield CDN，返回可访问的 URL
- **列出资源**: 获取指定 appId 下所有已上传的资源列表

## appId 来源

- **默认**：从项目根目录的 `src/manifest.json` 中读取 `id` 字段作为 appId。
- **若不存在**（无 `src/`、无 `src/manifest.json`、或内容中无有效 `id`），Claude 会**主动询问**：「希望使用什么 appId？（例如 pinefield.context-digital-native）」

## 环境变量

使用前必须设置 `PF_SESSION_TOKEN`：

```bash
export PF_SESSION_TOKEN="your-bearer-token"
```

Token 获取方式：登录 [test.sheepwall.com](https://test.sheepwall.com)，从浏览器开发者工具的 Network 面板中复制 `Authorization: Bearer xxx` 中的 token 部分。

## 项目结构

```
plugins/pf-resources/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── pf-resources-skill/
│       └── SKILL.md
├── src/
│   └── pf-resources.js
├── __tests__/
│   └── pf-resources.test.js
├── package.json
└── README.md
```

## 运行测试

在插件目录下：

```bash
pnpm install
pnpm test
```

## API 参考

| 接口                        | 方法             | 用途                                       |
| --------------------------- | ---------------- | ------------------------------------------ |
| `/resource/upload`          | POST (multipart) | 上传文件，字段: `files`(文件), `dir`(目录) |
| `/resource/detail?path=xxx` | GET              | 获取单个资源详情（含 URL）                 |
| `/resource/list`            | GET              | 获取完整资源树                             |
