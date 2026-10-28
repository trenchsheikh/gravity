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
  source: "jupiter";
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
    liquidityUsd: numeric(item.liquidity),
    // Jupiter's firstPool.id may be the token mint, not the actual pool.
    // Historical chart route resolves the correct GeckoTerminal pool by mint.
    poolAddress: null,
    dex: "Jupiter",
    createdAt: Number.isFinite(firstPoolCreated) ? firstPoolCreated : null,
    url: `https://pump.fun/coin/${mint}`,
    source: "jupiter"
  };
}
