# 创建 Enclosure

**URL**: `/api/enclosures/create`

**Base URL**: https://test.sheepwall.com/som

**方法**: `POST`

**请求体**:

- 类型: `application/json`
- 内容: Enclosure 数据,uuid没有会自动生成一个

**示例**:

```json
{
  "uuid": "testRlx1",
  "name": "放数据的"
}
```

**响应**:

- 成功响应 (200):
  ```json
  {
    "data": {
      "createdAt": "2025-04-27T15:51:29.870681+08:00",
      "name": "放数据的",
      "uuid": "testRlx1"
    },
    "code": 0,
    "message": "success"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
