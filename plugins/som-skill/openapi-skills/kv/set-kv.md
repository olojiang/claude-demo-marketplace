# 保存KV (Set KV)

若Key已存在，则会更新Val和过期时间。

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/kv/set`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，空间ID
  - `key`: 必填，Key值
  - `val`: 可选，Val值
  - `ttl`: 可选，过期时间，单位秒，不填时，默认为永久有效

### 示例

```http
POST /api/kv/set

{
    "enclosureId": "enclosureId_test",
    "key": "testKey",
    "val": "testVal",
    "ttl": 60
}
```

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "data": "set key"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
