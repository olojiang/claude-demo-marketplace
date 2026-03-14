const FINNHUB_BASE = 'https://finnhub.io/api/v1';

function getToken() {
  return process.env.FINN_HUB_KEY || process.env.FINNHUB_API_KEY;
}

export async function getQuote(symbol) {
  const token = getToken();
  if (!token) throw new Error('FINN_HUB_KEY env required for US stocks');
  const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub quote failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getCandles(symbol, fromTs, toTs, resolution = 'D') {
  const token = getToken();
  if (!token) throw new Error('FINN_HUB_KEY env required for US stocks');
  const url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${fromTs}&to=${toTs}&token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub candle failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.s === 'no_data') return { o: [], h: [], l: [], c: [], v: [], t: [] };
  return data;
}

export async function getCompanyNews(symbol, fromStr, toStr) {
  const token = getToken();
  if (!token) throw new Error('FINN_HUB_KEY env required for US stocks');
  const url = `${FINNHUB_BASE}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromStr}&to=${toStr}&token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub news failed: ${res.status} ${res.statusText}`);
  return res.json();
}
