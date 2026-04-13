# 创建实体 (Create Entity)

若实体已存在，则会返回错误。

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/createEntity`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `uuid`: 可选，实体UUID，如果不填，则自动生成
  - `data`: 必填，实体数据，字段名不能包含`|`
  - `decorator`: 可选，装饰器信息 ，详情参见 [Decorator API](decorator.md)

## 参数校验约束

### 必需参数验证

| 参数名        | 类型   | 验证规则                      | 获取方式                                                                                                                                                                                            | 错误处理                                                                 |
| ------------- | ------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `enclosureId` | string | 非空、非空字符串              | 1. 用户输入（优先）<br>2. **`.claude/env.json` 的 `encId`**（用户未指定时）<br>3. 环境变量 `ENCLOSURE_ID`<br>4. API 查询 `/api/enclosures`<br>5. 映射文件 `docs/mapping/space_enclosure_mapping.md` | 缺失时停止调用，返回错误："enclosureId 参数缺失，请提供空间ID或空间名称" |
| `data`        | object | 非空对象，字段名不能包含 `\|` | 从用户输入中构建实体数据对象                                                                                                                                                                        | 缺失时停止调用，返回错误："data 参数缺失，请提供实体数据"                |

### 可选参数验证

| 参数名      | 类型   | 验证规则        | 使用条件                 | 错误处理                |
| ----------- | ------ | --------------- | ------------------------ | ----------------------- |
| `uuid`      | string | UUID 格式字符串 | 需要指定实体 UUID 时使用 | 格式错误时自动生成 UUID |
| `decorator` | array  | 装饰器对象数组  | 需要装饰器信息时使用     | 格式错误时忽略该参数    |

### 参数格式要求

- **enclosureId**:
  - 格式：非空字符串，通常为 UUID 格式
  - 示例：`30latS7FRxjUjk9FgbMwhZ`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`30latS7FRxjUjk9FgbMwhZ`

- **data**:
  - 格式：对象，包含实体属性，字段名不能包含 `|`
  - 示例：`{"name": "实体名称", "classes": ["space.room"], "x": 0, "y": 0}`
  - ❌ 错误示例：空对象、字段名包含 `|`、null
  - ✅ 正确示例：`{"name": "实体名称", "classes": ["space.room"]}`

### 参数获取流程

1. **enclosureId 获取**：
   - 优先级1：从用户输入中提取空间名称或 enclosureId
     - 如果用户提到空间名称，使用 READ 工具读取 `docs/mapping/space_enclosure_mapping.md` 查找映射
   - 优先级2：用户未指定时，使用 READ 工具读取 `.claude/env.json` 中的 `encId` 字段
   - 优先级3：从环境变量 `ENCLOSURE_ID` 获取
   - 优先级4：通过 API `/api/enclosures` 查询空间列表
   - **验证**：必须验证 `enclosureId` 不为空，缺失时停止调用并返回明确错误

2. **data 获取**：
   - 从用户输入中提取实体信息（名称、分类、属性等）
   - 构建实体数据对象
   - **验证**：必须验证 `data` 不为空，字段名不包含 `|`

### 调用前检查清单

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已构建并验证 `data` 参数（必填）
- [ ] 已确认 `data` 中字段名不包含 `|`
- [ ] 已确认 `enclosureId` 和 `data` 都不为空
- [ ] 如需要，已规划对返回结果进行处理

### 常见错误示例

#### 错误 1：缺少必需参数

```bash
# ❌ 错误：缺少 enclosureId
curl -X POST "https://test.sheepwall.com/som/api/createEntity" \
  -H "Content-Type: application/json" \
  -d '{"data": {"name": "test"}}'

# ❌ 错误：缺少 data
curl -X POST "https://test.sheepwall.com/som/api/createEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx"}'

# ✅ 正确：包含所有必需参数
curl -X POST "https://test.sheepwall.com/som/api/createEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "data": {"name": "test"}}'
```

#### 错误 2：字段名包含非法字符

```bash
# ❌ 错误：字段名包含 |
curl -X POST "https://test.sheepwall.com/som/api/createEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "data": {"name|test": "value"}}'

# ✅ 正确：字段名不包含 |
curl -X POST "https://test.sheepwall.com/som/api/createEntity" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "data": {"name": "test"}}'
```

### curl 请求示例

```curl
  curl -X POST "https://test.sheepwall.com/som/entity/create" \
    -H "Authorization: Bearer $PF_SESSION_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "enclosureId": "spacesmart-som-test",
      "entity": {
        "name": "楼层四",
        "description": "亲子娱乐区",
        "classes": ["space.floor"],
        "attributes": {
          "分类2.attribute1": "属性1值",
          "x": 0,
          "y": 0
        },
        "ttl": 60
      }
    }'
```

### 示例

```http
POST /api/createEntity

{
  "enclosureId": "enclosure1",
  "data": {
    "name": "实体名称",
    "description": "实体描述",
    "classes": ["分类1", "分类2"],
    "x": 0,
    "y": 0,
    "分类1.attribute1": "属性1值"
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
    "message": "success",
    "data": {
      "uuid": "生成的实体UUID"
    }
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
