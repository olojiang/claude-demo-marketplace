# 实体坐标转换

**请求方式：** GET

**Base URL**: `https://test.sheepwall.com/som`

**路径：** /api/convertEntityPoint

**参数：**

- `enclosureId` (查询参数): 实体所属的围栏ID。
- `originEntityId` (查询参数): 原点实体ID。
- `dirType` (查询参数): 方向类型, 可选值有 `x`(x轴正方向)、`-x`(x轴反方向)、`y`(y轴正方向)、`-y`(y轴反方向)。
- `dirEntityId` (查询参数): 方向实体ID。
- `uuids` (查询参数): 转换实体的 UUID 列表。

### 示例

```shell
GET /api/convertEntityPoint?enclosureId=907d781cfaa74097873e3a2c4874623c&originEntityId=e2c208b9874147f8b6a249fd28e28d3e&dirType=y&dirEntityId=699fb684f2b844339fccefbab752d0bd&uuids=2863b323b02a49eda3092fa85672586a&uuids=9aac9ce5e6e94149912a197f36ffa942
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: {
      entities: {
        '2863b323b02a49eda3092fa85672586a': {
          _id: '682be6d4df7e2855815977ea',
          classes: ['space.structure', '枕头', 'shape'],
          createdAt: '2025-05-20T10:20:04.856+08:00',
          description: '床上的枕头',
          enclosureId: '907d781cfaa74097873e3a2c4874623c',
          floor: '',
          key: '2863b323b02a49eda3092fa85672586a',
          name: '枕头2',
          orientation: 0,
          'shape.boundingBox': [
            0.2522074783429139, 0.138645727910775, 0.9544907172076137, -0.24449687270902967,
            0.7629194168977114, -0.5956384921413795, 0.06063617803301155, -0.2124958915215749,
          ],
          'shape.height': 0.1,
          'shape.length': 0.4,
          'shape.polygon': [
            0.36826951316353446, 0.42006630349362956, 1.070552752028234, 0.036923702873824946,
            0.878981451718332, -0.3142179165585246, 0.17669821285363232, 0.06892468406128002,
            0.36826951316353446, 0.42006630349362956,
          ],
          'shape.width': 0.8,
          'space.structure.parent': '907d781cfaa74097873e3a2c4874623c',
          title: '枕头2',
          updatedAt: '2025-05-21T17:23:25.435+08:00',
          uuid: '2863b323b02a49eda3092fa85672586a',
          x: 0.36826951316353446,
          y: 0.42006630349362956,
          z: 0,
        },
      },
      errors: {},
    },
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
