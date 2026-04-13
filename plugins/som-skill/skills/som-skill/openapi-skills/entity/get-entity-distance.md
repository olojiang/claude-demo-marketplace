# 获取实体之间的距离 (支持不同模式)

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** /api/getEntityDistance

**参数：**

- `enclosureId` (查询参数): 实体所属的围栏ID。
- `uuids` (查询参数): 查询的实体的 UUID 列表。
- `distanceType` (查询参数): 距离计算模式, 可选值有：min(最近点距离)、max(最远点距离)、center(中心点距离)。

### 示例

```shell
GET /api/getEntityDistance?enclosureId=10latS7FRxjUjk9FgbMwhZ&uuids=7gIdGVCNtw2A8vHqgAMJqf&uuids=349vbvhTPhEVteioE058N6&distanceType=center
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: {
      distance: 0.5850498771294972,
    },
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
