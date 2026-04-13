# 删除Key (Delete Key)

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/kv/del`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，空间ID
  - `key`: 必填，要删除的Key

### 示例

```http
POST /api/kv/del

{
  "enclosureId": "enclosureId_test",
  "key": "testKey"
}
```

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "data": "deleted key"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
