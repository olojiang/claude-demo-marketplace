---
name: pf_resources
description: 可独立复制使用的 Pinefield 资源 CDN Skill。本目录内含 SKILL.md 与 `scripts/pf-resources.js`；上传/列举可用 curl 或 Node 复用 skill 内脚本。
---

# PF Resources

管理 Pinefield 应用的 CDN 资源：上传文件获取 URL、列出已有资源。

## 本 Skill 目录结构（复制后应保持完整）

仅复制本文件夹即可在其它机器使用，**不要依赖本文件夹外的路径**。推荐结构：

```
pf-resources-skill/
├── SKILL.md          # 本说明与 API / curl 流程
└── scripts/
    └── pf-resources.js # Node 可复用实现（与插件仓库内逻辑一致，单一源码）
```

- 所有「相对路径」均指：**相对于本 skill 目录**（例如 `./scripts/pf-resources.js`）。

## 可移植性与依赖

- 复制整个 `pf-resources-skill/` 到目标环境的 skills 目录即可。
- 环境变量：必须设置 `PF_SESSION_TOKEN`。
- **调用方式二选一**（或组合）：
  1. **curl**：按下文「功能 1 / 功能 2」中的命令执行（不依赖 Node 模块）。
  2. **Node**：在同目录下用 ES Module 引用 `./scripts/pf-resources.js`（需 Node 18+，含 `fetch` / `FormData` / `Blob`）。示例（在 `pf-resources-skill` 目录内执行）：

```bash
export PF_SESSION_TOKEN="your-token"

# 上传并查看 URL + WebP 链接 + 控制台链接
node --input-type=module -e "
import { getAppIdFromManifest, uploadResource, formatResultOutput } from './scripts/pf-resources.js'
const appId = getAppIdFromManifest()
const r = await uploadResource(appId, '/path/to/file.png')
console.log(formatResultOutput([r]))
"

# 上传到子目录
node --input-type=module -e "
import { getAppIdFromManifest, uploadResource, formatResultOutput } from './scripts/pf-resources.js'
const appId = getAppIdFromManifest()
const r = await uploadResource(appId, '/path/to/file.png', 'release/icons')
console.log(formatResultOutput([r]))
"

# 查询已有文件的链接（不上传）
node --input-type=module -e "
import { getAppIdFromManifest, getResourceDetail, formatResultOutput } from './scripts/pf-resources.js'
const appId = getAppIdFromManifest()
const r = await getResourceDetail(appId, 'test1.png')
console.log(formatResultOutput([r]))
"
```

- 解析 JSON 时可优先使用 `jq`；无 `jq` 时可由模型直接阅读返回文本。

> 若在其他仓库内集成，只需保留 `./scripts/pf-resources.js` 作为唯一实现文件。

## 使用场景

- 用户需要上传图片或文件到 CDN 并获取访问 URL（含 WebP 格式链接）
- 用户需要查看某个应用下已有的资源列表
- 用户需要获取某个已上传资源的 CDN 链接（含 WebP），不需要重新上传
- 用户需要访问资源管理控制台

## 前置条件

必须设置环境变量 `PF_SESSION_TOKEN`，否则提示用户：

```
请先设置环境变量 PF_SESSION_TOKEN：
export PF_SESSION_TOKEN="your-bearer-token"

Token 可从 https://test.sheepwall.com 的浏览器请求头中获取（Authorization: Bearer xxx）。
```

## appId 来源与默认规则

**默认来源**：优先从当前工作目录下的 `src/manifest.json` 中读取 `id` 字段作为 appId（例如 `"id": "pinefield.context-digital-native"`）。

**显式覆盖**：用户若指定了 appId（例如「上传到 pinefield.xxx」），应使用用户给出的值，不再仅依赖 manifest。

**回退默认值**：当出现以下任一情况时，直接使用默认 appId `pinefield.assets` 并继续执行（不需要先向用户追问）：

- `src/` 目录不存在
- `src/manifest.json` 文件不存在
- `src/manifest.json` 内容无法解析为 JSON
- 解析后的 JSON 中没有 `id` 字段，或 `id` 为空字符串

