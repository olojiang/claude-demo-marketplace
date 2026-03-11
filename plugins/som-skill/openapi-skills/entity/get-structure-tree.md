# 根据筛选条件获取树状结构数据 (Get Structure Tree)

**请求方式：** POST
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/v1/entity/getStructureTree`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `parentId`: 必填，父节点id，没有parentId时可以用enclosureId的值
  - `filters`: 筛选条件，可选，数组，每个元素有 field operator value 三个字段
  - `levelLimit`: 限制层级，可选，

## 参数校验约束

### 必需参数验证

| 参数名        | 类型   | 验证规则                | 获取方式                                                                                                                                    | 错误处理                                                                                      |
| ------------- | ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `enclosureId` | string | 非空、非空字符串        | 1. 用户输入（优先）<br>2. 环境变量 `ENCLOSURE_ID`<br>3. API 查询 `/api/enclosures`<br>4. 映射文件 `docs/mapping/space_enclosure_mapping.md` | 缺失时停止调用，返回错误："enclosureId 参数缺失，请提供空间ID或空间名称"                      |
| `parentId`    | string | 非空字符串，父节点 UUID | 从用户输入中提取父节点 UUID，如果没有 parentId 可以使用 enclosureId 的值                                                                    | 缺失时停止调用，返回错误："parentId 参数缺失，请提供父节点ID（如无父节点可使用 enclosureId）" |

### 可选参数验证

| 参数名       | 类型   | 验证规则                                                   | 使用条件             | 错误处理             |
| ------------ | ------ | ---------------------------------------------------------- | -------------------- | -------------------- |
| `filters`    | array  | 筛选条件数组，每个元素包含 field, operator, value 三个字段 | 需要筛选条件时使用   | 格式错误时忽略该参数 |
| `levelLimit` | number | 整数，>= 1                                                 | 限制树层级深度时使用 | 小于1时忽略该参数    |

### 参数格式要求

- **enclosureId**:
  - 格式：非空字符串，通常为 UUID 格式
  - 示例：`3gGHgg1YEP8Eln8K0htraa`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`3gGHgg1YEP8Eln8K0htraa`

- **parentId**:
  - 格式：非空字符串，父节点 UUID（如果没有父节点，可以使用 enclosureId 的值）
  - 示例：`3gGHgg1YEP8Eln8K0htraa`（根节点时使用 enclosureId）
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`3gGHgg1YEP8Eln8K0htraa`

- **filters**:
  - 格式：数组，每个元素包含 `field`、`operator`、`value` 三个字段
  - 示例：`[{"field": "uuid", "operator": "ne", "value": "3CQH2YmfIEiVUCp5q3b0Sw"}]`
  - ❌ 错误示例：缺少必需字段、格式不正确
  - ✅ 正确示例：`[{"field": "uuid", "operator": "ne", "value": "xxx"}]`

- **levelLimit**:
  - 格式：整数，>= 1
  - 示例：`2`
  - ❌ 错误示例：小于1、非整数
  - ✅ 正确示例：`2`

### 参数获取流程

1. **enclosureId 获取**：
   - 优先级1：从用户输入中提取空间名称或 enclosureId
     - 如果用户提到空间名称，使用 READ 工具读取 `docs/mapping/space_enclosure_mapping.md` 查找映射
   - 优先级2：从环境变量 `ENCLOSURE_ID` 获取
   - 优先级3：通过 API `/api/enclosures` 查询空间列表
   - **验证**：必须验证 `enclosureId` 不为空，缺失时停止调用并返回明确错误

2. **parentId 获取**：
   - 从用户输入中提取父节点 UUID
   - 如果用户没有指定父节点，使用 `enclosureId` 的值（表示从根节点开始）
   - 如果用户提到父节点名称，可能需要先通过 `searchEntities` API 查询获取父节点 UUID
   - **验证**：必须验证 `parentId` 不为空，缺失时停止调用并返回明确错误

3. **filters 获取**（如需要）：
   - 从用户输入中提取筛选条件
   - 构建筛选条件数组，每个元素包含 `field`、`operator`、`value`
   - **验证**：如果提供 filters，验证格式正确

### 调用前检查清单

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已获取并验证 `parentId` 参数（必填，如无父节点可使用 enclosureId）
- [ ] 已确认参数值格式正确
- [ ] 已确认 `enclosureId` 和 `parentId` 都不为空
- [ ] 如使用 filters，已确认格式正确（包含 field, operator, value）
- [ ] 如使用 levelLimit，已确认为整数且 >= 1
- [ ] 如需要，已规划对返回结果进行处理

### 常见错误示例

#### 错误 1：缺少必需参数

```bash
# ❌ 错误：缺少 enclosureId
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"parentId": "xxx"}'

# ❌ 错误：缺少 parentId
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx"}'

# ✅ 正确：包含所有必需参数
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "3gGHgg1YEP8Eln8K0htraa", "parentId": "3gGHgg1YEP8Eln8K0htraa"}'
```

#### 错误 2：parentId 为空

```bash
# ❌ 错误：parentId 为空字符串
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "parentId": ""}'

# ✅ 正确：parentId 使用 enclosureId（根节点）
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "3gGHgg1YEP8Eln8K0htraa", "parentId": "3gGHgg1YEP8Eln8K0htraa"}'
```

#### 错误 3：filters 格式错误

```bash
# ❌ 错误：filters 缺少必需字段
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "parentId": "xxx", "filters": [{"field": "uuid"}]}'

# ✅ 正确：filters 格式正确
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "3gGHgg1YEP8Eln8K0htraa", "parentId": "3gGHgg1YEP8Eln8K0htraa", "filters": [{"field": "uuid", "operator": "ne", "value": "3CQH2YmfIEiVUCp5q3b0Sw"}]}'
```

#### 错误 4：levelLimit 格式错误

```bash
# ❌ 错误：levelLimit 小于1
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "xxx", "parentId": "xxx", "levelLimit": 0}'

# ✅ 正确：levelLimit 为整数且 >= 1
curl -X POST "https://test.sheepwall.com/som/api/v1/entity/getStructureTree" \
  -H "Content-Type: application/json" \
  -d '{"enclosureId": "3gGHgg1YEP8Eln8K0htraa", "parentId": "3gGHgg1YEP8Eln8K0htraa", "levelLimit": 2}'
```

### 示例

```http
POST /api/v1/entity/getStructureTree
{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "filters": [
      {
            "field": "uuid",
            "operator": "ne",
            "value": "3CQH2YmfIEiVUCp5q3b0Sw"
        }
    ],
    "levelLimit": 2,
    "parentId": "3gGHgg1YEP8Eln8K0htraa"
}
```

### 响应

- 成功响应 (200):

```json5
{
  data: {
    '.autoGen.children': [
      // ...
    ],
    // ...
    uuid: '3gGHgg1YEP8Eln8K0htraa',
  },
  code: 0,
  message: 'success',
}
```

- 错误响应:
  请参考 [错误码文档](../error_codes.md)
