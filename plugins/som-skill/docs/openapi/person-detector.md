# 空间内人员检测 API 文档

## 1. 获取空间智能机人员信息 (Get Space Intelligence Info)

**请求方式：** GET  
**路径：** `/som/api/searchEntities`  
**服务：** `https://test.sheepwall.com`

### 功能说明

根据 `device_uuid` 和 `enclosure_uuid` 获取空间智能机信息，主要用于查询人员信息。

### 请求参数

- Query参数：
  - `enclosureId`: 必填，围栏/空间UUID
  - `classes[all]`: 必填，分类查询参数，格式为 `"person,{device_uuid}"`，其中 `{device_uuid}` 为设备的UUID或MAC地址
  - `limit`: 可选，限制返回数量，默认100

### cURL 示例

```bash
curl 'https://test.sheepwall.com/som/api/searchEntities?enclosureId=816d4ebf9b9d49eba51ace596d00034b&classes%5Ball%5D=person,a02833805ca1&limit=100'
```

### URL编码说明

- `classes[all]` 需要URL编码为 `classes%5Ball%5D`
- 示例中的 `classes[all]=person,a02833805ca1` 编码后为 `classes%5Ball%5D=person,a02833805ca1`

### 响应

- 成功响应 (200):
  ```json
  {
    "code": 0,
    "message": "success",
    "data": [
      {
        // 人员实体数据
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 100
  }
  ```
- 错误响应:
  - 请求失败时返回空字典 `{}`
  - 或返回错误信息

### 请求参数详细说明

#### `classes[all]` 参数格式

- 格式：`"person,{device_uuid}"`
- 示例：`"person,a02833805ca1"`
- 说明：查询指定设备的人员信息

### 注意事项

- 该接口为内网接口（`https://test.sheepwall.com`），需要在同一网络环境下访问
- `device_uuid` 可以是设备的UUID或MAC地址
- 超时时间建议设置为10秒
- 无需认证（根据代码示例）

---

## 使用场景

### 查询指定设备的人员信息

1. 使用设备的MAC地址或UUID作为 `device_uuid`
2. 调用接口2，设置 `classes[all]=person,{device_uuid}`
3. 获取该设备检测到的人员信息

### 完整流程示例

# 步骤2: 从设备列表中获取 device_uuid（例如：mac地址 "a02833805ca1"）

# 步骤3: 查询该设备的人员信息

curl 'https://test.sheepwall.com/som/api/searchEntities?enclosureId=816d4ebf9b9d49eba51ace596d00034b&classes%5Ball%5D=person,a02833805ca1&limit=100'

```

```
