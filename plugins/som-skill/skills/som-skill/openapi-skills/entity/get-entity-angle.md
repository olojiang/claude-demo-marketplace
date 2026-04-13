# 获取实体之间的夹角

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** /api/getEntityAngle

**参数：**

- `enclosureId` (查询参数): 实体所属的围栏ID。
- `uuids` (查询参数): 查询的实体的 UUID 列表。

### 示例

```shell
GET /api/getEntityAngle?enclosureId=10latS7FRxjUjk9FgbMwhZ&uuids=7gIdGVCNtw2A8vHqgAMJqf&uuids=349vbvhTPhEVteioE058N6
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: {
      radian: 0.22491087637493234,
    },
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
