# 搜索实体 (Search Entities)

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/searchEntities`

## ⚠️ 参数检查清单

调用此 API 前，请确认：

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 如按分类查询，使用 `classes[in]=value` 或 `classes[all]=value`（**不是 `className`**）
- [ ] 如按名称过滤，使用 `name[regex]=value` 方式
- [ ] 参数值格式正确
- [ ] 如需要，已规划对返回结果进行过滤处理

> **参考**：详细参数规范请查看 [参数使用规范](../SKILL.md#参数使用规范)

## 常见错误示例

### ❌ 错误 1：使用 className 参数

```bash
# 错误：使用 className（此 API 不支持此参数）
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=xxx&className=space.structure"
```

### ✅ 正确：使用 classes[in] 参数

```bash
# 正确：使用 classes[in] 进行分类查询
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=xxx&classes[in]=space.structure"
```

### ❌ 错误 2：缺少 enclosureId

```bash
# 错误：缺少必需的 enclosureId 参数
curl "https://test.sheepwall.com/som/api/searchEntities?classes[in]=space.structure"
```

### ✅ 正确：包含 enclosureId

```bash
# 正确：包含必需的 enclosureId 参数
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=xxx&classes[in]=space.structure"
```

## curl示例

```curl
  curl -X GET "https://test.sheepwall.com/som/api/searchEntities?enclosureId=30latS7FRxjUjk9FgbMwhZ&name[regex]=灯" \
    -H "Authorization: Bearer $PF_SESSION_TOKEN" \
    -H "Content-Type: application/json"
```

## 用户查询示例

**示例 1: 基本搜索**

- 用户查询: "搜索所有实体"、"查找实体列表"、"获取实体列表"
- 使用此 API: GET `/api/searchEntities?enclosureId={enclosureId}`

**示例 2: 按名称搜索**

- 用户查询: "查找名称为 'example' 的实体"、"搜索名称包含 'test' 的实体"
- 使用此 API: GET `/api/searchEntities?enclosureId={enclosureId}&name=example`

**示例 2.1: 模糊搜索**

- 用户查询: "查找名称包含 'test' 的实体"、"搜索名称模糊匹配 'example' 的实体"
- 使用此 API: GET `/api/searchEntities?enclosureId={enclosureId}&name[regex]=test`

**示例 3: 按分类搜索**

- 用户查询: "查找所有类型为 class1 的实体"、"搜索属于某个分类的实体"
- 使用此 API: GET `/api/searchEntities?enclosureId={enclosureId}&classes[in]=class1`
- **注意**: 如果只需要按单个分类查询，也可以使用 [entities-by-class.md](entities-by-class.md)（更简单）

**示例 4: 分页查询**

- 用户查询: "获取第一页的实体，每页 10 条"、"分页查询实体"
- 使用此 API: GET `/api/searchEntities?enclosureId={enclosureId}&page=1&limit=10`

**示例 5: 多条件组合搜索**

- 用户查询: "查找名称为 'test' 且类型为 'class1' 的实体"、"搜索满足多个条件的实体"
- 使用此 API: GET `/api/searchEntities?enclosureId={enclosureId}&name=test&classes[in]=class1`

**常见查询变体**:

- "搜索实体"、"查找实体"、"查询实体列表"、"获取实体列表"、"列出实体"、"筛选实体"

**与其他查询 API 的区别**:

- **需要按分类查询且不需要其他过滤条件** → 使用 [entities-by-class.md](entities-by-class.md)（更简单）
- **需要多条件组合搜索** → 使用此 API
- **已知 UUID，只需查询单个实体** → 使用 [get-entity.md](get-entity.md)（更直接）

### 请求参数

- Query参数：
  - `enclosureId`: **必填**，围栏ID（必须从用户输入、环境变量或 API 查询中获取并验证）
  - `classes[in]`: 可选，分类查询（包含任一分类），值为分类名称，多个用逗号分隔
  - `classes[all]`: 可选，分类查询（包含所有分类），值为分类名称，多个用逗号分隔
    - **注意**：使用 `classes[in]` 或 `classes[all]`，**不是 `className`**
  - `page`: 可选，不传或小于1时返回第一页
  - `limit`: 可选，每页数量，不传或小于1时，返回符合条件的所有实体
  - `snapshotAt`: 可选，历史时间点，默认值为当前时间
  - `projection`: 可选，指定要返回的字段，多个字段用逗号分隔
  - 其他查询参数用于过滤实体（name, x, y 等）

## 参数校验约束

### 必需参数验证

| 参数名        | 类型   | 验证规则         | 获取方式                                                                                                                                                                                            | 错误处理                                                                 |
| ------------- | ------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `enclosureId` | string | 非空、非空字符串 | 1. 用户输入（优先）<br>2. **`.claude/env.json` 的 `encId`**（用户未指定时）<br>3. 环境变量 `ENCLOSURE_ID`<br>4. API 查询 `/api/enclosures`<br>5. 映射文件 `docs/mapping/space_enclosure_mapping.md` | 缺失时停止调用，返回错误："enclosureId 参数缺失，请提供空间ID或空间名称" |

### 可选参数验证

| 参数名         | 类型   | 验证规则                       | 使用条件           | 错误处理                                                                          |
| -------------- | ------ | ------------------------------ | ------------------ | --------------------------------------------------------------------------------- |
| `classes[in]`  | string | 非空字符串，多个分类用逗号分隔 | 按分类查询时使用   | 格式错误时停止调用，返回错误："classes[in] 参数格式错误，应为逗号分隔的分类名称"  |
| `classes[all]` | string | 非空字符串，多个分类用逗号分隔 | 按分类查询时使用   | 格式错误时停止调用，返回错误："classes[all] 参数格式错误，应为逗号分隔的分类名称" |
| `name[regex]`  | string | 非空字符串，正则表达式         | 模糊搜索名称时使用 | 格式错误时停止调用，返回错误："name[regex] 参数格式错误"                          |
| `page`         | number | 整数，>= 1                     | 分页查询时使用     | 小于1时自动设置为1                                                                |
| `limit`        | number | 整数，>= 1                     | 限制返回数量时使用 | 小于1时返回所有结果                                                               |

### 参数格式要求

- **enclosureId**:
  - 格式：非空字符串，通常为 UUID 格式
  - 示例：`30latS7FRxjUjk9FgbMwhZ`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`30latS7FRxjUjk9FgbMwhZ`

- **classes[in]**:
  - 格式：分类名称，多个用逗号分隔
  - 示例：`space.structure` 或 `space.structure,space.room`
  - ❌ 错误示例：`className=space.structure`（参数名错误）
  - ✅ 正确示例：`classes[in]=space.structure`

- **classes[all]**:
  - 格式：分类名称，多个用逗号分隔
  - 示例：`space.structure,shape`
  - ❌ 错误示例：`className=space.structure`（参数名错误）
  - ✅ 正确示例：`classes[all]=space.structure,shape`

### 参数获取流程

1. **enclosureId 获取**：
   - 优先级1：从用户输入中提取空间名称或 enclosureId
     - 如果用户提到空间名称，使用 READ 工具读取 `docs/mapping/space_enclosure_mapping.md` 查找映射
   - 优先级2：用户未指定时，使用 READ 工具读取 `.claude/env.json` 中的 `encId` 字段
   - 优先级3：从环境变量 `ENCLOSURE_ID` 获取
   - 优先级4：通过 API `/api/enclosures` 查询空间列表
   - **验证**：必须验证 `enclosureId` 不为空，缺失时停止调用并返回明确错误

2. **classes 参数获取**（如需要）：
   - 从用户输入中提取分类名称
   - 如果用户提到中文分类名，使用 READ 工具读取 `docs/mapping/name_class_mapping.md` 查找映射
   - **验证**：确认使用 `classes[in]` 或 `classes[all]`，不是 `className`

### 调用前检查清单

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已确认参数名正确（使用 `classes[in]` 或 `classes[all]`，不是 `className`）
- [ ] 已确认参数值格式正确
- [ ] 已确认 `enclosureId` 不为空
- [ ] 如使用分类查询，已确认分类参数格式正确
- [ ] 如需要，已规划对返回结果进行过滤处理

### 常见错误示例

#### 错误 1：enclosureId 缺失

```bash
# ❌ 错误：缺少必需的 enclosureId 参数
curl "https://test.sheepwall.com/som/api/searchEntities?classes[in]=space.structure"

