# 删除 Enclosure

**URL**: `/api/enclosures/delete`

**Base URL**: https://test.sheepwall.com/som

**方法**: `POST`

**请求体**:

- 类型: `application/json`
- 内容: Enclosure 的 uuid
- 示例: `{"uuid": "xxxxxxxxxx"}`

**响应**:

- 成功响应 (200):
  ```json
  {
    "data": "Enclosure deleted",
    "code": 0,
    "message": "success"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
