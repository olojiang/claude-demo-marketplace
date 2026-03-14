---
name: jw-stock-skill
description: |
  股票关注列表管理、行情查询与历史分析 Skill。支持美股（Finnhub）、A股/港股（akshare）。
  当用户需要查看、分析股票、管理自选股时使用。

  <example>
  user: "我关注的股票最近怎么样？"
  assistant: 执行 `quote` 获取所有关注股的行情与近 1 月历史，呈现 summary 中的 periodChange、high、low
  </example>

  <example>
  user: "把 AMD 加入自选，然后查一下近一年的走势"
  assistant: 先 follows add --name AMD --code AMD --stock 美股，再 quote --code AMD --period 1y
  </example>

  <example>
  user: "分析一下蔚来和美团最近一个月的行情"
  assistant: 执行 quote --period 1m，筛选 NIO 与 3690 的结果，基于 summary 与 history 做走势分析
  </example>
---

# JW Stock Skill

股票关注列表 CRUD、实时报价、新闻与走势分析。美股用 Finnhub（免费版：quote + 新闻），A 股/港股用 akshare（含历史 K 线）。

CLI 路径：`${CLAUDE_PLUGIN_ROOT}/src/cli.js`

## 前置条件

- **美股**：需设置环境变量 `FINN_HUB_KEY`（Finnhub 免费 Key，不调用 Candle 接口）
- **A 股 / 港股**：需全局安装 akshare `pip install akshare`

## 数据存储

关注列表存储在 `~/.stock/follows.json`，可通过环境变量 `STOCK_DIR` 覆盖目录。

## CLI 用法

### 初始化默认自选股

```bash
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js init
```

### 关注列表 CRUD

```bash
# 列出
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows list

# 添加（stock: 美股 | 港股 | A 股）
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows add --name "AMD" --code AMD --stock 美股

# 删除
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows remove --code AMD

# 更新
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js follows update --code AMD --name "超微半导体"
```

### 行情与历史

```bash
# 查询所有关注股的报价与历史（默认近 1 月）
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote

# 指定股票 + 时间区间
node ${CLAUDE_PLUGIN_ROOT}/src/cli.js quote --code AMD --period 1y
```

**period 取值**：`today` | `1w` | `1m` | `3m` | `6m` | `1y`

返回 JSON 包含：`name`, `code`, `stock`, `quote`, `history`（A 股/港股有，美股免费版无）, `news`（仅美股）, `summary`（A 股/港股有走势概要）
