import Link from "next/link";
import {Activity, ChartNoAxesCombined, Radar, Search, ShieldCheck, SlidersHorizontal, Target, TrendingUp} from "lucide-react";
import MarketingHeader from "@/components/MarketingHeader";
import XSocialLink from "@/components/XSocialLink";
import HeroArtwork from "@/components/HeroArtwork";
import { ShaderBackground } from "@/components/ui/shadow-blending";

const perks=[
 {icon:Radar,title:"Discover fresh launches",body:"Explore emerging memecoins and stock tokens with clear, current market data.",scene:"discovery"},
 {icon:SlidersHorizontal,title:"Pick your direction",body:"Choose long or short, set collateral and leverage, and review your position.",scene:"position"},
 {icon:ChartNoAxesCombined,title:"Track every position",body:"Follow market prices, P&L and position history from one interface.",scene:"performance"}
];

type MedallionStyle="meme"|"stock";
function PremiumToken({variant,id,size=44}:{variant:MedallionStyle;id:string;size?:number}){
 const isStock=variant==="stock";
 const accent=isStock?"#b6dcff":"#8db8ff";
 const stroke=isStock?"#c2edff":"#8ab9ff";
 return <svg className={`gravity-premium-token gravity-premium-token-${variant}`} width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden="true" focusable="false">
  <defs>
   <linearGradient id={id+"-rim"} x1="17" y1="7" x2="73" y2="77" gradientUnits="userSpaceOnUse">
    <stop stopColor="#eef8ff"/><stop offset=".21" stopColor="#568dca"/><stop offset=".48" stopColor="#102947"/><stop offset=".73" stopColor="#7fc3ff"/><stop offset="1" stopColor="#071b34"/>
   </linearGradient>
   <radialGradient id={id+"-face"} cx="0" cy="0" r="1" gradientTransform="translate(30 24) rotate(60) scale(68)" gradientUnits="userSpaceOnUse">
    <stop stopColor={isStock?"#273c61":"#234374"}/><stop offset=".53" stopColor="#0d1d36"/><stop offset="1" stopColor="#050c1a"/>
   </radialGradient>
   <linearGradient id={id+"-shine"} x1="23" y1="19" x2="67" y2="66" gradientUnits="userSpaceOnUse">
    <stop stopColor="#e0f7ff"/><stop offset=".55" stopColor={accent}/><stop offset="1" stopColor="#3c74b2"/>
   </linearGradient>
  </defs>
  <circle cx="44" cy="44" r="41" fill={`url(#${id}-rim)`} stroke="#8cb9e4" strokeOpacity=".42" strokeWidth=".6"/>
  <circle cx="44" cy="44" r="36.6" fill="#07111f" stroke="#010a19" strokeWidth="1.2"/>
  <circle cx="44" cy="44" r="34.1" fill={`url(#${id}-face)`} stroke={`url(#${id}-shine)`} strokeWidth="1.2"/>
  <path d="M20 26A31 31 0 0 1 63 21" stroke="#e0f4ff" strokeOpacity=".49" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M64 66A31 31 0 0 1 25 68" stroke="#81befb" strokeOpacity=".36" strokeWidth="1.4" strokeLinecap="round"/>
  <circle cx="44" cy="44" r="26" stroke={stroke} strokeOpacity=".22" strokeWidth=".8" strokeDasharray="2 4"/>
  {isStock?
   <g stroke={`url(#${id}-shine)`} strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M27 57V51M39 57V43M51 57V36M63 57V27"/>
    <path d="M26 39L39 33L49 39L63 25"/>
    <path d="M55 25H63V33"/>
   </g>:
   <g stroke={`url(#${id}-shine)`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M44 22L49 35L62 40L49 45L44 59L39 45L26 40L39 35L44 22Z"/>
    <path d="M60 54L63 60L69 63L63 66L60 72L57 66L51 63L57 60Z" strokeWidth="1.8"/>
   </g>}
  <circle cx="17" cy="34" r="1.4" fill="#b9d9ff" fillOpacity=".8"/>
  <circle cx="70" cy="48" r="1.4" fill="#b9d9ff" fillOpacity=".65"/>
 </svg>;
}

type PreviewScene = "discovery" | "position" | "performance";
function FeaturePreview({scene}:{scene:PreviewScene}){
 if(scene==="discovery") return <div className="feature-art feature-preview preview-discovery" role="img" aria-label="Crisp token discovery interface illustration">
   <div className="preview-bar"><strong><span className="preview-dot"/> Market discovery</strong><span className="preview-label">LIVE DATA</span></div>
   <div className="preview-search"><Search size={16}/> Search a token or mint address</div>
   <div className="preview-token-row"><span className="preview-avatar premium-avatar"><PremiumToken variant="meme" id="gravity-launch-token" size={45}/></span><span><b>New launches</b><small>New token discovery</small></span><span className="preview-tag">Explore</span></div>
   <div className="preview-token-row"><span className="preview-avatar premium-avatar"><PremiumToken variant="stock" id="gravity-stock-token" size={45}/></span><span><b>Market activity</b><small>Price & liquidity data</small></span><span className="preview-bars"><i/><i/><i/></span></div>
 </div>;
 if(scene==="position") return <div className="feature-art feature-preview preview-position" role="img" aria-label="Position controls illustration">
   <div className="preview-bar"><strong>Choose a side</strong><span className="preview-label">LONG / SHORT</span></div>
   <div className="preview-direction"><span className="selected">Long</span><span>Short</span></div>
   <div className="preview-input-label">Virtual collateral <strong>USDC</strong></div>
   <div className="preview-amount">100.00 <span>USDC</span></div>
   <div className="preview-leverage"><span>1×</span><span className="selected">2×</span><span>3×</span></div>
 </div>;
 return <div className="feature-art feature-preview preview-performance" role="img" aria-label="Crisp illustration of position tracking and a market chart">
    <div className="preview-bar"><strong>Position overview</strong><span className="preview-label">POSITIONS</span></div>
    <div className="preview-chart-heading"><span>Market movement</span><span>Long / Short</span></div>
    <svg viewBox="0 0 440 150" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="preview-profit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7dbbf1" stopOpacity=".27"/><stop offset="100%" stopColor="#7dbbf1" stopOpacity="0"/></linearGradient></defs>
      <path d="M0 135H440 M0 90H440 M0 45H440" stroke="#27313d" strokeWidth="1" fill="none"/>
      <path d="M0 130 L30 112 L57 118 L83 85 L108 96 L138 74 L164 90 L188 61 L216 80 L246 44 L275 57 L310 25 L335 49 L366 30 L402 41 L440 12 L440 150 L0 150Z" fill="url(#preview-profit)"/>
      <path d="M0 130 L30 112 L57 118 L83 85 L108 96 L138 74 L164 90 L188 61 L216 80 L246 44 L275 57 L310 25 L335 49 L366 30 L402 41 L440 12" stroke="#7dbbf1" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
    </svg>
    <div className="preview-chart-foot"><span><span className="preview-dot"/> Market price</span><strong>Track your P&L</strong></div>
 </div>;
}

export default function Home(){
 return <main className="landing gravity-landing">
  <div className="shader-backdrop" aria-hidden="true"><ShaderBackground className="gravity-shader-canvas"/></div>
  <MarketingHeader/>
  <section className="simple-hero" aria-labelledby="gravity-title">
   <div className="simple-hero-copy">
    <span className="simple-hero-eyebrow">LONG OR SHORT</span>
    <h1 id="gravity-title">Memecoins <span className="gravity-hero-and">&</span><br/>Stock tokens<span className="hero-dot">.</span></h1>
    <p>Explore memecoins and tokenized stocks in one place. Follow the charts, choose your direction, and track every move.</p>
    <span className="simple-hero-disclaimer"><ShieldCheck size={16} aria-hidden="true"/> Virtual funds only · No real orders</span>
   </div>
   <div className="simple-device-stage gravity-chart-stage">
    <HeroArtwork/>
   </div>
   <p className="simple-hero-footnote">Real market prices, virtual positions. Gravity does not send live orders.</p>
  </section>
  <section className="section frame gravity-features" id="product">
   <div className="section-heading"><div><span className="overline">THE PLATFORM</span><h2>Two markets.<br/><span>One terminal.</span></h2></div><p>Find fast-moving memecoins and tokenized stock markets in one streamlined workspace.</p></div>
   <div className="feature-grid">{perks.map(({icon:Icon,title,body,scene},index)=><article key={title} className="feature-card">
    <div className="card-top"><span className="feature-index">0{index+1} / {index===0?"DISCOVER":index===1?"POSITION":"TRACK"}</span><span className="feature-icon"><Icon size={24} strokeWidth={1.8}/></span></div>
    <FeaturePreview scene={scene as PreviewScene}/>
    <h3>{title}</h3><p>{body}</p>
   </article>)}</div>
  </section>
  <section className="process frame" id="how"><div className="process-intro"><span className="overline">HOW IT WORKS</span><h2>Three steps.<br/><em>Two directions.</em></h2><p>From discovery to position tracking, Gravity puts the essentials in one clean view.</p></div>
   <div className="steps">
    <div><span className="step-icon"><Search size={25}/></span><div><h3>Choose your market</h3><p>Choose memecoins or stock tokens, then search by name, symbol, or token address.</p></div></div>
    <div><span className="step-icon"><Target size={25}/></span><div><h3>Choose long or short</h3><p>Choose your direction, set collateral, and adjust leverage.</p></div></div>
    <div><span className="step-icon"><Activity size={25}/></span><div><h3>Follow the movement</h3><p>Review market charts, P&L and your position history.</p></div></div>
   </div>
  </section>
  <section className="bottom-cta frame" id="about">
   <div className="cta-message"><span className="overline">WHAT GOES UP CAN COME DOWN</span><h2>Every market<br/>has two sides.</h2><p>Explore two kinds of markets with live prices and one clear trading workspace.</p><Link href="/app" className="pill pill-accent">Open Gravity</Link></div>
   <div className="cta-badges" aria-label="Gravity benefits">
    <div><PremiumToken variant="meme" id="gravity-cta-meme" size={48}/><span>Explore memecoins</span></div><div><PremiumToken variant="stock" id="gravity-cta-stock" size={48}/><span>Find stock tokens</span></div><div><TrendingUp size={34} strokeWidth={1.65}/><span>Choose your direction</span></div><div><ChartNoAxesCombined size={34} strokeWidth={1.65}/><span>Follow every move</span></div>
   </div>
  </section>
  <footer className="footer frame"><div className="gravity-footer-left"><span>© 2026 GRAVITY</span><Link className="gravity-footer-docs" href="/docs">Documentation</Link><XSocialLink placement="footer"/></div><span>Virtual funds only. No real orders. Tokenized stocks are not direct company shares. Not financial advice.</span></footer>
 </main>;
}