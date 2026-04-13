# 全量更新实体 (Full Update Entity)

会覆盖整个实体，包括 classes 字段。

**请求方式：** POST  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** /api/fullUpdateEntity

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `uuid`: 必填，实体UUID
  - `data`: 必填，实体数据，字段名不能包含`|`
  - `decorator`: 可选，装饰器信息 详情参见 [Decorator API](decorator.md)

### curl示例

```curl
  curl -X POST \
    "https://test.sheepwall.com/som/api/fullUpdateEntity" \
    -H "Authorization: Bearer $PF_SESSION_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "enclosureId": "spacesmart-som-test",
      "uuid": "14973e682c344a9d8eb9e6c3c414fec4",
      "data": {
        "name": "新名称",
        "description": "新描述",
        "classes": ["分类1", "分类2"],
        "x": 0,
        "y": 0,
        "分类1.attribute1": "新属性1值"
        "ttl": 60 // 过期时间，单位秒，不填时，默认为永久有效
      }
    }'
```

### 示例

```http
POST /api/fullUpdateEntity

{
  "enclosureId": "enclosure1",
  "uuid": "要更新的实体UUID",
  "data": {
    "name": "新名称",
    "description": "新描述",
    "classes": ["分类1", "分类2"],
    "x": 0,
    "y": 0,
    "分类1.attribute1": "新属性1值"
    "ttl": 60 // 过期时间，单位秒，不填时，默认为永久有效
  },
  "decorator": [
    {
      // 装饰器信息
    }
  ]
}
```

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "Entity updated"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
