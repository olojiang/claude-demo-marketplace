---
name: kimi-search
description: >
  使用 Kimi (Moonshot AI) 的内置联网搜索能力，帮助用户搜索实时网络信息。
  当用户需要搜索最新资讯、实时数据、新闻事件等网络信息时，使用此 Skill。
---

# Kimi Search Skill

当用户需要搜索网络信息时，使用此 Skill 通过 Kimi 的 `$web_search` 能力获取实时搜索结果。

## 使用场景

- 用户需要查询最新新闻、事件
- 用户需要查询实时数据（股价、天气、比赛结果等）
- 用户需要搜索特定话题的最新信息
- 用户需要验证某个事实或数据

## 使用方式

通过 CLI 工具执行搜索：

```bash
./scripts/cli.js search "<搜索问题>"
```

### 参数

- `--model <model>` 指定模型（默认 kimi-k2.5）
- `--temperature <number>` 温度参数，仅 instant 模式有效（默认 0.6）
- `--thinking` 启用 thinking 模式（temperature 强制为 1，支持深度推理）

### 环境变量

- `KIMI_API_KEY` 必须设置，Moonshot AI 的 API Key

## 示例

<example>
user: "帮我搜索一下今天的 AI 领域最新新闻"
assistant:
  1. 调用 kimi-search CLI 执行搜索
  2. 将搜索结果整理后呈现给用户
</example>

<example>
user: "2024年诺贝尔物理学奖得主是谁?"
assistant:
  1. 调用 `./scripts/cli.js search "2024年诺贝尔物理学奖得主是谁?"`
  2. 获取 Kimi 联网搜索结果
  3. 向用户呈现答案
</example>

<example>
user: "搜索一下最新的 React 19 有什么新特性"
assistant:
  1. 调用 `./scripts/cli.js search "React 19 新特性"`
  2. 整理搜索结果，向用户呈现
</example>

## 注意事项

- 搜索结果由 Kimi 联网搜索提供，结果的时效性取决于 Kimi 的搜索能力
- 搜索结果展示给用户时，请注明 "搜索结果由 Kimi 提供"
- 如果 KIMI_API_KEY 未设置，CLI 会报错，请提示用户设置环境变量
