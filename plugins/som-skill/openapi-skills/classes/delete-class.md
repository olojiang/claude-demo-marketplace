# 删除 Class

**URL**: `/api/classes/delete`

**Base URL**: `https://test.sheepwall.com/som`

**方法**: `POST`

**请求体**:

- 类型: `application/json`
- 示例:

```json
{
  "enclosureId": "xxxxxxx",
  "name": "Class 1"
}
```

**响应**:

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "Class deleted"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
