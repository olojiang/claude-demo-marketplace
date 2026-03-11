# 搜索 polygon 范围内的实体

**请求方式：** GET  
**Base URL**: https://test.sheepwall.com/som
**路径：** /api/findEntitiesInPolygon

**参数：**

- `enclosureId` (查询参数): 实体所属的围栏ID。
- `polygon` (查询参数): 要查询的 polygon 坐标点，格式为 [-1.225, 1.9, 0.915, 1.9, 0.915, -0.385, -1.225, -0.385]。

### shell示例

```shell
GET /api/findEntitiesInPolygon?enclosureId=907d781cfaa74097873e3a2c4874623c&polygon=[-1.225, 1.9, 0.915, 1.9, 0.915, -0.385, -1.225, -0.385]
```

### curl 示例

```curl
curl -X GET \
  "https://test.sheepwall.com/som/api/findEntitiesInPolygon?enclosureId=907d781cfaa74097873e3a2c4874623c&polygon=%5B-2.01%2C1.4%2C0.825%2C1.0%2C0.542%2C0.378%2C-0.999%2C-0.534%2C-1.522%2C-1.978%5D" \
  -H "Authorization: Bearer $PF_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: {
      list: [
        {
          classes: ['space.structure', '枕头', 'shape'],
          createdAt: '2025-05-20T10:21:14.682+08:00',
          description: '床上的枕头',
          enclosureId: '907d781cfaa74097873e3a2c4874623c',
          floor: '',
          key: '9aac9ce5e6e94149912a197f36ffa942',
          name: '枕头3',
          orientation: 0,
          'shape.boundingbox': [0, 1, 0.8, 1, 0.8, 0.6, 0, 0.6],
          'shape.height': 0.1,
          'shape.length': 0.4,
          'shape.polygon': [
            -1.105263157894737, 1.2712918660287096, -0.30526315789473685, 1.2712918660287096,
            -0.30526315789473685, 0.8712918660287091, -1.105263157894737, 0.8712918660287091,
            -1.105263157894737, 1.2712918660287096,
          ],
          'shape.width': 0.8,
          'space.structure.parent': '907d781cfaa74097873e3a2c4874623c',
          title: '枕头3',
          updatedAt: '2025-05-20T10:41:02.234+08:00',
          uuid: '9aac9ce5e6e94149912a197f36ffa942',
          x: -1.105263157894737,
          y: 1.2712918660287096,
          z: 0,
        },
        {
          classes: ['shape', 'space.structure', '枕头'],
          createdAt: '2025-05-20T10:20:04.856+08:00',
          description: '床上的枕头',
          enclosureId: '907d781cfaa74097873e3a2c4874623c',
          floor: '',
          key: '2863b323b02a49eda3092fa85672586a',
          name: '枕头2',
          orientation: 0,
          'shape.boundingbox': [0, 1, 0.8, 1, 0.8, 0.6, 0, 0.6],
          'shape.height': 0.1,
          'shape.length': 0.4,
          'shape.polygon': [
            -0.03289473684210526, 1.3026315789473675, 0.7671052631578946, 1.3026315789473675,
            0.7671052631578946, 0.9026315789473679, -0.03289473684210526, 0.9026315789473679,
            -0.03289473684210526, 1.3026315789473675,
          ],
          'shape.width': 0.8,
          'space.structure.parent': '907d781cfaa74097873e3a2c4874623c',
          title: '枕头2',
          updatedAt: '2025-05-20T10:25:06.334+08:00',
          uuid: '2863b323b02a49eda3092fa85672586a',
          x: -0.03289473684210526,
          y: 1.3026315789473675,
          z: 0,
        },
        {
          classes: ['枕头', 'shape', 'space.structure'],
          createdAt: '2025-05-20T10:22:40.719+08:00',
          description: '床上的枕头',
          enclosureId: '907d781cfaa74097873e3a2c4874623c',
          floor: '',
          key: '26562d70d74e4079afe605b1f63ac997',
          name: '枕头4',
          orientation: 0,
          'shape.boundingbox': [0, 1, 0.8, 1, 0.8, 0.6, 0, 0.6],
          'shape.height': 0.1,
          'shape.length': 0.4,
          'shape.polygon': [
            -0.032894736842105275, 1.4999999999999998, 0.7671052631578946, 1.4999999999999998,
            0.7671052631578946, 1.0999999999999994, -0.032894736842105275, 1.0999999999999994,
            -0.032894736842105275, 1.4999999999999998,
          ],
          'shape.width': 0.8,
          'space.structure.parent': '907d781cfaa74097873e3a2c4874623c',
          title: '枕头4',
          updatedAt: '2025-05-20T10:24:57.113+08:00',
          uuid: '26562d70d74e4079afe605b1f63ac997',
          x: -0.032894736842105275,
          y: 1.4999999999999998,
          z: 0,
        },
        {
          classes: ['毯子', 'space.structure', 'shape'],
          createdAt: '2025-05-19T18:47:55.07+08:00',
          description: '床上的毯子',
          floor: '',
          name: '毯子',
          orientation: 0,
          'shape.boundingbox': [-1.225, 0.015, 0.915, 0.015, 0.915, -0.385, -1.225, -0.385],
          'shape.height': 0.01,
          'shape.length': 0.4,
          'shape.polygon': [-1.225, 0.015, 0.915, 0.015, 0.915, -0.385, -1.225, -0.385],
          'shape.width': 2.14,
          'space.structure.parent': '907d781cfaa74097873e3a2c4874623c',
          updatedAt: '2025-05-19T18:47:55.07+08:00',
          uuid: '452494c76d414b81b968c277b0c7a507',
          x: -0.16,
          y: 0.015,
          z: 0,
        },
      ],
    },
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
