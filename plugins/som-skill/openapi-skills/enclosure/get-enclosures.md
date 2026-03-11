# 获取 Enclosure 列表

**URL**: `/api/enclosures`

**Base URL**: `https://test.sheepwall.com/som`

**方法**: `GET`

## 用户查询示例

**示例 1: 基本查询**

- 用户查询: "获取所有空间列表"、"列出所有空间"、"查询所有 Enclosure"
- 使用此 API: GET `/api/enclosures`

**示例 2: 常见查询变体**
以下用户查询都使用此 API:

- "获取所有空间"
- "列出空间"
- "查询空间列表"
- "获取空间列表"
- "显示所有 Enclosure"

**响应**:

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        "createdAt": "2025-05-28T05:51:26.706Z",
        "description": "MVP-空间智能机",
        "name": "MVP-空间智能机",
        "uuid": "6bvNlLlAXC3wpZW2SIGGb9"
      },
      {
        "createdAt": "2025-04-28T06:20:49.362Z",
        "name": "东方枢纽测试-ghb",
        "uuid": "4zKzpLcMsQzJwB1JpQDIO5"
      },
      {
        "uuid": "xxxxxxxxxx",
        "name": "Enclosure 2"
      }
    ]
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
