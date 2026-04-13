---
name: openapi-skills
description: 提供空间智能上下文服务的 API 文档，包括实体管理、空间管理、分类管理和键值存储。在调用 API、生成 API 客户端代码或进行空间数据操作时使用。
---

# OpenAPI 接口文档

空间智能上下文服务的 API 文档集合。每个 API 接口都有独立的文档文件，便于查找和参考。

> **目录结构**: 完整 API 列表与数据模型见本 SKILL 下文；主技能说明请参考 `som-skill` 的主 SKILL 文档。

## 数据模型与关系

### 核心概念

**Enclosure (空间)**：最顶层的容器，代表一个完整的空间（如建筑物、园区等）。每个空间有唯一的 `uuid`，空间本身也是一个实体。

**Entity (实体)**：空间内的具体对象，可以是房间、设备、人员轨迹等。每个实体：

- 有唯一的 `uuid`
- 属于某个空间（通过 `enclosureId` 字段）
- 可以有多个分类（通过 `classes` 数组）
- 包含各种属性（基础属性、分类相关属性、自定义属性）

**Class (分类)**：定义实体的类型和可用的属性。一个实体可以有多个分类，分类通过 `classes` 数组定义。

**Attribute (属性)**：实体的数据字段，包括：

- **基础属性**：`name`, `description`, `x`, `y`, `z`, `uuid`, `createdAt`, `updatedAt`, `enclosureId`
- **分类相关属性**：格式为 `分类名.属性名`，如 `space.structure.parent`、`shape.height`、`traj.enterZone`
- **自定义属性**：可以是任意键值对

### 关系结构

```
Enclosure (空间)
  ├── uuid: "30latS7FRxjUjk9FgbMwhZ"
  ├── classes: ["enclosure", "space.structure", ...]
  └── Entity[] (实体列表)
      ├── Entity 1
      │   ├── uuid: "实体UUID"
      │   ├── enclosureId: "30latS7FRxjUjk9FgbMwhZ"
      │   ├── classes: ["space.structure", "space.room", "shape"]
      │   ├── 基础属性: name, description, x, y, z, ...
      │   ├── space.structure.parent: "父节点UUID"  (分类相关属性)
      │   ├── shape.height: 3.0  (分类相关属性)
      │   └── 自定义属性: key: value
      └── Entity 2
          └── ...
```

### 实体示例

```json
{
  "uuid": "aee1cff8-1653-4f41-b7ab-45415aa6c894",
  "enclosureId": "30latS7FRxjUjk9FgbMwhZ",
  "name": "xxx测试",
  "description": "xxx测试, 由扫描建模自动生成",
  "classes": ["space.room", "shape", "space.structure"],
  "x": 0,
  "y": 0,
  "z": 0,
  "space.structure.parent": "30latS7FRxjUjk9FgbMwhZ",
  "shape.height": 3,
  "tag": ["zone"],
  "createdAt": "2025-04-25T19:05:12.098+08:00",
  "updatedAt": "2025-11-18T16:07:35.476+08:00"
}
```

### 关键关系说明

1. **空间层级关系**：
   - 通过 `space.structure.parent` 属性建立父子关系
   - 根节点的 `space.structure.parent` 为空字符串或空间自身的 uuid
   - 子节点的 `space.structure.parent` 指向父节点的 uuid

2. **分类与属性**：
   - 分类定义了实体可以有哪些属性
   - 属性命名规则：`分类名.属性名`，如 `space.structure.parent`、`shape.height`
   - 一个实体可以有多个分类，因此可以有多个分类相关的属性

3. **常见分类示例**：
   - `space.structure`：空间结构（房间、区域等）
   - `space.room`：房间
   - `shape`：形状相关（有 height、polygon 等属性）
   - `traj`：轨迹（人员移动轨迹）
   - `floor.device`：楼层设备
   - `thing.device.iotProfile`：IoT 设备

4. **查询关系**：
   - 通过 `enclosureId` 查询空间内的所有实体
   - 通过 `classes` 查询特定分类的实体
   - 通过 `name` 正则方式过滤实体
   - 通过 `space.structure.parent` 查询子实体
   - 通过属性名（如 `shape.height`）进行筛选

## API 分类

**实体管理 (Entity Management)**: 创建、读取、更新、删除和查询空间实体。详见 [entity/](entity/) 目录。

**空间管理 (Enclosure Operations)**: 管理空间（创建、更新、删除、复制）。详见 [enclosure/](enclosure/) 目录。

**分类管理 (Class Management)**: 管理实体分类（获取、更新、删除）。详见 [classes/](classes/) 目录。

**键值存储 (Key-Value Storage)**: 存储和检索键值对，支持 TTL。详见 [kv/](kv/) 目录。

