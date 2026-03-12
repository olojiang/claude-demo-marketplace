# KV Skill Plugin

Redis key-value 存储操作 Skill，支持字符串、数字、列表、JSON 数据类型及 TTL 过期设置。

## 功能

- **字符串操作**: set / get / del / exists
- **数字操作**: incr / decr / setNumber / getNumber
- **列表操作**: rpush / lpush / rpop / lpop / lrange
- **JSON 操作**: setJson / getJson
- **TTL 支持**: 所有写入操作均可指定过期时间

## 环境变量

使用前必须设置 Redis 连接地址（二选一）：

```bash
export REDIS_URL="redis://localhost:6379"
# 或
export KV_URL="redis://localhost:6379"
```

## 项目结构

```
plugins/kv-skill/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── kv-skill/
│       └── SKILL.md
├── src/
│   ├── cli.ts
│   ├── index.ts
│   └── lib/
│       ├── kv-service.ts
│       ├── redis-client.ts
│       └── __tests__/
│           └── kv-service.test.ts
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

## 运行测试

```bash
pnpm install
pnpm test
```

## CLI 命令

| 命令         | 说明           | 示例                                  |
| ------------ | -------------- | ------------------------------------- |
| `set`        | 设置键值对     | `set mykey myvalue -e 60`             |
| `get`        | 获取值         | `get mykey`                           |
| `del`        | 删除键         | `del mykey`                           |
| `incr`       | 自增           | `incr counter`                        |
| `decr`       | 自减           | `decr counter`                        |
| `list-push`  | 推入列表       | `list-push mylist a b c`             |
| `list-pop`   | 弹出列表       | `list-pop mylist -l`                  |
| `list-get`   | 获取列表范围   | `list-get mylist -s 0 -e 5`          |
| `json-set`   | 存储 JSON      | `json-set config '{"k":"v"}' -e 120` |
| `json-get`   | 读取 JSON      | `json-get config`                     |
