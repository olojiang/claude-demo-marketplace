# 监听实体 (Listen Entities)

**请求方式：** GET (SSE)  
**Base URL**: `https://test.sheepwall.com/som`
**路径：** `/api/listenEntities`

使用 MongoDB Change Streams 实现实时监听，支持字段级变更检测。

### 请求参数

- Query参数：
  - `enclosureId`: 必填，围栏ID
  - `classes`: 可选，监听实体的类名，支持操作符
  - `uuids`: 可选，监听实体的UUID列表（逗号分隔）
  - `limit`: 可选，首次返回实体数量
  - `watchFields`: 可选，**字段级监听**，只监听指定字段的变化（逗号分隔，不支持操作符）
  - 其他查询参数：用于过滤实体，支持操作符

### 两个概念

#### 1. 过滤条件（选择监听**哪些实体**）

支持以下操作符用于筛选实体：

- `field[eq]` 或 `field=value`: 等于（默认）
- `field[in]`: 包含在列表中（逗号分隔，用于数组字段）
- `field[all]`: 包含所有值（逗号分隔，用于数组字段）
- `field[exists]`: 字段是否存在（布尔值）
- `field[gt]`: 大于（支持时间戳）
- `field[gte]`: 大于等于
- `field[lt]`: 小于
- `field[lte]`: 小于等于

#### 2. 字段级监听（选择监听**哪些字段的变化**）

使用 `watchFields` 参数（**不支持操作符，只是字段名列表**）：

- 只监听指定字段的变化
- 多个字段用逗号分隔
- 如不指定，则监听所有字段变化

### 示例

#### 基础用法

```shell
# 1. 监听 thing.device 类的所有字段变化
GET /api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device

# 2. 只监听 status 字段变化
GET /api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device&watchFields=status

# 3. 监听 status 和 temperature 两个字段变化
GET /api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device&watchFields=status,temperature
```

#### 使用过滤条件

```shell
# 4. [in] 操作符：监听 thing.device 或 thing.sensor 类
GET /api/listenEntities?enclosureId=sandcu_nerv&classes[in]=thing.device,thing.sensor

# 5. [all] 操作符：监听同时拥有 thing.device 和 thing.alarm 类的实体
GET /api/listenEntities?enclosureId=sandcu_nerv&classes[all]=thing.device,thing.alarm

# 6. [gt] 操作符：监听最近创建的实体
GET /api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device&createdAt[gt]=1730000000

# 7. [exists] 操作符：监听存在 temperature 字段的实体
GET /api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device&temperature[exists]=true
```

#### 组合使用

```shell
# 8. 过滤 + 字段级监听：只监听 floor=1 的设备，且只关注 status 变化
GET /api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device&floor=1&watchFields=status

# 9. 多条件过滤 + 多字段监听
GET /api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device&floor=1&building=A&watchFields=status,temperature
```

### cURL 示例

```bash
# 监听 thing.device 的 status 字段变化
curl -N "http://10.8.0.1:28507/api/listenEntities?enclosureId=sandcu_nerv&classes=thing.device&watchFields=status"
```

### 响应

使用 SSE (Server-Sent Events) 协议，返回数据格式如下：

```json5
// 初始消息：当前符合条件的实体列表
data: {"newIds": ["uuid1", "uuid2"], "deletedIds": [], "updatedIds": []}

// 后续消息：实时变化通知
data: {"newIds": [], "deletedIds": [], "updatedIds": ["uuid1"]}

data: {"newIds": ["uuid3"], "deletedIds": [], "updatedIds": []}

data: {"newIds": [], "deletedIds": ["uuid2"], "updatedIds": []}

// 心跳（每10秒）
:heartbeat
```

**字段说明：**

- `newIds`: 新增的实体UUID列表
- `updatedIds`: 更新的实体UUID列表（当 watchFields 指定时，只在监听字段变化时触发）
- `deletedIds`: 删除的实体UUID列表
