# listenRaster，监听栅格数据

**请求方式：** GET (SSE)

**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/raster/listen`

### 请求参数

Query参数：

- `enclosureId`: 必填，围栏ID
- `uuids`: 监听实体的UUID 列表
- `attrKey`：监听的属性key

### 示例

```shell
curl --location 'http://test.sheepwall.com/som/api/raster/listen?enclosureId=3gGHgg1YEP8Eln8K0htraa&uuids=2souxYLYf8XBrzhxVcyq63&attrKey=heatmap.realtime' \
--header 'Content-Type: text/event-stream' \
--header 'Accept: text/event-stream' \
--header 'Authorization: xxxxxx'
```

### 响应

使用 SSE (Server-Sent Events) 协议，返回数据格式如下：

每个entity uuid第一条返回的数据，返回的数据格式如下：

```json5
{
  eventType: 'header',
  eventData: {
    cols: 106,
    rows: 135,
    xtl_corner: -145,
    ytl_corner: 104,
    cell_size: 1,
  },
  enclosureId: '3gGHgg1YEP8Eln8K0htraa',
  uuid: '2souxYLYf8XBrzhxVcyq63',
  key: 'heatmap.realtime',
}
```

后续推送增量数据，返回的数据格式如下：

```json5
{
  eventType: 'diff',
  eventData: {
    version: 9382,
    cells: [
      {
        row: 107, // 栅格数据的行号
        col: 54, // 栅格数据的列号
        value: 0, // 栅格数据的最新值
      },
      {
        row: 76,
        col: 60,
        value: 1,
      },
      // ...
    ],
  },
  enclosureId: '3gGHgg1YEP8Eln8K0htraa',
  uuid: '2souxYLYf8XBrzhxVcyq63',
  key: 'heatmap.realtime',
}
```
