# 回滚实体到历史快照 (Rollback Entity)

将实体回滚到指定时间点的历史快照版本。支持按 UUID、Class 或 UUIDs 列表进行回滚。

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/rollbackEntity`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `snapshotAt`: 可选，回滚到的快照时间（Unix秒时间戳），与 `snapshotAtTime` 二选一
  - `snapshotAtTime`: 可选，回滚到的快照时间（ISO 8601格式，如 `2024-11-18T10:30:00Z`），与 `snapshotAt` 二选一
  - `uuid`: 可选，回滚特定实体的UUID（与 `class`、`uuids` 三选一）
  - `class`: 可选，回滚特定类别的所有实体（与 `uuid`、`uuids` 三选一）
  - `uuids`: 可选，批量回滚多个实体的UUID列表（与 `uuid`、`class` 三选一，优先级最高）

### 回滚方式说明

#### 1. 按 UUID 回滚单个实体

回滚指定的单个实体到历史版本。

**示例：**

```bash
curl -X POST https://test.sheepwall.com/som/api/rollbackEntity \
  -H "Content-Type: application/json" \
  -d '{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "snapshotAt": 1700000000,
    "uuid": "entity-uuid-123"
  }'
```

**使用 ISO 时间格式：**

```bash
curl -X POST https://test.sheepwall.com/som/api/rollbackEntity \
  -H "Content-Type: application/json" \
  -d '{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "snapshotAtTime": "2024-11-18T10:30:00Z",
    "uuid": "entity-uuid-123"
  }'
```

#### 2. 按 Class 回滚整个类别

回滚指定类别的所有实体到历史版本。

**示例：**

```bash
curl -X POST https://test.sheepwall.com/som/api/rollbackEntity \
  -H "Content-Type: application/json" \
  -d '{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "snapshotAt": 1700000000,
    "class": "space.structure"
  }'
```

#### 3. 按 UUIDs 列表批量回滚

批量回滚指定的多个实体。

**示例：**

```bash
curl -X POST https://test.sheepwall.com/som/api/rollbackEntity \
  -H "Content-Type: application/json" \
  -d '{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "snapshotAt": 1700000000,
    "uuids": ["uuid-1", "uuid-2", "uuid-3"]
  }'
```

### 时间格式说明

支持两种时间格式（二选一）：

1. **Unix 时间戳** (`snapshotAt`): 精确到秒的整数
   - 示例: `1700000000`
   - 适合程序化调用

2. **ISO 8601 格式** (`snapshotAtTime`): 标准时间格式
   - 示例: `"2024-11-18T10:30:00Z"`
   - 必须使用 UTC 时区（以 `Z` 结尾）
   - 适合人工操作

**注意**：如果同时提供两种格式，ISO 8601 格式优先。

### 响应

- 成功响应 (200):

  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "success": ["uuid-1", "uuid-2"],
      "failed": [],
      "failedReasons": {},
      "totalCount": 2,
      "successCount": 2,
      "failedCount": 0
    }
  }
  ```

- 部分失败响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "success": ["uuid-1"],
      "failed": ["uuid-2"],
      "failedReasons": {
        "uuid-2": "snapshot not found at specified time"
      },
      "totalCount": 2,
      "successCount": 1,
      "failedCount": 1
    }
  }
  ```

### 响应字段说明

| 字段            | 类型              | 说明                   |
| --------------- | ----------------- | ---------------------- |
| `success`       | []string          | 成功回滚的实体UUID列表 |
| `failed`        | []string          | 回滚失败的实体UUID列表 |
| `failedReasons` | map[string]string | 失败原因，key为UUID    |
| `totalCount`    | int               | 总共尝试回滚的实体数量 |
| `successCount`  | int               | 成功回滚的数量         |
| `failedCount`   | int               | 失败的数量             |

### 常见错误原因

| 错误信息                                 | 说明                   |
| ---------------------------------------- | ---------------------- |
| `snapshot not found at specified time`   | 指定时间点没有快照记录 |
| `failed to find snapshot: ...`           | 查询快照时发生错误     |
| `entity not found in current collection` | 实体在当前集合中不存在 |
| `failed to replace entity: ...`          | 替换实体时发生错误     |

### 注意事项

1. **快照可用性**
   - 只能回滚到有快照记录的时间点
   - 系统会查找小于等于指定时间的最近一条快照
   - 默认快照保留期为 90 天

2. **回滚操作特点**
   - 回滚是完全替换，不是部分更新
   - `updatedAt` 会更新为回滚操作的时间
   - 回滚操作本身也会生成新的快照记录

3. **批量回滚建议**
   - 对重要数据，先测试单个实体回滚
   - 确保选择的时间点有有效的快照
   - 建议在低峰期执行大量实体的回滚

4. **时区要求**
   - Unix 时间戳始终是 UTC
   - ISO 8601 格式必须使用 UTC 时区（以 `Z` 结尾）
   - 不支持其他时区格式（如 `+08:00`）

### 完整示例

```bash
# 1. 回滚单个实体（使用 Unix 时间戳）
curl -X POST https://test.sheepwall.com/som/api/rollbackEntity \
  -H "Content-Type: application/json" \
  -d '{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "snapshotAt": 1700000000,
    "uuid": "3gGHgg1YEP8Eln8K0htraa"
  }'

# 2. 回滚整个类别（使用 ISO 时间格式）
curl -X POST https://test.sheepwall.com/som/api/rollbackEntity \
  -H "Content-Type: application/json" \
  -d '{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "snapshotAtTime": "2024-11-18T10:30:00Z",
    "class": "peopleStreamInfo"
  }'

# 3. 批量回滚多个实体
curl -X POST https://test.sheepwall.com/som/api/rollbackEntity \
  -H "Content-Type: application/json" \
  -d '{
    "enclosureId": "3gGHgg1YEP8Eln8K0htraa",
    "snapshotAt": 1700000000,
    "uuids": [
      "entity-uuid-1",
      "entity-uuid-2",
      "entity-uuid-3"
    ]
  }'
```

- 错误响应:
  请参考 [错误码文档](../error_codes.md)
