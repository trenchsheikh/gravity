import Link from "next/link";
import {Activity, ChartNoAxesCombined, CircleCheck, Compass, Radar, Search, ShieldCheck, SlidersHorizontal, Target, TrendingDown, TrendingUp} from "lucide-react";
import Brand from "@/components/Brand";

const perks=[
 {icon:Radar,title:"Discover fresh launches",body:"Browse new Pump.fun-origin tokens and look up markets by contract address. Real prices where available.",scene:"discovery",alt:"Illustrative new-token discovery dashboard"},
 {icon:SlidersHorizontal,title:"Pick your direction",body:"Go long or short in a safe simulation. Adjust virtual collateral and leverage before opening a paper position.",scene:"position",alt:"Illustrative long and short trading controls"},
 {icon:ChartNoAxesCombined,title:"Track every position",body:"Monitor entry prices, market moves and simulated P&L. Close positions and review your trading history.",scene:"performance",alt:"Illustrative token price chart and position tracking dashboard"}
];
export default function Home(){
 return <main className="landing gravity-landing">
  <div className="landing-bg" aria-hidden="true"/>
  <header className="marketing-nav frame">
   <Brand/>
   <nav aria-label="Primary navigation"><a href="#product">The platform</a><a href="#how">How it works</a><a href="#about">About Gravity</a></nav>
   <Link href="/app" className="pill pill-nav">Launch app</Link>
  </header>
  <section className="hero frame" aria-labelledby="gravity-title">
   <div className="hero-left">
    <div className="eyebrow"><span className="status-dot"/> SOLANA MEMECOIN TRADING, REIMAGINED</div>
    <h1 id="gravity-title">Long or Short<br/><em>Memecoins.</em></h1>
    <p className="hero-description">Explore Pump.fun tokens, choose which way you think the price will move, and open simulated long or short positions. One clean terminal. Real market data. No real money.</p>
    <div className="hero-actions"><Link href="/app" className="pill pill-accent">Start paper trading</Link><a href="#product" className="pill pill-outline">Explore the platform</a></div>
    <div className="hero-trust"><ShieldCheck size={20} aria-hidden="true"/><span>Paper trading only · $10,000 virtual balance · No deposits</span></div>
   </div>
   <div className="hero-art hero-product-art">
    <div className="hero-product-frame"><div className="scene-image scene-hero" role="img" aria-label="Illustrative trading interface with price charts and long-short controls"/><div className="hero-visual-caption"><span className="status-dot"/> BUILT FOR BOTH SIDES</div></div>
    <span className="hero-image-note">Illustrative interface artwork</span>
   </div>
  </section>
  <div className="ticker-strip" aria-label="Platform capabilities"><div className="ticker-content">PUMP.FUN TOKEN DISCOVERY <span>✳</span> SIMULATED LONGS & SHORTS <span>✳</span> LIVE MARKET PRICES <span>✳</span> CLEAR POSITION TRACKING <span>✳</span> PUMP.FUN TOKEN DISCOVERY <span>✳</span> SIMULATED LONGS & SHORTS <span>✳</span> LIVE MARKET PRICES</div></div>
  <section className="section frame gravity-features" id="product">
   <div className="section-heading"><div><span className="overline">THE PLATFORM</span><h2>Memecoins move fast.<br/><span>Stay in control.</span></h2></div><p>From discovery to a closed paper position, Gravity gives you a clear way to explore both sides of Solana's fastest-moving markets.</p></div>
   <div className="feature-grid">{perks.map(({icon:Icon,title,body,scene,alt},index)=><article key={title} className="feature-card">
    <div className="card-top"><span className="feature-index">0{index+1} / {index===0?"DISCOVER":index===1?"POSITION":"TRACK"}</span><span className="feature-icon"><Icon size={24} strokeWidth={1.8}/></span></div>
    <div className={`feature-art scene-image scene-${scene}`} role="img" aria-label={alt}/>
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