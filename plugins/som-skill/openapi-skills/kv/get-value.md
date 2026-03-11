# 获取Value (Get Value)

如果key不存在，则返回空字符串。

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/kv/get`

### 请求参数

- Query参数：
  - `enclosureId`: 必填，空间ID
  - `key`: 必填，要获取的Value的Key

### 示例

```shell
GET /api/kv/get?enclosureId=enclosureId_test&key=testKey
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: 'testVal',
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
