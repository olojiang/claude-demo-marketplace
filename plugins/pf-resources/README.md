# PF Resources Skill

可独立复制使用的 Pinefield 资源管理 Skill：上传文件到 CDN 并获取 URL，或列出指定 appId 下的资源列表。

## 功能

- **上传资源**: 将本地文件上传到 Pinefield CDN，返回原始 URL 和 WebP 格式 URL，同时显示资源管理控制台链接
- **列出资源**: 获取指定 appId 下所有已上传的资源列表
- **查询链接**: 查询已有资源的 CDN 链接（含 WebP），无需重新上传

## 独立使用（可复制）

- 直接复制整个 `skills/pf-resources-skill/` 文件夹（内含 `SKILL.md` + `scripts/pf-resources.js`）到目标 skills 目录即可。
- **实现代码以 skill 目录内 `scripts/pf-resources.js` 为准**；复制后仅用 curl 也可工作，用 Node 时在 skill 目录内 `import './scripts/pf-resources.js'` 即可，无需仓库其它路径。
- 插件包中的 `src/pf-resources.js` 仅 re-export skill 内模块，便于本仓库测试与引用，**独立分发 skill 时不必包含** `src/`、`__tests__/`。
- 运行时依赖：
  - `PF_SESSION_TOKEN` 环境变量
  - 可访问 Pinefield 资源 API 的网络环境
  - `curl`（可选 `jq`），或 Node 18+（使用 `pf-resources.js` 时）

## appId 来源

- **默认**：从当前工作目录的 `src/manifest.json` 中读取 `id` 字段作为 appId。
- **若不存在**（无 `src/`、无 `src/manifest.json`、或内容中无有效 `id`），会自动回退为 `pinefield.assets` 并继续执行。
- **显式指定**：调用方可以直接传入想要的 `appId`，不必依赖 manifest。

## 上传目录：subPath（子目录）

对象在 CDN 上的逻辑路径为 `apps/<appId>/` 下的文件；可选 **subPath** 表示再进入一层或多层子目录（相对 `apps/<appId>/`，不要带前导 `/`，不要包含 `..` 或单独的 `.` 段）。

| 场景 | 上传表单 `dir` | detail 查询 `path`（示例文件 `logo.png`） |
| ---- | -------------- | ------------------------------------------ |
| 仅 app 根目录 | `/apps/<appId>` | `apps/<appId>/logo.png` |
| 带子目录 `release/icons` | `/apps/<appId>/release/icons` | `apps/<appId>/release/icons/logo.png` |

**Node**（在 `skills/pf-resources-skill` 目录下，已设置 `PF_SESSION_TOKEN`）：

```bash
node --input-type=module -e "
import { getAppIdFromManifest, uploadResource, getResourceDetail, listResources } from './scripts/pf-resources.js'
const appId = getAppIdFromManifest()

const up = await uploadResource(appId, '/path/to/logo.png', 'release/icons')
console.log('upload:', up.url, up.webpUrl, up.path)

const detail = await getResourceDetail(appId, 'logo.png', 'release/icons')
console.log('detail:', detail.url, detail.webpUrl)

const files = await listResources(appId, 'release/icons')
console.log('list:', files.map((f) => f.path))
"
```

**curl**（上传到子目录 `release/icons`）：

```bash
curl -X POST 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/upload' \
  -H "authorization: Bearer $PF_SESSION_TOKEN" \
  -F "files=@/path/to/logo.png" \
  -F "dir=/apps/pinefield.context-digital-native/release/icons"
```

上传后取 URL 时，`path` 要与实际对象键一致（需对查询参数做 URL 编码）：

```bash
curl 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource/detail?path=apps%2Fpinefield.context-digital-native%2Frelease%2Ficons%2Flogo.png' \
  -H "authorization: Bearer $PF_SESSION_TOKEN"
```

`listResources(appId, subPath)` 只展平该子目录树下的文件；不传第二参数时行为与原先一致（整个 app 下全部文件）。

## 环境变量

使用前必须设置 `PF_SESSION_TOKEN`：

```bash
export PF_SESSION_TOKEN="your-bearer-token"
```

Token 获取方式：登录 [test.sheepwall.com](https://test.sheepwall.com)，从浏览器开发者工具的 Network 面板中复制 `Authorization: Bearer xxx` 中的 token 部分。

## 目录结构说明

独立分发时，skill 目录应包含：

```
skills/
└── pf-resources-skill/
    ├── SKILL.md
    └── scripts/
        └── pf-resources.js
```

当前仓库中的插件开发结构（含测试与入口 re-export）：

```
plugins/pf-resources/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── pf-resources-skill/
│       ├── SKILL.md
│       └── scripts/
│           └── pf-resources.js    # 可移植主实现
├── src/
│   └── pf-resources.js        # re-export skill 内 scripts/pf-resources.js
├── __tests__/
│   └── pf-resources.test.js
├── package.json
└── README.md
```

## 运行测试

仅开发插件源码时需要：

```bash
pnpm install
pnpm test
```

## API 参考

| 接口                        | 方法             | 用途                                                                 |
| --------------------------- | ---------------- | -------------------------------------------------------------------- |
| `/resource/upload`          | POST (multipart) | 上传文件：`files`（文件）、`dir`（目标目录，如 `/apps/<appId>` 或 `/apps/<appId>/<subPath>`） |
| `/resource/detail?path=xxx` | GET              | 获取单个资源详情（含 URL、WebP URL），`path` 为存储对象键如 `apps/.../file.png` |
| `/resource/list`            | GET              | 获取完整资源树；脚本侧可按 `appId` 与可选 `subPath` 筛选展平后的文件列表 |

## JS 导出说明

| 导出                  | 类型     | 说明                                                                 |
| --------------------- | -------- | -------------------------------------------------------------------- |
| `uploadResource`      | async fn | 上传文件，返回 `{ url, webpUrl, name, path }`                       |
| `getResourceDetail`   | async fn | 查询已有资源链接（不上传），返回 `{ url, webpUrl, name, path }`     |
| `listResources`       | async fn | 列出 appId 下的资源文件列表                                         |
| `buildWebpUrl`        | fn       | 将原始 CDN URL 转为 WebP 格式 URL                                   |
| `formatResultOutput`  | fn       | 格式化结果输出（含 WebP 链接和控制台链接）                           |
| `CONSOLE_URL`         | string   | 资源管理控制台链接                                                   |
| `CDN_DOMAIN`          | string   | CDN 域名                                                            |

更完整的流程与参数说明见 `skills/pf-resources-skill/SKILL.md`。
