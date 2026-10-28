import Link from "next/link";
import {Activity, ChartNoAxesCombined, CircleCheck, Compass, Radar, Search, ShieldCheck, SlidersHorizontal, Target, TrendingDown, TrendingUp} from "lucide-react";
import MarketingHeader from "@/components/MarketingHeader";

const perks=[
 {icon:Radar,title:"Discover fresh launches",body:"Browse new Pump.fun-origin tokens and look up markets by contract address. Real prices where available.",scene:"discovery"},
 {icon:SlidersHorizontal,title:"Pick your direction",body:"Go long or short in a safe simulation. Adjust virtual collateral and leverage before opening a paper position.",scene:"position"},
 {icon:ChartNoAxesCombined,title:"Track every position",body:"Monitor entry prices, market moves and simulated P&L. Close positions and review your trading history.",scene:"performance"}
];
type PreviewScene = "discovery" | "position" | "performance";
function FeaturePreview({scene}:{scene:PreviewScene}){
 if(scene==="discovery") return <div className="feature-art feature-preview preview-discovery" role="img" aria-label="Crisp token discovery interface illustration">
   <div className="preview-bar"><strong><span className="preview-dot"/> Market discovery</strong><span className="preview-label">LIVE DATA</span></div>
   <div className="preview-search"><Search size={16}/> Search a token or mint address</div>
   <div className="preview-token-row"><span className="preview-avatar"><Radar size={18}/></span><span><b>New launches</b><small>Pump.fun discovery</small></span><span className="preview-tag">Explore</span></div>
   <div className="preview-token-row"><span className="preview-avatar muted"><Activity size={18}/></span><span><b>Market activity</b><small>Price & liquidity data</small></span><span className="preview-bars"><i/><i/><i/></span></div>
 </div>;
 if(scene==="position") return <div className="feature-art feature-preview preview-position" role="img" aria-label="Crisp paper trading position controls illustration">
   <div className="preview-bar"><strong>Choose a side</strong><span className="preview-label">SIMULATED</span></div>
   <div className="preview-direction"><span className="selected">Long</span><span>Short</span></div>
   <div className="preview-input-label">Virtual collateral <strong>USDC</strong></div>
   <div className="preview-amount">100.00 <span>USDC</span></div>
   <div className="preview-leverage"><span>1×</span><span className="selected">2×</span><span>3×</span></div>
 </div>;
 return <div className="feature-art feature-preview preview-performance" role="img" aria-label="Crisp illustration of position tracking and a market chart">
    <div className="preview-bar"><strong>Position overview</strong><span className="preview-label">PAPER</span></div>
    <div className="preview-chart-heading"><span>Market movement</span><span>Long / Short</span></div>
    <svg viewBox="0 0 440 150" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="preview-profit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#baf37b" stopOpacity=".27"/><stop offset="100%" stopColor="#baf37b" stopOpacity="0"/></linearGradient></defs>
      <path d="M0 135H440 M0 90H440 M0 45H440" stroke="#293b2d" strokeWidth="1" fill="none"/>
      <path d="M0 130 L30 112 L57 118 L83 85 L108 96 L138 74 L164 90 L188 61 L216 80 L246 44 L275 57 L310 25 L335 49 L366 30 L402 41 L440 12 L440 150 L0 150Z" fill="url(#preview-profit)"/>
      <path d="M0 130 L30 112 L57 118 L83 85 L108 96 L138 74 L164 90 L188 61 L216 80 L246 44 L275 57 L310 25 L335 49 L366 30 L402 41 L440 12" stroke="#baf37b" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
    </svg>
    <div className="preview-chart-foot"><span><span className="preview-dot"/> Market price</span><strong>Track your paper P&L</strong></div>
 </div>;
}

export default function Home(){
 return <main className="landing gravity-landing">
  <div className="landing-bg" aria-hidden="true"/>
  <MarketingHeader/>
  <section className="simple-hero" aria-labelledby="gravity-title">
   <div className="simple-hero-copy">
    <span className="simple-hero-eyebrow"><span className="status-dot"/> SOLANA MEMECOINS · PAPER TRADING</span>
    <h1 id="gravity-title">Long or short<br/><em>memecoins.</em></h1>
    <p>Discover Pump.fun tokens and simulate both sides of the market with live price data. All in one clean terminal.</p>
    <span className="simple-hero-disclaimer"><ShieldCheck size={16} aria-hidden="true"/> Paper trading with virtual funds · No real orders</span>
   </div>
   <div className="simple-device-stage">
    <img src="/gravity-laptop-phone.webp" width="1568" height="789" alt="Gravity laptop and iPhone trading app concepts showing token markets, price charts and simulated long and short controls" fetchPriority="high" decoding="async"/>
   </div>
   <p className="simple-hero-footnote">Illustrative screen design. Gravity currently offers simulated trading, not real leveraged positions.</p>
  </section>
  <section className="section frame gravity-features" id="product">
   <div className="section-heading"><div><span className="overline">THE PLATFORM</span><h2>Memecoins move fast.<br/><span>Stay in control.</span></h2></div><p>From discovery to a closed paper position, Gravity gives you a clear way to explore both sides of Solana's fastest-moving markets.</p></div>
   <div className="feature-grid">{perks.map(({icon:Icon,title,body,scene},index)=><article key={title} className="feature-card">
    <div className="card-top"><span className="feature-index">0{index+1} / {index===0?"DISCOVER":index===1?"POSITION":"TRACK"}</span><span className="feature-icon"><Icon size={24} strokeWidth={1.8}/></span></div>
    <FeaturePreview scene={scene as PreviewScene}/>
    <h3>{title}</h3><p>{body}</p>
   </article>)}</div>
  </section>
  <section className="process frame" id="how"><div className="process-intro"><span className="overline">HOW IT WORKS</span><h2>Three steps.<br/><em>Two directions.</em></h2><p>Go from finding a token to tracking a paper position in moments. Clear tools without the trading noise.</p></div>
   <div className="steps">
    <div><span className="step-icon"><Search size={25}/></span><div><h3>Find your memecoin</h3><p>Browse new Pump.fun launches or paste a Solana mint address.</p></div></div>
    <div><span className="step-icon"><Target size={25}/></span><div><h3>Choose long or short</h3><p>Pick your direction, set your virtual USDC collateral, and adjust leverage.</p></div></div>
    <div><span className="step-icon"><Activity size={25}/></span><div><h3>Follow the movement</h3><p>Review the chart, simulated P&L and your history of closed paper trades.</p></div></div>
   </div>
  </section>
  <section className="bottom-cta frame" id="about">
   <div className="cta-message"><span className="overline">WHAT GOES UP CAN COME DOWN</span><h2>Every market<br/>has two sides.</h2><p>Start exploring memecoins with virtual capital. Learn by taking paper positions on real market prices.</p><Link href="/app" className="pill pill-accent">Open Gravity</Link></div>
   <div className="cta-badges" aria-label="Gravity benefits">
    <div><Compass size={29}/><span>Explore new tokens</span></div><div><TrendingUp size={29}/><span>Simulate going long</span></div><div><TrendingDown size={29}/><span>Simulate going short</span></div><div><CircleCheck size={29}/><span>Track the outcome</span></div>
   </div>
  </section>
  <footer className="footer frame"><span>© 2026 GRAVITY</span><span>Built for discovery. Paper trading only, not financial advice.</span></footer>
 </main>;
}