# 创建 Enclosure 副本

**URL**: `/api/enclosures/fork`

**Base URL**: `https://test.sheepwall.com/som`

**方法**: `POST`

**请求体**:

- 类型: `application/json`
- 内容: 源空间ID, 目标空间ID, 目标空间名称, target没有会自动生成一个ID, 注意：实体的classes中含有no_copy标记的不会被fork，名称默认为 "源空间名称\_fork"

**示例**:

```json
{
  "source": "2HjUP8DHNsdA6cXtWxbEUt",
  "target": "",
  "targetName": "新空间"
}
```

**响应**:

- 成功响应 (200):
  ```json
  {
    "data": {
      "createdAt": "2025-06-23T17:12:16.000613+08:00",
      "name": "漕河泾中心",
      "uuid": "ef840c69c74f4cc79cd2565762c328e4"
    },
    "code": 0,
    "message": "success"
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
