# remotion-skill

Remotion 视频生成：输入内容与时长，输出 MP4。默认输出到 /tmp，可指定路径。

## 安装

```bash
pnpm install
```

## 用法

```bash
# 基本（默认 5 秒，/tmp 输出）
node src/cli.js "欢迎观看"

# 指定时长与输出路径
node src/cli.js "产品介绍" --duration 10 --out /tmp/demo.mp4

# 指定输出目录
node src/cli.js "内容" --dir ~/Desktop
```

## 前置条件

- Node.js 18+
- FFmpeg（Remotion 依赖）
