# 获取 Class 列表

**URL**: `/api/classes`

**Base URL**: `https://test.sheepwall.com/som`

**方法**: `GET`

## 用户查询示例

**示例 1: 基本查询**

- 用户查询: "获取空间内的所有分类"、"列出所有分类"、"查询分类列表"
- 使用此 API: GET `/api/classes?enclosureId={enclosureId}`

**示例 2: 常见查询变体**
以下用户查询都使用此 API:

- "获取所有分类"
- "列出分类"
- "查询分类列表"
- "获取分类列表"
- "显示空间内的所有分类"

**查询参数**:

- `enclosureId`: Enclosure 的 ID

**响应**:

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "enclosureId": "10latS7FRxjUjk9FgbMwhZ",
        "name": "sandcu"
      },
      {
        "enclosureId": "10latS7FRxjUjk9FgbMwhZ",
        "name": "meeting.room"
      }
    ]
  }
  ```

**cURL**

```bash
curl --request GET \
  --url "https://test.sheepwall.com/som/api/classes?enclosureId=${ENCLOSURE_ID}" \
  --header "authorization: Bearer ${PF_SESSION_TOKEN}" \
  --header "content-type: application/json"
```

**参数说明**：

- `enclosureId`: 空间/围栏 ID，从用户输入（优先）、**.claude/env.json 的 encId**（用户未指定时）、或[获取 Enclosure 列表](enclosure/get-enclosures.md)中的`/api/enclosures`接口获取
- `PF_SESSION_TOKEN`: API 认证令牌，从环境变量 `PF_SESSION_TOKEN` 获取

**注意**：

- 环境变量 `PF_SESSION_TOKEN` 从环境变量读取
- 实际调用时，请将环境变量替换为实际值

- 错误响应:
  请参考 [错误码文档](../error_codes.md)
