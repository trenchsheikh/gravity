import { NextRequest, NextResponse } from "next/server";
import { fetchJson, fromDex, fromGecko, fromPump, isMint, Market, uniqueMarkets } from "@/lib/markets";

export const runtime = "nodejs";

function ok(data: object, status = 200) {
  return NextResponse.json(data, {status, headers: {"Cache-Control":"public, s-maxage=15, stale-while-revalidate=30"}});
}

async function getDiscovery(tab: string): Promise<{markets: Market[], providers: string[]}> {
  const providers: string[] = [];
  const lists = await Promise.allSettled([
    fetchJson("https://frontend-api-v3.pump.fun/coins/latest?offset=0&limit=45&includeNsfw=false"),
    fetchJson(`https://api.geckoterminal.com/api/v2/networks/solana/${tab === "trending" ? "trending_pools" : "new_pools"}?page=1&include=base_token`, 7000),
    fetchJson(`https://api.dexscreener.com/token-boosts/${tab === "trending" ? "top" : "latest"}/v1`),
  ]);
  let results: Market[] = [];
  if (lists[0].status === "fulfilled" && Array.isArray(lists[0].value)) {
    providers.push("Pump.fun"); results.push(...lists[0].value.map(fromPump).filter(Boolean) as Market[]);
  }
  if (lists[1].status === "fulfilled") {
    providers.push("GeckoTerminal"); const json = lists[1].value;
    results.push(...(json.data || []).map((v: any) => fromGecko(v, json.included || [])).filter(Boolean));
  }
  if (lists[2].status === "fulfilled" && Array.isArray(lists[2].value)) {
    providers.push("DexScreener");
    // Boosted tokens are a discovery list, not an organic trending ranking.
    const addresses = lists[2].value.filter((v:any)=>v.chainId === "solana" && isMint(v.tokenAddress) && v.tokenAddress.toLowerCase().endsWith("pump")).slice(0, 18).map((v:any)=>v.tokenAddress);
    if (addresses.length) {
      try {
        const pairs = await fetchJson(`https://api.dexscreener.com/tokens/v1/solana/${addresses.join(",")}`);
        if (Array.isArray(pairs)) results.push(...pairs.map(fromDex).filter(Boolean) as Market[]);
      } catch {/* Other providers remain available. */}
    }
  }
  // Price-enrich freshly listed Pump.fun tokens using an independent public market feed.
  // Tokens without a covered pool stay unpriced instead of showing invented quotes.
  const latestMints = [...new Set(results.filter(m => m.source === "pump").slice(0, 30).map(m => m.mint))];
  if (latestMints.length) {
    try {
      const pairs = await fetchJson(`https://api.dexscreener.com/tokens/v1/solana/${latestMints.join(",")}`);
      if (Array.isArray(pairs)) results.push(...pairs.map(fromDex).filter(Boolean) as Market[]);
    } catch {/* Discovery still functions without a supplemental price provider. */}
  }
  results = uniqueMarkets(results);
  if (tab === "trending") results.sort((a,b)=>(b.volume24h ?? -1)-(a.volume24h ?? -1));
  else results.sort((a,b)=>(b.createdAt ?? 0)-(a.createdAt ?? 0));
  return {markets:results.slice(0, 55),providers};
}

export async function GET(request: NextRequest) {
  const tab = request.nextUrl.searchParams.get("tab") === "trending" ? "trending" : "new";
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0,90);
  try {
    if (query) {
      if (isMint(query)) {
        const [dex, gecko] = await Promise.allSettled([
          fetchJson(`https://api.dexscreener.com/token-pairs/v1/solana/${encodeURIComponent(query)}`),
          fetchJson(`https://api.geckoterminal.com/api/v2/networks/solana/tokens/${encodeURIComponent(query)}/pools?page=1`),
        ]);
        const markets: Market[] = [];
        if (dex.status === "fulfilled" && Array.isArray(dex.value)) markets.push(...dex.value.map(fromDex).filter(Boolean) as Market[]);
        if (gecko.status === "fulfilled") markets.push(...(gecko.value.data || []).map((p:any)=>fromGecko(p,gecko.value.included||[])).filter(Boolean));
        // The lookup is deliberately NOT restricted to Pump.fun origin if user pastes an address.
        const unique = uniqueMarkets(markets).filter(m=>m.mint === query).sort((a,b)=>(b.liquidityUsd||0)-(a.liquidityUsd||0));
        return ok({markets: unique.slice(0,12), providers:["DexScreener","GeckoTerminal"], query});
      }
      const dex = await fetchJson(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
      const markets = uniqueMarkets((dex.pairs || []).map(fromDex).filter(Boolean) as Market[])
        .filter(m=>m.mint.toLowerCase().endsWith("pump") || /pump/i.test(m.dex)).slice(0,30);
      return ok({markets, providers:["DexScreener"],query});
    }
    const {markets, providers} = await getDiscovery(tab);
    if (!providers.length) return ok({markets:[], providers:[],error:"Market data providers are temporarily unavailable. Retry shortly."},503);
    return ok({markets, providers,updatedAt:Date.now(),tab});
  } catch {
    return ok({markets:[],providers:[],error:"Live market data unavailable. Please retry."},503);
  }
}