## 基础 URL

所有 API 请求需要拼接基础地址（API_BASE_URL）：

- **所有接口**: `https://test.sheepwall.com/som`
- **环境变量**: `API_BASE_URL` 或 `VITE_API_BASE_URL`

## 完整 API 列表

### 实体管理接口 (Entity APIs) - 23个接口

#### 基础 CRUD 操作

- [创建实体](entity/create-entity.md) - 创建新实体
- [创建或更新实体](entity/upsert-entity.md) - 创建或更新实体（存在则更新）
- [读取/查询实体](entity/get-entity.md) - 根据 UUID 查询实体
  - _使用场景_: "获取实体"、"查询实体详情"、"读取实体数据"、"查看实体"、"查询某空间实体"、"获取实体信息"
- [部分更新实体](entity/update-entity.md) - 部分更新实体字段
  - _使用场景_: "更新实体"、"修改实体属性"、"部分更新实体"
- [全量更新实体](entity/full-update-entity.md) - 全量覆盖实体数据
- [删除实体](entity/delete-one-entity.md) - 删除单个实体
- [批量删除实体](entity/delete-entities.md) - 批量删除多个实体

#### 查询和搜索

- [根据分类/类型搜索实体](entity/entities-by-class.md) - 按分类查询实体列表
  - _使用场景_: "获取所有某分类的实体"、"按分类查询实体"、"列出某类型的实体"
- [根据空间结构父节点查询](entity/entities-by-parent.md) - 按父节点查询子实体
- [搜索实体/获取所有实体](entity/search-entities.md) - 多条件搜索实体
  - _使用场景_: "搜索实体"、"查找实体"、"多条件查询实体"、"筛选实体"、"获取空间所有实体"
- [根据 ID 列表获取实体](entity/get-by-id-list.md) - 批量获取实体
- [根据筛选条件获取树状结构数据](entity/get-structure-tree.md) - 获取空间结构树

#### 实时监听

- [监听实体](entity/listen-entities.md) - 实时监听实体变化（SSE）
- [监听栅格数据](entity/listen-raster.md) - 实时监听栅格数据变化（SSE）

#### 空间计算

- [获取实体之间的距离](entity/get-entity-distance.md) - 计算实体间距离（支持多种模式）
- [获取实体的面积](entity/get-entity-area.md) - 计算实体面积
- [获取实体的体积](entity/get-entity-volume.md) - 计算实体体积
- [获取实体之间的夹角](entity/get-entity-angle.md) - 计算实体间夹角
- [获取实体的朝向](entity/get-entity-orientation.md) - 获取实体朝向向量
- [查询实体方向范围内的所有实体](entity/find-entities-in-cone.md) - 按方向和角度范围查询
- [搜索 polygon 范围内的实体](entity/find-entities-in-polygon.md) - 按多边形范围查询
- [实体坐标转换](entity/convert-entity-point.md) - 转换实体坐标系统

#### 其他功能

- [回滚实体到历史快照](entity/rollback-entity.md) - 回滚实体到指定时间点

### 空间管理接口 (Enclosure APIs) - 5个接口

- [获取 Enclosure 列表](enclosure/get-enclosures.md) - 获取所有空间列表
  - _使用场景_: "获取所有空间"、"列出空间"、"查询空间列表"
- [创建 Enclosure](enclosure/create-enclosure.md) - 创建新空间
- [更新 Enclosure](enclosure/update-enclosure.md) - 更新空间信息
- [删除 Enclosure](enclosure/delete-enclosure.md) - 删除空间
- [创建 Enclosure 副本](enclosure/fork-enclosure.md) - 复制空间及其数据

### 分类管理接口 (Class APIs) - 3个接口

- [获取 Class 列表](classes/get-classes.md) - 获取空间内的所有分类
  - _使用场景_: "获取所有分类"、"列出分类"、"查询分类列表"
- [更新 Class](classes/update-class.md) - 更新分类信息
- [删除 Class](classes/delete-class.md) - 删除分类

### 键值存储接口 (KV APIs) - 3个接口

- [保存 KV](kv/set-kv.md) - 设置键值对（支持 TTL）
- [获取 Value](kv/get-value.md) - 获取键对应的值
- [删除 Key](kv/delete-key.md) - 删除键值对

## 通用模式

### 请求格式

- **GET 请求**: 使用查询参数（Query Parameters）
- **POST 请求**: 使用 JSON 请求体，大多数接口需要 `enclosureId` 参数

### 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 属性命名规范

- **基础属性**：直接使用属性名，如 `name`, `x`, `y`, `z`
- **分类相关属性**：使用 `分类名.属性名` 格式，如 `space.structure.parent`, `shape.height`
- **字段名限制**：字段名不能包含 `|` 字符
