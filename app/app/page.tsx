"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowDownLeft, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, Clock3, Compass, ExternalLink, LoaderCircle, Menu, RefreshCw, Search, ShieldCheck, Star, TrendingDown, TrendingUp, Wallet, X } from "lucide-react";
import Brand from "@/components/Brand";
import type { Market } from "@/lib/markets";
import { closePosition, freeBalance, getPnl, getPositions, lockedMargin, newPosition, Position, realisedPnl, STARTING_BALANCE, storePositions } from "@/lib/paper";

type Candle = {time:number;close:number};
function dollar(n:number|null|undefined,compact=false){
  if(n==null || !Number.isFinite(n)) return "—";
  if(compact) return "$"+new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(n);
  if(n===0) return "$0.00";
  if(Math.abs(n)<0.0001) return "$"+n.toPrecision(3);
  if(Math.abs(n)<1) return "$"+n.toFixed(5);
  return "$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
}
function change(n:number|null|undefined){return n==null ? "—" : `${n>0?"+":""}${n.toFixed(2)}%`}
function relative(t:number|null){if(!t)return "—";let ms=Date.now()-t;if(ms<0)return "just now";if(ms<3600000)return `${Math.floor(ms/60000)}m`;if(ms<86400000)return `${Math.floor(ms/3600000)}h`;return `${Math.floor(ms/86400000)}d`}
function TokenIcon({market,size=37}:{market:Pick<Market,"image"|"symbol">,size?:number}){
  const [broken,setBroken]=useState(false);
  return <span className="token-icon" style={{width:size,height:size}}>{market.image&&!broken ? <img src={market.image} alt="" onError={()=>setBroken(true)}/> : <span>{(market.symbol||"?").slice(0,2).toUpperCase()}</span>}</span>;
}
function PriceChart({candles,loading,empty}: {candles:Candle[];loading:boolean;empty:string}){
  if(loading)return <div className="chart-empty"><LoaderCircle className="spin" size={24}/><span>Loading market history</span></div>;
  if(candles.length<3)return <div className="chart-empty"><Activity size={25}/><span>{empty}</span><small>No chart data is fabricated.</small></div>;
  const vals=candles.map(c=>c.close);const min=Math.min(...vals),max=Math.max(...vals);const span=max-min||1;
  const pts=vals.map((n,i)=>`${(i/(vals.length-1)*1000).toFixed(2)},${(230-(n-min)/span*190).toFixed(2)}`).join(" ");
  const area=`0,250 ${pts} 1000,250`;
  const up=vals.at(-1)!>=vals[0];
  return <div className="chart-live"><div className="chart-grid"/><svg viewBox="0 0 1000 250" preserveAspectRatio="none" aria-label="Historical price chart sourced from GeckoTerminal" role="img"><defs><linearGradient id="chartfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={up?"#70b3ed":"#ff716f"} stopOpacity=".20"/><stop offset="1" stopColor={up?"#70b3ed":"#ff716f"} stopOpacity="0"/></linearGradient></defs><polygon points={area} fill="url(#chartfill)"/><polyline points={pts} fill="none" stroke={up?"#70b3ed":"#ff716f"} strokeWidth="2.3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="chart-ticks"><span>OLDER</span><span>5 MIN CANDLES · GECKOTERMINAL</span><span>NOW</span></div></div>
}

function SolanaGlyph({size=19}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 26 25" aria-label="Solana network" role="img" fill="none">
    <defs><linearGradient id="sol-gradient" x1="0" x2="26" y1="24" y2="0"><stop stopColor="#725dff"/><stop offset=".52" stopColor="#64a0ff"/><stop offset="1" stopColor="#19f5bb"/></linearGradient></defs>
    <path d="M5 3h19l-4 4H1l4-4Zm-4 7h19l4 4H5l-4-4Zm4 7h19l-4 4H1l4-4Z" fill="url(#sol-gradient)"/>
  </svg>;
}
function compactNum(n:number|null|undefined){if(n===null||n===undefined||!Number.isFinite(n))return "—";return Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(n)}
function windowChange(m:Market,window:"5m"|"1h"|"6h"|"24h"){return window==="5m"?m.change5m:window==="1h"?m.change1h:window==="6h"?m.change6h:m.change24h}
function windowVolume(m:Market,window:"5m"|"1h"|"6h"|"24h"){return window==="5m"?m.volume5m:window==="1h"?m.volume1h:window==="6h"?m.volume6h:m.volume24h}

