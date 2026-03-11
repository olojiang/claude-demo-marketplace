# 更新 Enclosure

**URL**: `/api/enclosures/update`

**Base URL**: `https://test.sheepwall.com/som`

**方法**: `POST`

**请求体**:

- 类型: `application/json`
- 内容: 更新的数据，需要包含uuid，如更新 enclosure 描述
  ```json
  {
    "uuid": "spacesmart-test-08",
    "description": "spacesmart测试空间 08"
  }
  ```

**响应**:

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "Enclosure updated"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
