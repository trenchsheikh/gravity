import { NextRequest, NextResponse } from "next/server";
import { fetchJson, isMint, numeric } from "@/lib/markets";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const pool = (req.nextUrl.searchParams.get("pool") || "").trim();
  if (!isMint(pool)) return NextResponse.json({error:"Invalid pool address",candles:[]},{status:400});
  try {
    const json = await fetchJson(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${encodeURIComponent(pool)}/ohlcv/minute?aggregate=5&limit=100`,7500);
    const candles = (json.data?.attributes?.ohlcv_list || []).map((row:unknown[])=>({
      time:numeric(row[0]), open:numeric(row[1]),high:numeric(row[2]),low:numeric(row[3]),close:numeric(row[4]),volume:numeric(row[5]),
    })).filter((v:{time:number|null,close:number|null})=>v.time!==null && v.close!==null && v.close>0).sort((a:{time:number},b:{time:number})=>a.time-b.time);
    return NextResponse.json({candles,source:"GeckoTerminal",interval:"5m"},{headers:{"Cache-Control":"public, s-maxage=25, stale-while-revalidate=25"}});
  } catch {
    return NextResponse.json({candles:[],error:"Historical candles unavailable for this pool."},{status:503});
  }
}
