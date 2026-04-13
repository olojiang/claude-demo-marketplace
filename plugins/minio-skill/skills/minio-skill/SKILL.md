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

通过 `node ./scripts/cli.js` 调用（编译产物已内置在 skill）。

### 列出 Buckets

```bash
node ./scripts/cli.js list
```

### 列出 Objects

```bash
node ./scripts/cli.js list <bucket> [prefix] [-r]
```

### 上传文件

```bash
node ./scripts/cli.js upload <bucket> <objectName> <localFilePath>
```

### 下载文件

```bash
node ./scripts/cli.js download <bucket> <objectName> <localFilePath>
```

### 删除对象

```bash
node ./scripts/cli.js delete <bucket> <objectName>
```

<example>
用户: 帮我上传 logo.png 到 MinIO 的 my-bucket
助手: 执行 `node ./scripts/cli.js upload my-bucket logo.png ./logo.png`
</example>

<example>
用户: 列出 test-bucket 中 images/ 下的所有文件
助手: 执行 `node ./scripts/cli.js list test-bucket images/ -r`
</example>