**执行顺序**：在执行上传或列出资源前，先尝试从当前工作目录的 `src/manifest.json` 获取 appId；若未拿到有效 id，则自动回退到 `pinefield.assets`。

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
| `appId`    | 应用标识；优先从 `src/manifest.json` 的 `id` 读取，若不存在则回退 `pinefield.assets`；用户指定时以用户为准     | `pinefield.context-digital-native`             |
| `filePath` | 本地文件路径；**优先使用当前消息/上下文中已提供的附件路径**（如工作区 `assets/` 下的路径），没有时再向用户索要 | `/path/to/image.png` 或 `assets/image-xxx.png` |
| `subPath`  | 可选。上传到 CDN 时对象位于 `apps/<appId>/<subPath>/` 下；不含 `appId` 前缀；不要含 `..` 或单独的 `.` 段       | `release`、`icons/hd`、`2026-03/banner`      |

**目录与表单字段**：上传接口的 `dir` 为 `/apps/<appId>`（无子目录时），或 `/apps/<appId>/<subPath>`（有子目录时，多段用 `/` 连接）。对象在存储中的 `path` 为 `apps/<appId>/<fileName>` 或 `apps/<appId>/<subPath>/<fileName>`。

### 执行命令

无子目录（与历史行为一致）：

```bash
curl -X POST 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/upload' \
  -H "authorization: Bearer $PF_SESSION_TOKEN" \
  -F "files=@<filePath>" \
  -F "dir=/apps/<appId>"
```

指定子目录 `subPath`（示例为 `release/icons`）：

```bash
curl -X POST 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/upload' \
  -H "authorization: Bearer $PF_SESSION_TOKEN" \
  -F "files=@<filePath>" \
  -F "dir=/apps/<appId>/release/icons"
```

### 上传后获取 URL

上传完成后，通过 detail 接口获取完整资源信息（`path` 需与实际对象键一致，注意是否包含 `subPath`）：

```bash
# 无 subPath：path = apps/<appId>/<fileName>
curl 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/detail?path=apps%2F<appId>%2F<fileName>' \
  -H "authorization: Bearer $PF_SESSION_TOKEN"
```

```bash
# 有 subPath（示例 subPath = release/icons）：path = apps/<appId>/release/icons/<fileName>
curl 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/detail?path=apps%2F<appId>%2Frelease%2Ficons%2F<fileName>' \
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

**核心返回值**: 将 `url` 和 `webpUrl` 字段返回给用户，同时附上资源管理控制台链接。

### 上传后的输出格式

无论上传一个还是多个文件，都必须在结果中显示以下信息：

1. **每个文件** 的 `url`（原始链接）和 `webpUrl`（WebP 格式链接）
2. **资源管理控制台** 链接：`https://app.pinefield.cn/pinefield.developer-console/#/`

示例输出：

```
test1.png
  URL:  https://assets.pinefield.cn/apps/pinefield.assets/test1.png
  WebP: https://assets.pinefield.cn/apps/pinefield.assets/test1.png?x-oss-process=image/format,webp
test2.jpg
  URL:  https://assets.pinefield.cn/apps/pinefield.assets/test2.jpg
  WebP: https://assets.pinefield.cn/apps/pinefield.assets/test2.jpg?x-oss-process=image/format,webp

Resource Console: https://app.pinefield.cn/pinefield.developer-console/#/
```

可使用 `formatResultOutput(results)` 函数生成上述格式。

## 功能 2：列出资源

### 参数

| 参数      | 说明                                                                                    | 示例                               |
| --------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| `appId`   | 应用标识；优先从 `src/manifest.json` 的 `id` 读取，若不存在则回退 `pinefield.assets`     | `pinefield.context-digital-native` |
| `subPath` | 可选。只列出 `apps/<appId>/<subPath>/` 下的文件（含子文件夹内文件，结果展平）；不传则列出整个 app 下所有文件 | `release`、`images/icons`          |

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