export default function Terminal(){
  const [view,setView]=useState<"markets"|"positions">("markets");
  const [tab,setTab]=useState<"new"|"trending">("trending");
  const [windowSize,setWindowSize]=useState<"5m"|"1h"|"6h"|"24h">("1h");
  const [sortBy,setSortBy]=useState<"cap"|"liquidity"|"volume"|"change">("cap");
  const [tradeOpen,setTradeOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [markets,setMarkets]=useState<Market[]>([]);
  const [selected,setSelected]=useState<Market|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [provider,setProvider]=useState("");
  const [refreshed,setRefreshed]=useState<number|null>(null);
  const [tick,setTick]=useState(0);
  const [side,setSide]=useState<"long"|"short">("long");
  const [margin,setMargin]=useState("100");
  const [lev,setLev]=useState(1);
  const [positions,setPositions]=useState<Position[]>([]);
  const [prices,setPrices]=useState<Record<string,number>>({});
  const [toast,setToast]=useState("");
  const [candles,setCandles]=useState<Candle[]>([]);
  const [candlesLoading,setCandlesLoading]=useState(false);
  const [chartMessage,setChartMessage]=useState("Historical market data isn't available for this token yet.");
  const [processing,setProcessing]=useState(false);
  const [mobileMenu,setMobileMenu]=useState(false);
  const [mobileTrading,setMobileTrading]=useState(false);
  const [watchlist,setWatchlist]=useState<string[]>([]);
  const [watchOnly,setWatchOnly]=useState(false);

  useEffect(()=>{setPositions(getPositions());try{const v=JSON.parse(localStorage.getItem("gravity.watchlist.v1")||"[]");if(Array.isArray(v))setWatchlist(v.filter(x=>typeof x==="string"));}catch{}},[]);
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(""),4500);return()=>clearTimeout(id)},[toast]);
  const fetchMarkets=useCallback(async(signal?:AbortSignal)=>{
    setLoading(true);setError("");
    try {
      const params=new URLSearchParams({tab,window:windowSize});if(query.trim())params.set("q",query.trim());
      const r=await fetch(`/api/markets?${params}`,{signal,cache:"no-store"});const data=await r.json();
      if(!r.ok)throw Error(data.error||"Market feed temporarily unavailable");
      const list=(data.markets||[]) as Market[];
      setMarkets(list);setProvider((data.providers||[]).join(" + "));setRefreshed(Date.now());
      setSelected(current=>{if(!current)return list[0]||null;return list.find(m=>m.mint===current.mint)||current});
      setPrices(old=>({...old,...Object.fromEntries(list.filter(m=>m.priceUsd!=null&&m.priceUsd>0).map(m=>[m.mint,m.priceUsd!]))}));
    } catch(e){if((e as Error).name!=="AbortError"){setError(e instanceof Error?e.message:"Could not load markets");setMarkets([])}}finally{if(!signal?.aborted)setLoading(false)}
  },[tab,query,windowSize]);
  useEffect(()=>{const c=new AbortController();const timeout=setTimeout(()=>fetchMarkets(c.signal),query?450:0);return()=>{clearTimeout(timeout);c.abort()}},[fetchMarkets,tick]);
  useEffect(()=>{const id=setInterval(()=>setTick(x=>x+1),30000);return()=>clearInterval(id)},[]);
  useEffect(()=>{if(!selected?.mint){setCandles([]);setChartMessage("Historical market data isn't available for this token yet.");return}
    const c=new AbortController();setCandlesLoading(true);setCandles([]);fetch(`/api/candles?mint=${encodeURIComponent(selected.mint)}`,{signal:c.signal}).then(r=>r.json()).then(d=>{if(!c.signal.aborted){setCandles(d.candles||[]);setChartMessage(d.error||"No historical candles found for this pool.")}}).catch(()=>{if(!c.signal.aborted)setChartMessage("The chart provider is unavailable.")}).finally(()=>{if(!c.signal.aborted)setCandlesLoading(false)});
    return()=>c.abort();
  },[selected?.mint]);
  useEffect(()=>{
    const mints=[...new Set(positions.filter(p=>!p.closedAt).map(p=>p.mint))].slice(0,10);
    if(!mints.length)return;
    let cancelled=false;
    const refresh=async()=>{
      const found=await Promise.all(mints.map(async mint=>{try{const r=await fetch(`/api/markets?q=${mint}`,{cache:"no-store"});if(!r.ok)return null;const d=await r.json();const m=d.markets?.find((m:Market)=>m.mint===mint&&m.priceUsd!=null&&m.priceUsd>0);return m?[mint,m.priceUsd] as const:null}catch{return null}}));
      if(!cancelled)setPrices(prev=>({...prev,...Object.fromEntries(found.filter(Boolean) as (readonly [string,number])[])}));
    };
    void refresh();const timer=setInterval(refresh,45000);return()=>{cancelled=true;clearInterval(timer)};
  },[positions]);
  const visible=useMemo(()=>{
    const list=watchOnly?markets.filter(m=>watchlist.includes(m.mint)):markets;
    if(tab==="new"&&!query.trim()&&!watchOnly) return list;
    const sortValue=(m:Market)=>sortBy==="cap"?m.marketCap:sortBy==="liquidity"?m.liquidityUsd:sortBy==="volume"?windowVolume(m,windowSize):windowChange(m,windowSize);
    return [...list].sort((a,b)=>(sortValue(b)??Number.NEGATIVE_INFINITY)-(sortValue(a)??Number.NEGATIVE_INFINITY));
  },[markets,watchOnly,watchlist,tab,query,sortBy,windowSize]);
  const openTrade=(m:Market)=>{setSelected(m);setTradeOpen(true);setMobileTrading(true)};
  const hideTrade=()=>{setTradeOpen(false);setMobileTrading(false)};
  const open=positions.filter(p=>!p.closedAt);
  const closed=positions.filter(p=>!!p.closedAt);
  const realised=realisedPnl(positions);
  const equity=STARTING_BALANCE+realised+open.reduce((s,p)=>s+(prices[p.mint]?Math.max(-p.margin,getPnl(p,prices[p.mint])):0),0);
  const currentPrice=selected?(prices[selected.mint]??selected.priceUsd):null;
  const canOpen=!!currentPrice && currentPrice>0 && Number(margin)>=5 && Number(margin)<=1000 && Number(margin)<=freeBalance(positions);
  function toggleWatch(mint:string){const next=watchlist.includes(mint)?watchlist.filter(x=>x!==mint):[...watchlist,mint];setWatchlist(next);localStorage.setItem("gravity.watchlist.v1",JSON.stringify(next))}
  function openPaper(){if(!selected)return;setProcessing(true);try{
    const position=newPosition({...selected,priceUsd:currentPrice},side,Number(margin),lev,positions);
    const next=[position,...positions];setPositions(next);storePositions(next);setToast(`${side.toUpperCase()} paper position opened on ${selected.symbol}`);
  }catch(e){setToast((e as Error).message)}finally{setProcessing(false)}}
  function closePaper(p:Position){const mark=prices[p.mint];if(!mark){setToast("Current market price unavailable — cannot close yet.");return}try{const next=positions.map(x=>x.id===p.id?closePosition(x,mark):x);setPositions(next);storePositions(next);setToast(`Paper position on ${p.symbol} closed.`)}catch(e){setToast((e as Error).message)}}
  const selectedActive=selected && open.filter(p=>p.mint===selected.mint).length;
  return <div className="terminal-shell axiom-terminal">
    <header className="axiom-header">
      <div className="axiom-header-left">
        <Brand small/>
        <nav className="axiom-primary-nav" aria-label="App navigation">
          <button className={view==="markets"&&!watchOnly&&tab==="trending"?"active":""} onClick={()=>{setView("markets");setTab("trending");setWatchOnly(false)}}>Discover</button>
          <button className={view==="markets"&&!watchOnly&&tab==="new"?"active":""} onClick={()=>{setView("markets");setTab("new");setWatchOnly(false)}}>New launches</button>
          <button className={view==="markets"&&watchOnly?"active":""} onClick={()=>{setView("markets");setWatchOnly(true)}}>Watchlist</button>
          <button className={view==="positions"?"active":""} onClick={()=>setView("positions")}>Portfolio <span className="axiom-nav-count">{open.length}</span></button>
        </nav>
      </div>
      <div className="axiom-header-right">
        <div className="axiom-search"><Search size={16}/><input value={query} onChange={e=>{setQuery(e.target.value);setView("markets")}} aria-label="Search token or contract address" placeholder="Search by token or CA"/>{query?<button aria-label="Clear search" onClick={()=>setQuery("")}><X size={14}/></button>:<kbd>/</kbd>}</div>
        <div className="axiom-network"><SolanaGlyph size={18}/> <span>SOL</span><ChevronDown size={12}/></div>
        <div className="axiom-balance"><Wallet size={15}/><span>{dollar(freeBalance(positions))}</span><small>VIRTUAL</small></div>
        <Link className="axiom-home" href="/" aria-label="Back to Gravity homepage"><ArrowUpRight size={18}/></Link>
      </div>
    </header>
    <div className="axiom-utility"><div><ShieldCheck size={14}/> SIMULATED TRADING — NO LIVE ORDERS <span>·</span> Jupiter market data</div><div><span className="axiom-status-dot"/>{refreshed?"Feed active":"Connecting"} <span>·</span> {refreshed?new Date(refreshed).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—"}</div></div>
    <main className="axiom-main">
      <div className="axiom-workspace">
        <div className="axiom-mobile-search"><Search size={16}/><input value={query} onChange={e=>{setQuery(e.target.value);setView("markets")}} placeholder="Search token or contract address"/></div>

        {view==="markets"?<>
          <div className="axiom-section-bar">
            <div className="axiom-section-tabs">
              <button className={!watchOnly&&tab==="trending"?"current":""} onClick={()=>{setTab("trending");setWatchOnly(false)}}>Top</button>
              <button className={!watchOnly&&tab==="new"?"current":""} onClick={()=>{setTab("new");setWatchOnly(false)}}>New</button>
              <button className={watchOnly?"current":""} onClick={()=>setWatchOnly(true)}>Watchlist <span>{watchlist.length}</span></button>
            </div>
            <div className="axiom-table-tools">
              <span className="axiom-time-label">Change</span>
              {(["5m","1h","6h","24h"] as const).map(w=><button key={w} className={windowSize===w?"selected":""} onClick={()=>setWindowSize(w)}>{w}</button>)}
              <span className="axiom-v-divider"/>
              <button className="axiom-refresh" aria-label="Refresh token list" onClick={()=>setTick(v=>v+1)}><RefreshCw size={15} className={loading?"spin":""}/></button>
            </div>
          </div>
          <div className="axiom-list-container">
            <div className="axiom-list-topline">
              <div><SolanaGlyph size={20}/><strong>SOLANA</strong><span className="axiom-source-pill">JUPITER DATA</span><span className="axiom-list-count">{visible.length} tokens</span></div>
              <div className="axiom-ordering"><label htmlFor="gravity-sort">Sort by</label><select id="gravity-sort" value={sortBy} onChange={e=>setSortBy(e.target.value as typeof sortBy)}>
                <option value="cap">Market cap</option><option value="liquidity">Liquidity</option><option value="volume">Volume</option><option value="change">Price change</option>
              </select></div>
            </div>
            <div className="axiom-list-scroll">
              <div className="axiom-table-head axiom-cols"><span>Pair info</span><span>Market cap / move</span><span>Liquidity</span><span>Volume</span><span>24h trades</span><span>Token info</span><span>Action</span></div>
              <div className="axiom-list-body">
                {loading?Array.from({length:9},(_,i)=><div className="axiom-skeleton" key={i}><i/><span/><b/></div>)
                :error?<div className="axiom-state"><CircleHelp size={26}/><strong>Live feed unavailable</strong><p>{error}</p><button onClick={()=>setTick(x=>x+1)}>Try again</button></div>
                :visible.length===0?<div className="axiom-state"><Search size={26}/><strong>No tokens found</strong><p>{watchOnly?"Star tokens in the current feed to build your watchlist.":"Try another search, or switch market lists."}</p><button onClick={()=>{setQuery("");setWatchOnly(false);setTab("trending")}}>Show tokens</button></div>
                :visible.map(m=>{
                  const move=windowChange(m,windowSize);
                  const hasMove=move!==null&&Number.isFinite(move);
                  const buys=m.buys24h,sells=m.sells24h;
                  return <div className="axiom-row axiom-cols" key={m.mint} role="button" tabIndex={0} aria-label={"Open paper trading for "+m.name} onClick={()=>openTrade(m)} onKeyDown={e=>{if(e.target===e.currentTarget&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openTrade(m)}}}>
                    <div className="axiom-pair">
                      <div className="axiom-token-icon"><TokenIcon market={m} size={44}/><span className="axiom-chain-mini"><SolanaGlyph size={11}/></span></div>
                      <div className="axiom-pair-content"><div><strong>{m.symbol}</strong><span>{m.name}</span>{m.isVerified&&<span className="axiom-verified" title="Jupiter verified">✓</span>}</div>
                        <div className="axiom-pair-meta"><span className="axiom-age">{relative(m.createdAt)}</span><span>{dollar(m.priceUsd)}</span><span className={m.isSuspicious?"text-down":"axiom-safe"}>{m.isSuspicious?"Flagged":"On Solana"}</span></div>
                      </div>
                    </div>
                    <div className="axiom-cap"><strong>{dollar(m.marketCap,true)}</strong><span className={hasMove?(move!>=0?"text-up":"text-down"):"axiom-muted"}>{change(move)}</span><span className={"axiom-change-meter "+(hasMove&&move!<0?"negative":"")} title={hasMove?"Price change for "+windowSize+": "+change(move):"Price change unavailable"}><i style={{width:hasMove?Math.min(100,Math.abs(move!)*2+5)+"%":"0%"}}/></span></div>
                    <div className="axiom-value">{dollar(m.liquidityUsd,true)}</div>
                    <div className="axiom-value">{dollar(windowVolume(m,windowSize),true)}</div>
                    <div className="axiom-txn"><strong>{buys!==null||sells!==null?compactNum((buys||0)+(sells||0)):"—"}</strong><span><b className="text-up">{compactNum(buys)}</b> / <b className="text-down">{compactNum(sells)}</b></span></div>
                    <div className="axiom-info">
                      <span className={m.isSuspicious?"axiom-risk-flag":m.isVerified?"axiom-risk-ok":"axiom-risk-neutral"}>{m.isSuspicious?"⚠ Flagged":m.isVerified?"✓ Verified":"Unverified"}</span>
                      <span>Holders <b>{compactNum(m.holderCount)}</b></span>
                      <span>Organic <b>{m.organicScore===null?"—":m.organicScore.toFixed(0)+"/100"}</b></span>
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
          {tradeOpen&&<><button aria-label="Close trade panel" className="axiom-overlay" onClick={hideTrade}/><aside className="axiom-ticket" role="dialog" aria-modal="true" aria-label={"Paper trading "+(selected?.symbol||"token")}>
            <div className="axiom-ticket-header"><div><SolanaGlyph size={17}/><span>GRAVITY TERMINAL</span><span className="axiom-paper-chip">PAPER TRADING</span></div><button aria-label="Close trade panel" onClick={hideTrade}><X size={20}/></button></div>
            <div className="axiom-ticket-content">
              {selected?<>
<div className="asset-panel"><div className="asset-top"><div className="asset-identity"><TokenIcon market={selected} size={47}/><div><h2>{selected.name} <span>{selected.symbol}</span></h2><p>{selected.mint.slice(0,6)}…{selected.mint.slice(-5)} <button title="Copy contract address" aria-label="Copy contract address" onClick={()=>{navigator.clipboard.writeText(selected.mint).then(()=>setToast("Contract copied"))}}><CopyIcon/></button></p></div></div><button className={`circle-button ${watchlist.includes(selected.mint)?"star-active":""}`} onClick={()=>toggleWatch(selected.mint)} title="Add to watchlist" aria-label="Toggle watchlist"><Star size={17} fill={watchlist.includes(selected.mint)?"currentColor":"none"}/></button></div><div className="asset-pricing"><div><small>MARK PRICE</small><strong>{dollar(currentPrice)}</strong></div><span className={`percent-pill ${(selected.change24h??0)>=0?"positive":"negative"}`}>{(selected.change24h??0)>=0?<TrendingUp size={15}/>:<TrendingDown size={15}/>} {change(selected.change24h)}</span></div><div className="chart-container"><div className="chart-header"><span>PRICE HISTORY</span><span className="chart-badge">5M · HISTORICAL</span></div><PriceChart candles={candles} loading={candlesLoading} empty={chartMessage}/></div><div className="asset-stats"><div><span>MARKET CAP</span><strong>{dollar(selected.marketCap,true)}</strong></div><div><span>24H VOLUME</span><strong>{dollar(selected.volume24h,true)}</strong></div><div><span>LIQUIDITY</span><strong>{dollar(selected.liquidityUsd,true)}</strong></div></div><div className="asset-activity"><div className="asset-activity-head"><strong>Paper positions</strong><span>{open.filter(p=>p.mint===selected.mint).length} open</span></div>{open.filter(p=>p.mint===selected.mint).length?<div className="asset-activity-rows">{open.filter(p=>p.mint===selected.mint).slice(0,4).map(p=><div className="asset-activity-row" key={p.id}><span className={p.side==="long"?"text-up":"text-down"}>{p.side.toUpperCase()} · {p.leverage}×</span><span>{dollar(p.margin)} margin</span><strong className={currentPrice&&getPnl(p,currentPrice)>=0?"text-up":"text-down"}>{currentPrice?`${getPnl(p,currentPrice)>=0?"+":"−"}${dollar(Math.abs(getPnl(p,currentPrice)))}`:"—"}</strong></div>)}</div>:<p>No paper positions on this token yet. Choose a direction to start practicing.</p>}</div></div>
              <div className="order-panel"><div className="order-title"><strong>Simulated trade</strong><span>SIMULATED</span></div><div className="direction-switch"><button className={side==="long"?"long active":"long"} onClick={()=>setSide("long")}>Long</button><button className={side==="short"?"short active":"short"} onClick={()=>setSide("short")}>Short</button></div><div className="input-title"><span>Paper collateral</span><span>AVAILABLE {dollar(freeBalance(positions))}</span></div><div className="amount-field"><input type="number" min="5" max="1000" step="5" value={margin} onChange={e=>setMargin(e.target.value)} aria-label="Paper collateral amount"/><span>USDC · DEMO</span></div><div className="input-title"><span>Leverage</span><span>MAX 3×</span></div><div className="leverage-options">{[1,2,3].map(n=><button className={lev===n?"active":""} key={n} onClick={()=>setLev(n)}>{n}×</button>)}</div><div className="order-summary"><div><span>Notional exposure</span><strong>{dollar((Number(margin)||0)*lev)}</strong></div><div><span>Entry price</span><strong>{dollar(currentPrice)}</strong></div><div><span>Open paper positions</span><strong>{selectedActive}</strong></div></div><button className="pill pill-accent order-submit" disabled={!canOpen||processing} onClick={openPaper}>{canOpen?`Open paper ${side}`:"Live price / collateral required"}</button><p className="order-disclaimer"><ShieldCheck size={15}/> Paper trades only. No custody, transactions, or real shorts. Prices may be delayed; no automatic liquidation engine.</p></div>
              </>:<div className="axiom-state"><p>Select a market to open a simulated trade.</p></div>}
            </div>
          </aside></>}
        </>:<div className="portfolio-layout"><div className="portfolio-summary"><div className="portfolio-hero"><span>YOUR SIMULATED EQUITY</span><strong>{dollar(equity)}</strong><small>Not a real wallet balance</small></div><div><span>AVAILABLE COLLATERAL</span><strong>{dollar(freeBalance(positions))}</strong></div><div><span>LOCKED COLLATERAL</span><strong>{dollar(lockedMargin(positions))}</strong></div><div><span>REALIZED P&L</span><strong className={realised>=0?"text-up":"text-down"}>{realised>=0?"+":"−"}{dollar(Math.abs(realised))}</strong></div></div><div className="positions-panel"><div className="panel-bar"><span className="panel-title">Open positions <span className="subtle-count">{open.length}</span></span><span className="position-note">MARKS REFRESH EVERY ~45S</span></div>{open.length===0?<div className="feed-message position-empty"><Wallet size={24}/><strong>No open paper positions</strong><span>Find a token to open your first simulated long or short.</span><button onClick={()=>setView("markets")} className="pill pill-outline">Browse markets</button></div>:<div className="positions-list">{open.map(p=><div className="position-row" key={p.id}><div className="position-asset"><TokenIcon market={p}/><span><strong>{p.symbol}</strong><small>{p.side.toUpperCase()} · {p.leverage}×</small></span></div><div><small>ENTRY</small><strong>{dollar(p.entry)}</strong></div><div><small>MARK</small><strong>{dollar(prices[p.mint])}</strong></div><div><small>UNREALIZED P&L</small><strong className={!prices[p.mint]?"":getPnl(p,prices[p.mint])>=0?"text-up":"text-down"}>{prices[p.mint]?`${getPnl(p,prices[p.mint])>=0?"+":"−"}${dollar(Math.abs(Math.max(-p.margin,getPnl(p,prices[p.mint]))))}`:"—"}</strong></div><button className="pill pill-outline position-close" disabled={!prices[p.mint]} onClick={()=>closePaper(p)}>Close</button></div>)}</div>}</div><div className="positions-panel"><div className="panel-bar"><span className="panel-title">Trade history <span className="subtle-count">{closed.length}</span></span></div>{closed.length===0?<div className="history-empty">Your closed paper positions will appear here.</div>:<div className="positions-list">{closed.map(p=><div className="position-row" key={p.id}><div className="position-asset"><TokenIcon market={p}/><span><strong>{p.symbol}</strong><small>{p.side.toUpperCase()} · {p.leverage}×</small></span></div><div><small>ENTRY</small><strong>{dollar(p.entry)}</strong></div><div><small>EXIT</small><strong>{dollar(p.exit)}</strong></div><div><small>REALIZED P&L</small><strong className={(p.pnl||0)>=0?"text-up":"text-down"}>{(p.pnl||0)>=0?"+":"−"}{dollar(Math.abs(p.pnl||0))}</strong></div><span className="closed-tag"><Check size={14}/> CLOSED</span></div>)}</div>}</div><div className="portfolio-fineprint"><CircleHelp size={16}/> Paper P&L is indicative, based on sampled market prices. No fees, slippage, funding, liquidations, wallet deposits, or real trades. Local browser storage only.</div></div>
      </div>
    </main>
    <div className="axiom-statusbar"><div><SolanaGlyph size={14}/> Solana <span className="axiom-divider"/> JUPITER TOKENS V2 <span className="axiom-divider"/> {refreshed?"MARKETS LIVE":"MARKETS CONNECTING"}</div><div><span>Paper equity <strong>{dollar(equity)}</strong></span><span>Open <strong>{open.length}</strong></span><span>Realized <strong className={realised>=0?"text-up":"text-down"}>{realised>=0?"+":"−"}{dollar(Math.abs(realised))}</strong></span></div></div>
    {toast&&<div className="toast" role="status"><Check size={17}/>{toast}<button aria-label="Dismiss notification" onClick={()=>setToast("")}><X size={14}/></button></div>}
  </div>;
}

function LayersIcon(){return <Activity size={18}/>}
function CopyIcon(){return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5"/></svg>}
