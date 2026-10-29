import { NextRequest, NextResponse } from "next/server";
import { fromJupiter, isMint, Market, numeric } from "@/lib/markets";

export const runtime = "nodejs";
export const maxDuration = 20;

const JUPITER = "https://api.jup.ag/tokens/v2";
const STONK = "https://www.stonkfun.xyz/api/public/v1";
const KEY = process.env.JUPITER_API_KEY?.trim();

function response(data:object,status=200){
  return NextResponse.json(data,{status,headers:{
    "Cache-Control":status===200?"public, s-maxage=20, stale-while-revalidate=40":"no-store"
  }});
}
async function jupiter(path:string):Promise<unknown[]>{
  const res=await fetch(JUPITER+path,{
    headers:{Accept:"application/json",...(KEY?{"x-api-key":KEY}:{})},
    next:{revalidate:20},signal:AbortSignal.timeout(8500)
  });
  if(!res.ok)throw Error(res.status===429?"Market data is busy. Retry shortly.":res.status===401||res.status===403?"Market prices are temporarily unavailable.":"Market prices are temporarily unavailable.");
  const data:unknown=await res.json();
  if(!Array.isArray(data))throw Error("Unexpected market data format");
  return data;
}
function normalizeJupiter(data:unknown[],onlyPump:boolean):Market[]{
  const seen=new Map<string,Market>();
  for(const row of data){
    if(!row||typeof row!=="object")continue;
    const token=fromJupiter(row as Record<string,unknown>);
    if(!token)continue;
    if(onlyPump&&!token.mint.toLowerCase().endsWith("pump"))continue;
    seen.set(token.mint,token);
  }
  return [...seen.values()];
}
type RecordAny=Record<string,unknown>;
function asObj(v:unknown):RecordAny {return v&&typeof v==="object"&&!Array.isArray(v)?v as RecordAny:{}}
function str(v:unknown):string{return typeof v==="string"?v.trim():""}
function safeIcon(v:unknown):string|null{
  if(typeof v!=="string"||v.length>1600)return null;
  try {const url=new URL(v);return url.protocol==="https:"?v:null}catch{return null}
}
type StonkPair={mint:string;name:string;symbol:string;image:string|null;price:number|null;category:string};
async function stockRegistry():Promise<StonkPair[]>{
  const url=STONK+"/pairs?category=xstock";
  const r=await fetch(url,{next:{revalidate:300},signal:AbortSignal.timeout(8500),headers:{Accept:"application/json"}});
  if(!r.ok)throw Error("Stock-token list is temporarily unavailable (HTTP "+r.status+").");
  const raw:unknown=await r.json();
  const root=asObj(raw),data=asObj(root.data);
  const rows=Array.isArray(data.pairs)?data.pairs:Array.isArray(root.pairs)?root.pairs:Array.isArray(raw)?raw:[];
  if(!rows.length)throw Error("No stock tokens are available right now.");
  const found=new Map<string,StonkPair>();
  for(const item of rows){
    const entry=asObj(item),quote=asObj(entry.quote),token=asObj(entry.token);
    const mint=str(entry.mint)||str(entry.quoteMint)||str(entry.address)||str(quote.mint)||str(token.mint);
    if(!isMint(mint))continue;
    const category=(str(entry.category)||str(quote.category)||"xstock").toLowerCase();
    if(!["xstock","xstocks","stock","stocks","etf"].includes(category))continue;
    const symbol=str(entry.symbol)||str(quote.symbol)||str(token.symbol)||mint.slice(0,5);
    const name=str(entry.name)||str(quote.name)||str(token.name)||symbol;
    const market=asObj(entry.market),price=asObj(entry.price);
    const value=numeric(entry.priceUsd)??numeric(entry.usdPrice)??numeric(market.priceUsd)??numeric(price.usd);
    found.set(mint,{mint,symbol:symbol.slice(0,24),name:name.slice(0,90),image:safeIcon(entry.logo)||safeIcon(entry.icon)||safeIcon(entry.logoURI)||safeIcon(quote.logo)||safeIcon(token.logo),price:value,category});
  }
  if(!found.size)throw Error("No matching stock-token addresses were returned.");
  return [...found.values()].slice(0,100);
}
async function stockMarkets(query:string):Promise<Market[]>{
  const pairs=await stockRegistry();
  const filtered=query&&!isMint(query)?pairs.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())||p.symbol.toLowerCase().includes(query.toLowerCase())):pairs;
  const wanted=isMint(query)?filtered.filter(p=>p.mint===query):filtered;
  if(!wanted.length)return [];
  let enriched:Market[]=[];
  try{
    enriched=normalizeJupiter(await jupiter("/search?query="+encodeURIComponent(wanted.map(p=>p.mint).join(","))),false);
  }catch{
    // The verified Stonk mint list remains usable when Jupiter's price feed is unavailable.
  }
  const byMint=new Map(enriched.map(token=>[token.mint,token]));
  return wanted.map(pair=>{
    const match=byMint.get(pair.mint);
    if(match)return {...match,category:"stock" as const,venue:"StonkFun",name:match.name||pair.name,symbol:match.symbol||pair.symbol,image:match.image||pair.image,url:"https://www.stonkfun.xyz/"};
    return {
      mint:pair.mint,name:pair.name,symbol:pair.symbol,image:pair.image,priceUsd:pair.price,
      change24h:null,marketCap:null,volume24h:null,liquidityUsd:null,poolAddress:null,
      dex:"StonkFun",createdAt:null,url:"https://www.stonkfun.xyz/",source:"stonk" as const,
      change5m:null,change1h:null,change6h:null,volume5m:null,volume1h:null,volume6h:null,
      buys24h:null,sells24h:null,holderCount:null,organicScore:null,isVerified:false,isSuspicious:false,
      category:"stock" as const,venue:"StonkFun"
    };
  });
}
export async function GET(request:NextRequest){
  const params=request.nextUrl.searchParams;
  const tab=params.get("tab")==="trending"?"trending":"new";
  const query=(params.get("q")||"").trim().slice(0,90);
  const market=params.get("market")==="stocks"?"stocks":"memes";
  const requested=params.get("window");
  const window=requested&&["5m","1h","6h","24h"].includes(requested)?requested:"1h";
  try {
    if(market==="stocks"){
      const list=await stockMarkets(query);
      if(tab==="trending")list.sort((a,b)=>(b.marketCap??-1)-(a.marketCap??-1));
      else list.sort((a,b)=>a.symbol.localeCompare(b.symbol));
      return response({markets:list.slice(0,100),updatedAt:Date.now(),market,tab,window});
    }
    if(query){
      const listed=normalizeJupiter(await jupiter("/search?query="+encodeURIComponent(query)),!isMint(query));
      return response({markets:(isMint(query)?listed.filter(m=>m.mint===query):listed).slice(0,30),
        updatedAt:Date.now(),market,query});
    }
    const endpoint=tab==="new"?"/recent":"/toptrending/"+window+"?limit=100";
    const listed=normalizeJupiter(await jupiter(endpoint),true);
    if(tab==="new")listed.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    else listed.sort((a,b)=>(b.volume24h||0)-(a.volume24h||0));
    return response({markets:listed.slice(0,80),updatedAt:Date.now(),market,tab,window});
  }catch(error){
    const message=error instanceof Error?error.message:"Market data temporarily unavailable.";
    return response({markets:[],error:message,market},503);
  }
}
