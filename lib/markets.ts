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
  source: "jupiter" | "stonk";
  category?: "meme" | "stock";
  venue?: string;
  change5m: number | null;
  change1h: number | null;
  change6h: number | null;
  volume5m: number | null;
  volume1h: number | null;
  volume6h: number | null;
  buys24h: number | null;
  sells24h: number | null;
  holderCount: number | null;
  organicScore: number | null;
  isVerified: boolean;
  isSuspicious: boolean;
};

export const isMint = (value: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());

export function numeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export async function fetchJson(url: string, timeout = 6500): Promise<any> {
  const response = await fetch(url, {
    next: {revalidate: 25},
    signal: AbortSignal.timeout(timeout),
    headers: {Accept: "application/json", "User-Agent": "GravityPaperTerminal/1.1"}
  });
  if (!response.ok) throw Error(`Historical chart provider HTTP ${response.status}`);
  return response.json();
}

export function fromJupiter(item: Record<string, unknown>): Market | null {
  const mint = typeof item.id === "string" ? item.id : "";
  if (!isMint(mint)) return null;
  const stats = item.stats24h && typeof item.stats24h === "object"
    ? item.stats24h as Record<string,unknown> : {};
  const firstPool = item.firstPool && typeof item.firstPool === "object"
    ? item.firstPool as Record<string,unknown> : {};
  const volumeA = numeric(stats.buyVolume), volumeB = numeric(stats.sellVolume);
  const firstPoolCreated = typeof firstPool.createdAt === "string"
    ? Date.parse(firstPool.createdAt) : NaN;
  return {
    mint,
    name: String(item.name || (mint.slice(0,4)+"…"+mint.slice(-4))).slice(0,80),
    symbol: String(item.symbol || "???").slice(0,20),
    image: typeof item.icon === "string" && /^https:\/\//i.test(item.icon) ? item.icon : null,
    priceUsd: numeric(item.usdPrice),
    change24h: numeric(stats.priceChange),
    marketCap: numeric(item.mcap) ?? numeric(item.fdv),
    volume24h: volumeA !== null || volumeB !== null ? (volumeA || 0) + (volumeB || 0) : null,
    change5m: numeric((item.stats5m as Record<string,unknown> | undefined)?.priceChange),
    change1h: numeric((item.stats1h as Record<string,unknown> | undefined)?.priceChange),
    change6h: numeric((item.stats6h as Record<string,unknown> | undefined)?.priceChange),
    volume5m: numeric((item.stats5m as Record<string,unknown> | undefined)?.buyVolume) !== null || numeric((item.stats5m as Record<string,unknown> | undefined)?.sellVolume) !== null
      ? (numeric((item.stats5m as Record<string,unknown> | undefined)?.buyVolume)||0)+(numeric((item.stats5m as Record<string,unknown> | undefined)?.sellVolume)||0) : null,
    volume1h: numeric((item.stats1h as Record<string,unknown> | undefined)?.buyVolume) !== null || numeric((item.stats1h as Record<string,unknown> | undefined)?.sellVolume) !== null
      ? (numeric((item.stats1h as Record<string,unknown> | undefined)?.buyVolume)||0)+(numeric((item.stats1h as Record<string,unknown> | undefined)?.sellVolume)||0) : null,
    volume6h: numeric((item.stats6h as Record<string,unknown> | undefined)?.buyVolume) !== null || numeric((item.stats6h as Record<string,unknown> | undefined)?.sellVolume) !== null
      ? (numeric((item.stats6h as Record<string,unknown> | undefined)?.buyVolume)||0)+(numeric((item.stats6h as Record<string,unknown> | undefined)?.sellVolume)||0) : null,
    buys24h: numeric(stats.numBuys),
    sells24h: numeric(stats.numSells),
    holderCount: numeric(item.holderCount),
    organicScore: numeric(item.organicScore),
    isVerified: item.isVerified === true,
    isSuspicious: (item.audit as Record<string,unknown> | undefined)?.isSus === true,
    liquidityUsd: numeric(item.liquidity),
    // Jupiter's firstPool.id may be the token mint, not the actual pool.
    // Historical chart route resolves the correct GeckoTerminal pool by mint.
    poolAddress: null,
    dex: "Jupiter",
    createdAt: Number.isFinite(firstPoolCreated) ? firstPoolCreated : null,
    url: `https://pump.fun/coin/${mint}`,
    source: "jupiter",
    category: "meme"
  };
}
