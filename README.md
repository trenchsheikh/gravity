# Gravity

A premium Solana token discovery and **paper-trading** terminal. The website is intentionally explicit: it does not route orders, custody funds, create synthetic derivatives or open real short positions.

## Stack
Next.js App Router, TypeScript, Lucide icons, GeckoTerminal + DexScreener market data. Pump.fun public website feed is attempted for fresh launches; it is **unofficial and may be unavailable or change without notice**. The app falls back to pump-origin pools on GeckoTerminal and related DexScreener discovery. The generated Gravity orbital brand artwork is a real `.webp` image in `public/`, not a CSS-drawn substitute.

## Run
```bash
npm install
npm run dev
npm run typecheck
npm run build
```
Open `http://localhost:3000` for the landing page and `/app` for the terminal. Deploy directly to Vercel as a Next.js project; no environment variables are required for these public feeds.

## Features
- Responsive editorial landing page, generated orbital brand visual, rounded buttons and product flow.
- New and active Pump.fun-origin token discovery from multiple market data providers.
- Mint-address lookup, token search, prices, market caps, volumes, liquidity, chart history when available.
- Watchlist stored locally in the browser.
- Functional simulated long/short orders, $10,000 initial paper collateral, 1–3× exposure, position close and history in local storage.
- Empty/error/loading states, periodic refresh, readable source attribution.

## Limitations
- `Pump.fun` website listing endpoint is undocumented. This is a best-effort provider and may fail; we do not quietly display invented tokens or prices.
- DexScreener boosted lists are promotional and are **not** evidence of organic trending; the 'Active' view sorts price-covered discovery by observed 24h volume, not authoritative exchange-wide ranking.
- The demo P&L uses discrete market marks without fees, funding, margin calls, actual liquidation, slippage, or real settlement. Positions are local browser state and can be lost if storage is cleared. No account sync.
- GeckoTerminal historical candles may not be available for a new Pump.fun bonding curve or some pools. No synthetic/fake charts are shown.
- Newly created tokens may lack verifiable market price or sufficient liquidity and are discoverable but not paper-tradable until data is available.
- A regulated leveraged derivatives platform requires a separately audited price/risk/settlement system, capital, and jurisdiction-specific legal advice. Do not treat this MVP as safe real-money trading infrastructure.

## Data providers
- https://docs.pump.fun/ — official developer API covers social/wallet data, **not public live token listing**; requires approval/key (not used here).
- https://www.geckoterminal.com/dex-api — pool discovery + OHLCV.
- https://docs.dexscreener.com/api/reference — latest token boosts, pool/price lookup.
