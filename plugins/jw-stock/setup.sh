#!/usr/bin/env bash
# jw-stock 前置检查

echo "[jw-stock] Checking dependencies..."

# akshare for A股/港股
if ! python3 -c "import akshare" 2>/dev/null; then
  echo "[jw-stock] akshare not found. Install with: pip install akshare"
else
  echo "[jw-stock] akshare OK"
fi

# FINN_HUB_KEY for 美股
if [ -z "$FINN_HUB_KEY" ] && [ -z "$FINNHUB_API_KEY" ]; then
  echo "[jw-stock] FINN_HUB_KEY not set (needed for US stocks). Get free key: https://finnhub.io"
else
  echo "[jw-stock] Finnhub API key OK"
fi
