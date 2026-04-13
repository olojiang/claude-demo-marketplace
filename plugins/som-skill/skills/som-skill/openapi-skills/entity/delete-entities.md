# 批量删除实体 (Delete Entities)

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/deleteEntities`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `uuids`: 必填，待删除实体的UUID列表

### 示例

```http
POST /api/deleteEntities

{
  "enclosureId": "enclosure1",
  "uuids": ["uuid1", "uuid2"]
}
```

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {
      "deleted": ["uuid1", "uuid2"],
      "failed": ["uuid3"],
      "failedReasons": {
        "uuid3": "internal error"
      }
    }
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
