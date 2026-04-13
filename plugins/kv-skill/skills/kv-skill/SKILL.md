---
name: kv_skill
description: Redis key-value store operations (string/number/list/JSON with TTL). Use when user needs to store, retrieve, or manage key-value data via Redis.
---

# KV Skill

Redis key-value 存储操作，支持字符串、数字、列表、JSON 数据类型及 TTL 过期设置。

## 使用场景

- 用户需要在 Redis 中存储/读取 key-value 数据
- 用户需要操作 Redis 列表（push/pop/range）
- 用户需要存取 JSON 结构化数据
- 用户需要数字自增/自减计数

## 前置条件

必须设置 Redis 连接环境变量（二选一）：

```
export REDIS_URL="redis://localhost:6379"
# 或
export KV_URL="redis://localhost:6379"
```

## CLI 用法

通过 `node ./scripts/cli.js` 调用（编译产物已内置在 skill）。

### 字符串操作

```bash
node ./scripts/cli.js set <key> <value> [-e <seconds>]
node ./scripts/cli.js get <key>
node ./scripts/cli.js del <key>
```

### 数字操作

```bash
node ./scripts/cli.js incr <key>
node ./scripts/cli.js decr <key>
```

### 列表操作

```bash
node ./scripts/cli.js list-push <key> <values...> [-l]
node ./scripts/cli.js list-pop <key> [-l]
node ./scripts/cli.js list-get <key> [-s <start>] [-e <end>]
```

### JSON 操作

```bash
node ./scripts/cli.js json-set <key> '<json>' [-e <seconds>]
node ./scripts/cli.js json-get <key>
```

<example>
用户: 帮我在 Redis 里存一个配置项 app-config
助手: 执行 `node ./scripts/cli.js json-set app-config '{"theme":"dark","lang":"zh"}'`
</example>

<example>
用户: 读取 Redis 中 counter 的值并自增
助手: 先 `node ./scripts/cli.js get counter`，再 `node ./scripts/cli.js incr counter`
</example>
