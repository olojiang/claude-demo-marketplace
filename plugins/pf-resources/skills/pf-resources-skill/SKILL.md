---
name: pf_resources
description: 上传文件到 Pinefield 资源 CDN 并获取 URL，或列出指定 appId 下的所有资源。当用户需要上传图片/文件到 CDN、查看已有资源、获取资源链接时使用。
---

# PF Resources

管理 Pinefield 应用的 CDN 资源：上传文件获取 URL、列出已有资源。

## 使用场景

- 用户需要上传图片或文件到 CDN 并获取访问 URL
- 用户需要查看某个应用下已有的资源列表
- 用户需要获取某个资源的 CDN 链接

## 前置条件

必须设置环境变量 `PF_SESSION_TOKEN`，否则提示用户：

```
请先设置环境变量 PF_SESSION_TOKEN：
export PF_SESSION_TOKEN="your-bearer-token"

Token 可从 https://test.sheepwall.com 的浏览器请求头中获取（Authorization: Bearer xxx）。
```

## appId 来源与询问规则

**默认来源**：从项目根目录下的 `src/manifest.json` 中读取 `id` 字段作为 appId（例如 `"id": "pinefield.context-digital-native"`）。

**何时需要主动询问用户**：在以下任一情况下，**必须主动询问用户**「希望使用什么 appId？（例如 pinefield.context-digital-native）」：

- `src/` 目录不存在
- `src/manifest.json` 文件不存在
- `src/manifest.json` 内容无法解析为 JSON
- 解析后的 JSON 中没有 `id` 字段，或 `id` 为空字符串

**执行顺序**：在执行上传或列出资源前，先尝试从 `src/manifest.json` 获取 appId；若得到 `null`，则向用户提问，待用户提供 appId 后再继续。

## API 基础信息

- **Base URL**: `https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource`
- **CDN 域名**: `https://assets.pinefield.cn`
- **认证方式**: Bearer Token（`Authorization: Bearer $PF_SESSION_TOKEN`）

## 功能 1：上传资源

### 文件路径来源（重要）

用户可能在对话中**直接粘贴或附带图片/文件**（例如在 Claude Code 里拖入图片、选择「引用文件」等）。此时：

1. **优先从当前消息上下文中查找可用路径**：若系统已给出附件的本地路径（例如 Cursor 会将图片保存到工作区下的 `assets/image-xxx.png`，或在上下文中提供 `image_files`、附件路径等），**直接使用该路径**作为 `filePath` 进行上传，**不要**再向用户索要「本地文件路径」。
2. **仅当上下文中没有任何文件路径时**，再询问用户：「请提供要上传的文件的本地路径，例如 `/Users/你的用户名/Desktop/image.png`」。

这样用户说「给我上传」并附带一张图时，只要上下文里带有该图的保存路径，就应用该路径执行上传。

### 参数

| 参数       | 说明                                                                                                           | 示例                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `appId`    | 应用标识；优先从 `src/manifest.json` 的 `id` 读取，若不存在则询问用户                                          | `pinefield.context-digital-native`             |
| `filePath` | 本地文件路径；**优先使用当前消息/上下文中已提供的附件路径**（如工作区 `assets/` 下的路径），没有时再向用户索要 | `/path/to/image.png` 或 `assets/image-xxx.png` |

### 执行命令

```bash
curl -X POST 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/upload' \
  -H "authorization: Bearer $PF_SESSION_TOKEN" \
  -F "files=@<filePath>" \
  -F "dir=/apps/<appId>"
```

### 上传后获取 URL

上传完成后，通过 detail 接口获取完整资源信息：

```bash
curl 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/detail?path=apps%2F<appId>%2F<fileName>' \
  -H "authorization: Bearer $PF_SESSION_TOKEN"
```

### 返回值

detail 接口返回格式：

```json
{
  "name": "test1.png",
  "path": "apps/pinefield.context-digital-native/test1.png",
  "size": 36401,
  "lastModified": "Wed, 11 Mar 2026 07:06:53 GMT",
  "etag": "D48383BF75B71E1F14226A10DA57DC3A",
  "type": "image/png",
  "storageClass": "Standard",
  "url": "https://assets.pinefield.cn/apps/pinefield.context-digital-native/test1.png",
  "webpUrl": "https://assets.pinefield.cn/apps/pinefield.context-digital-native/test1.png?x-oss-process=image/format,webp"
}
```

**核心返回值**: 将 `url` 字段返回给用户。

## 功能 2：列出资源

### 参数

| 参数    | 说明                                                                  | 示例                               |
| ------- | --------------------------------------------------------------------- | ---------------------------------- |
| `appId` | 应用标识；优先从 `src/manifest.json` 的 `id` 读取，若不存在则询问用户 | `pinefield.context-digital-native` |

### 执行命令

```bash
curl 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/list' \
  -H "authorization: Bearer $PF_SESSION_TOKEN"
```

### 返回值

返回完整的资源树结构，需从中筛选 `apps/<appId>/` 路径下的文件：

```json
{
  "tree": [
    {
      "name": "apps",
      "path": "apps/",
      "type": "directory",
      "children": [
        {
          "name": "pinefield.context-digital-native",
          "path": "apps/pinefield.context-digital-native/",
          "type": "directory",
          "children": [
            {
              "name": "test1.png",
              "path": "apps/pinefield.context-digital-native/test1.png",
              "type": "file",
              "size": 36401,
              "lastModified": "2026-03-11T07:06:53.000Z",
              "url": "https://assets.pinefield.cn/apps/pinefield.context-digital-native/test1.png"
            }
          ]
        }
      ]
    }
  ]
}
```

**筛选逻辑**: 在 `tree` 中找到 `name === "apps"` 的目录，再找到 `name === appId` 的子目录，递归展平其下所有文件节点（`type === "file"`）。

## 工作流程

### 上传文件

1. **解析 filePath**：查看当前消息/上下文中是否已包含用户附带文件的本地路径（如 `image_files`、工作区 `assets/` 下路径等）；**若有则直接使用，若无再询问用户**「请提供要上传的文件的本地路径」。
2. **解析 appId**：读取项目根目录下 `src/manifest.json` 的 `id` 字段；若文件/目录不存在或无有效 `id`，**主动询问用户**「希望使用什么 appId？（例如 pinefield.context-digital-native）」，待用户提供后再继续。
3. 检查 `PF_SESSION_TOKEN` 环境变量是否存在
4. 执行 curl 上传命令（`-F "files=@<filePath>" -F "dir=/apps/<appId>"`）
5. 调用 detail 接口获取上传后的 URL
6. 将 URL 返回给用户

### 列出资源

1. **解析 appId**：同上，优先从 `src/manifest.json` 读取，否则询问用户。
2. 检查 `PF_SESSION_TOKEN` 环境变量是否存在
3. 调用 list 接口获取完整资源树
4. 从树中筛选指定 appId 目录下的文件
5. 以表格或列表形式展示文件名、大小、URL

## Node 模块

核心逻辑封装在插件目录 `${CLAUDE_PLUGIN_ROOT}/src/pf-resources.js` 中，导出以下函数：

- `getAppIdFromManifest(projectRoot?)` → 从 `src/manifest.json` 读取 `id` 作为 appId，无法读取时返回 `null`（此时应询问用户）
- `uploadResource(appId, filePath)` → `{ url, name, path }`
- `listResources(appId)` → `ResourceFile[]`
- `getToken()` → 获取并验证 token
- `findAppDir(tree, appId)` → 在树中查找 app 目录
- `flattenFiles(nodes)` → 递归展平文件列表
- `MANIFEST_PATH` → 常量 `'src/manifest.json'`
