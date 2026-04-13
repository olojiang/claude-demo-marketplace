---
name: oss_skill
description: Aliyun OSS 对象存储操作（上传、下载、列举、删除、重命名、软链接、签名URL）。当用户需要管理阿里云 OSS 文件时使用。
---

# OSS Skill

阿里云 OSS 对象存储操作，支持上传、下载、列举文件、删除、重命名、软链接、生成签名 URL。

## 使用场景

- 用户需要上传文件到阿里云 OSS
- 用户需要从 OSS 下载文件
- 用户需要查看 bucket 列表或文件列表
- 用户需要删除或重命名 OSS 中的文件
- 用户需要生成临时签名 URL

## 前置条件

必须设置以下环境变量：

```
export OSS_ACCESS_KEY_ID="your-access-key-id"
export OSS_ACCESS_KEY_SECRET="your-access-key-secret"
# 可选（有默认值）
export OSS_ENDPOINT="https://oss-cn-zhangjiakou.aliyuncs.com"
export ALLOWED_BUCKETS="bucket1,bucket2"
```

## CLI 用法

通过 `node ./scripts/index.js` 调用（编译产物已内置在 skill）。

### 列出 Buckets

```bash
node ./scripts/index.js list-buckets
```

### 上传文件

```bash
node ./scripts/index.js upload <bucket> <localPath> <remotePath>
```

### 下载文件

```bash
node ./scripts/index.js download <bucket> <remotePath> [localPath]
```

### 列出文件

```bash
node ./scripts/index.js list-objects <bucket> [-p prefix] [-m maxKeys]
```

### 删除文件

```bash
node ./scripts/index.js delete <bucket> <remotePath>
```

### 重命名文件

```bash
node ./scripts/index.js rename <bucket> <oldPath> <newPath>
```

### 生成签名 URL

```bash
node ./scripts/index.js sign-url <bucket> <remotePath> [-e seconds]
```

<example>
用户: 帮我上传 logo.png 到 pf-test-public-web
助手: 执行 `node ./scripts/index.js upload pf-test-public-web ./logo.png images/logo.png`
</example>
