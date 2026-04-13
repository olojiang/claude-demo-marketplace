# 根据空间结构父节点查询entities (Search Entities by Space Structure Parent Node)

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/entitiesByParent`

### 请求参数

- Query参数：
  - `enclosureId`: 必填，围栏ID
  - `parent`: 必填，父节点ID
  - `projection`: 可选，指定要返回的字段，多个字段用逗号分隔

## 参数校验约束

### 必需参数验证

| 参数名        | 类型   | 验证规则                | 获取方式                                                                                                                                    | 错误处理                                                                 |
| ------------- | ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `enclosureId` | string | 非空、非空字符串        | 1. 用户输入（优先）<br>2. 环境变量 `ENCLOSURE_ID`<br>3. API 查询 `/api/enclosures`<br>4. 映射文件 `docs/mapping/space_enclosure_mapping.md` | 缺失时停止调用，返回错误："enclosureId 参数缺失，请提供空间ID或空间名称" |
| `parent`      | string | 非空字符串，父节点 UUID | 从用户输入中提取父节点 UUID，或通过 `getEntity` 或 `searchEntities` API 获取                                                                | 缺失时停止调用，返回错误："parent 参数缺失，请提供父节点ID"              |

### 可选参数验证

| 参数名       | 类型   | 验证规则         | 使用条件           | 错误处理             |
| ------------ | ------ | ---------------- | ------------------ | -------------------- |
| `projection` | string | 逗号分隔的字段名 | 指定返回字段时使用 | 格式错误时忽略该参数 |

### 参数格式要求

- **enclosureId**:
  - 格式：非空字符串，通常为 UUID 格式
  - 示例：`30latS7FRxjUjk9FgbMwhZ`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`30latS7FRxjUjk9FgbMwhZ`

- **parent**:
  - 格式：非空字符串，父节点 UUID
  - 示例：`6MP5VDKk0wLENEHt0WKWIA`
  - ❌ 错误示例：空字符串、null、undefined
  - ✅ 正确示例：`6MP5VDKk0wLENEHt0WKWIA`

### 参数获取流程

1. **enclosureId 获取**：
   - 优先级1：从用户输入中提取空间名称或 enclosureId
     - 如果用户提到空间名称，使用 READ 工具读取 `docs/mapping/space_enclosure_mapping.md` 查找映射
   - 优先级2：从环境变量 `ENCLOSURE_ID` 获取
   - 优先级3：通过 API `/api/enclosures` 查询空间列表
   - **验证**：必须验证 `enclosureId` 不为空，缺失时停止调用并返回明确错误

2. **parent 获取**：
   - 从用户输入中提取父节点 UUID
   - 如果用户提到父节点名称，可能需要先通过 `searchEntities` API 查询获取父节点 UUID
   - **验证**：必须验证 `parent` 不为空，缺失时停止调用并返回明确错误

### 调用前检查清单

- [ ] 已获取并验证 `enclosureId` 参数（必填）
- [ ] 已获取并验证 `parent` 参数（必填）
- [ ] 已确认参数值格式正确
- [ ] 已确认 `enclosureId` 和 `parent` 都不为空
- [ ] 如需要，已规划对返回结果进行过滤处理

### 常见错误示例

#### 错误 1：缺少必需参数

```bash
# ❌ 错误：缺少 enclosureId
curl "https://test.sheepwall.com/som/api/entitiesByParent?parent=6MP5VDKk0wLENEHt0WKWIA"

# ❌ 错误：缺少 parent
curl "https://test.sheepwall.com/som/api/entitiesByParent?enclosureId=30latS7FRxjUjk9FgbMwhZ"

# ✅ 正确：包含所有必需参数
curl "https://test.sheepwall.com/som/api/entitiesByParent?enclosureId=30latS7FRxjUjk9FgbMwhZ&parent=6MP5VDKk0wLENEHt0WKWIA"
```

#### 错误 2：参数值格式错误

```bash
# ❌ 错误：parent 为空
curl "https://test.sheepwall.com/som/api/entitiesByParent?enclosureId=xxx&parent="

# ✅ 正确：parent 格式正确
curl "https://test.sheepwall.com/som/api/entitiesByParent?enclosureId=30latS7FRxjUjk9FgbMwhZ&parent=6MP5VDKk0wLENEHt0WKWIA"
```

### 响应说明

返回结果中会有 `space.structure.autoGenHasChildren` 字段，用于标识节点是否有子节点，用于前端展示。

该字段是在接口查询时自动计算获得，并非空间节点上存在的真实数据。

```
GET /api/entitiesByParent?enclosureId=enclosure1&parent=parent1
```

例如：/api/entitiesByParent?enclosureId=30latS7FRxjUjk9FgbMwhZ&parent=6MP5VDKk0wLENEHt0WKWIA

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: [
      {
        uuid: '实体UUID',
        createdAt: '创建时间',
        'space.structure.autoGenHasChildren': false,
        // 其他字段
      },
      // 更多实体
    ],
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
