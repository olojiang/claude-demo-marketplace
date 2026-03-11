---
name: som-skill
description: Spatial Object Model (SOM) skill for spatial intelligence applications, including Person Detector and OpenAPI skills.
---

# 空间智能应用项目 (SOM Skill)

此技能包含**空间智能应用模板**的核心能力，专注于空间内人员检测和空间实体管理，基于 **SOM (Spatial Object Model)** 架构。

空间场地的其他表达：办公室、会议室、空间、区域、办公区等等，表示某一个空间场地的都是可以归类到这里的。

## 🚀 快速导航

### 查找 API 文档

#### OpenAPI 接口文档

- **所有 API 文档**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/`
- **API 总览**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/SKILL.md` ⭐
- **快速查找表**: 见下方"API 快速查找指南"部分

#### 空间内人员检测 API

- **API 参考文档**: `${CLAUDE_PLUGIN_ROOT}/docs/openapi/person-detector.md`

### 常用操作

#### OpenAPI 操作

- **查询实体**: `openapi-skills/entity/search-entities.md` 或 `openapi-skills/entity/get-entity.md`
- **创建实体**: `openapi-skills/entity/create-entity.md`
- **更新实体**: `openapi-skills/entity/update-entity.md`
- **查询空间**: `openapi-skills/enclosure/get-enclosures.md`
- **查询分类**: `openapi-skills/classes/get-classes.md`

### 重要配置

- **Base URL**: `https://test.sheepwall.com/som` (必须包含 `/som`)
- **Authorization**: `Authorization: Bearer $PF_SESSION_TOKEN` (必须包含，从环境变量读取)
- **Token 环境变量**: `PF_SESSION_TOKEN`
- **encId / enclosureId 默认值**: 当用户未直接指定空间 ID 时，从项目根目录 `.claude/env.json` 的 `encId` 字段读取
- **映射关系**: `${CLAUDE_PLUGIN_ROOT}/docs/mapping/` 目录

## API 快速查找指南

### 📍 API 文档位置

**OpenAPI 接口文档**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/`  
**空间内人员检测 API**: `${CLAUDE_PLUGIN_ROOT}/docs/openapi/person-detector.md`

### 🔍 按功能分类查找

#### 1. 实体管理 (Entity) - 23个接口

**目录**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/entity/`

| 功能           | API 路径                               | 文档文件                      | 使用场景                             |
| -------------- | -------------------------------------- | ----------------------------- | ------------------------------------ |
| **基础 CRUD**  |
| 创建实体       | `POST /api/createEntity`               | `create-entity.md`            | 创建新实体                           |
| 创建或更新     | `POST /api/upsertEntity`               | `upsert-entity.md`            | 存在则更新，不存在则创建             |
| 查询实体       | `GET /api/getEntity/{uuid}`            | `get-entity.md`               | 获取实体、查询实体详情、读取实体数据 |
| 部分更新       | `POST /api/updateEntity`               | `update-entity.md`            | 更新实体、修改实体属性               |
| 全量更新       | `POST /api/fullUpdateEntity`           | `full-update-entity.md`       | 全量覆盖实体数据                     |
| 删除实体       | `POST /api/deleteOneEntity`            | `delete-one-entity.md`        | 删除单个实体                         |
| 批量删除       | `POST /api/deleteEntities`             | `delete-entities.md`          | 批量删除多个实体                     |
| **查询和搜索** |
| 按分类查询     | `GET /api/entitiesByClass`             | `entities-by-class.md`        | 获取所有某分类的实体、按分类查询     |
| 按父节点查询   | `GET /api/entitiesByParent`            | `entities-by-parent.md`       | 查询子实体                           |
| 搜索实体       | `GET /api/searchEntities`              | `search-entities.md`          | 搜索实体、查找实体、获取空间所有实体 |
| 批量获取       | `POST /api/v1/entity/getByIdList`      | `get-by-id-list.md`           | 根据 ID 列表批量获取                 |
| 获取结构树     | `POST /api/v1/entity/getStructureTree` | `get-structure-tree.md`       | 获取空间结构树                       |
| **实时监听**   |
| 监听实体       | `GET /api/listenEntities`              | `listen-entities.md`          | 实时监听实体变化（SSE）              |
| 监听栅格       | `GET /api/raster/listen`               | `listen-raster.md`            | 实时监听栅格数据（SSE）              |
| **空间计算**   |
| 实体距离       | `POST /api/getEntityDistance`          | `get-entity-distance.md`      | 计算实体间距离                       |
| 实体面积       | `POST /api/getEntityArea`              | `get-entity-area.md`          | 计算实体面积                         |
| 实体体积       | `POST /api/getEntityVolume`            | `get-entity-volume.md`        | 计算实体体积                         |
| 实体夹角       | `POST /api/getEntityAngle`             | `get-entity-angle.md`         | 计算实体间夹角                       |
| 实体朝向       | `POST /api/getEntityOrientation`       | `get-entity-orientation.md`   | 获取实体朝向向量                     |
| 方向范围查询   | `POST /api/findEntitiesInCone`         | `find-entities-in-cone.md`    | 按方向和角度范围查询                 |
| 多边形范围查询 | `GET /api/findEntitiesInPolygon`       | `find-entities-in-polygon.md` | 按多边形范围查询                     |
| 坐标转换       | `POST /api/convertEntityPoint`         | `convert-entity-point.md`     | 转换实体坐标系统                     |
| **其他功能**   |
| 回滚实体       | `POST /api/rollbackEntity`             | `rollback-entity.md`          | 回滚实体到历史快照                   |

