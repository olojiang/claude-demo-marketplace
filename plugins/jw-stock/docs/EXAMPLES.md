# JW Stock - Claude Code 自然语言对话样例

在 Claude Code 中，你可以用自然语言与 jw-stock 插件交互。下面是各种场景的对话样例。

---

## 1. 初始化与自选股管理

### 初始化默认自选股

**用户说**：
> 帮我初始化股票关注列表，用默认的那批股票

**Claude 会执行**：
```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js init
```

---

### 添加自选股

**用户说**：
> 把 AMD 加入我的股票关注
> 把平安好医生（1833）加入关注，是港股的
> 帮我关注一下 TCL 科技，代码 000100，A 股

**Claude 会执行**：
```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows add --name "AMD" --code AMD --stock 美股
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows add --name "平安好医生" --code 1833 --stock 港股
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows add --name "TCL科技" --code 000100 --stock "A 股"
```

---

### 查看关注列表

**用户说**：
> 我关注了哪些股票？
> 列出我的自选股

**Claude 会执行**：
```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows list
```

---

### 删除 / 更新

**用户说**：
> 把 HUYA 从关注里删掉
> 把 AMD 的显示名改成「超微半导体」

**Claude 会执行**：
```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows remove --code HUYA
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows update --code AMD --name "超微半导体"
```

---

## 2. 行情与历史

### 查看所有关注股近况

**用户说**：
> 我关注的股票最近怎么样？
> 给我看看自选股最近一个月的行情
> 查一下我关注的股票

**Claude 会执行**：
```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote
```
（默认 `period=1m`，即近 1 月）

---

### 指定时间区间

**用户说**：
> AMD 最近一周的走势
> 蔚来近 3 个月的股价
> 美团近一年的行情
> 给我看今天 BILI 的情况
> 双碳 ETF 近 6 个月的数据

**Claude 会执行**：
```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code AMD --period 1w
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code NIO --period 3m
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code 3690 --period 1y
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code BILI --period today
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code 159642 --period 6m
```

---

### 分析走势

**用户说**：
> 分析一下 AMD 近一年的走势
> PLTR 这半年涨了还是跌了？有没有新闻？
> 给我分析一下 快手 最近一个月的行情

**Claude 会执行**：
```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code AMD --period 1y
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code PLTR --period 6m
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code 1024 --period 1m
```

返回的 JSON 中：美股有 `quote`、`news`（无 history/summary，因 Finnhub 免费版不含 Candle）；A 股/港股有 `quote`、`history`、`summary`。

---

## 3. 复合场景

**用户说**：
> 先帮我初始化股票关注，然后查一下近一个月的行情

**Claude 会**：依次执行 `init` 和 `quote`，并汇总结果。

---

**用户说**：
> 把我的美股自选都查一下，看近 3 个月涨跌

**Claude 会**：执行 `quote --period 3m`，在结果中筛选 `stock === '美股'`，并整理涨跌幅。

---

**用户说**：
> 关注列表里加上小鹏 XPEV 和 英特尔 INTC，然后给我看他们最近一周的表现

**Claude 会**：先 `follows add` 两次，再 `quote --period 1w`，只展示这两只的结果。

---

## 4. 环境与依赖说明

| 市场 | 依赖 | 说明 |
|------|------|------|
| 美股 | `FINN_HUB_KEY` | Finnhub 免费 Key，用于 quote + 新闻（不调用 Candle） |
| A 股 / 港股 | `akshare` | `pip install akshare` 全局安装，含历史 K 线 |

**存储路径**：`~/.stock/follows.json`，可用 `STOCK_DIR` 覆盖。
