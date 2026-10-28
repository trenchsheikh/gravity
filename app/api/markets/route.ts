import { NextRequest, NextResponse } from "next/server";
import { fromJupiter, isMint, Market } from "@/lib/markets";

export const runtime = "nodejs";
const BASE = "https://api.jup.ag/tokens/v2";
const KEY = process.env.JUPITER_API_KEY?.trim();

function response(data: object, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {"Cache-Control": status === 200 ? "public, s-maxage=30, stale-while-revalidate=45" : "no-store"}
  });
}

async function jupiter(path: string): Promise<unknown[]> {
  const res = await fetch(BASE + path, {
    headers: {Accept: "application/json", ...(KEY ? {"x-api-key": KEY} : {})},
    next: {revalidate: 30},
    signal: AbortSignal.timeout(8500)
  });
  if (!res.ok) {
    const reason = (res.status === 401 || res.status === 403)
      ? "Jupiter requires a valid API key. Configure JUPITER_API_KEY in Vercel."
      : res.status === 429
      ? "Jupiter's request limit was reached. Configure a Jupiter API key or retry shortly."
      : "Jupiter token feed is temporarily unavailable.";
    throw new Error(reason);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("Unexpected Jupiter token response.");
  return data;
}

function normalize(data: unknown[], onlyPump: boolean): Market[] {
  const found = new Map<string, Market>();
  for (const token of data) {
    if (!token || typeof token !== "object") continue;
    const item = fromJupiter(token as Record<string, unknown>);
    if (!item) continue;
    // Without a reliable origin field in Jupiter V2, use the typical pump-suffix for discovery.
    // Exact mint lookups still support tokens on any Solana launch venue.
    if (onlyPump && !item.mint.toLowerCase().endsWith("pump")) continue;
    if (!found.has(item.mint)) found.set(item.mint,item);
  }
  return [...found.values()];
}

export async function GET(request: NextRequest) {
  const tab = request.nextUrl.searchParams.get("tab") === "trending" ? "trending" : "new";
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 90);
  try {
    if (query) {
      const result = normalize(await jupiter("/search?query=" + encodeURIComponent(query)), !isMint(query));
      const markets = isMint(query) ? result.filter(m => m.mint === query) : result;
      return response({markets: markets.slice(0,30), providers: ["Jupiter Tokens V2"], query, updatedAt: Date.now()});
    }
    const endpoint = tab === "new" ? "/recent" : "/toptrending/1h?limit=100";
    const result = normalize(await jupiter(endpoint),true);
    if (tab === "new") result.sort((a,b)=>(b.createdAt || 0)-(a.createdAt || 0));
    else result.sort((a,b)=>(b.volume24h || 0)-(a.volume24h || 0));
    return response({markets:result.slice(0,80),providers:["Jupiter Tokens V2"],updatedAt:Date.now(),tab});
  } catch (err) {
    const message = err instanceof Error ? err.message : "Jupiter token data unavailable.";
    return response({markets:[],providers:["Jupiter Tokens V2"],error:message},503);
  }
}