#### 2. 空间管理 (Enclosure) - 5个接口

**目录**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/enclosure/`

| 功能     | API 路径                      | 文档文件              | 使用场景                             |
| -------- | ----------------------------- | --------------------- | ------------------------------------ |
| 获取列表 | `GET /api/enclosures`         | `get-enclosures.md`   | 获取所有空间、列出空间、查询空间列表 |
| 创建空间 | `POST /api/enclosures/create` | `create-enclosure.md` | 创建新空间                           |
| 更新空间 | `POST /api/enclosures/update` | `update-enclosure.md` | 更新空间信息                         |
| 删除空间 | `POST /api/enclosures/delete` | `delete-enclosure.md` | 删除空间                             |
| 复制空间 | `POST /api/enclosures/fork`   | `fork-enclosure.md`   | 复制空间及其数据                     |

#### 3. 分类管理 (Class) - 3个接口

**目录**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/classes/`

| 功能     | API 路径                   | 文档文件          | 使用场景                             |
| -------- | -------------------------- | ----------------- | ------------------------------------ |
| 获取列表 | `GET /api/classes`         | `get-classes.md`  | 获取所有分类、列出分类、查询分类列表 |
| 更新分类 | `POST /api/classes/update` | `update-class.md` | 更新分类信息                         |
| 删除分类 | `POST /api/classes/delete` | `delete-class.md` | 删除分类                             |

#### 4. 键值存储 (KV) - 3个接口

**目录**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/kv/`

| 功能       | API 路径           | 文档文件        | 使用场景               |
| ---------- | ------------------ | --------------- | ---------------------- |
| 保存 KV    | `POST /api/kv/set` | `set-kv.md`     | 设置键值对（支持 TTL） |
| 获取 Value | `GET /api/kv/get`  | `get-value.md`  | 获取键对应的值         |
| 删除 Key   | `POST /api/kv/del` | `delete-key.md` | 删除键值对             |

### 🎯 按使用场景查找

**查询相关**:

- 获取所有实体 → `search-entities.md`
- 按分类查询 → `entities-by-class.md`
- 按父节点查询 → `entities-by-parent.md`
- 根据 UUID 查询 → `get-entity.md`

**创建/更新相关**:

- 创建实体 → `create-entity.md`
- 创建或更新 → `upsert-entity.md`
- 部分更新 → `update-entity.md`
- 全量更新 → `full-update-entity.md`

**空间计算相关**:

- 距离计算 → `get-entity-distance.md`
- 面积计算 → `get-entity-area.md`
- 体积计算 → `get-entity-volume.md`
- 方向范围查询 → `find-entities-in-cone.md`
- 多边形范围查询 → `find-entities-in-polygon.md`

### 📚 核心文档

#### OpenAPI 文档

- **API 总览**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/SKILL.md` ⭐
- **数据模型说明**: `${CLAUDE_PLUGIN_ROOT}/openapi-skills/SKILL.md` (数据模型与关系部分)

