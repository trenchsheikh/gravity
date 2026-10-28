import { NextRequest, NextResponse } from "next/server";
import { fetchJson, isMint, numeric } from "@/lib/markets";

export const runtime = "nodejs";

// Jupiter Tokens V2 provides token metadata and live prices; GeckoTerminal is only
// used for historical candles. Jupiter's firstPool.id is not a Gecko pool address.
export async function GET(req: NextRequest) {
  const mint = (req.nextUrl.searchParams.get("mint") || "").trim();
  const legacyPool = (req.nextUrl.searchParams.get("pool") || "").trim();
  if (!isMint(mint || legacyPool)) {
    return NextResponse.json({candles:[],error:"A valid Solana token mint is required."},{status:400});
  }
  try {
    let address = legacyPool;
    if (mint) {
      const pools = await fetchJson(
        `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${encodeURIComponent(mint)}/pools?page=1`,
        7500
      );
      const candidates = (Array.isArray(pools.data) ? pools.data : [])
        .filter((p: any) => p && typeof p === "object")
        .sort((a: any,b: any) => (numeric(b.attributes?.reserve_in_usd)||0)-(numeric(a.attributes?.reserve_in_usd)||0));
      const pool = candidates.find((p:any) => {
        const value = String(p.attributes?.address || (typeof p.id === "string" ? p.id.replace(/^solana_/,"") : ""));
        return isMint(value);
      });
      address = pool ? String(pool.attributes?.address || pool.id.replace(/^solana_/,"")) : "";
    }
    if (!isMint(address)) throw Error("No chart-supported liquidity pool found for this token.");
    const json = await fetchJson(
      `https://api.geckoterminal.com/api/v2/networks/solana/pools/${encodeURIComponent(address)}/ohlcv/minute?aggregate=5&limit=100`,
      7500
    );
    const candles = (json.data?.attributes?.ohlcv_list || []).map((row:unknown[])=>({
      time:numeric(row[0]),open:numeric(row[1]),high:numeric(row[2]),
      low:numeric(row[3]),close:numeric(row[4]),volume:numeric(row[5])
    })).filter((v:{time:number|null,close:number|null})=>v.time!==null && v.close!==null && v.close>0)
      .sort((a:{time:number},b:{time:number})=>a.time-b.time);
    return NextResponse.json(
      {candles,source:"GeckoTerminal",interval:"5m",poolAddress:address},
      {headers:{"Cache-Control":"public, s-maxage=25, stale-while-revalidate=25"}}
    );
  } catch {
    return NextResponse.json({candles:[],error:"Historical price data is not available for this token."},{status:503});
  }
}
