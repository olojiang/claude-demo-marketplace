# 删除实体 (Delete Entity)

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/deleteOneEntity`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `uuid`: 必填，实体UUID

### 示例

```http
POST /api/deleteOneEntity

{
  "enclosureId": "enclosure1",
  "uuid": "要删除的实体UUID"
}
```

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "Entity deleted"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
