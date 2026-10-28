# Gravity
Responsive Solana memecoin market discovery and **paper trading only**.

## Token data
Gravity uses Jupiter Tokens V2 on the server:
- `GET /tokens/v2/recent` for freshly created liquidity pools.
- `GET /tokens/v2/toptrending/1h?limit=100` for trending tokens.
- `GET /tokens/v2/search?query=...` for name, symbol and mint lookup.

The discover/trending lists focus on typical Pump.fun mints ending in `pump`. Mint-address lookups accept any Solana token. Jupiter may omit prices for illiquid assets; such tokens remain visible but can't be paper-traded without a verified price. A "recent" token means the first liquidity pool was created recently, not necessarily the mint itself.

**Recommended Vercel setting:** set an encrypted `JUPITER_API_KEY` (server-side only) from [Jupiter Developer Portal](https://developers.jup.ag/portal), targeting Production and Preview, for reliable rate limits. Without one, Jupiter supports restricted keyless requests, subject to throttling. Never use `NEXT_PUBLIC_` for a server key.

Historical 5-minute candles remain sourced from GeckoTerminal because Jupiter Tokens V2 does not provide OHLC candles.

## Development
```bash
npm install
npm run typecheck
npm run build
```
Push to `main` for automatic Vercel deployment. No separate manual deployment is required.

No real orders, custody, wallet deposits, onchain shorts or liquidations. Positions are saved in local browser storage; the example leverage and margins are virtual.
