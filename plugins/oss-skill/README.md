# OSS Skill Plugin

阿里云 OSS 对象存储操作 Skill，支持上传、下载、列举、删除、重命名、软链接、生成签名 URL。

## 功能

- **上传文件**: 上传本地文件到 OSS 并返回下载 URL
- **下载文件**: 从 OSS 下载文件到本地
- **列出 Buckets**: 查看所有可用 bucket
- **列出 Objects**: 按前缀过滤，支持分页
- **删除文件**: 从 OSS 删除文件
- **重命名文件**: 通过复制+删除实现
- **软链接**: 创建 OSS 软链接
- **签名 URL**: 生成临时访问 URL

## 环境变量

使用前**必须**设置以下环境变量（不允许硬编码）：

```bash
export OSS_ACCESS_KEY_ID="your-access-key-id"
export OSS_ACCESS_KEY_SECRET="your-access-key-secret"

# 可选（有默认值）
export OSS_ENDPOINT="https://oss-cn-zhangjiakou.aliyuncs.com"
export ALLOWED_BUCKETS="pf-test-public-web,pf-test-public-file"
export SERVICE_BASE_URL="test.sheepwall.com"
```

## 项目结构

```
plugins/oss-skill/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── oss-skill/
│       └── SKILL.md
├── src/
│   ├── index.ts
│   └── lib/
│       ├── config.ts
│       ├── oss-client.ts
│       └── oss-client.test.ts
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

| 命令           | 说明           | 示例                                                    |
| -------------- | -------------- | ------------------------------------------------------- |
| `list-buckets` | 列出 buckets   | `list-buckets`                                          |
| `bucket-info`  | bucket 详情    | `bucket-info pf-test-public-web`                       |
| `upload`       | 上传文件       | `upload pf-test-public-web ./img.png images/img.png`   |
| `download`     | 下载文件       | `download pf-test-public-web images/img.png ./img.png` |
| `list-objects` | 列举文件       | `list-objects pf-test-public-web -p images/ -m 10`     |
| `delete`       | 删除文件       | `delete pf-test-public-web images/old.png`             |
| `rename`       | 重命名         | `rename pf-test-public-web old.png new.png`            |
| `symlink`      | 创建软链接     | `symlink pf-test-public-web link.jpg target.jpg`       |
| `sign-url`     | 生成签名 URL   | `sign-url pf-test-private-file doc.pdf -e 60`          |
