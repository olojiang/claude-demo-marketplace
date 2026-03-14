#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fetch stock history via akshare. Called from Node.
Usage: python3 akshare_hist.py <market> <code> <start_yyyymmdd> <end_yyyymmdd>
Output: JSON array of {date, open, high, low, close, volume} to stdout
"""
import json
import sys

def main():
    if len(sys.argv) != 5:
        sys.stderr.write("Usage: akshare_hist.py <market> <code> <start_yyyymmdd> <end_yyyymmdd>\n")
        sys.stderr.write("  market: a_stock | hk\n")
        sys.exit(1)

    market, code, start_date, end_date = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

    try:
        import akshare as ak
    except ImportError:
        sys.stderr.write("akshare not installed. Run: pip install akshare\n")
        sys.exit(2)

    rows = []
    try:
        if market == "hk":
            df = ak.stock_hk_hist(symbol=code, period="daily", start_date=start_date, end_date=end_date, adjust="")
        else:
            # A股
            df = ak.stock_zh_a_hist(symbol=code, period="daily", start_date=start_date, end_date=end_date, adjust="")

        # akshare returns: 日期 开盘 收盘 最高 最低 成交量 ...
        for _, row in df.iterrows():
            d = str(row.get("日期", row.get("date", "")))[:10]
            rows.append({
                "date": d,
                "open": float(row.get("开盘", row.get("open", 0))),
                "high": float(row.get("最高", row.get("high", 0))),
                "low": float(row.get("最低", row.get("low", 0))),
                "close": float(row.get("收盘", row.get("close", 0))),
                "volume": int(row.get("成交量", row.get("volume", 0))),
            })
    except Exception as e:
        sys.stderr.write(f"akshare error: {e}\n")
        sys.exit(3)

    print(json.dumps(rows, ensure_ascii=False))

if __name__ == "__main__":
    main()
