---
name: minimax-skill
description: >
  使用 MiniMax Coding Plan API 执行联网搜索与图像理解。
  当用户要求“查资料/联网搜索”或“看图解释图片内容”时使用此 Skill。
---

# MiniMax Skill

该 Skill 提供两个能力：
- `search`：调用 `POST /v1/coding_plan/search`
- `understand-image`：调用 `POST /v1/coding_plan/vlm`

## 使用方式

```bash
./scripts/cli.js search "Python 3.12 release highlights"
./scripts/cli.js understand-image --prompt "请简要描述这张图" --image ./demo.png
```

`--image` 支持：
- 本地文件路径（会自动转 `data:image/...;base64,...`）
- `http(s)` 图片 URL（会先下载再转 data URL）
- 已经是 data URL 的字符串

## 环境变量

- `MINIMAX_TOKEN`（必填）

示例：

```bash
export MINIMAX_TOKEN="your_minimax_token"
```

## 自然语言触发样例

<example>
user: "帮我联网搜一下 Python 3.12 的主要新特性"
assistant:
  1. 执行 `./scripts/cli.js search "Python 3.12 的主要新特性"`
  2. 基于返回结果整理要点回复用户
</example>

<example>
user: "帮我看下这张图片里有什么，图片在 ./screenshots/ui.png"
assistant:
  1. 执行 `./scripts/cli.js understand-image --prompt "请描述图片中的关键元素" --image ./screenshots/ui.png`
  2. 根据返回结果总结并回复用户
</example>

<example>
user: "分析这个图片 URL 的内容：https://example.com/a.png"
assistant:
  1. 执行 `./scripts/cli.js understand-image --prompt "请分析这张图片" --image https://example.com/a.png`
  2. 根据返回结果给出结构化结论
</example>

## 注意事项

- 如果未设置 `MINIMAX_TOKEN`，命令会报错并退出。
- 图像理解接口底层提交字段是 `image_url`；本 Skill 自动处理输入格式转换。
- 搜索与图像理解均按官方 Header 发送：`Authorization`、`MM-API-Source`、`Content-Type`。
