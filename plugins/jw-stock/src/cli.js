#!/usr/bin/env node

import {
  listFollows,
  addFollow,
  removeFollow,
  updateFollow,
  getFollow,
} from './follows.js';
import { getQuote, getCompanyNews } from './finnhub.js';
import { fetchHistory, marketToAkshare } from './akshare-runner.js';
import { getPeriodRange, formatDateYmd } from './periods.js';

const args = process.argv.slice(2);
const cmd = args[0];
const sub = args[1];

function arg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

function out(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

function fail(msg) {
  console.error(`jw-stock - ${msg}`);
  process.exit(1);
}

async function fetchQuoteAndHistory(item, period) {
  const { name, code, stock } = item;
  const { from, to } = getPeriodRange(period || '1m');

  if (stock === '美股') {
    const token = process.env.FINN_HUB_KEY || process.env.FINNHUB_API_KEY;
    if (!token) fail('FINN_HUB_KEY env required for US stocks');
    const quote = await getQuote(code);
    /* Finnhub 免费版不包含 Candle 接口，仅使用 quote + news */
    const candles = { t: [], o: [], h: [], l: [], c: [], v: [] };
    let news = [];
    try {
      const fmt = (d) => formatDateYmd(d).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
      news = await getCompanyNews(code, fmt(from), fmt(to));
      news = (news || []).slice(0, 5);
    } catch (_) {}

    const bars = (candles.t || []).map((t, i) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      open: candles.o?.[i],
      high: candles.h?.[i],
      low: candles.l?.[i],
      close: candles.c?.[i],
      volume: candles.v?.[i],
    }));
    const summary = computeTrend(bars, quote);
    return { name, code, stock, quote, history: bars, news, summary };
  }

  const aksMarket = marketToAkshare(stock);
  if (!aksMarket) fail(`Unsupported market: ${stock}`);

  let history = [];
  try {
    history = await fetchHistory(aksMarket, code, formatDateYmd(from), formatDateYmd(to));
  } catch (e) {
    return { name, code, stock, error: e.message, history: [] };
  }

  const last = history[history.length - 1];
  const quote = last ? { c: last.close, o: last.open, h: last.high, l: last.low, pc: history[history.length - 2]?.close } : null;
  const summary = computeTrend(history, quote);
  return { name, code, stock, quote, history, summary };
}

function computeTrend(bars, quote) {
  if (!bars || bars.length < 2) return null;
  const first = bars[0];
  const last = bars[bars.length - 1];
  const firstClose = first.close;
  const lastClose = last.close;
  const periodChange = firstClose ? (((lastClose - firstClose) / firstClose) * 100).toFixed(2) + '%' : null;
  const highs = bars.map((b) => b.high).filter((v) => v != null);
  const lows = bars.map((b) => b.low).filter((v) => v != null);
  return {
    periodChange,
    high: highs.length ? Math.max(...highs).toFixed(2) : null,
    low: lows.length ? Math.min(...lows).toFixed(2) : null,
    startDate: first.date,
    endDate: last.date,
  };
}

async function main() {
  try {
    switch (cmd) {
      case 'follow':
      case 'follows': {
        switch (sub) {
          case 'list':
          case undefined:
            out(listFollows());
            break;
          case 'add': {
            const name = arg('name');
            const code = arg('code');
            const stock = arg('stock');
            if (!name || !code || !stock) fail('follows add needs --name --code --stock');
            addFollow({ name, code, stock });
            console.log('jw-stock - added:', name, code, stock);
            break;
          }
          case 'remove': {
            const code = arg('code');
            if (!code) fail('follows remove needs --code');
            removeFollow(code);
            console.log('jw-stock - removed:', code);
            break;
          }
          case 'update': {
            const code = arg('code');
            if (!code) fail('follows update needs --code');
            const name = arg('name');
            const stock = arg('stock');
            const updates = {};
            if (name) updates.name = name;
            if (stock) updates.stock = stock;
            if (Object.keys(updates).length === 0) fail('follows update needs --name or --stock');
            updateFollow(code, updates);
            console.log('jw-stock - updated:', code);
            break;
          }
          default:
            fail(`follows: unknown subcommand ${sub}, use list|add|remove|update`);
        }
        break;
      }

      case 'quote': {
        const code = arg('code');
        const period = arg('period') || '1m';
        if (code) {
          const f = getFollow(code);
          if (!f) fail(`follow not found: ${code}`);
          const r = await fetchQuoteAndHistory(f, period);
          out(r);
        } else {
          const list = listFollows();
          const results = [];
          for (const item of list) {
            const r = await fetchQuoteAndHistory(item, period);
            results.push(r);
          }
          out(results);
        }
        break;
      }

      case 'init': {
        const dir = process.env.STOCK_DIR || `${process.env.HOME || process.env.USERPROFILE}/.stock`;
        const defaultFollows = [
          { name: 'AMD', code: 'AMD', stock: '美股' },
          { name: 'BILI', code: 'BILI', stock: '美股' },
          { name: '虎牙', code: 'HUYA', stock: '美股' },
          { name: '英特尔', code: 'INTC', stock: '美股' },
          { name: '蔚来', code: 'NIO', stock: '美股' },
          { name: '小鹏汽车', code: 'XPEV', stock: '美股' },
          { name: 'Palantir', code: 'PLTR', stock: '美股' },
          { name: 'Desktop Metal', code: 'DM', stock: '美股' },
          { name: '平安好医生', code: '1833', stock: '港股' },
          { name: '映宇宙', code: '3700', stock: '港股' },
          { name: '美团', code: '3690', stock: '港股' },
          { name: '快手', code: '1024', stock: '港股' },
          { name: 'TCL科技', code: '000100', stock: 'A 股' },
          { name: '双碳ETF', code: '159642', stock: 'A 股' },
        ];
        for (const s of defaultFollows) {
          addFollow(s);
        }
        console.log('jw-stock - init: default follows written to', dir);
        break;
      }

      default:
        fail(`Unknown command: ${cmd}. Use: follows, quote, init`);
    }
  } catch (err) {
    fail(err.message);
  }
}

main();
