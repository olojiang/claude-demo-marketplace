# call-doubao

Doubao AI 多功能插件，支持文本问答、图文对话、文生图、图生图和 Token 检测。

## 功能

| 功能       | 命令                                         | 说明                      |
| ---------- | -------------------------------------------- | ------------------------- |
| 文本问答   | `call-doubao chat "<text>"`                  | 纯文本 AI 对话            |
| 图文对话   | `call-doubao chat "<text>" --image <url>`    | 带图片的视觉问答          |
| 文生图     | `call-doubao image "<prompt>"`               | 根据文字生成图片          |
| 图生图     | `call-doubao image "<prompt>" --image <url>` | 基于已有图片生成新图      |
| Token 检测 | `call-doubao token-check <token>`            | 检测 token/session 有效性 |

## 环境变量

```bash
export DOUBAO_API_KEY="your-api-key"
```

## 安装

```bash
bash setup.sh
```

## 使用示例

```bash
# 文本问答
call-doubao chat "什么是量子计算"

# 图文对话 - URL 图片
call-doubao chat "描述这张图片" --image "https://example.com/photo.jpg"

# 图文对话 - 本地文件（自动转 base64）
call-doubao chat "描述这张图片" --image "/Users/me/Desktop/photo.png"

# 图文对话 - base64 图片
call-doubao chat "描述这张图片" --image "iVBORw0KGgoAAAANSU..."

# 文生图
call-doubao image "机器猫" --ratio "1:1" --style "卡通"

# 文生图 - 自定义比例
call-doubao image "3d 学校建模" --ratio "4:3" --style "写实"

# 图生图
call-doubao image "机器猫" --image "https://example.com/source.jpg" --style "卡通"

# Token 检测
call-doubao token-check "6750e5af32eb15976..."
```

## 选项

| 选项                  | 说明                        | 默认值                |
| --------------------- | --------------------------- | --------------------- |
| `--model <model>`     | 模型名称                    | doubao / Seedream 4.0 |
| `--image <url\|path>` | 图片 URL、本地路径或 base64 | -                     |
| `--ratio <ratio>`     | 图片比例                    | 1:1                   |
| `--style <style>`     | 图片风格                    | 写实                  |

## 目录结构

```text
call-doubao/
├── .claude-plugin/plugin.json
├── hooks/
│   ├── hooks.json
│   └── ensure-setup.sh
├── skills/call-doubao-skill/SKILL.md
├── src/
│   ├── cli.js           # CLI 入口
│   ├── cli.test.js      # CLI 参数解析测试
│   ├── client.js           # HTTP 客户端
│   ├── resolve-image.js    # 图片输入解析（URL/路径/base64）
│   ├── resolve-image.test.js # 图片解析测试
│   ├── client.test.js   # 客户端测试
│   ├── chat.js          # 文本/图文对话
│   ├── chat.test.js     # 对话测试
│   ├── image.js         # 文生图/图生图
│   ├── image.test.js    # 图片生成测试
│   ├── token.js         # Token 检测
│   └── token.test.js    # Token 检测测试
├── package.json
├── setup.sh
└── README.md
```

## 测试

```bash
npm test
```

## 在 Claude Code 中测试

以下是在 Claude Code 会话中可以使用的测试用例，覆盖所有功能和边界场景。

### 前置准备

```bash
# 确保环境变量已设置
export DOUBAO_API_KEY="your-api-key"

# 确保 CLI 可执行
chmod +x plugins/call-doubao/src/cli.js
```

### Case 1: 文本问答

```bash
# 基础问答
./src/cli.js chat "你好，介绍一下你自己"

# 带自定义 model
./src/cli.js chat "什么是量子计算" --model "doubao"

# 多词 prompt（空格自动拼接）
./src/cli.js chat 今天 天气 怎么样
```

### Case 2: 图文对话 - URL 图片

```bash
# HTTPS 图片 URL
./src/cli.js chat "请描述这张图片" --image "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"

# HTTP 图片 URL
./src/cli.js chat "这是什么" --image "http://example.com/photo.jpg"
```