**筛选逻辑**: 在 `tree` 中找到 `name === "apps"` 的目录，再找到 `name === appId` 的子目录；若未传 `subPath`，递归展平该 app 目录下所有文件节点（`type === "file"`）；若传了 `subPath`，先按路径段进入对应子目录，再对该子树展平。子目录不存在时结果为空列表。

## 功能 3：查询资源链接（不上传）

已上传过的文件可以直接查询其 CDN 链接和 WebP 链接，无需重新上传。

### 参数

| 参数       | 说明                                                                                       | 示例                               |
| ---------- | ------------------------------------------------------------------------------------------ | ---------------------------------- |
| `appId`    | 应用标识；优先从 `src/manifest.json` 的 `id` 读取，若不存在则回退 `pinefield.assets`       | `pinefield.context-digital-native` |
| `fileName` | 文件名                                                                                     | `test1.png`                        |
| `subPath`  | 可选。文件所在的子目录路径（相对于 `apps/<appId>/`）                                       | `release/icons`                    |

### 执行命令（curl）

```bash
curl 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/detail?path=apps%2F<appId>%2F<fileName>' \
  -H "authorization: Bearer $PF_SESSION_TOKEN"
```

### Node 调用

```bash
node --input-type=module -e "
import { getAppIdFromManifest, getResourceDetail, formatResultOutput } from './scripts/pf-resources.js'
const appId = getAppIdFromManifest()
const r = await getResourceDetail(appId, 'test1.png')
console.log(formatResultOutput([r]))
"
```

### 返回值

与上传后的 detail 返回格式一致（含 `url`、`webpUrl`、`name`、`path`），同时显示控制台链接。

## 工作流程

### 上传文件

1. **解析 filePath**：查看当前消息/上下文中是否已包含用户附带文件的本地路径（如 `image_files`、工作区 `assets/` 下路径等）；**若有则直接使用，若无再询问用户**「请提供要上传的文件的本地路径」。
2. **解析 appId**：若用户未指定，则读取当前工作目录下 `src/manifest.json` 的 `id` 字段；若文件/目录不存在或无有效 `id`，自动回退 `pinefield.assets` 并继续执行。
3. **解析 subPath**（可选）：若用户要求上传到某子目录或列出某子目录，使用其给出的相对路径（相对 `apps/<appId>/`），写入表单 `dir` 与 detail 的 `path` 时与脚本 `buildUploadDir` / `buildResourcePath` 行为一致；路径中不得包含 `..` 或单独的 `.` 段。
4. 检查 `PF_SESSION_TOKEN` 环境变量是否存在
5. 执行 curl 上传命令：`-F "files=@<filePath>" -F "dir=/apps/<appId>"` 或 `-F "dir=/apps/<appId>/<subPath>"`（将 `<subPath>` 中的 `/` 按实际段编码进一条 dir 值）
6. 调用 detail 接口获取上传后的 URL（`path` 为 `apps/<appId>/<fileName>` 或 `apps/<appId>/<subPath>/<fileName>`）
7. **展示结果**：显示每个文件的 `url` 和 `webpUrl`，以及资源管理控制台链接 `https://app.pinefield.cn/pinefield.developer-console/#/`

### 列出资源

1. **解析 appId**：同上；用户指定 appId 时优先采用用户值。
2. **解析 subPath**（可选）：同上；用于只查看某一子文件夹下的资源。
3. 检查 `PF_SESSION_TOKEN` 环境变量是否存在
4. 调用 list 接口获取完整资源树
5. 从树中定位 `apps/<appId>/`（及可选的 `subPath` 子目录），展平文件
6. 以表格或列表形式展示文件名、大小、URL

### 查询链接（不上传）

1. **解析 appId**：同上。
2. **解析 fileName**：用户指定的文件名。
3. **解析 subPath**（可选）：同上。
4. 检查 `PF_SESSION_TOKEN` 环境变量是否存在
5. 调用 detail 接口获取 `url` 和 `webpUrl`
6. **展示结果**：显示 `url`、`webpUrl`，以及资源管理控制台链接
