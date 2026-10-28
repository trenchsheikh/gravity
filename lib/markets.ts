export type Market = {
  mint: string;
  name: string;
  symbol: string;
  image: string | null;
  priceUsd: number | null;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  poolAddress: string | null;
  dex: string;
  createdAt: number | null;
  url: string;
  source: "pump" | "gecko" | "dex";
};

export const isMint = (value: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());
export const numeric = (x: unknown): number | null => {
  if (x === null || x === undefined || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

const isSafeImage = (url: unknown): url is string => typeof url === "string" && /^https:\/\//i.test(url);
const shorten = (v: string) => `${v.slice(0, 4)}…${v.slice(-4)}`;

export function fromPump(item: Record<string, unknown>): Market | null {
  const mint = String(item.mint ?? "");
  if (!isMint(mint)) return null;
  return {
    mint, name: String(item.name || shorten(mint)).slice(0, 80),
    symbol: String(item.symbol || "???").slice(0, 20),
    image: isSafeImage(item.image_uri) ? item.image_uri : null,
    priceUsd: null, // Never infer price from token market cap / assumed supply.
    change24h: null, marketCap: numeric(item.usd_market_cap), volume24h: null,
    liquidityUsd: null, poolAddress: null, dex: "Pump.fun",
    createdAt: numeric(item.created_timestamp),
    url: `https://pump.fun/coin/${mint}`, source: "pump",
  };
}

type GeckoResource = { id: string; type: string; attributes?: Record<string, any>; relationships?: Record<string, any> };
export function fromGecko(item: GeckoResource, included: GeckoResource[]): Market | null {
  const attr = item.attributes || {};
  const baseId = item.relationships?.base_token?.data?.id as string | undefined;
  const base = included.find(x => x.id === baseId);
  const mint = baseId?.startsWith("solana_") ? baseId.slice(7) : "";
  if (!isMint(mint)) return null;
  const dexId = String(item.relationships?.dex?.data?.id || "");
  // New pool discovery is restricted to Pump.fun-origin markets.
  if (!mint.toLowerCase().endsWith("pump") && !/pump/i.test(dexId)) return null;
  const baseName = String(base?.attributes?.name || attr.name?.split(" /")[0] || shorten(mint));
  return {
    mint, name: baseName.slice(0, 80), symbol: String(base?.attributes?.symbol || baseName).slice(0, 20),
    image: isSafeImage(base?.attributes?.image_url) ? base!.attributes!.image_url : null,
    priceUsd: numeric(attr.base_token_price_usd), change24h: numeric(attr.price_change_percentage?.h24),
    marketCap: numeric(attr.market_cap_usd) ?? numeric(attr.fdv_usd),
    volume24h: numeric(attr.volume_usd?.h24), liquidityUsd: numeric(attr.reserve_in_usd),
    poolAddress: item.id.startsWith("solana_") ? item.id.slice(7) : null,
    dex: dexId.replace(/^solana_/, "") || "Pump market",
    createdAt: attr.pool_created_at ? Date.parse(String(attr.pool_created_at)) : null,
    url: `https://pump.fun/coin/${mint}`, source: "gecko",
  };
}

export function fromDex(pair: Record<string, any>): Market | null {
  const mint = String(pair.baseToken?.address || "");
  if (pair.chainId !== "solana" || !isMint(mint)) return null;
  return {
    mint, name: String(pair.baseToken?.name || shorten(mint)).slice(0,80),
    symbol: String(pair.baseToken?.symbol || "???").slice(0,20),
    image: isSafeImage(pair.info?.imageUrl) ? pair.info.imageUrl : null,
    priceUsd: numeric(pair.priceUsd), change24h: numeric(pair.priceChange?.h24),
    marketCap: numeric(pair.marketCap) ?? numeric(pair.fdv),
    volume24h: numeric(pair.volume?.h24), liquidityUsd: numeric(pair.liquidity?.usd),
    poolAddress: typeof pair.pairAddress === "string" ? pair.pairAddress : null,
    dex: String(pair.dexId || "DEX"), createdAt: numeric(pair.pairCreatedAt),
    url: `https://pump.fun/coin/${mint}`, source: "dex",
  };
}

export async function fetchJson(url: string, timeout = 6500): Promise<any> {
  const response = await fetch(url, {next: {revalidate: 20}, signal: AbortSignal.timeout(timeout), headers: {"Accept": "application/json", "User-Agent":"GravityPaperTerminal/1.0"}});
  if (!response.ok) throw new Error(`Data provider HTTP ${response.status}`);
  return response.json();
}

export function uniqueMarkets(markets: Market[]): Market[] {
  const map = new Map<string, Market>();
  for (const m of markets) {
    const old = map.get(m.mint);
    if (!old || ((m.priceUsd !== null ? 4 : 0) + (m.liquidityUsd || 0)/100000) > ((old.priceUsd !== null ? 4 : 0) + (old.liquidityUsd || 0)/100000)) map.set(m.mint, m);
  }
  return [...map.values()];
}
