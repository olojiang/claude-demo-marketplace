---
name: call-doubao
description: >
  使用 Doubao AI 的多模态能力：文本问答、图文对话、文生图、图生图、Token 检测。
  当用户需要 AI 对话、图片生成或 session 检测时，使用此 Skill。
---

# Call Doubao Skill

Doubao AI 多功能 Skill，支持文本问答、图文对话、文生图、图生图和 Token 活跃检测。

## 使用场景

- 用户需要与 AI 进行文本对话
- 用户提供图片并需要 AI 描述或分析
- 用户需要根据文字描述生成图片
- 用户需要基于已有图片生成新图片
- 用户需要检测 token/session 是否有效

## 使用方式

### 文本问答

```bash
${CLAUDE_PLUGIN_ROOT}/src/cli.js chat "<问题>"
```

### 图文对话（带图片）

```bash
${CLAUDE_PLUGIN_ROOT}/src/cli.js chat "<问题>" --image <图片URL或base64>
```

### 文生图

```bash
${CLAUDE_PLUGIN_ROOT}/src/cli.js image "<描述>" --ratio <比例> --style <风格>
```

### 图生图

```bash
${CLAUDE_PLUGIN_ROOT}/src/cli.js image "<描述>" --image <原图URL或base64> --ratio <比例> --style <风格>
```

### Token 检测

```bash
${CLAUDE_PLUGIN_ROOT}/src/cli.js token-check <token>
```

### 参数

- `--model <model>` 指定模型（文本默认 doubao，图片默认 Seedream 4.0）
- `--image <url|path>` 图片 URL、base64 字符串或本地文件路径
- `--ratio <ratio>` 图片比例，如 1:1, 4:3, 16:9（默认 1:1）
- `--style <style>` 图片风格，如 写实, 卡通（默认 写实）

### 环境变量

- `DOUBAO_API_KEY` 必须设置，Doubao API 的认证密钥

## 示例

<example>
user: "帮我问一下豆包，什么是量子计算"
assistant:
  1. 调用 call-doubao chat 发送问题
  2. 将 AI 回复整理后呈现给用户
</example>

<example>
user: "帮我描述一下这张图片 https://example.com/photo.jpg"
assistant:
  1. 调用 call-doubao chat --image 发送图文请求
  2. 将图片描述结果呈现给用户
</example>

<example>
user: "帮我生成一张机器猫的卡通图片"
assistant:
  1. 调用 call-doubao image "机器猫" --style 卡通
  2. 将生成的图片 URL 返回给用户
</example>

<example>
user: "基于这张图片生成一个写实风格的版本"
assistant:
  1. 调用 call-doubao image "<描述>" --image <原图URL> --style 写实
  2. 将生成的图片结果返回给用户
</example>

<example>
user: "检查一下这个 token 是否还有效"
assistant:
  1. 调用 call-doubao token-check <token>
  2. 将检测结果（有效/过期）告知用户
</example>

## 注意事项

- 文本模型默认使用 doubao，图片模型默认使用 Seedream 4.0
- image 参数支持三种格式：URL（http/https）、本地文件路径、base64 字符串
- 本地文件路径会自动读取并转为 base64，支持 jpg/jpeg/png/gif/webp/bmp/svg
- 纯 base64 输入会自动添加 `data:image/jpeg;base64,` 前缀
- 图生图需要同时提供 prompt 和 --image 参数

## Token/Session 过期

当 Doubao 的 **sessionId（即环境变量 DOUBAO_API_KEY）过期或无效**时：

- **chat / image** 请求会失败，命令行会打印明确错误并提示如何更新。
- **token-check** 若返回 `"live": false`，同样会提示该 token 已过期。

**更新方法：**

1. 在 `~/.zshrc` 中设置新的 token：`export DOUBAO_API_KEY="<新 token>"`
2. 执行 `source ~/.zshrc` 或重新打开终端。

重新获取 token 后按上述步骤更新即可继续使用。
