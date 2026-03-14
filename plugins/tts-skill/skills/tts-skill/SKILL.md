---
name: tts-skill
description: |
  Edge TTS 文本转语音 Skill。输入文本，输出 MP3。默认中文女声 Xiaoxiao，支持其他语音。
  当用户需要将文字转为语音、生成朗读音频时使用。

  <example>
  user: "把这段话转成语音：欢迎使用智能助手"
  assistant: 执行 `tts "欢迎使用智能助手"` 或 `tts synthesize --text "欢迎使用智能助手"`
  </example>

  <example>
  user: "有哪些中文女声可以用？"
  assistant: 执行 `tts voices --filter zh-CN` 列出中文语音，筛选 Female 展示
  </example>

  <example>
  user: "用 Xiaoyi 的声音读这段文字，保存到桌面"
  assistant: 执行 `tts synthesize --text "..." --voice zh-CN-XiaoyiNeural --out ~/Desktop/out.mp3`
  </example>
---

# TTS Skill

基于 Microsoft Edge TTS 的文本转语音，输出 MP3。默认中文女声 Xiaoxiao（晓晓），可切换其他语音。

CLI 路径：`${CLAUDE_PLUGIN_ROOT}/src/cli.js`

## 前置条件

- Node.js 18+
- 无需 API Key，使用 Edge 在线服务

## CLI 用法

### 合成语音（默认 /tmp 输出）

```bash
# 简写：直接传文本
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js "你好世界"

# 完整命令
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js synthesize --text "你好世界"

# 指定输出路径
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js "你好世界" --out /tmp/hello.mp3

# 指定语音（默认 zh-CN-XiaoxiaoNeural）
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js "你好" --voice zh-CN-XiaoyiNeural
```

### 列出支持的语音（voices / love）

```bash
# 列出全部
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js voices
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js love

# 按语言/名称过滤
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js voices --filter zh-CN
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js voices -f Xiaoxiao
```

返回 JSON 含：`ShortName`（语音 ID，用于 --voice）、`Locale`、`Gender`、`FriendlyName`。

## 常用中文女声

| ShortName | 说明 |
|-----------|------|
| zh-CN-XiaoxiaoNeural | 晓晓（默认） |
| zh-CN-XiaoyiNeural | 晓艺 |
| zh-CN-liaoning-XiaobeiNeural | 小北（东北） |
| zh-CN-shaanxi-XiaoniNeural | 小妮（陕西） |

## 参数说明

- `--text, -t`：待合成文本
- `--voice, -v`：语音 ShortName，默认 `zh-CN-XiaoxiaoNeural`
- `--out, -o`：输出文件路径，默认 `/tmp/tts_<timestamp>.mp3`
- `--dir, -d`：输出目录（未指定 --out 时，在此目录下生成 `tts_<ts>.mp3`），默认 `/tmp`
- `--filter, -f`：voices 过滤关键词（语言、名称等）
