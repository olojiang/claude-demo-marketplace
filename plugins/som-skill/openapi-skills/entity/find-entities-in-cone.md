# 查询实体方向范围内的所有实体

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** /api/findEntitiesInCone/{uuid}

**参数：**

- `uuid` (路径参数): 实体的唯一标识符。
- `enclosureId` (查询参数): 实体所属的围栏ID。
- `distance` (查询参数): 搜索距离。
- `angleDeg` (查询参数): 搜索角度。

### 示例

```shell
GET /api/findEntitiesInCone/35655a78d7cf44d78c8131a6661ba7f2?enclosureId=907d781cfaa74097873e3a2c4874623c&distance=10&angleDeg=100
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
          classes: ['space', 'shape', 'space.structure', '马桶'],
          createdAt: '2025-05-19T17:26:23.512+08:00',
          description: '卫生间的马桶',
          enclosureId: '907d781cfaa74097873e3a2c4874623c',
          floor: '',
          key: '2055a78a578a4e17a3bdedccaca89107',
          name: '马桶',
          orientation: 0,
          'shape.boundingBox': [2.4, 1.9, 2.8, 1.9, 2.8, 1.5, 2.4, 1.5],
          'shape.height': 0.78,
          'shape.length': 0.4,
          'shape.polygon': [2.4, 1.9, 2.8, 1.9, 2.8, 1.5, 2.4, 1.5],
          'shape.width': 0.4,
          'space.structure.parent': '907d781cfaa74097873e3a2c4874623c',
          title: '马桶',
          updatedAt: '2025-05-20T16:54:27.797+08:00',
          uuid: '2055a78a578a4e17a3bdedccaca89107',
          x: 2.6,
          y: 1.7,
          z: 0.39,
        },
        {
          classes: ['shape', 'space.structure', '枕头'],
          createdAt: '2025-05-20T10:18:09.681+08:00',
          description: '床上的枕头',
          enclosureId: '907d781cfaa74097873e3a2c4874623c',
          floor: '',
          key: '699fb684f2b844339fccefbab752d0bd',
          name: '枕头1',
          orientation: 0,
          'shape.boundingbox': [0, 1, 0.8, 1, 0.8, 0.6, 0, 0.6],
          'shape.height': 0.2,
          'shape.length': 0.4,
          'shape.polygon': [
            -1.1081081081081081, 1.504504504504503, -0.3081081081081082, 1.504504504504503,
            -0.3081081081081082, 1.104504504504504, -1.1081081081081081, 1.104504504504504,
          ],
          'shape.width': 0.8,
          'space.structure.parent': '907d781cfaa74097873e3a2c4874623c',
          title: '枕头',
          updatedAt: '2025-05-20T10:23:45.569+08:00',
          uuid: '699fb684f2b844339fccefbab752d0bd',
          x: -1.1081081081081081,
          y: 2.504504504504503,
          z: 0,
        },
      ],
    },
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
