# tts-skill

Edge TTS 文本转 MP3。默认中文女声 Xiaoxiao，支持 `voices`/`love` 列出语音供选择。

## 安装

```bash
pnpm install
```

## 用法

```bash
# 合成（默认 /tmp）
node src/cli.js "你好世界"

# 指定路径
node src/cli.js "你好" --out /tmp/hello.mp3

# 换语音
node src/cli.js "你好" --voice zh-CN-XiaoyiNeural

# 列出语音
node src/cli.js voices --filter zh-CN
```
