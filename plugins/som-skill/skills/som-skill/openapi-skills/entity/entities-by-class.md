# 根据分类搜索实体 (Search Entities by Class)

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/entitiesByClass`

## ⚠️ 参数检查清单

调用此 API 前，请确认：

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已获取 `classes` 参数值（必填）
- [ ] 使用 `classes=value` 参数名（**不是 `className`**）
- [ ] 参数值格式正确
- [ ] 如需要，已规划对返回结果进行过滤处理

> **参考**：详细参数规范请查看 [参数使用规范](../SKILL.md#参数使用规范)

## 常见错误示例

### ❌ 错误 1：使用 className 参数

```bash
# 错误：使用 className（此 API 不支持此参数）
curl "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=xxx&className=space.structure"
```

### ✅ 正确：使用 classes 参数

```bash
# 正确：使用 classes 参数
curl "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=xxx&classes=space.structure"
```

### ❌ 错误 2：缺少 enclosureId

```bash
# 错误：缺少必需的 enclosureId 参数
curl "https://test.sheepwall.com/som/api/entitiesByClass?classes=space.structure"
```

### ✅ 正确：包含 enclosureId

```bash
# 正确：包含必需的 enclosureId 参数
curl "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=xxx&classes=space.structure"
```

## 用户查询示例

**示例 1: 基本分类查询**

- 用户查询: "获取某空间中所有楼层实体"、"查询某空间中类型为 space.floor 的所有实体"
- 使用此 API: GET `/api/entitiesByClass?enclosureId={enclosureId}&classes=space.floor`

**示例 2: 常见查询变体**
以下用户查询都使用此 API:

- "获取某空间中所有某分类的实体"
- "在某空间中按分类查询实体"
- "列出某空间中某类型的实体"
- "查询某个空间中属于某个分类的实体"
- "获取某空间中分类为 xxx 的所有实体"
- "获取某个空间下某个类型实体的数量"

**与其他查询 API 的区别**:

- **只需要按分类查询** → 使用此 API（更简单、更直接）
- **需要按分类 + 其他条件（如名称、坐标）查询** → 使用 [search-entities.md](search-entities.md)
- **已知 UUID，只需查询单个实体** → 使用 [get-entity.md](get-entity.md)

### 请求参数

- Query参数：
  - `enclosureId`: **必填**，围栏ID（必须从用户输入、环境变量或 API 查询中获取并验证）
  - `classes`: **必填**，分类名称（**注意**：参数名是 `classes`，**不是 `className`**）
  - `page`: 可选，不传为1，小于1时为1
  - `limit`: 可选，每页数量，不传或小于1时，返回符合条件的所有实体
  - `snapshotAt`: 可选，历史时间点，默认值为当前时间
  - `projection`: 可选，指定要返回的字段，多个字段用逗号分隔

## 参数校验约束

### 必需参数验证

| 参数名        | 类型   | 验证规则             | 获取方式                                                                                                                                    | 错误处理                                                                 |
| ------------- | ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `enclosureId` | string | 非空、非空字符串     | 1. 用户输入（优先）<br>2. 环境变量 `ENCLOSURE_ID`<br>3. API 查询 `/api/enclosures`<br>4. 映射文件 `docs/mapping/space_enclosure_mapping.md` | 缺失时停止调用，返回错误："enclosureId 参数缺失，请提供空间ID或空间名称" |
| `classes`     | string | 非空字符串，分类名称 | 1. 用户输入中提取分类名称<br>2. 映射文件 `docs/mapping/name_class_mapping.md`                                                               | 缺失时停止调用，返回错误："classes 参数缺失，请提供分类名称"             |

### 可选参数验证

| 参数名       | 类型          | 验证规则           | 使用条件           | 错误处理               |
| ------------ | ------------- | ------------------ | ------------------ | ---------------------- |
| `page`       | number        | 整数，>= 1         | 分页查询时使用     | 小于1时自动设置为1     |
| `limit`      | number        | 整数，>= 1         | 限制返回数量时使用 | 小于1时返回所有结果    |
| `snapshotAt` | number/string | 时间戳或时间字符串 | 查询历史快照时使用 | 格式错误时使用当前时间 |
| `projection` | string        | 逗号分隔的字段名   | 指定返回字段时使用 | 格式错误时忽略该参数   |

### 参数格式要求

- **enclosureId**:
  - 格式：非空字符串，通常为 UUID 格式
  - 示例：`30latS7FRxjUjk9FgbMwhZ`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`30latS7FRxjUjk9FgbMwhZ`

- **classes**:
  - 格式：分类名称字符串（不是 `className`）
  - 示例：`space.structure`、`space.room`、`thing.device.camera`
  - ❌ 错误示例：`className=space.structure`（参数名错误）
  - ✅ 正确示例：`classes=space.structure`

### 参数获取流程

1. **enclosureId 获取**：
   - 优先级1：从用户输入中提取空间名称或 enclosureId
     - 如果用户提到空间名称，使用 READ 工具读取 `docs/mapping/space_enclosure_mapping.md` 查找映射
   - 优先级2：从环境变量 `ENCLOSURE_ID` 获取
   - 优先级3：通过 API `/api/enclosures` 查询空间列表
   - **验证**：必须验证 `enclosureId` 不为空，缺失时停止调用并返回明确错误

2. **classes 参数获取**：
   - 从用户输入中提取分类名称
   - 如果用户提到中文分类名，使用 READ 工具读取 `docs/mapping/name_class_mapping.md` 查找映射
   - **验证**：确认使用 `classes` 参数名，不是 `className`，值不为空

### 调用前检查清单

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已获取并验证 `classes` 参数（必填）
- [ ] 已确认参数名正确（使用 `classes`，不是 `className`）
- [ ] 已确认参数值格式正确
- [ ] 已确认 `enclosureId` 和 `classes` 都不为空
- [ ] 如需要，已规划对返回结果进行过滤处理

### 常见错误示例

#### 错误 1：使用错误的参数名 className

```bash
# ❌ 错误：使用 className（此 API 不支持此参数）
curl "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=xxx&className=space.structure"

# ✅ 正确：使用 classes 参数
curl "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=xxx&classes=space.structure"
```

#### 错误 2：缺少必需参数

```bash
# ❌ 错误：缺少 enclosureId
curl "https://test.sheepwall.com/som/api/entitiesByClass?classes=space.structure"

# ❌ 错误：缺少 classes
curl "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=xxx"

# ✅ 正确：包含所有必需参数
curl "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=xxx&classes=space.structure"
```

### curl示例

```
  curl -X GET "https://test.sheepwall.com/som/api/entitiesByClass?enclosureId=30latS7FRxjUjk9FgbMwhZ&classes=space.floor" \
    -H "Authorization: Bearer $PF_SESSION_TOKEN" \
    -H "Content-Type: application/json"
```

### 示例

```shell
GET /api/entitiesByClass?enclosureId=enclosure1&classes=class1&page=1&limit=10&snapshotAt=1633024800
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    total: 1, //   总数 int类型
    page: 1, //    当前页码 int类型
    limit: 100, // 每页数量 int类型
    data: [
      {
        uuid: '实体UUID',
        createdAt: '创建时间',
        // 其他字段
      },
      // 更多实体
    ],
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
