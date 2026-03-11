# 部分更新实体 (Partial Update Entity)

只会更新参数中的属性，不会更新其他字段，也不会删除其他字段。

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/updateEntity`

## 用户查询示例

**示例 1: 基本更新**

- 用户查询: "更新实体的名称和描述"、"修改实体的某些属性"
- 使用此 API: POST `/api/updateEntity`

**示例 2: 部分字段更新**

- 用户查询: "只更新实体的坐标"、"修改实体的部分字段"
- 使用此 API: POST `/api/updateEntity` (在 data 中只包含要更新的字段)

**示例 3: 常见查询变体**
以下用户查询都使用此 API:

- "更新实体"
- "修改实体属性"
- "部分更新实体"
- "编辑实体"
- "变更实体数据"

**与其他更新 API 的区别**:

- **部分更新 (此 API)**: 只更新提供的字段，其他字段保持不变
- **全量更新** [full-update-entity.md](full-update-entity.md): 用新数据完全替换实体，未提供的字段会被删除
  - 用户查询: "完全替换实体数据"、"用新数据覆盖实体" → 使用全量更新 API

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `uuid`: 必填，实体UUID
  - `data`: 必填，实体数据，字段名不能包含`|`
  - `decorator`: 可选，装饰器信息 详情参见 [Decorator API](decorator.md)

## 参数校验约束

### 必需参数验证

| 参数名        | 类型   | 验证规则                      | 获取方式                                                                                                                                                                                            | 错误处理                                                                 |
| ------------- | ------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `enclosureId` | string | 非空、非空字符串              | 1. 用户输入（优先）<br>2. **`.claude/env.json` 的 `encId`**（用户未指定时）<br>3. 环境变量 `ENCLOSURE_ID`<br>4. API 查询 `/api/enclosures`<br>5. 映射文件 `docs/mapping/space_enclosure_mapping.md` | 缺失时停止调用，返回错误："enclosureId 参数缺失，请提供空间ID或空间名称" |
| `uuid`        | string | 非空、非空字符串，UUID 格式   | 从用户输入中提取实体 UUID，或通过 `getEntity` 或 `searchEntities` API 获取                                                                                                                          | 缺失时停止调用，返回错误："uuid 参数缺失，请提供实体 UUID"               |
| `data`        | object | 非空对象，字段名不能包含 `\|` | 从用户输入中构建要更新的实体数据对象（只包含需要更新的字段）                                                                                                                                        | 缺失时停止调用，返回错误："data 参数缺失，请提供要更新的实体数据"        |

### 可选参数验证

| 参数名      | 类型  | 验证规则       | 使用条件             | 错误处理             |
| ----------- | ----- | -------------- | -------------------- | -------------------- |
| `decorator` | array | 装饰器对象数组 | 需要装饰器信息时使用 | 格式错误时忽略该参数 |

### 参数格式要求

- **enclosureId**:
  - 格式：非空字符串，通常为 UUID 格式
  - 示例：`30latS7FRxjUjk9FgbMwhZ`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`30latS7FRxjUjk9FgbMwhZ`

- **uuid**:
  - 格式：非空字符串，UUID 格式
  - 示例：`14973e682c344a9d8eb9e6c3c414fec4`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`14973e682c344a9d8eb9e6c3c414fec4`

- **data**:
  - 格式：对象，包含要更新的字段，字段名不能包含 `|`
  - 示例：`{"name": "新名称", "description": "新描述", "x": 0, "y": 0}`
  - ❌ 错误示例：空对象、字段名包含 `|`、null
  - ✅ 正确示例：`{"name": "新名称", "description": "新描述"}`

### 参数获取流程

1. **enclosureId 获取**：
   - 优先级1：从用户输入中提取空间名称或 enclosureId
     - 如果用户提到空间名称，使用 READ 工具读取 `docs/mapping/space_enclosure_mapping.md` 查找映射
   - 优先级2：用户未指定时，使用 READ 工具读取 `.claude/env.json` 中的 `encId` 字段
   - 优先级3：从环境变量 `ENCLOSURE_ID` 获取
   - 优先级4：通过 API `/api/enclosures` 查询空间列表
   - **验证**：必须验证 `enclosureId` 不为空，缺失时停止调用并返回明确错误

2. **uuid 获取**：
   - 从用户输入中提取实体 UUID
   - 如果用户提到实体名称，可能需要先通过 `searchEntities` API 查询获取 UUID
   - **验证**：必须验证 `uuid` 不为空，缺失时停止调用并返回明确错误

3. **data 获取**：
   - 从用户输入中提取要更新的字段和值
   - 构建实体数据对象（只包含需要更新的字段）
   - **验证**：必须验证 `data` 不为空，字段名不包含 `|`

### 调用前检查清单

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已获取并验证 `uuid` 参数（必填）
- [ ] 已构建并验证 `data` 参数（必填）
- [ ] 已确认 `data` 中字段名不包含 `|`
- [ ] 已确认 `enclosureId`、`uuid` 和 `data` 都不为空
- [ ] 已确认 `data` 只包含需要更新的字段（部分更新）
- [ ] 如需要，已规划对返回结果进行处理

### 常见错误示例

#### 错误 1：缺少必需参数

```bash
# ❌ 错误：缺少 enclosureId
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"uuid": "xxx", "data": {"name": "test"}}'

# ❌ 错误：缺少 uuid
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "data": {"name": "test"}}'

# ❌ 错误：缺少 data
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "uuid": "xxx"}'

# ✅ 正确：包含所有必需参数
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "uuid": "xxx", "data": {"name": "test"}}'
```

#### 错误 2：字段名包含非法字符

```bash
# ❌ 错误：字段名包含 |
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "uuid": "xxx", "data": {"name|test": "value"}}'

# ✅ 正确：字段名不包含 |
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "uuid": "xxx", "data": {"name": "test"}}'
```

#### 错误 3：data 为空对象

```bash
# ❌ 错误：data 为空对象
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "uuid": "xxx", "data": {}}'

# ✅ 正确：data 包含要更新的字段
curl -X POST "https://test.sheepwall.com/som/api/updateEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "uuid": "xxx", "data": {"name": "新名称"}}'
```

### curl示例

```curl
  curl -X POST \
    "https://test.sheepwall.com/som/api/updateEntity" \
    -H "Authorization: Bearer $PF_SESSION_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "enclosureId": "spacesmart-som-test",
      "uuid": "14973e682c344a9d8eb9e6c3c414fec4",
      "data": {
        "name": "新名称",
        "description": "新描述",
        "classes": ["分类1", "分类2"],
        "x": 0,
        "y": 0,
        "分类1.attribute1": "新属性1值"
        "ttl": 60 // 过期时间，单位秒，不填时，默认为永久有效
      }
    }'
```

### 示例

```http
POST /api/updateEntity

{
  "enclosureId": "enclosure1",
  "uuid": "要更新的实体UUID",
  "data": {
    "name": "新名称",
    "description": "新描述",
    "classes": ["分类1", "分类2"],
    "x": 0,
    "y": 0,
    "分类1.attribute1": "新属性1值"
    "ttl": 60 // 过期时间，单位秒，不填时，默认为永久有效
  },
  "decorator": [
    {
      // 装饰器信息
    }
  ]
}
```

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "Entity updated"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
