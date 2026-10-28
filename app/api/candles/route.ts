import { NextRequest, NextResponse } from "next/server";
import { isMint } from "@/lib/markets";

export const runtime = "nodejs";
export const maxDuration = 20;

export type PriceCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const OPTIONS = {
  "1m":  { birdeye: "1m", gecko: "minute", aggregate: 1,  seconds: 60,    count: 260 },
  "5m":  { birdeye: "5m", gecko: "minute", aggregate: 5,  seconds: 300,   count: 260 },
  "15m": { birdeye: "15m",gecko: "minute", aggregate: 15, seconds: 900,   count: 260 },
  "1H":  { birdeye: "1H", gecko: "hour",   aggregate: 1,  seconds: 3600,  count: 260 },
  "4H":  { birdeye: "4H", gecko: "hour",   aggregate: 4,  seconds: 14400, count: 260 },
  "1D":  { birdeye: "1D", gecko: "day",    aggregate: 1,  seconds: 86400, count: 200 },
} as const;
type Interval = keyof typeof OPTIONS;
type UnknownRecord = Record<string, unknown>;

function number(value: unknown): number | null {
  if(value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function normalize(items: unknown): PriceCandle[] {
  if(!Array.isArray(items)) return [];
  const sorted = new Map<number, PriceCandle>();
  for(const row of items) {
    let t:number|null, o:number|null, h:number|null, l:number|null, c:number|null, v:number|null;
    if(Array.isArray(row)) {
      [t,o,h,l,c,v]=[number(row[0]),number(row[1]),number(row[2]),number(row[3]),number(row[4]),number(row[5])];
    } else if(row && typeof row === "object") {
      const obj = row as UnknownRecord;
      t=number(obj.unix_time ?? obj.unixTime ?? obj.time);
      o=number(obj.o ?? obj.open); h=number(obj.h ?? obj.high);
      l=number(obj.l ?? obj.low); c=number(obj.c ?? obj.close);
      v=number(obj.v_usd ?? obj.v ?? obj.volume) ?? 0;
    } else continue;
    if(t === null || o === null || h === null || l === null || c === null) continue;
    if(t>1e12) t=Math.floor(t/1000);
    t=Math.floor(t);
    if(t<=0 || ![o,h,l,c].every(x=>Number.isFinite(x)&&x>0)) continue;
    if(h<Math.max(o,c) || l>Math.min(o,c) || l>h) continue;
    sorted.set(t,{time:t,open:o,high:h,low:l,close:c,volume:Math.max(0,v??0)});
  }
  return [...sorted.values()].sort((a,b)=>a.time-b.time);
}
async function apiJson(url:string,headers:Record<string,string>):Promise<UnknownRecord> {
  const response=await fetch(url,{
    headers:{Accept:"application/json",...headers},
    next:{revalidate:10},
    signal:AbortSignal.timeout(6500)
  });
  if(!response.ok) throw new Error("HTTP "+response.status);
  const body:unknown=await response.json();
  if(!body || typeof body!=="object") throw new Error("Invalid data");
  return body as UnknownRecord;
}
async function birdeye(mint:string,interval:Interval):Promise<PriceCandle[]> {
  const key=process.env.BIRDEYE_API_KEY?.trim();
  if(!key) return [];
  const {birdeye:type,seconds,count}=OPTIONS[interval];
  const now=Math.floor(Date.now()/1000);
  // Widen short-token history slightly, so first requests don't omit early launches.
  const from=now-seconds*(count+4);
  const params=new URLSearchParams({
    address:mint,type,currency:"usd",time_from:String(from),
    time_to:String(now+seconds),mode:"range",padding:"false"
  });
  const headers={"X-API-KEY":key,"x-chain":"solana"};
  try {
    const v3=await apiJson("https://public-api.birdeye.so/defi/v3/ohlcv?"+params,headers);
    const records=(v3.data as UnknownRecord|undefined)?.items;
    const candles=normalize(records);
    if(candles.length) return candles.slice(-500);
  } catch {}
  // Birdeye older endpoint can cover tokens unavailable from the V3 plan.
  try {
    const legacy=new URLSearchParams({address:mint,type,time_from:String(from),time_to:String(now+seconds)});
    const v1=await apiJson("https://public-api.birdeye.so/defi/ohlcv?"+legacy,headers);
    return normalize((v1.data as UnknownRecord|undefined)?.items).slice(-500);
  } catch {return []}
}
async function gecko(mint:string,interval:Interval):Promise<PriceCandle[]> {
  const settings=OPTIONS[interval];
  const pools=await apiJson(
    "https://api.geckoterminal.com/api/v2/networks/solana/tokens/"+encodeURIComponent(mint)+"/pools?page=1",
    {}
  );
  const candidates=Array.isArray(pools.data)?pools.data:[];
  const sorted=[...candidates].filter(x=>x&&typeof x==="object").sort((a,b)=>{
    const first=(a as UnknownRecord).attributes as UnknownRecord|undefined;
    const second=(b as UnknownRecord).attributes as UnknownRecord|undefined;
    return (number(second?.reserve_in_usd)||0)-(number(first?.reserve_in_usd)||0);
  }).slice(0,3);
  for(const candidate of sorted) {
    const record=candidate as UnknownRecord;
    const attrs=record.attributes as UnknownRecord|undefined;
    const pool=String(attrs?.address || (typeof record.id==="string" ? record.id.replace(/^solana_/,"") : ""));
    if(!isMint(pool))continue;
    try {
      const params=new URLSearchParams({
        aggregate:String(settings.aggregate),
        limit:String(Math.min(settings.count,1000)),
        currency:"usd"
      });
      const result=await apiJson(
        "https://api.geckoterminal.com/api/v2/networks/solana/pools/"+encodeURIComponent(pool)+"/ohlcv/"+settings.gecko+"?"+params,
        {}
      );
      const raw=(result.data as UnknownRecord|undefined)?.attributes as UnknownRecord|undefined;
      const candles=normalize(raw?.ohlcv_list);
      if(candles.length) return candles;
    } catch {}
  }
  return [];
}
function json(data:UnknownRecord,status=200){
  return NextResponse.json(data,{status,headers:{"Cache-Control":status===200?"public, s-maxage=10, stale-while-revalidate=20":"public, s-maxage=12"}});
}
export async function GET(req:NextRequest) {
  const mint=(req.nextUrl.searchParams.get("mint")||"").trim();
  if(!isMint(mint)) return json({candles:[],error:"Invalid Solana token address"},400);
  const raw=req.nextUrl.searchParams.get("interval")||"1m";
  const interval:Interval=Object.prototype.hasOwnProperty.call(OPTIONS,raw) ? raw as Interval : "1m";
  try {
    const candles=await birdeye(mint,interval);
    if(candles.length>=1) return json({candles,source:"Birdeye",interval,updatedAt:Date.now(),marketAvailable:true});
    const fallback=await gecko(mint,interval);
    if(fallback.length>=1) return json({candles:fallback,source:"GeckoTerminal",interval,updatedAt:Date.now(),marketAvailable:true});
    return json({
      candles:[],source:"none",interval,marketAvailable:false,updatedAt:Date.now(),
      error:"No real historical trades or candles are available from Birdeye or the fallback provider for this token and interval. Try 1m or another timeframe."
    });
  } catch {
    return json({
      candles:[],source:"none",interval,marketAvailable:false,updatedAt:Date.now(),
      error:"Historical market data is temporarily unavailable. Please retry."
    },503);
  }
}
