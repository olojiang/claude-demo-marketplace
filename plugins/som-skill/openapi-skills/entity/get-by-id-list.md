# 根据id列表获取实体 (Get Entity By Id List)

**请求方式：** POST
**路径：** `/api/v1/entity/getByIdList`
**Base URL**: `https://test.sheepwall.com/som`

### 请求参数

- Body参数：
  - `enclosureId`: 必填，围栏ID
  - `uuids`: 必填，uuid列表
  - `projection`: 可选，指定要返回的字段，map [string]int,key是字段名，value是1或0，1表示返回该字段，0表示不返回该字段
  - `snapshotAt`: 可选，历史时间点，默认值为当前时间
  - `page`: 可选，不传或小于1时返回第一页
  - `limit`: 可选，每页数量，不传或小于1时，返回符合条件的所有实体
  - `decorator` (查询参数, 可选): 装饰器信息，格式为 JSON 字符串数组。

### 示例

```http
POST /api/v1/entity/getByIdList
{
    "enclosureId": "64e9c9699795494c4999f949",
    "uuids": [
        "64e9c97a9795494c4999f94a"
    ],
    "projection": {
        "name": 1
    },
    "snapshotAt": 1633024800,
    "page": 1,
    "limit": 10,
    "decorator":[
        "{\"Key\":\"outCount\",\"DecType\":\"stream\",\"Method\":\"range\",\"Args\":[\"1748141836\",\"1748314636\"]}",
        "{\"Key\":\"inCount\",\"DecType\":\"stream\",\"Method\":\"range\",\"Args\":[\"1748141836\",\"1748314636\"]}"
    ]
}
```

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "total": 1,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "uuid": "64e9c97a9795494c4999f94a",
        "name": "space-1"
      }
    ]
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
