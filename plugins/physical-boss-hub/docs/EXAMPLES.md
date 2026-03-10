# 测试样例

安装插件后，通过以下 3 个场景体验 Physical Boss Hub 的完整功能。

> 所有命令中的 `$CLI` = `node $PLUGIN_DIR/src/cli.js`

```bash
# 初始化路径变量
PLUGIN_DIR=$(ls -d ~/.claude/plugins/cache/olojiang-demo/physical-boss-hub/*)
CLI="node $PLUGIN_DIR/src/cli.js"
```

---

## 样例 1：委派日报撰写（Person）

体验 Agent 自动发现合适的人 → 委派任务 → 收到 AI 模拟的日报。

**第 1 步：注册人员**

```bash
$CLI person register \
  --name "韩啸" \
  --description "空间智能机项目负责人，擅长撰写技术日报和项目进展报告" \
  --tags "空间智能机,项目管理,技术报告" \
  --actions "write-daily-report,write-weekly-summary,project-status"
```

预期输出包含 `"_worker": "mhub-person-韩啸"` 表示 worker 已启动。

**第 2 步：确认 Worker 运行**

```bash
pm2 status
# 预期：mhub-person-韩啸 状态为 online
```

**第 3 步：在 Claude Code 中测试**

```
帮我看一下空间智能机项目的最新进展，写一份今日日报
```

预期行为：

1. Agent 执行 `person list`，发现韩啸的 `actions` 包含 `write-daily-report`
2. Agent 向 hub channel 发送委派消息给韩啸
3. 韩啸的 Worker 通过 `claude -p` 生成日报
4. Agent 收到回复，向用户呈现日报内容，注明 **"此日报由韩啸撰写"**

**第 4 步：验证消息链**

```bash
$CLI message list --channel hub --limit 5
# 预期：agent → 韩啸 的任务消息 + 韩啸 → agent 的日报回复
```

---

## 样例 2：查询设备数据（Device）

体验 Agent 发现传感器设备 → 发送读取指令 → 收到设备模拟数据。

**第 1 步：注册设备**

```bash
$CLI device register \
  --name "办公室温度计" \
  --description "办公室温湿度传感器，实时采集环境数据" \
  --tags "传感器,温度,湿度,办公室" \
  --actions "read-temperature,read-humidity"
```

**第 2 步：确认 Worker 运行**

```bash
pm2 status
# 预期：mhub-device-办公室温度计 状态为 online
```

**第 3 步：在 Claude Code 中测试**

```
现在办公室温度怎么样？
```

预期行为：

1. Agent 执行 `device list`，发现"办公室温度计"的 `actions` 包含 `read-temperature`
2. Agent 发送读取指令给该设备
3. 设备 Worker 通过 `claude -p` 模拟返回温度数据
4. Agent 呈现结果，注明 **"数据由设备 办公室温度计 提供"**

---

## 样例 3：多实体协作（Person + Device）

体验 Agent 同时调用 Person 和 Device 完成一个复合任务。

**第 1 步：确保样例 1、2 的实体已注册**

```bash
$CLI person list   # 应看到韩啸
$CLI device list   # 应看到办公室温度计
pm2 status         # 两个 worker 都在线
```

**第 2 步：在 Claude Code 中测试**

```
帮我做两件事：
1. 查一下办公室现在的温度
2. 让韩啸写一份今天空间智能机项目的日报
```

预期行为：

1. Agent 分析出两个子任务
2. 分别向"办公室温度计"和"韩啸"发送消息
3. 两个 Worker 各自处理并回复
4. Agent 汇总结果：温度数据 + 日报内容，注明各自来源

**第 3 步：查看完整消息链**

```bash
$CLI message list --channel hub --limit 10
# 预期：4 条消息 — 2 条任务 + 2 条回复，replyTo 正确关联
```

**第 4 步：查看 Worker 日志**

```bash
pm2 logs mhub-person-韩啸 --lines 10 --nostream
pm2 logs mhub-device-办公室温度计 --lines 10 --nostream
# 预期：看到 processMessage / replied 日志
```

---

## 清理测试环境

```bash
$CLI person remove --id <韩啸 id>
$CLI device remove --id <设备 id>

# 或直接 PM2 清理
pm2 delete mhub-person-韩啸
pm2 delete mhub-device-办公室温度计

# 清理数据（谨慎操作）
rm -rf ~/.pinefield/physical-boss-hub
```
