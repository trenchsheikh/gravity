"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type {OhlcvCandle} from "@/components/MarketCandlestickChart";
const MarketCandlestickChart=dynamic(()=>import("@/components/MarketCandlestickChart"),{ssr:false});
import { Activity, ArrowDownLeft, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, Clock3, Compass, ExternalLink, LoaderCircle, Menu, RefreshCw, Search, ShieldCheck, Star, TrendingDown, TrendingUp, Wallet, X, BookOpen } from "lucide-react";
import Brand from "@/components/Brand";
import SolanaWalletButton from "@/components/SolanaWalletButton";
import type { Market } from "@/lib/markets";

type Candle=OhlcvCandle;
type ChartInterval="1m"|"5m"|"15m"|"1H"|"4H"|"1D";
const INTERVALS:ChartInterval[]=["1m","5m","15m","1H","4H","1D"];
const candleCache=new Map<string,{candles:Candle[];source:string;updated:number}>();
function dollar(n:number|null|undefined,compact=false){
  if(n==null || !Number.isFinite(n)) return "N/A";
  if(compact) return "$"+new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(n);
  if(n===0) return "$0.00";
  if(Math.abs(n)<0.0001) return "$"+n.toPrecision(3);
  if(Math.abs(n)<1) return "$"+n.toFixed(5);
  return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
}
function change(n:number|null|undefined){return n==null ? "N/A" : `${n>0?"+":""}${n.toFixed(2)}%`}
function relative(t:number|null){if(!t)return "N/A";let ms=Date.now()-t;if(ms<0)return "just now";if(ms<3600000)return `${Math.floor(ms/60000)}m`;if(ms<86400000)return `${Math.floor(ms/3600000)}h`;return `${Math.floor(ms/86400000)}d`}
// Cache broken original URLs so refreshes never restart the same failed image.
const failedTokenImages=new Set<string>();
const logoFallbacks=new Map<string,string>();
function TokenIcon({market,size=37}:{market:Pick<Market,"mint"|"image"|"symbol">,size?:number}){
  const mint=market.mint;
  const direct=market.image&&market.image.startsWith("https://")?market.image:null;
  const proxy="/api/token-image?mint="+encodeURIComponent(mint)+(direct?"&src="+encodeURIComponent(direct):"");
  const [broken,setBroken]=useState<Set<string>>(()=>new Set());
  const [rendered,setRendered]=useState<string|null>(null);
  const hue=Array.from(mint).reduce((sum,ch)=>(sum*31+ch.charCodeAt(0))%360,0);
  const initials=(market.symbol||"?").replace(/[^A-Za-z0-9]/g,"").slice(0,2).toUpperCase()||"?";
  const candidate=direct&&!failedTokenImages.has(direct)&&!broken.has(direct)?direct:proxy;
  const display=logoFallbacks.has(mint)?null:candidate;
  return <span className="token-icon gravity-token-avatar" style={{width:size,height:size,background:`linear-gradient(135deg,hsl(${hue} 40% 28%),hsl(${(hue+35)%360} 48% 17%))`}}>
    <span className="gravity-token-letters" aria-hidden="true">{initials}</span>
    {display?<img key={display} src={display} alt={market.symbol+" logo"} loading="eager" decoding="async"
      style={{opacity:rendered===display?1:0}}
      onLoad={()=>setRendered(display)}
      onError={()=>{
        if(display===direct){failedTokenImages.add(display);setBroken(previous=>new Set(previous).add(display));}
        else{logoFallbacks.set(mint,initials);setBroken(previous=>new Set(previous).add(proxy));}
        setRendered(null);
      }}/>:null}
  </span>;
}
function PriceChart({candles,loading,empty}: {candles:Candle[];loading:boolean;empty:string}){
  if(loading&&!candles.length)return <div className="chart-empty"><LoaderCircle className="spin" size={23}/><span>Loading real market candles</span></div>;
  if(!candles.length)return <div className="chart-empty"><Activity size={22}/><span>{empty||"No recorded market candles are available yet."}</span><small>Only real market data is displayed. Try another interval or token.</small></div>;
  return <div className="chart-live gravity-interactive-chart"><MarketCandlestickChart candles={candles}/>{loading&&<span className="gravity-chart-refresh"><LoaderCircle className="spin" size={12}/> Updating</span>}</div>;
}

function SolanaGlyph({size=19}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 26 25" aria-label="Solana network" role="img" fill="none">
    <defs><linearGradient id="sol-gradient" x1="0" x2="26" y1="24" y2="0"><stop stopColor="#725dff"/><stop offset=".52" stopColor="#64a0ff"/><stop offset="1" stopColor="#19f5bb"/></linearGradient></defs>
    <path d="M5 3h19l-4 4H1l4-4Zm-4 7h19l4 4H5l-4-4Zm4 7h19l-4 4H1l4-4Z" fill="url(#sol-gradient)"/>
  </svg>;
}
function compactNum(n:number|null|undefined){if(n===null||n===undefined||!Number.isFinite(n))return "N/A";return Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(n)}
function windowChange(m:Market,window:"5m"|"1h"|"6h"|"24h"){return window==="5m"?m.change5m:window==="1h"?m.change1h:window==="6h"?m.change6h:m.change24h}
function windowVolume(m:Market,window:"5m"|"1h"|"6h"|"24h"){return window==="5m"?m.volume5m:window==="1h"?m.volume1h:window==="6h"?m.volume6h:m.volume24h}

