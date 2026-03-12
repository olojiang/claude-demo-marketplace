---
name: minio_skill
description: MinIO/S3 object storage operations (list, upload, download, delete). Use when user needs to manage files in MinIO or S3-compatible storage.
---

# MinIO Skill

MinIO/S3 兼容对象存储操作，支持列出 buckets/objects、上传、下载、删除文件。

## 使用场景

- 用户需要查看 MinIO 中的 buckets 或 objects 列表
- 用户需要上传本地文件到 MinIO bucket
- 用户需要从 MinIO 下载文件到本地
- 用户需要删除 MinIO 中的对象

## 前置条件

必须设置以下环境变量：

```
export MINIO_ENDPOINT="play.min.io"
export MINIO_ACCESS_KEY="your-access-key"
export MINIO_SECRET_KEY="your-secret-key"
# 可选
export MINIO_PORT="9000"
export MINIO_USE_SSL="true"
```

## CLI 用法

通过 `${CLAUDE_PLUGIN_ROOT}/src/cli.ts` 调用（需 tsx 或构建后使用 dist）。

### 列出 Buckets

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts list
```

### 列出 Objects

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts list <bucket> [prefix] [-r]
```

### 上传文件

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts upload <bucket> <objectName> <localFilePath>
```

### 下载文件

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts download <bucket> <objectName> <localFilePath>
```

### 删除对象

```bash
npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts delete <bucket> <objectName>
```

<example>
用户: 帮我上传 logo.png 到 MinIO 的 my-bucket
助手: 执行 `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts upload my-bucket logo.png ./logo.png`
</example>

<example>
用户: 列出 test-bucket 中 images/ 下的所有文件
助手: 执行 `npx tsx ${CLAUDE_PLUGIN_ROOT}/src/cli.ts list test-bucket images/ -r`
</example>
