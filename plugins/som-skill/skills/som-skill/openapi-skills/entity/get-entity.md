# 读取/查询实体 (Read Entity)

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/getEntity/{uuid}`

## 用户查询示例

**示例 1: 基本查询**

- 用户查询: "获取 UUID 为 7gIdGVCNtw2A8vHqgAMJqf 的实体信息"
- 使用此 API: GET `/api/getEntity/7gIdGVCNtw2A8vHqgAMJqf?enclosureId={enclosureId}`

**示例 2: 查询历史快照**

- 用户查询: "查看实体在某个时间点的状态"、"获取实体的历史快照"
- 使用此 API: GET `/api/getEntity/{uuid}?enclosureId={enclosureId}&snapshotAt={timestamp}`

**示例 3: 常见查询变体**
以下用户查询都使用此 API:

- "读取实体数据"
- "查询实体详情"
- "获取实体信息"
- "查看实体"
- "根据 UUID 获取实体"

**参数：**

- `uuid` (路径参数): 实体的唯一标识符。
- `enclosureId` (查询参数): 实体所属的空间围栏ID。
- `snapshotAt` (查询参数): 查询实体的时间戳。
- `decorator` (查询参数, 可选): 装饰器信息，可以多次传递，格式为 JSON 字符串。

## 参数校验约束

### 必需参数验证

| 参数名        | 类型   | 验证规则                    | 获取方式                                                                                                                                                                                            | 错误处理                                                                 |
| ------------- | ------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `uuid`        | string | 非空、非空字符串，UUID 格式 | 从用户输入中提取实体 UUID                                                                                                                                                                           | 缺失时停止调用，返回错误："uuid 参数缺失，请提供实体 UUID"               |
| `enclosureId` | string | 非空、非空字符串            | 1. 用户输入（优先）<br>2. **`.claude/env.json` 的 `encId`**（用户未指定时）<br>3. 环境变量 `ENCLOSURE_ID`<br>4. API 查询 `/api/enclosures`<br>5. 映射文件 `docs/mapping/space_enclosure_mapping.md` | 缺失时停止调用，返回错误："enclosureId 参数缺失，请提供空间ID或空间名称" |

### 可选参数验证

| 参数名       | 类型          | 验证规则           | 使用条件             | 错误处理               |
| ------------ | ------------- | ------------------ | -------------------- | ---------------------- |
| `snapshotAt` | number/string | 时间戳或时间字符串 | 查询历史快照时使用   | 格式错误时使用当前时间 |
| `decorator`  | string        | JSON 字符串格式    | 需要装饰器信息时使用 | 格式错误时忽略该参数   |

### 参数格式要求

- **uuid**:
  - 格式：非空字符串，UUID 格式
  - 示例：`7gIdGVCNtw2A8vHqgAMJqf`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`7gIdGVCNtw2A8vHqgAMJqf`

- **enclosureId**:
  - 格式：非空字符串，通常为 UUID 格式
  - 示例：`30latS7FRxjUjk9FgbMwhZ`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`30latS7FRxjUjk9FgbMwhZ`

### 参数获取流程

1. **uuid 获取**：
   - 从用户输入中提取实体 UUID
   - 如果用户提到实体名称，可能需要先通过 `searchEntities` API 查询获取 UUID
   - **验证**：必须验证 `uuid` 不为空，缺失时停止调用并返回明确错误

2. **enclosureId 获取**：
   - 优先级1：从用户输入中提取空间名称或 enclosureId
     - 如果用户提到空间名称，使用 READ 工具读取 `docs/mapping/space_enclosure_mapping.md` 查找映射
   - 优先级2：用户未指定时，使用 READ 工具读取 `.claude/env.json` 中的 `encId` 字段
   - 优先级3：从环境变量 `ENCLOSURE_ID` 获取
   - 优先级4：通过 API `/api/enclosures` 查询空间列表
   - **验证**：必须验证 `enclosureId` 不为空，缺失时停止调用并返回明确错误

### 调用前检查清单

- [ ] 已获取并验证 `uuid` 参数（必填）
- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已确认参数值格式正确
- [ ] 已确认 `uuid` 和 `enclosureId` 都不为空
- [ ] 如需要，已规划对返回结果进行处理

### 常见错误示例

#### 错误 1：缺少必需参数

```bash
# ❌ 错误：缺少 enclosureId
curl "https://test.sheepwall.com/som/api/getEntity/7gIdGVCNtw2A8vHqgAMJqf"

# ❌ 错误：缺少 uuid（路径参数）
curl "https://test.sheepwall.com/som/api/getEntity?enclosureId=xxx"

# ✅ 正确：包含所有必需参数
curl "https://test.sheepwall.com/som/api/getEntity/7gIdGVCNtw2A8vHqgAMJqf?enclosureId=30latS7FRxjUjk9FgbMwhZ"
```

#### 错误 2：参数值格式错误

```bash
# ❌ 错误：uuid 为空
curl "https://test.sheepwall.com/som/api/getEntity/?enclosureId=xxx"

# ✅ 正确：uuid 格式正确
curl "https://test.sheepwall.com/som/api/getEntity/7gIdGVCNtw2A8vHqgAMJqf?enclosureId=30latS7FRxjUjk9FgbMwhZ"
```

### curl示例

```curl
  curl -X GET "https://test.sheepwall.com/som/api/getEntity/7gIdGVCNtw2A8vHqgAMJqf?enclosureId=30latS7FRxjUjk9FgbMwhZ" \
    -H "Authorization: Bearer $PF_SESSION_TOKEN" \
    -H "Content-Type: application/json"
```

### 示例

```shell
GET /api/getEntity/uuid123?enclosureId=enclosure1&snapshotAt=1633024800&decorator={"Key":"xxx.streamAttrKey","DecType":"stream","Method":"range","Args":["1734066046","1734067046"]}
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: {
      uuid: '实体UUID',
      createdAt: '创建时间',
      // 其他字段
    },
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
