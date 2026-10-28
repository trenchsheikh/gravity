import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Crosshair, Layers3, LockKeyhole, MoveDownRight, Radar, ShieldCheck, Zap } from "lucide-react";
import Brand from "@/components/Brand";

export default function Home() {
  return <main className="landing">
    <div className="landing-bg" />
    <header className="marketing-nav frame">
      <Brand />
      <nav aria-label="Primary"><a href="#product">The terminal</a><a href="#how">How it works</a><a href="#about">About</a></nav>
      <Link href="/app" className="pill pill-nav">Launch app <ArrowUpRight size={16} /></Link>
    </header>
    <section className="hero frame">
      <div className="hero-left">
        <div className="eyebrow"><span className="status-dot" /> INTRODUCING GRAVITY <span className="eyebrow-num">001 / SOLANA</span></div>
        <h1>What goes up<br/><em>can come down.</em></h1>
        <p className="hero-description">A new perspective on Solana markets. Discover fresh launches, track every move, and explore the other side of the trade.</p>
        <div className="hero-actions"><Link href="/app" className="pill pill-accent">Enter the terminal <ArrowUpRight size={18}/></Link><a href="#how" className="pill pill-outline">Explore Gravity <ArrowDownRight size={18}/></a></div>
        <p className="hero-disclaimer"><span /> LIVE MARKET DATA · PAPER TRADING ONLY</p>
      </div>
      <div className="hero-art" role="img" aria-label="Luminous metallic orbital ring, Gravity brand sculpture">
        <img src="/gravity-orbit.webp" alt="Gravity metallic orbital sculpture with electric lime glow" />
        <span className="art-label label-top">FIG. 01 <span>GRAVITATIONAL SHIFT</span></span>
        <span className="art-label label-bottom">∞ <span>EVERY MARKET HAS TWO SIDES</span></span>
      </div>
    </section>
    <div className="ticker-strip" aria-label="Product features"><div className="ticker-content">BUILT FOR THE OTHER SIDE <span>✳</span> REAL-TIME DISCOVERY <span>✳</span> PAPER LONGS & SHORTS <span>✳</span> SOLANA NATIVE <span>✳</span> BUILT FOR THE OTHER SIDE <span>✳</span> REAL-TIME DISCOVERY <span>✳</span> PAPER LONGS & SHORTS</div></div>
    <section className="section frame" id="product">
      <div className="section-heading"><div><span className="overline">01 / THE PLATFORM</span><h2>The market moves.<br/><span>You move differently.</span></h2></div><p>Discover the newest tokens, research real markets, and practise taking either side. One focused interface, without the noise.</p></div>
      <div className="feature-grid">
        <div className="feature-card feature-wide"><div className="card-top"><span className="overline">DISCOVER</span><Radar size={21}/></div><div className="mini-screen"><div className="mini-screen-head"><span className="mini-dot"/> LIVE / NEW LAUNCHES <span className="mini-live">● MONITORING</span></div><div className="mini-tokens"><div><span className="token-square green"/> NEW PAIR <span>↗</span></div><div><span className="token-square grey"/> MARKET DATA <span>↗</span></div><div><span className="token-square yellow"/> PRICE HISTORY <span>↗</span></div></div></div><h3>Find the next move.</h3><p>Discover Pump.fun-origin tokens with real market data, filtered into a terminal built for speed.</p></div>
        <div className="feature-card"><div className="card-top"><span className="overline">TWO SIDES</span><MoveDownRight size={21}/></div><div className="side-visual"><span>LONG <ArrowUpRight size={20}/></span><span>SHORT <ArrowDownRight size={20}/></span></div><h3>Up or down. Your call.</h3><p>Open simulated long or short positions and learn how both directions behave.</p></div>
        <div className="feature-card"><div className="card-top"><span className="overline">CLARITY</span><Crosshair size={21}/></div><div className="data-visual"><div><span>POSITION</span><strong>ACTIVE</strong></div><div><span>ENTRY PRICE</span><strong>LIVE MARK</strong></div><div><span>COLLATERAL</span><strong>VISIBLE</strong></div></div><h3>Every number counts.</h3><p>Clear entry prices, notional exposure, and mark-to-market paper P&L.</p></div>
      </div>
    </section>
    <section className="process frame" id="how"><div><span className="overline">02 / THE FLOW</span><h2>Less friction.<br/><em>More perspective.</em></h2></div><div className="steps"><div><span className="step-no">01</span><div><h3>Find a token</h3><p>Browse new launches or paste a Solana contract address.</p></div><ArrowUpRight size={20}/></div><div><span className="step-no">02</span><div><h3>Choose your side</h3><p>Select long or short, paper collateral, and leverage.</p></div><ArrowUpRight size={20}/></div><div><span className="step-no">03</span><div><h3>Track the outcome</h3><p>Follow live mark prices, manage positions, and review outcomes.</p></div><ArrowUpRight size={20}/></div></div></section>
    <section className="bottom-cta frame" id="about"><div className="cta-graphic"><img src="/gravity-orbit.webp" alt="" /></div><div><span className="overline">READY FOR A DIFFERENT VIEW?</span><h2>Don't just follow<br/>the market.</h2><p>Explore a different side of Solana. Start with $10,000 in simulated balance, no wallet or deposit needed.</p><Link href="/app" className="pill pill-accent">Open Gravity <ArrowRight size={18}/></Link></div></section>
    <footer className="footer frame"><Brand small/><span>© 2026 GRAVITY. BUILT FOR PERSPECTIVE.</span><span>Simulation only. Not financial advice.</span></footer>
  </main>;
}