# ✅ 正确：包含必需的 enclosureId 参数
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=30latS7FRxjUjk9FgbMwhZ&classes[in]=space.structure"
```

#### 错误 2：使用错误的参数名 className

```bash
# ❌ 错误：使用 className（此 API 不支持此参数）
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=xxx&className=space.structure"

# ✅ 正确：使用 classes[in] 或 classes[all]
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=xxx&classes[in]=space.structure"
```

#### 错误 3：参数格式错误

```bash
# ❌ 错误：使用 classes= 而不是 classes[in]=
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=xxx&classes=space.structure"

# ✅ 正确：使用 classes[in]= 或 classes[all]=
curl "https://test.sheepwall.com/som/api/searchEntities?enclosureId=xxx&classes[in]=space.structure"
```

### ⚠️ 重要限制

**当前 filter 只支持以下字段的过滤：**

- **classes**: 实体类别
- **name**: 实体名称
- **x**: X坐标
- **y**: Y坐标

使用其他字段进行过滤将无法正确筛选结果。

### 过滤条件支持类型

- `field[eq]`: 等于，默认操作符，可直接使用 `filed=value`
- `field[in]`: 包含在列表中，值为逗号分隔的字符串，只能用在值为数组的字段
- `field[all]`: 包含所有值，值为逗号分隔的字符串，只能用在值为数组的字段
- `field[exists]`: 字段是否存在，值为布尔值
- `field[regex]`: 正则表达式匹配，用于模糊查找，值为部分匹配的字符串

### 示例

- `name[eq]=example` 或 `name=example`: 过滤名称等于 "example" 的实体
- `name[regex]=test`: 过滤名称包含 "test" 的实体（模糊匹配）
- `classes[in]=class1,class2`: 过滤类型包含 "class1" 或 "class2" 的实体
- `classes[all]=class1,class2`: 过滤类型包含 "class1" 和 "class2" 的实体
- `x[eq]=100`: 过滤X坐标等于100的实体
- `y[eq]=200`: 过滤Y坐标等于200的实体
- `x[gt]=0&x[lt]=1&y[gt]=0&y[lt]=10`:坐标 "0<x<1, 0<y<10" 的实体

### 示例

```shell
GET /api/searchEntities?enclosureId=enclosure1&page=1&limit=10&snapshotAt=1633024800
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
