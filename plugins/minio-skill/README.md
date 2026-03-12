# MinIO Skill Plugin

MinIO/S3 兼容对象存储操作 Skill，支持列出 buckets/objects、上传、下载、删除文件。

## 功能

- **列出 Buckets**: 查看所有 buckets
- **列出 Objects**: 按 prefix 过滤、支持递归列举
- **上传文件**: 上传本地文件到指定 bucket
- **下载文件**: 从 bucket 下载到本地
- **删除对象**: 删除指定 object

## 环境变量

使用前必须设置以下环境变量：

```bash
export MINIO_ENDPOINT="play.min.io"
export MINIO_ACCESS_KEY="your-access-key"
export MINIO_SECRET_KEY="your-secret-key"
# 可选
export MINIO_PORT="9000"
export MINIO_USE_SSL="true"
```

## 项目结构

```
plugins/minio-skill/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── minio-skill/
│       └── SKILL.md
├── src/
│   ├── cli.ts
│   └── lib/
│       ├── minio-client.ts
│       └── __tests__/
│           └── minio-client.test.ts
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

| 命令       | 说明         | 别名     | 示例                                      |
| ---------- | ------------ | -------- | ----------------------------------------- |
| `list`     | 列出桶/对象  | `ls`     | `list mybucket images/ -r`               |
| `upload`   | 上传文件     | `cp-in`  | `upload mybucket obj.txt ./obj.txt`      |
| `download` | 下载文件     | `cp-out` | `download mybucket obj.txt ./local.txt`  |
| `delete`   | 删除对象     | `rm`     | `delete mybucket obj.txt`                |
