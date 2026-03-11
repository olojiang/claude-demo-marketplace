# 获取实体的朝向

**请求方式：** GET  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** /api/getEntityOrientation/{uuid}

**参数：**

- `uuid` (路径参数): 实体的唯一标识符。
- `enclosureId` (查询参数): 实体所属的围栏ID。

### 示例

```shell
GET /api/getEntityOrientation/2GDYjQR1Cdy1VM37j9WMer?enclosureId=10latS7FRxjUjk9FgbMwhZ
```

### 响应

- 成功响应 (200):
  ```json5
  {
    code: 0,
    message: 'success',
    data: {
      orientation: {
        x: 0.5482534867118507,
        y: 0.37311175853359396,
        z: 0.748468923838704,
      },
    },
  }
  ```
- 错误响应:
  请参考 [错误码文档](../error_codes.md)
