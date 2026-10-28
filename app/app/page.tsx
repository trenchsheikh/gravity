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
  return <div className="chart-live"><div className="chart-grid"/><svg viewBox="0 0 1000 250" preserveAspectRatio="none" aria-label="Historical price chart sourced from GeckoTerminal" role="img"><defs><linearGradient id="chartfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={up?"#b7ef6e":"#ff716f"} stopOpacity=".20"/><stop offset="1" stopColor={up?"#b7ef6e":"#ff716f"} stopOpacity="0"/></linearGradient></defs><polygon points={area} fill="url(#chartfill)"/><polyline points={pts} fill="none" stroke={up?"#b7ef6e":"#ff716f"} strokeWidth="2.3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="chart-ticks"><span>OLDER</span><span>5 MIN CANDLES · GECKOTERMINAL</span><span>NOW</span></div></div>
}
export default function Terminal(){
  const [view,setView]=useState<"markets"|"positions">("markets");
  const [tab,setTab]=useState<"new"|"trending">("new");
  const [query,setQuery]=useState("");
  const [markets,setMarkets]=useState<Market[]>([]);
  const [selected,setSelected]=useState<Market|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [provider,setProvider]=useState("");
  const [refreshed,setRefreshed]=useState<number|null>(null);
  const [tick,setTick]=useState(0);
  const [side,setSide]=useState<"long"|"short">("short");
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
  const [watchlist,setWatchlist]=useState<string[]>([]);
  const [watchOnly,setWatchOnly]=useState(false);

  useEffect(()=>{setPositions(getPositions());try{const v=JSON.parse(localStorage.getItem("gravity.watchlist.v1")||"[]");if(Array.isArray(v))setWatchlist(v.filter(x=>typeof x==="string"));}catch{}},[]);
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(""),4500);return()=>clearTimeout(id)},[toast]);
  const fetchMarkets=useCallback(async(signal?:AbortSignal)=>{
    setLoading(true);setError("");
    try {
      const params=new URLSearchParams({tab});if(query.trim())params.set("q",query.trim());
      const r=await fetch(`/api/markets?${params}`,{signal,cache:"no-store"});const data=await r.json();
      if(!r.ok)throw Error(data.error||"Market feed temporarily unavailable");
      const list=(data.markets||[]) as Market[];
      setMarkets(list);setProvider((data.providers||[]).join(" + "));setRefreshed(Date.now());
      setSelected(current=>{if(!current)return list[0]||null;return list.find(m=>m.mint===current.mint)||current});
      setPrices(old=>({...old,...Object.fromEntries(list.filter(m=>m.priceUsd!=null&&m.priceUsd>0).map(m=>[m.mint,m.priceUsd!]))}));
    } catch(e){if((e as Error).name!=="AbortError"){setError(e instanceof Error?e.message:"Could not load markets");setMarkets([])}}finally{if(!signal?.aborted)setLoading(false)}
  },[tab,query]);
  useEffect(()=>{const c=new AbortController();const timeout=setTimeout(()=>fetchMarkets(c.signal),query?450:0);return()=>{clearTimeout(timeout);c.abort()}},[fetchMarkets,tick]);
  useEffect(()=>{const id=setInterval(()=>setTick(x=>x+1),30000);return()=>clearInterval(id)},[]);
  useEffect(()=>{if(!selected?.poolAddress){setCandles([]);setChartMessage("Historical market data isn't available for this token yet.");return}
    const c=new AbortController();setCandlesLoading(true);setCandles([]);fetch(`/api/candles?pool=${encodeURIComponent(selected.poolAddress)}`,{signal:c.signal}).then(r=>r.json()).then(d=>{if(!c.signal.aborted){setCandles(d.candles||[]);setChartMessage(d.error||"No historical candles found for this pool.")}}).catch(()=>{if(!c.signal.aborted)setChartMessage("The chart provider is unavailable.")}).finally(()=>{if(!c.signal.aborted)setCandlesLoading(false)});
    return()=>c.abort();
  },[selected?.poolAddress]);
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
  const visible=watchOnly?markets.filter(m=>watchlist.includes(m.mint)):markets;
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
  return <div className="terminal-shell">
    <aside className={`sidebar ${mobileMenu?"open":""}`}>
      <div className="sidebar-top"><Brand small/><button className="icon-button mobile-close" onClick={()=>setMobileMenu(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="sidebar-label">WORKSPACE</div>
      <button className={`side-link ${view==="markets"?"current":""}`} onClick={()=>{setView("markets");setMobileMenu(false)}}><Compass size={18}/> Discover markets <ArrowUpRight className="side-end" size={15}/></button>
      <button className={`side-link ${view==="positions"?"current":""}`} onClick={()=>{setView("positions");setMobileMenu(false)}}><LayersIcon/> Paper portfolio <span className="side-counter">{open.length}</span></button>
      <div className="sidebar-label second-label">QUICK ACCESS</div>
      <button className={`side-link ${watchOnly&&view==="markets"?"current-soft":""}`} onClick={()=>{setWatchOnly(x=>!x);setView("markets");setMobileMenu(false)}}><Star size={17}/> Watchlist <span className="side-counter">{watchlist.length}</span></button>
      <a className="side-link" href="https://pump.fun" target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/> Pump.fun <ArrowUpRight className="side-end" size={15}/></a>
      <div className="sidebar-foot"><div className="balance-icon"><Wallet size={19}/></div><span><small>PAPER BALANCE</small><strong>{dollar(freeBalance(positions))}</strong></span><span className="live-indicator"/></div>
    </aside>
    {mobileMenu&&<button className="mobile-backdrop" onClick={()=>setMobileMenu(false)} aria-label="Dismiss menu"/>}
    <main className="terminal-main">
      <header className="terminal-header"><div className="header-left"><button className="icon-button mobile-menu-btn" onClick={()=>setMobileMenu(true)} aria-label="Open menu"><Menu size={21}/></button><span className="header-route">TERMINAL <span>/</span> {view==="markets"?"MARKETS":"PORTFOLIO"}</span></div><div className="header-right"><span className="pill pill-demo"><span className="status-dot"/> PAPER TRADING</span><div className="header-separator"/><span className="header-sol">◎ SOLANA</span><Link href="/" className="pill pill-quiet"><ArrowLeft size={15}/> Home</Link></div></header>
      <div className="workspace">
        <div className="workspace-title"><div><span className="overline">GRAVITY / {view==="markets"?"DISCOVER":"PORTFOLIO"}</span><h1>{view==="markets"?"Discover the other side.":"Your paper positions."}</h1><p>{view==="markets"?"Fresh launches. Live markets. A different perspective.":"Everything you're tracking, in one place. No real funds are used."}</p></div><div className="workspace-tag"><Activity size={16}/><span>{refreshed?"MARKET FEED ACTIVE":"CONNECTING FEED"}</span></div></div>
        {view==="markets"?<>
          <div className="metric-row"><div className="metric"><span>VIRTUAL EQUITY</span><strong>{dollar(equity)}</strong><small>Starting paper balance: $10,000</small></div><div className="metric"><span>OPEN POSITIONS</span><strong>{open.length.toString().padStart(2,"0")}</strong><small>Up to 3× simulated exposure</small></div><div className="metric"><span>REALIZED P&L</span><strong className={realised>=0?"text-up":"text-down"}>{realised>=0?"+":"−"}{dollar(Math.abs(realised))}</strong><small>Closed paper positions only</small></div></div>
          <div className="trading-layout">
            <section className="market-panel"><div className="panel-bar"><div className="panel-heading"><span className="panel-title">Markets</span><span className="subtle-count">{visible.length} TOKENS</span></div><button className="circle-button" onClick={()=>setTick(x=>x+1)} title="Refresh markets" aria-label="Refresh markets"><RefreshCw size={15} className={loading?"spin":""}/></button></div>
              <div className="market-toolbar"><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search token or paste contract..." aria-label="Search token"/>{query&&<button onClick={()=>setQuery("")} aria-label="Clear search"><X size={15}/></button>}</div><div className="market-filter"><button className={tab==="new"?"active":""} onClick={()=>{setTab("new");setWatchOnly(false)}}>New</button><button className={tab==="trending"?"active":""} onClick={()=>{setTab("trending");setWatchOnly(false)}}>Active</button><button className={watchOnly?"active":""} onClick={()=>setWatchOnly(x=>!x)} aria-label="Filter watchlist"><Star size={14}/></button></div></div>
              <div className="market-table-head"><span>ASSET</span><span>PRICE</span><span>24H</span><span>MCAP</span><span></span></div>
              <div className="market-list">{loading?Array.from({length:7},(_,i)=><div className="skeleton-row" key={i}><div className="skeleton-icon"/><div className="skeleton-line"/></div>):error?<div className="feed-message"><CircleHelp size={24}/><strong>Feed unavailable</strong><span>{error}</span><button className="pill pill-outline" onClick={()=>setTick(x=>x+1)}>Try again <RefreshCw size={15}/></button></div>:visible.length===0?<div className="feed-message"><Search size={24}/><strong>No matching tokens</strong><span>{watchOnly?"Star markets to add them to your watchlist.":"Try another search or switch market feeds."}</span></div>:visible.map(m=><button className={`market-row ${selected?.mint===m.mint?"selected":""}`} key={m.mint} onClick={()=>setSelected(m)}><div className="asset-cell"><TokenIcon market={m}/><span className="asset-copy"><strong>{m.symbol}</strong><small>{m.name}</small></span></div><span className="price-cell">{dollar(m.priceUsd)}</span><span className={`change-cell ${(m.change24h??0)>=0?"text-up":"text-down"}`}>{change(m.change24h)}</span><span className="marketcap-cell">{dollar(m.marketCap,true)}</span><span className="row-chevron"><ArrowUpRight size={15}/></span></button>)}</div>
              <div className="market-foot"><span><span className="status-dot"/> {provider||"CONNECTING"}</span><span>{refreshed?`REFRESHED ${new Date(refreshed).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}`:"WAITING FOR DATA"}</span></div>
            </section>
            <section className="trade-column">
              {selected?<><div className="asset-panel"><div className="asset-top"><div className="asset-identity"><TokenIcon market={selected} size={47}/><div><h2>{selected.name} <span>{selected.symbol}</span></h2><p>{selected.mint.slice(0,6)}…{selected.mint.slice(-5)} <button title="Copy contract address" aria-label="Copy contract address" onClick={()=>{navigator.clipboard.writeText(selected.mint).then(()=>setToast("Contract copied"))}}><CopyIcon/></button></p></div></div><button className={`circle-button ${watchlist.includes(selected.mint)?"star-active":""}`} onClick={()=>toggleWatch(selected.mint)} title="Add to watchlist" aria-label="Toggle watchlist"><Star size={17} fill={watchlist.includes(selected.mint)?"currentColor":"none"}/></button></div><div className="asset-pricing"><div><small>MARK PRICE</small><strong>{dollar(currentPrice)}</strong></div><span className={`percent-pill ${(selected.change24h??0)>=0?"positive":"negative"}`}>{(selected.change24h??0)>=0?<TrendingUp size={15}/>:<TrendingDown size={15}/>} {change(selected.change24h)}</span></div><div className="chart-container"><div className="chart-header"><span>PRICE ACTION</span><span className="chart-badge">5M · HISTORICAL</span></div><PriceChart candles={candles} loading={candlesLoading} empty={chartMessage}/></div><div className="asset-stats"><div><span>MARKET CAP</span><strong>{dollar(selected.marketCap,true)}</strong></div><div><span>24H VOLUME</span><strong>{dollar(selected.volume24h,true)}</strong></div><div><span>LIQUIDITY</span><strong>{dollar(selected.liquidityUsd,true)}</strong></div></div></div>
              <div className="order-panel"><div className="order-title"><strong>New paper position</strong><span>SIMULATED</span></div><div className="direction-switch"><button className={side==="long"?"long active":"long"} onClick={()=>setSide("long")}><ArrowUpRight size={18}/> Long</button><button className={side==="short"?"short active":"short"} onClick={()=>setSide("short")}><ArrowDownRight size={18}/> Short</button></div><div className="input-title"><span>Paper collateral</span><span>AVAILABLE {dollar(freeBalance(positions))}</span></div><div className="amount-field"><input type="number" min="5" max="1000" step="5" value={margin} onChange={e=>setMargin(e.target.value)} aria-label="Paper collateral amount"/><span>USDC · DEMO</span></div><div className="input-title"><span>Leverage</span><span>MAX 3×</span></div><div className="leverage-options">{[1,2,3].map(n=><button className={lev===n?"active":""} key={n} onClick={()=>setLev(n)}>{n}×</button>)}</div><div className="order-summary"><div><span>Notional exposure</span><strong>{dollar((Number(margin)||0)*lev)}</strong></div><div><span>Entry price</span><strong>{dollar(currentPrice)}</strong></div><div><span>Open paper positions</span><strong>{selectedActive}</strong></div></div><button className="pill pill-accent order-submit" disabled={!canOpen||processing} onClick={openPaper}>{canOpen?`Open paper ${side}`:"Live price / collateral required"}<ArrowRight size={17}/></button><p className="order-disclaimer"><ShieldCheck size={15}/> Paper trades only. No custody, transactions, or real shorts. Prices may be delayed; no automatic liquidation engine.</p></div></>:<div className="asset-panel selected-empty"><Compass size={30}/><h3>Select a market</h3><p>Choose a token from the live feed to view its chart and practise a paper trade.</p></div>}
            </section>
          </div>
        </>:<div className="portfolio-layout"><div className="portfolio-summary"><div className="portfolio-hero"><span>YOUR SIMULATED EQUITY</span><strong>{dollar(equity)}</strong><small>Not a real wallet balance</small></div><div><span>AVAILABLE COLLATERAL</span><strong>{dollar(freeBalance(positions))}</strong></div><div><span>LOCKED COLLATERAL</span><strong>{dollar(lockedMargin(positions))}</strong></div><div><span>REALIZED P&L</span><strong className={realised>=0?"text-up":"text-down"}>{realised>=0?"+":"−"}{dollar(Math.abs(realised))}</strong></div></div><div className="positions-panel"><div className="panel-bar"><span className="panel-title">Open positions <span className="subtle-count">{open.length}</span></span><span className="position-note">MARKS REFRESH EVERY ~45S</span></div>{open.length===0?<div className="feed-message position-empty"><Wallet size={24}/><strong>No open paper positions</strong><span>Find a token to open your first simulated long or short.</span><button onClick={()=>setView("markets")} className="pill pill-outline">Browse markets <ArrowRight size={15}/></button></div>:<div className="positions-list">{open.map(p=><div className="position-row" key={p.id}><div className="position-asset"><TokenIcon market={p}/><span><strong>{p.symbol}</strong><small>{p.side.toUpperCase()} · {p.leverage}×</small></span></div><div><small>ENTRY</small><strong>{dollar(p.entry)}</strong></div><div><small>MARK</small><strong>{dollar(prices[p.mint])}</strong></div><div><small>UNREALIZED P&L</small><strong className={!prices[p.mint]?"":getPnl(p,prices[p.mint])>=0?"text-up":"text-down"}>{prices[p.mint]?`${getPnl(p,prices[p.mint])>=0?"+":"−"}${dollar(Math.abs(Math.max(-p.margin,getPnl(p,prices[p.mint]))))}`:"—"}</strong></div><button className="pill pill-outline position-close" disabled={!prices[p.mint]} onClick={()=>closePaper(p)}>Close <X size={14}/></button></div>)}</div>}</div><div className="positions-panel"><div className="panel-bar"><span className="panel-title">Trade history <span className="subtle-count">{closed.length}</span></span></div>{closed.length===0?<div className="history-empty">Your closed paper positions will appear here.</div>:<div className="positions-list">{closed.map(p=><div className="position-row" key={p.id}><div className="position-asset"><TokenIcon market={p}/><span><strong>{p.symbol}</strong><small>{p.side.toUpperCase()} · {p.leverage}×</small></span></div><div><small>ENTRY</small><strong>{dollar(p.entry)}</strong></div><div><small>EXIT</small><strong>{dollar(p.exit)}</strong></div><div><small>REALIZED P&L</small><strong className={(p.pnl||0)>=0?"text-up":"text-down"}>{(p.pnl||0)>=0?"+":"−"}{dollar(Math.abs(p.pnl||0))}</strong></div><span className="closed-tag"><Check size={14}/> CLOSED</span></div>)}</div>}</div><div className="portfolio-fineprint"><CircleHelp size={16}/> Paper P&L is indicative, based on sampled market prices. No fees, slippage, funding, liquidations, wallet deposits, or real trades. Local browser storage only.</div></div>}
      </div>
      <footer className="terminal-footer"><span>© GRAVITY 2026</span><span>DATA: PUMP.FUN / GECKOTERMINAL / DEXSCREENER · PAPER TRADING ONLY</span><span>NOT FINANCIAL ADVICE</span></footer>
    </main>
    {toast&&<div className="toast" role="status"><Check size={17}/>{toast}<button aria-label="Dismiss notification" onClick={()=>setToast("")}><X size={14}/></button></div>}
  </div>;
}
function LayersIcon(){return <Activity size={18}/>}
function CopyIcon(){return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5"/></svg>}