export default function Terminal(){
  const [tab,setTab]=useState<"new"|"trending">("trending");
  const [marketType,setMarketType]=useState<"memes"|"stocks">("memes");
  const [windowSize,setWindowSize]=useState<"5m"|"1h"|"6h"|"24h">("1h");
  const [sortBy,setSortBy]=useState<"cap"|"liquidity"|"volume"|"change">("cap");
  const [tradeOpen,setTradeOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [markets,setMarkets]=useState<Market[]>([]);
  const [shownFeedKey,setShownFeedKey]=useState("memes:trending:1h:");
  const [fetching,setFetching]=useState(false);
  const requestSerial=useRef(0);
  const listScroll=useRef({top:0,left:0,listTop:0});
  const [catalog,setCatalog]=useState<Market[]>([]);
  const [selected,setSelected]=useState<Market|null>(null);
  const [loading,setLoading]=useState(true);
  const [selectedLastUpdated,setSelectedLastUpdated]=useState<number|null>(null);
  const [cacheTime,setCacheTime]=useState<number|null>(null);
  const [cacheNotice,setCacheNotice]=useState("");
  const [pageVisible,setPageVisible]=useState(true);
  const [error,setError]=useState("");
  const [refreshed,setRefreshed]=useState<number|null>(null);
  const [tick,setTick]=useState(0);
  const [side,setSide]=useState<"long"|"short">("long");
  const [walletAddress,setWalletAddress]=useState<string|null>(null);
  const [prices,setPrices]=useState<Record<string,number>>({});
  const [toast,setToast]=useState("");
  const [candles,setCandles]=useState<Candle[]>([]);
  const [chartKey,setChartKey]=useState("");
  const [chartInterval,setChartInterval]=useState<ChartInterval>("1m");
  const [candlesLoading,setCandlesLoading]=useState(false);
  const [chartMessage,setChartMessage]=useState("Historical market data isn't available for this token yet.");
  const [watchlist,setWatchlist]=useState<string[]>([]);
  const [watchOnly,setWatchOnly]=useState(false);
  const [detailTab,setDetailTab]=useState<"overview"|"info">("overview");

  useEffect(()=>{try{const v=JSON.parse(localStorage.getItem("gravity.watchlist.v1")||"[]");if(Array.isArray(v))setWatchlist(v.filter(x=>typeof x==="string"));}catch{}
    try{const tokens=JSON.parse(localStorage.getItem("gravity.token.catalog.v1")||"[]");if(Array.isArray(tokens))setCatalog(tokens.filter((m:Market)=>m&&typeof m.mint==="string").slice(0,280));}catch{}
  },[]);

  useEffect(()=>{
    const onVisibility=()=>setPageVisible(document.visibilityState==="visible");
    onVisibility();
    document.addEventListener("visibilitychange",onVisibility);
    return()=>document.removeEventListener("visibilitychange",onVisibility);
  },[]);
  const activeFeedKey=marketType+":"+tab+":"+windowSize+":"+query.trim().toLowerCase();
  useEffect(()=>{
    let saved:null|{markets:Market[];time:number}=null;
    try{
      const cache=JSON.parse(localStorage.getItem("gravity.market.cache.v2")||"{}");
      const item=cache[marketType+":"+tab+":"+windowSize];
      if(!query.trim()&&item&&Array.isArray(item.markets)&&Date.now()-item.time<6*3600000)saved=item;
    }catch{}
    setMarkets(saved?.markets||[]);
    setShownFeedKey(saved?activeFeedKey:"");
    setCacheTime(saved?.time||null);setRefreshed(saved?.time||null);
    setCacheNotice("");
    setLoading(!saved);setError("");
  },[activeFeedKey,marketType,tab,windowSize,query]);
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(""),4500);return()=>clearTimeout(id)},[toast]);
  const fetchMarkets=useCallback(async(signal:AbortSignal)=>{
    const serial=++requestSerial.current;
    const current=()=>!signal.aborted&&serial===requestSerial.current;
    setFetching(true);
    try {
      const params=new URLSearchParams({tab,window:windowSize,market:marketType});if(query.trim())params.set("q",query.trim());
      const r=await fetch(`/api/markets?${params}`,{signal,cache:"no-store"});const data=await r.json();if(!current())return;
      if(!r.ok)throw Error(data.error||"Market feed temporarily unavailable");
      const list=(data.markets||[]) as Market[];
      setMarkets(list);setShownFeedKey(activeFeedKey);setRefreshed(Date.now());setCacheTime(Date.now());setCacheNotice("");setError("");
      if(!query.trim())try{
        const oldCatalog=JSON.parse(localStorage.getItem("gravity.token.catalog.v1")||"[]") as Market[];
        const seen=new Map<string,Market>();
        for(const m of list)if(m?.mint)seen.set(m.mint,m);
        for(const m of oldCatalog)if(m?.mint&&!seen.has(m.mint))seen.set(m.mint,m);
        const recent=[...seen.values()].slice(0,280);
        localStorage.setItem("gravity.token.catalog.v1",JSON.stringify(recent));setCatalog(recent);
      }catch{}
      if(!query.trim())try{
        const cache=JSON.parse(localStorage.getItem("gravity.market.cache.v2")||"{}");
        cache[marketType+":"+tab+":"+windowSize]={time:Date.now(),markets:list.slice(0,120)};
        Object.keys(cache).sort((a,b)=>(cache[b]?.time||0)-(cache[a]?.time||0)).slice(8).forEach(k=>delete cache[k]);
        localStorage.setItem("gravity.market.cache.v2",JSON.stringify(cache));
      }catch{}
      setSelected(current=>{if(!current)return list[0]||null;return list.find(m=>m.mint===current.mint)||current});
      setPrices(old=>({...old,...Object.fromEntries(list.filter(m=>m.priceUsd!=null&&m.priceUsd>0).map(m=>[m.mint,m.priceUsd!]))}));
    } catch(e){if(current()){const msg=e instanceof Error?e.message:"Could not load markets";setError(msg);setCacheNotice(msg)}}finally{if(current()){setLoading(false);setFetching(false)}}
  },[tab,query,windowSize,marketType,activeFeedKey]);
  useEffect(()=>{if(!pageVisible||tradeOpen||watchOnly)return;const c=new AbortController();const timeout=setTimeout(()=>fetchMarkets(c.signal),query.trim()?350:0);return()=>{clearTimeout(timeout);c.abort();requestSerial.current++}},[fetchMarkets,tick,pageVisible,tradeOpen,watchOnly]);
  useEffect(()=>{if(!pageVisible||tradeOpen||watchOnly)return;const timer=setInterval(()=>setTick(x=>x+1),15000);return()=>clearInterval(timer)},[pageVisible,tradeOpen,watchOnly]);
  useEffect(()=>{if(pageVisible)setTick(x=>x+1)},[pageVisible]);
  useEffect(()=>{
    if(!tradeOpen||!selected?.mint||!pageVisible)return;
    const mint=selected.mint;
    const key=mint+":"+chartInterval;
    let active=true;
    let controller:AbortController|null=null;
    const prev=candleCache.get(key);
    setChartKey(key);
    if(prev?.candles.length){
      setCandles(prev.candles);
      
      setCandlesLoading(false);
    }else{
      setCandles([]);
      
      setCandlesLoading(true);
    }
    setChartMessage("Waiting for the token's real market history.");
    const update=async()=>{
      controller?.abort();
      const request=new AbortController();controller=request;
      if(!candleCache.has(key))setCandlesLoading(true);
      try{
        const r=await fetch("/api/candles?mint="+encodeURIComponent(mint)+"&interval="+encodeURIComponent(chartInterval),{
          signal:request.signal,cache:"no-store"
        });
        const response=await r.json();
        if(!r.ok)throw Error(response.error||"Chart provider unavailable");
        const records=(Array.isArray(response.candles)?response.candles:[]) as Candle[];
        const clean=records.filter(c=>Number.isFinite(c.time)&&c.open>0&&c.high>0&&c.low>0&&c.close>0)
          .sort((a,b)=>a.time-b.time);
        if(!active||request.signal.aborted)return;
        if(clean.length){
          candleCache.set(key,{candles:clean,source:response.source||"Market data",updated:Date.now()});
          setCandles(clean);
        }else{
          if(!candleCache.has(key)){setCandles([]);}
          setChartMessage(response.error||"No historical trades recorded by the chart providers for this timeframe.");
        }
      }catch(error){
        if(!active||request.signal.aborted)return;
        setChartMessage(error instanceof Error?error.message:"Historical market data could not be loaded");
      }finally{if(active&&!request.signal.aborted)setCandlesLoading(false)}
    };
    void update();
    const timer=setInterval(update,15000);
    return()=>{active=false;controller?.abort();clearInterval(timer)};
  },[tradeOpen,selected?.mint,chartInterval,pageVisible]);
  useEffect(()=>{
    if(!tradeOpen||!selected?.mint||!pageVisible)return;
    const mint=selected.mint;let closed=false;
    const refresh=async()=>{
      try{
        const res=await fetch("/api/markets?q="+encodeURIComponent(mint),{cache:"no-store"});
        if(!res.ok)throw Error("Quote unavailable");
        const data=await res.json();
        const token=(data.markets||[]).find((m:Market)=>m.mint===mint) as Market|undefined;
        if(!token||token.priceUsd==null||token.priceUsd<=0)throw Error("No market price");
        if(closed)return;
        setSelected(current=>current?.mint===mint?{...token,category:current.category,venue:current.venue}:current);
        setPrices(previous=>({...previous,[mint]:token.priceUsd!}));
        setSelectedLastUpdated(Date.now());
      }catch{if(!closed)setSelectedLastUpdated(null)}
    };
    void refresh();const timer=setInterval(refresh,12000);
    return()=>{closed=true;clearInterval(timer)};
  },[tradeOpen,selected?.mint,pageVisible]);
  const resultsReady=shownFeedKey===activeFeedKey;
  const visible=useMemo(()=>{
    const list=watchOnly?watchlist.map(mint=>markets.find(m=>m.mint===mint)||catalog.find(m=>m.mint===mint)).filter((m):m is Market=>!!m):resultsReady?markets:[];
    if(tab==="new"&&marketType==="memes"&&!query.trim()&&!watchOnly) return list;
    const sortValue=(m:Market)=>sortBy==="cap"?m.marketCap:sortBy==="liquidity"?m.liquidityUsd:sortBy==="volume"?windowVolume(m,windowSize):windowChange(m,windowSize);
    return [...list].sort((a,b)=>(sortValue(b)??Number.NEGATIVE_INFINITY)-(sortValue(a)??Number.NEGATIVE_INFINITY));
  },[markets,catalog,watchOnly,watchlist,tab,marketType,query,sortBy,windowSize,resultsReady]);
  const selectMarket=(next:"memes"|"stocks")=>{
    if(!tradeOpen&&!watchOnly&&marketType===next&&!query.trim())return;
    requestSerial.current++;
    const key=next+":"+tab+":"+windowSize;
    let cached:null|{markets:Market[];time:number}=null;
    try{
      const cache=JSON.parse(localStorage.getItem("gravity.market.cache.v2")||"{}");
      const item=cache[key];
      if(item&&Array.isArray(item.markets)&&Date.now()-item.time<6*3600000)cached=item;
    }catch{}
    setMarketType(next);setWatchOnly(false);setTradeOpen(false);setFetching(false);
    setQuery("");setMarkets(cached?.markets||[]);setShownFeedKey(cached?next+":"+tab+":"+windowSize+":":"");setLoading(!cached);
    setError("");setCacheNotice("");
    setRefreshed(cached?.time||null);setCacheTime(cached?.time||null);
  };
  const showWatchlist=()=>{
    requestSerial.current++;
    setTradeOpen(false);setWatchOnly(true);
    setQuery("");setError("");setFetching(false);
  };
  const searchMarkets=(value:string)=>{
    requestSerial.current++;
    setQuery(value);setTradeOpen(false);
    setWatchOnly(false);setError("");setFetching(false);
  };
  const openTrade=(m:Market)=>{
    requestSerial.current++;
    const list=document.querySelector(".axiom-list-scroll");
    listScroll.current={top:window.scrollY,left:list?.scrollLeft||0,listTop:list?.scrollTop||0};
    setSelected(m);setDetailTab("overview");setSelectedLastUpdated(null);
    setTradeOpen(true);setFetching(false);
    window.scrollTo({top:0,behavior:"instant"});
  };
  const hideTrade=()=>{
    setTradeOpen(false);
    requestAnimationFrame(()=>{
      const list=document.querySelector(".axiom-list-scroll");
      if(list){list.scrollLeft=listScroll.current.left;list.scrollTop=listScroll.current.listTop;}
      window.scrollTo({top:listScroll.current.top,behavior:"instant"});
    });
  };
  const currentPrice=selected?(prices[selected.mint]??selected.priceUsd):null;
  const showWalletMenu=()=>window.dispatchEvent(new Event("gravity:open-wallet"));
  function toggleWatch(mint:string){
    const next=watchlist.includes(mint)?watchlist.filter(x=>x!==mint):[...watchlist,mint];
    setWatchlist(next);
    localStorage.setItem("gravity.watchlist.v1",JSON.stringify(next));
  }
  const currentChartKey=selected?selected.mint+":"+chartInterval:"";
  const activeCandles=chartKey===currentChartKey?candles:(candleCache.get(currentChartKey)?.candles||[]);
  const activeChartLoading=candlesLoading||(chartKey!==currentChartKey&&!activeCandles.length);
  return <div className="terminal-shell axiom-terminal">
    <header className="axiom-header">
      <div className="axiom-header-left">
        <Brand small/>
        <nav className="axiom-primary-nav" aria-label="App navigation">
 <button className={marketType==="memes"&&!watchOnly?"active":""} onClick={()=>selectMarket("memes")}>Memecoins</button>
 <button className={marketType==="stocks"&&!watchOnly?"active":""} onClick={()=>selectMarket("stocks")}>Stock tokens </button>
 <button className={watchOnly?"active":""} onClick={showWatchlist}>Watchlist</button>
 </nav>
      </div>
      <div className="axiom-header-right">
        <div className="axiom-search"><Search size={16}/><input value={query} onChange={e=>searchMarkets(e.target.value)} aria-label="Search token or contract address" placeholder="Search by token or CA"/>{query?<button aria-label="Clear search" onClick={()=>setQuery("")}><X size={14}/></button>:<kbd>/</kbd>}</div>
        <div className="axiom-network"><SolanaGlyph size={18}/> <span>SOL</span><ChevronDown size={12}/></div>
        }
        <Link href="/docs" className="axiom-docs-link" aria-label="Gravity documentation"><BookOpen size={16}/><span>Docs</span></Link>
        <SolanaWalletButton onAddressChange={setWalletAddress}/>
        <Link className="axiom-home" href="/" aria-label="Back to Gravity homepage"><ArrowUpRight size={18}/></Link>
      </div>
    </header>
    <div className="axiom-utility"><div><ShieldCheck size={14}/> LIVE MARKET DATA · EXECUTION UNAVAILABLE <span>·</span> Market data</div><div><span className="axiom-status-dot"/>{cacheNotice?"Using cached data":refreshed?"Feed active":"Connecting"} <span>·</span> {refreshed?new Date(refreshed).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"N/A"}</div></div>
    <main className="axiom-main">
      <div className="axiom-workspace">
        <div className="axiom-mobile-search"><Search size={16}/><input value={query} onChange={e=>searchMarkets(e.target.value)} placeholder="Search token or contract address"/></div>

        <div className="gravity-screener gravity-section-enter" style={{display:tradeOpen?"none":undefined}}>
          <div className="axiom-section-bar">
            <div className="axiom-section-tabs">
 <button className={!watchOnly&&tab==="trending"?"current":""} onClick={()=>{setTab("trending");setWatchOnly(false)}}>{marketType==="stocks"?"Top stocks":"Top"}</button>
 <button className={!watchOnly&&tab==="new"?"current":""} onClick={()=>{setTab("new");setWatchOnly(false)}}>{marketType==="stocks"?"A to Z":"New"}</button>
 <button className={watchOnly?"current":""} onClick={showWatchlist}>Watchlist <span>{watchlist.length}</span></button>
 </div>
            <div className="axiom-table-tools">
              <span className="axiom-time-label">Change</span>
              {(["5m","1h","6h","24h"] as const).map(w=><button key={w} className={windowSize===w?"selected":""} onClick={()=>setWindowSize(w)}>{w}</button>)}
              <span className="axiom-v-divider"/>
              <button className="axiom-refresh" aria-label="Refresh token list" onClick={()=>setTick(v=>v+1)} disabled={fetching}><RefreshCw size={15} className={fetching?"spin":""}/></button>
            </div>
          </div>
          {cacheNotice&&<div className="gravity-cache-banner"><Activity size={15}/><span>{markets.length?"Showing available cached markets. ":""}{cacheNotice}</span></div>}
          <div className="axiom-list-container">
            <div className="axiom-list-topline">
              <div><SolanaGlyph size={20}/><strong>{marketType==="stocks"?"STOCK TOKENS":"MEMECOINS"}</strong><span className="axiom-source-pill">GRAVITY MARKETS</span><span className="axiom-list-count">{visible.length} tokens</span><span className="gravity-cache-time">{cacheTime?"Synced "+new Date(cacheTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}</span></div>
              <div className="axiom-ordering"><label htmlFor="gravity-sort">Sort by</label><select id="gravity-sort" value={sortBy} onChange={e=>setSortBy(e.target.value as typeof sortBy)}>
                <option value="cap">Market cap</option><option value="liquidity">Liquidity</option><option value="volume">Volume</option><option value="change">Price change</option>
              </select></div>
            </div>
            <div className="axiom-list-scroll">
              <div className="axiom-table-head axiom-cols"><span>Pair info</span><span>Market cap / move</span><span>Liquidity</span><span>Volume</span><span>24h trades</span><span>Token info</span><span>Action</span></div>
              <div className="axiom-list-body" aria-busy={fetching||(!watchOnly&&loading&&!resultsReady)}>
                {(!watchOnly&&loading&&!resultsReady)?Array.from({length:9},(_,i)=><div className="axiom-skeleton" key={i}><i/><span/><b/></div>)
                :error&&!visible.length?<div className="axiom-state"><CircleHelp size={26}/><strong>Live feed unavailable</strong><p>{error}</p><button onClick={()=>setTick(x=>x+1)}>Try again</button></div>
                :visible.length===0?<div className="axiom-state"><Search size={26}/><strong>No tokens found</strong><p>{watchOnly?"Star tokens in the current feed to build your watchlist.":"Try another search, or switch market lists."}</p><button onClick={()=>{setQuery("");setWatchOnly(false);setTab("trending")}}>Show tokens</button></div>
                :visible.map(m=>{
                  const move=windowChange(m,windowSize);
                  const hasMove=move!==null&&Number.isFinite(move);
                  const buys=m.buys24h,sells=m.sells24h;
                  return <div className="axiom-row axiom-cols" key={m.mint} role="button" tabIndex={0} aria-label={"Open market details for "+m.name} onClick={()=>openTrade(m)} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openTrade(m)}}}>
                    <div className="axiom-pair">
                      <div className="axiom-token-icon"><TokenIcon market={m} size={44}/><span className="axiom-chain-mini"><SolanaGlyph size={11}/></span></div>
                      <div className="axiom-pair-content"><div><strong>{m.symbol}</strong><span>{m.name}</span>{m.isVerified&&<span className="axiom-verified" title="Verified token">✓</span>}</div>
                        <div className="axiom-pair-meta"><span className="axiom-age">{m.category==="stock"?"xStock":relative(m.createdAt)}</span><span>{dollar(m.priceUsd)}</span><span className={m.isSuspicious?"text-down":"axiom-safe"}>{m.isSuspicious?"Flagged":m.category==="stock"?"Stock token":"On Solana"}</span></div>
                      </div>
                    </div>
                    <div className="axiom-cap"><strong>{dollar(m.marketCap,true)}</strong><span className={hasMove?(move!>=0?"text-up":"text-down"):"axiom-muted"}>{change(move)}</span><span className={"axiom-change-meter "+(hasMove&&move!<0?"negative":"")} title={hasMove?"Price change for "+windowSize+": "+change(move):"Price change unavailable"}><i style={{width:hasMove?Math.min(100,Math.abs(move!)*2+5)+"%":"0%"}}/></span></div>
                    <div className="axiom-value">{dollar(m.liquidityUsd,true)}</div>
                    <div className="axiom-value">{dollar(windowVolume(m,windowSize),true)}</div>
                    <div className="axiom-txn"><strong>{buys!==null||sells!==null?compactNum((buys||0)+(sells||0)):"N/A"}</strong><span><b className="text-up">{compactNum(buys)}</b> / <b className="text-down">{compactNum(sells)}</b></span></div>
                    <div className="axiom-info">
                      <span className={m.isSuspicious?"axiom-risk-flag":m.isVerified?"axiom-risk-ok":"axiom-risk-neutral"}>{m.isSuspicious?"⚠ Flagged":m.isVerified?"✓ Verified":"Unverified"}</span>
                      <span>Holders <b>{compactNum(m.holderCount)}</b></span>
                      <span>Organic <b>{m.organicScore===null?"N/A":m.organicScore.toFixed(0)+"/100"}</b></span>
                    </div>
                    <div className="axiom-action-buttons">
                      <button type="button" className="axiom-trade-btn" onClick={e=>{e.stopPropagation();openTrade(m)}}>Trade</button>
                      <button type="button" className={"axiom-watch-btn "+(watchlist.includes(m.mint)?"is-watched":"")} aria-label={watchlist.includes(m.mint)?"Remove from watchlist":"Add to watchlist"} onClick={e=>{e.stopPropagation();toggleWatch(m.mint)}}><Star size={15} fill={watchlist.includes(m.mint)?"currentColor":"none"}/></button>
                    </div>
                  </div>
                })}
              </div>
            </div>
          </div>
          </div>
          {tradeOpen&&selected&&<section className="gravity-market-detail gravity-compact-market gravity-section-enter">
    <div className="gravity-detail-navigation">
      <button onClick={hideTrade}><ArrowLeft size={16}/> Markets</button>
      <div className="gravity-compact-nav-right"><span><SolanaGlyph size={16}/> Solana</span><span className="gravity-market-live"><i/> {selectedLastUpdated&&Date.now()-selectedLastUpdated<30000?"Price live":"Updating"}</span>
        <button onClick={()=>toggleWatch(selected.mint)} aria-label="Toggle watchlist"><Star size={17} fill={watchlist.includes(selected.mint)?"currentColor":"none"}/></button>
        <button aria-label="Copy token address" onClick={()=>navigator.clipboard.writeText(selected.mint).then(()=>setToast("Contract copied"))}><CopyIcon/></button>
      </div>
    </div>
    <div className="gravity-detail-grid">
      <div className="gravity-detail-primary">
        <div className="gravity-detail-heading">
          <TokenIcon market={selected} size={43}/>
          <div className="gravity-detail-names"><span className="gravity-detail-category">{selected.category==="stock"?"Stock token":"Memecoin"} · {selected.isVerified?"Verified":"Unverified"} · {relative(selected.createdAt)}</span><h1>{selected.name} <small>{selected.symbol}</small></h1></div>
          <div className="gravity-detail-price"><strong>{dollar(currentPrice)}</strong><span className={(selected.change24h??0)>=0?"text-up":"text-down"}>{change(selected.change24h)} <small>24h</small></span></div>
        </div>
        <div className="gravity-detail-chart"><div className="gravity-detail-chart-top"><div className="gravity-chart-label"><strong>Price · USD</strong><span>Live price history</span></div><div className="gravity-chart-timeframes" role="group" aria-label="Chart timeframe">{INTERVALS.map(interval=><button key={interval} onClick={()=>setChartInterval(interval)} aria-pressed={chartInterval===interval} className={chartInterval===interval?"active":""}>{interval}</button>)}</div></div><PriceChart key={currentChartKey} candles={activeCandles} loading={activeChartLoading} empty={chartMessage}/></div>
        <div className="gravity-compact-chart-footer"><span><Activity size={14}/> {dollar(selected.volume24h,true)} 24h volume</span><span>{selectedLastUpdated?"Updated "+new Date(selectedLastUpdated).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"Waiting for market quote"}</span></div>
        <div className="gravity-inline-metrics">
          <div><span>Market cap</span><strong>{dollar(selected.marketCap,true)}</strong></div>
          <div><span>Liquidity</span><strong>{dollar(selected.liquidityUsd,true)}</strong></div>
          <div><span>24h volume</span><strong>{dollar(selected.volume24h,true)}</strong></div>
          <div><span>Holders</span><strong>{compactNum(selected.holderCount)}</strong></div>
          <div><span>Buys / sells</span><strong><span className="text-up">{compactNum(selected.buys24h)}</span> <span className="gravity-inline-slash">/</span> <span className="text-down">{compactNum(selected.sells24h)}</span></strong></div>
        </div>
        <div className="gravity-compact-tabs" role="tablist" aria-label="Token information">
          <button role="tab" aria-selected={detailTab==="overview"} className={detailTab==="overview"?"active":""} onClick={()=>setDetailTab("overview")}>Overview</button>

          <button role="tab" aria-selected={detailTab==="info"} className={detailTab==="info"?"active":""} onClick={()=>setDetailTab("info")}>Token details</button>
        </div>
        <div className="gravity-compact-tabbody">
          {detailTab==="overview"?<div className="gravity-compact-overview">
            <span className="gravity-compact-subtitle">Price change</span>
            {(["5m","1h","6h","24h"] as const).map(w=><div key={w}><span>{w}</span><strong className={(windowChange(selected,w)??0)>=0?"text-up":"text-down"}>{change(windowChange(selected,w))}</strong></div>)}
            <span className="gravity-compact-score">Organic score <strong>{selected.organicScore==null?"N/A":selected.organicScore.toFixed(0)+"/100"}</strong></span>
          </div>:          </div>:<div className="gravity-compact-info">
            <div><span>Contract</span><button onClick={()=>navigator.clipboard.writeText(selected.mint).then(()=>setToast("Contract copied"))}>{selected.mint.slice(0,10)}…{selected.mint.slice(-7)} <CopyIcon/></button></div>
            <div><span>Network</span><strong><SolanaGlyph size={14}/> Solana</strong></div>
            <div><span>Verification</span><strong>{selected.isVerified?"Verified":"Unverified"}</strong></div>
            <div><span>Risk flag</span><strong className={selected.isSuspicious?"text-down":""}>{selected.isSuspicious?"Flagged":"No flag reported"}</strong></div>
          </div>}
        </div>
      </div>
      <aside className="gravity-detail-sidebar">
        <div className="gravity-trade-mode" role="group" aria-label="Trading mode">
          <button type="button" className={tradeMode==="paper"?"active paper":""} aria-pressed={tradeMode==="paper"} onClick={()=>chooseTradeMode("paper")}>Paper</button>
          <button type="button" className={tradeMode==="live"?"active live":""} aria-pressed={tradeMode==="live"} onClick={()=>chooseTradeMode("live")}>Live</button>
        </div>
        <div className="gravity-sidebar-token"><TokenIcon market={selected} size={30}/><div><strong>{selected.symbol} / USDC</strong><span>{tradeMode==="paper"?"Virtual funds · Demo positions":"Solana wallet · Live execution unavailable"}</span></div></div>
        {tradeMode==="paper"?<div className="order-panel"><div className="order-title"><strong>Position</strong><span>VIRTUAL</span></div><div className="direction-switch"><button className={side==="long"?"long active":"long"} onClick={()=>setSide("long")}>Long</button><button className={side==="short"?"short active":"short"} onClick={()=>setSide("short")}>Short</button></div><div className="input-title"><span>Collateral</span><span>Available {dollar(freeBalance(positions))}</span></div><div className="amount-field"><input type="number" min="5" max="1000" step="5" value={margin} onChange={e=>setMargin(e.target.value)} aria-label="Paper collateral amount"/><span>USDC · DEMO</span></div><div className="input-title"><span>Leverage</span><span>MAX 3×</span></div><div className="leverage-options">{[1,2,3].map(n=><button className={lev===n?"active":""} key={n} onClick={()=>setLev(n)}>{n}×</button>)}</div><div className="order-summary"><div><span>Notional exposure</span><strong>{dollar((Number(margin)||0)*lev)}</strong></div><div><span>Entry price</span><strong>{dollar(currentPrice)}</strong></div><div><span>Open positions</span><strong>{selectedActive}</strong></div></div><button className="pill pill-accent order-submit" disabled={!canOpen||processing} onClick={openPaper}>{canOpen?`Open ${side}`:"Live price / collateral required"}</button></div>:
        <div className="order-panel gravity-live-ticket">
          <div className="order-title"><strong>Live trading</strong><span>NOT ACTIVE</span></div>
          <div className="gravity-live-wallet">
            <span className="gravity-live-wallet-label"><Wallet size={15}/> Solana wallet</span>
            <strong>{walletAddress?walletAddress.slice(0,5)+"..."+walletAddress.slice(-5):"Not connected"}</strong>
            <span className="gravity-live-wallet-detail">{walletAddress?"Wallet connected. No transactions will be requested.":"Connect a Solana wallet to view your address."}</span>
          </div>
          <div className="direction-switch" aria-label="Direction preview"><button className={side==="long"?"long active":"long"} onClick={()=>setSide("long")}>Long</button><button className={side==="short"?"short active":"short"} onClick={()=>setSide("short")}>Short</button></div>
          <div className="order-summary gravity-live-summary">
            <div><span>Token price</span><strong>{dollar(currentPrice)}</strong></div>
            <div><span>Wallet collateral</span><strong>Unavailable</strong></div>
            <div><span>Order execution</span><strong className="gravity-live-unavailable">Not enabled</strong></div>
          </div>
          {!walletAddress&&<button type="button" className="gravity-live-connect" onClick={showWalletMenu}><Wallet size={15}/> Connect Solana wallet</button>}
          <button type="button" className="pill order-submit gravity-live-submit" disabled aria-disabled="true">Live orders unavailable</button>
          <p className="gravity-live-disclosure">Wallet connection is active, but Gravity does not yet submit real orders. Live mode never uses your paper balance.</p>
        </div>}
        
      </aside>
    </div>
  </section>}
        </>:<div className="portfolio-layout gravity-section-enter"><div className="portfolio-summary"><div className="portfolio-hero"><span>VIRTUAL EQUITY</span><strong>{dollar(equity)}</strong><small>Not a real wallet balance</small></div><div><span>AVAILABLE COLLATERAL</span><strong>{dollar(freeBalance(positions))}</strong></div><div><span>LOCKED COLLATERAL</span><strong>{dollar(lockedMargin(positions))}</strong></div><div><span>REALIZED P&L</span><strong className={realised>=0?"text-up":"text-down"}>{realised>=0?"+":"−"}{dollar(Math.abs(realised))}</strong></div></div><div className="positions-panel"><div className="panel-bar"><span className="panel-title">Open positions <span className="subtle-count">{open.length}</span></span><span className="position-note">MARKS REFRESH EVERY ~15S</span></div>{open.length===0?<div className="feed-message position-empty"><Wallet size={24}/><strong>No open positions</strong><span>Find a token and choose long or short.</span><button onClick={()=>selectMarket(marketType)} className="pill pill-outline">Browse markets</button></div>:<div className="positions-list">{open.map(p=><div className="position-row" key={p.id}><div className="position-asset"><TokenIcon market={p}/><span><strong>{p.symbol}</strong><small>{p.side.toUpperCase()} · {p.leverage}×</small></span></div><div><small>ENTRY</small><strong>{dollar(p.entry)}</strong></div><div><small>MARK</small><strong>{dollar(prices[p.mint])}</strong></div><div><small>UNREALIZED P&L</small><strong className={!prices[p.mint]?"":getPnl(p,prices[p.mint])>=0?"text-up":"text-down"}>{prices[p.mint]?`${getPnl(p,prices[p.mint])>=0?"+":"−"}${dollar(Math.abs(Math.max(-p.margin,getPnl(p,prices[p.mint]))))}`:"N/A"}</strong></div><button className="pill pill-outline position-close" disabled={!prices[p.mint]} onClick={()=>closePaper(p)}>Close</button></div>)}</div>}</div><div className="positions-panel"><div className="panel-bar"><span className="panel-title">Trade history <span className="subtle-count">{closed.length}</span></span></div>{closed.length===0?<div className="history-empty">Your closed positions will appear here.</div>:<div className="positions-list">{closed.map(p=><div className="position-row" key={p.id}><div className="position-asset"><TokenIcon market={p}/><span><strong>{p.symbol}</strong><small>{p.side.toUpperCase()} · {p.leverage}×</small></span></div><div><small>ENTRY</small><strong>{dollar(p.entry)}</strong></div><div><small>EXIT</small><strong>{dollar(p.exit)}</strong></div><div><small>REALIZED P&L</small><strong className={(p.pnl||0)>=0?"text-up":"text-down"}>{(p.pnl||0)>=0?"+":"−"}{dollar(Math.abs(p.pnl||0))}</strong></div><span className="closed-tag"><Check size={14}/> CLOSED</span></div>)}</div>}</div><div className="portfolio-fineprint"><CircleHelp size={16}/> Indicative P&L excludes fees, slippage, and funding. Virtual funds only, no real orders. Browser storage only.</div></div>}
      </div>
    </main>
    <div className="axiom-statusbar"><div><SolanaGlyph size={14}/> Solana <span className="axiom-divider"/> {marketType==="stocks"?"STOCK TOKENS":"MEMECOIN MARKETS"} <span className="axiom-divider"/> {refreshed?"MARKETS LIVE":"MARKETS CONNECTING"}</div><div>{tradeOpen&&tradeMode==="live"?<span>Live execution <strong>Not enabled</strong></span>:<><span>Virtual balance <strong>{dollar(equity)}</strong></span><span>Open <strong>{open.length}</strong></span><span>Realized <strong className={realised>=0?"text-up":"text-down"}>{realised>=0?"+":"−"}{dollar(Math.abs(realised))}</strong></span></>}</div></div>
    {toast&&<div className="toast" role="status"><Check size={17}/>{toast}<button aria-label="Dismiss notification" onClick={()=>setToast("")}><X size={14}/></button></div>}
  </div>;
}

function LayersIcon(){return <Activity size={18}/>}
function CopyIcon(){return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5"/></svg>}
