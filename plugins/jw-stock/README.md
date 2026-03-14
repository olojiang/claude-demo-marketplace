# jw-stock

股票关注列表 CRUD、行情查询、新闻与走势分析。支持美股（Finnhub）、A 股/港股（akshare）。

## 安装依赖

- **美股**：设置环境变量 `FINN_HUB_KEY`（[Finnhub](https://finnhub.io) 免费 API Key）。免费版仅含 quote + 新闻，无历史 K 线
- **A 股 / 港股**：全局安装 akshare

```bash
pip install akshare
```

## 快速开始

```bash
# 初始化默认自选股
node src/cli.js init

# 查看关注列表
node src/cli.js follows list

# 查询行情（默认近 1 月）
node src/cli.js quote

# 指定股票 + 时间区间
node src/cli.js quote --code AMD --period 1y
```

## 存储

关注列表：`~/.stock/follows.json`，可通过 `STOCK_DIR` 覆盖。

## 命令

| 命令 | 说明 |
|------|------|
| `follows list` | 列出关注 |
| `follows add --name --code --stock` | 添加（stock: 美股\|港股\|A 股） |
| `follows remove --code` | 删除 |
| `follows update --code [--name] [--stock]` | 更新 |
| `quote [--code] [--period]` | 行情+历史，period: today/1w/1m/3m/6m/1y |
| `init` | 初始化默认自选股 |

## 测试

```bash
pnpm test
```

## 文档

- [SKILL.md](skills/jw-stock-skill/SKILL.md) - Skill 说明
- [docs/EXAMPLES.md](docs/EXAMPLES.md) - Claude Code 自然语言对话样例