#### 人员检测文档

- **API 参考**: `${CLAUDE_PLUGIN_ROOT}/docs/openapi/person-detector.md`

#### 通用配置

- **Base URL 配置**: 见下方"Base URL 使用规范"部分

## 插件结构

```
plugins/som-skill/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── som-skill/
│       └── SKILL.md         # 本文件
├── openapi-skills/          # OpenAPI 接口文档 ⭐
│   ├── SKILL.md             # API 总览（必读）
│   ├── entity/               # Entity 管理接口（23个）
│   ├── enclosure/            # Enclosure 管理接口（5个）
│   ├── classes/              # Class 管理接口（3个）
│   └── kv/                   # Key-Value 存储接口（3个）
└── docs/
    ├── mapping/              # 映射关系
    │   ├── space_enclosure_mapping.md
    │   └── name_class_mapping.md
    ├── openapi/
    │   ├── person-detector.md
    │   └── README.md
    └── third-party/
```

### API 调用响应协议

执行 API 调用后，**必须**在回复中显式展示以下内容（不得省略）：

1. **📋 请求详情**: 完整的 cURL 命令字符串（URL 编码格式），便于直接复制使用
   - **必须包含**: `Authorization: Bearer $PF_SESSION_TOKEN` header
   - **必须使用**: 环境变量 `$PF_SESSION_TOKEN`，不能硬编码 token
2. **📊 响应结果**: 格式化后的 JSON 响应数据
3. **💻 代码示例**: 对应的 JavaScript/Axios 调用代码
   - **必须包含**: Authorization header，从环境变量读取 token

### ⚠️ Base URL 使用规范（重要）

**所有 API 调用必须使用正确的 Base URL**：

**Base URL 配置**：

- **标准 Base URL**: `https://test.sheepwall.com/som`
- **环境变量**: `API_BASE_URL` 或 `VITE_API_BASE_URL`
- **注意**: Base URL **必须包含 `/som` 路径**

### ⚠️ Authorization Header 使用规范（重要）

**所有 API 调用必须包含正确的 Authorization Header**：

**Authorization 配置**：

- **环境变量**: `PF_SESSION_TOKEN`（从环境变量读取）
- **Header 格式**: `Authorization: Bearer $PF_SESSION_TOKEN`
- **注意**: 必须使用 `Bearer` 前缀，token 从环境变量读取

### 映射关系查找

> **⚠️ 重要**: 查找映射关系时，**必须且仅使用 READ 工具**（`read_file`）直接读取映射文件。
>
> - ✅ **正确**: 使用 `READ("${CLAUDE_PLUGIN_ROOT}/docs/mapping/space_enclosure_mapping.md")` 或 `READ("${CLAUDE_PLUGIN_ROOT}/docs/mapping/name_class_mapping.md")`
> - ❌ **错误**: 使用 `codebase_search`、`MAX` 等其他工具函数
>
> **原因**: 这些映射文件已优化为紧凑格式，占用最小上下文空间。直接使用 `read_file` 读取即可在返回内容中高效搜索，无需其他工具。

#### 空间映射查找

当用户咨询空间相关问题时，**使用 READ 工具**读取 `${CLAUDE_PLUGIN_ROOT}/docs/mapping/space_enclosure_mapping.md` 查找空间名称与 enclosureId 的映射关系。

#### Class 名称映射查找

当用户咨询 Class 相关问题时，**使用 READ 工具**读取 `${CLAUDE_PLUGIN_ROOT}/docs/mapping/name_class_mapping.md` 查找 Class 中文名与 class.name 的映射关系。
