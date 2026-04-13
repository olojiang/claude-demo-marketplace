---
name: remotion-skill
description: |
  Remotion 视频生成 Skill。输入视频内容与时长，输出 MP4。默认输出到 /tmp，可指定路径。
  当用户需要根据文本内容生成视频时使用。

  <example>
  user: "生成一个 10 秒的视频，内容是：欢迎观看"
  assistant: 执行 `remotion-video "欢迎观看" --duration 10`
  </example>

  <example>
  user: "把这段文字做成 30 秒视频，保存到桌面：产品发布会在下周二举行"
  assistant: 执行 `remotion-video "产品发布会在下周二举行" --duration 30 --out ~/Desktop/release.mp4`
  </example>

  <example>
  user: "用 Remotion 生成一个 5 秒介绍视频，内容是多行文字"
  assistant: 执行 `remotion-video --content "第一行\n第二行\n第三行" --duration 5`
  </example>
---

# Remotion Skill

基于 Remotion 的文本转视频。输入内容与时长，输出 MP4。内容支持换行（\n）。

CLI 路径：`./scripts/cli.js`

## 前置条件

- Node.js 18+
- FFmpeg（Remotion 依赖）
- 无需 API Key

## CLI 用法

### 基本（默认 /tmp 输出）

```bash
# 直接传内容，默认 5 秒
node ./scripts/cli.js "欢迎观看"

# 指定时长（秒）
node ./scripts/cli.js "欢迎观看" --duration 10

# 使用 --content
node ./scripts/cli.js --content "产品介绍" -d 15
```

### 指定输出路径

```bash
# 指定完整输出路径
node ./scripts/cli.js "内容" --out /path/to/output.mp4

# 指定输出目录（自动生成 remotion_<timestamp>.mp4）
node ./scripts/cli.js "内容" --dir ~/Desktop
```

### 参数说明

- `--content, -c`：视频内容文本，支持换行
- `--duration, -d`：时长（秒），默认 5
- `--out, -o`：输出文件路径，默认 `/tmp/remotion_<timestamp>.mp4`
- `--dir, -D`：输出目录（未指定 --out 时使用），默认 `/tmp`

返回 JSON：`{ ok: true, path: "..." }`