### Case 3: 图文对话 - 本地文件

```bash
# 绝对路径
./src/cli.js chat "请描述这张图片" --image "/Users/me/Desktop/photo.png"

# 相对路径
./src/cli.js chat "这张图里有什么" --image "./test-image.jpg"

# 支持各种图片格式
./src/cli.js chat "描述" --image "/path/to/image.webp"
./src/cli.js chat "描述" --image "/path/to/image.gif"
```

### Case 4: 图文对话 - base64

```bash
# 裸 base64 字符串（自动补 data:image/jpeg;base64, 前缀）
./src/cli.js chat "这是什么" --image "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEklEQVR4nGP4z8CAFWEXHbQSACj/P8Fu7N9hAAAAAElFTkSuQmCC"

# 完整 data URI（直接透传）
./src/cli.js chat "描述图片" --image "data:image/png;base64,iVBORw0KGgo..."
```

### Case 5: 文生图

```bash
# 基础文生图（默认 1:1 写实）
./src/cli.js image "机器猫"

# 自定义比例和风格
./src/cli.js image "机器猫" --ratio "1:1" --style "卡通"

# 宽屏比例
./src/cli.js image "3d 学校建模（有科技感）" --ratio "4:3" --style "写实"

# 16:9 比例
./src/cli.js image "日落海滩" --ratio "16:9" --style "写实"

# 自定义模型
./src/cli.js image "未来城市" --model "Seedream 4.0" --style "科幻"
```

### Case 6: 图生图

```bash
# URL 源图
./src/cli.js image "机器猫" --image "https://example.com/source.jpg" --ratio "1:1" --style "卡通"

# 本地文件源图（自动转 base64）
./src/cli.js image "写实风格" --image "/Users/me/Desktop/sketch.png" --style "写实"

# 改变风格
./src/cli.js image "油画风格" --image "./photo.jpg" --ratio "4:3" --style "油画"
```

### Case 7: Token 检测

```bash
# 检测有效 token
./src/cli.js token-check "6750e5af32eb15976..."

# 检测无效/过期 token
./src/cli.js token-check "invalid-token-abc"
```

### Case 8: 错误处理与边界场景

```bash
# 未设置 API Key
unset DOUBAO_API_KEY && ./src/cli.js chat "hello"
# 预期: Error: DOUBAO_API_KEY environment variable is required

# 缺少必要参数
./src/cli.js chat
# 预期: chat: missing <text> argument

./src/cli.js image
# 预期: image: missing <prompt> argument

./src/cli.js token-check
# 预期: token-check: missing <token> argument

# 未知命令
./src/cli.js foo
# 预期: unknown command: foo + 帮助信息

# 帮助信息
./src/cli.js help
./src/cli.js
# 预期: 打印完整的 Usage 帮助

# 不存在的本地文件路径（会被当作 base64 处理）
./src/cli.js chat "test" --image "/nonexistent/file.png"
# 预期: 将路径字符串当作 base64 发送（API 可能报错）
```

### Case 9: 在 Claude Code 对话中自然语言触发

在 Claude Code 会话中直接对 AI 说：

| 测试用例         | 自然语言                              | 预期触发                          |
| ---------------- | ------------------------------------- | --------------------------------- |
| 文本问答         | "帮我问一下豆包，什么是大语言模型"    | `chat`                            |
| 图文对话 URL     | "帮我描述一下这张图片 https://..."    | `chat --image`                    |
| 图文对话本地文件 | "帮我看看桌面上这张 photo.png 是什么" | `chat --image /path/to/photo.png` |
| 文生图           | "帮我生成一张机器猫的卡通图片"        | `image --style 卡通`              |
| 图生图           | "基于这张图生成写实风格版本"          | `image --image ... --style 写实`  |
| Token 检测       | "检查一下这个 token 是否有效"         | `token-check`                     |
| 错误提示         | "帮我用豆包搜索"（未设 API Key）      | 提示设置 DOUBAO_API_KEY           |
