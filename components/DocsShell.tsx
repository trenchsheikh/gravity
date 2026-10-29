"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {
  ArrowLeft,ArrowRight,ArrowUpRight,BookOpen,Check,ChevronRight,
  Command,Compass,FileText,Home,Layers3,Link2,Menu,
  Search,ShieldCheck,TrendingUp,Wallet,X
} from "lucide-react";
import type {DocArticle,DocSection} from "@/lib/docs-content";
import {docs,docsGroups,docHref} from "@/lib/docs-content";

function Section({section}:{section:DocSection}){
 return <section className="gd-section" aria-labelledby={section.id}>
   <h2 id={section.id}>{section.title}<a className="gd-heading-anchor" href={"#"+section.id} aria-label={"Link to "+section.title}><Link2 size={15}/></a></h2>
   {section.body.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
   {section.bullets&&<ul className="gd-points">{section.bullets.map((item,i)=><li key={i}>{item}</li>)}</ul>}
   {section.table&&<div className="gd-table-scroll"><table><thead><tr>{section.table.columns.map(column=><th key={column}>{column}</th>)}</tr></thead><tbody>{section.table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
   {section.note&&<aside className={"gd-note gd-note-"+section.note.tone}><div className="gd-note-header"><ShieldCheck size={17}/><strong>{section.note.title}</strong></div><p>{section.note.text}</p></aside>}
 </section>;
}

const quickLinks=[
 {slug:"market-discovery",title:"Explore markets",desc:"Memecoins, stocks, and useful market signals.",icon:Compass},
 {slug:"virtual-positions",title:"Virtual positions",desc:"Follow long and short exposure in one place.",icon:TrendingUp},
 {slug:"wallet-connection",title:"Solana wallets",desc:"Connect and manage a compatible wallet.",icon:Wallet},
 {slug:"charts-and-data",title:"Charts & data",desc:"Read candles, intervals and price statistics.",icon:Layers3}
];

export default function DocsShell({article}:{article:DocArticle}){
 const [query,setQuery]=useState("");
 const [drawer,setDrawer]=useState(false);
 const [copied,setCopied]=useState(false);
 const search=useRef<HTMLInputElement|null>(null);
 const normalized=query.trim().toLowerCase();
 const matches=useMemo(()=>docs.filter(doc=>
   !normalized||
   (doc.title+" "+doc.description+" "+doc.group+" "+doc.sections.map(s=>s.title+" "+s.body.join(" ")).join(" "))
    .toLowerCase().includes(normalized)
 ),[normalized]);
 const index=docs.findIndex(doc=>doc.slug===article.slug);
 const previous=docs[index-1],next=docs[index+1];

 useEffect(()=>{
  const keyboard=(event:KeyboardEvent)=>{
   if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){
    event.preventDefault();setDrawer(true);
    requestAnimationFrame(()=>search.current?.focus());
   }
   if(event.key==="Escape"){setDrawer(false);setQuery("")}
  };
  window.addEventListener("keydown",keyboard);
  return()=>window.removeEventListener("keydown",keyboard);
 },[]);
 useEffect(()=>{setDrawer(false);setQuery("");window.scrollTo({top:0,behavior:"instant"})},[article.slug]);
 useEffect(()=>{
  if(!drawer)return;
  const onResize=()=>{if(window.innerWidth>920)setDrawer(false)};
  window.addEventListener("resize",onResize);
  return()=>window.removeEventListener("resize",onResize);
 },[drawer]);

 const copyLink=async()=>{
  try{await navigator.clipboard.writeText(window.location.href);setCopied(true);
   window.setTimeout(()=>setCopied(false),1800);
  }catch{}
 };
 return <div className="gravity-docs">
   <header className="gd-header">
     <div className="gd-header-left">
       <Link href="/" className="gd-brand" aria-label="Gravity homepage">gravity<span>.</span></Link>
       <span className="gd-brand-divider"/>
       <Link href="/docs" className="gd-documentation-title">Documentation</Link>
     </div>
     <div className="gd-header-right">
       <button className="gd-search-shortcut" type="button" aria-label="Search documentation" onClick={()=>{
        setDrawer(true);requestAnimationFrame(()=>search.current?.focus());
       }}><Search size={15}/><span>Search the docs</span><kbd><Command size={12}/> K</kbd></button>
       <a href="https://x.com/gravitydottrade" className="gd-social" target="_blank" rel="noopener noreferrer" aria-label="Follow Gravity on X">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.801-7.584-6.635 7.584H.477l8.6-9.832L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.29 19.492h2.04L6.486 3.24H4.298l13.313 17.405Z"/></svg>
       </a>
       <Link className="gd-launch" href="/app">Launch app <ArrowUpRight size={15}/></Link>
       <button type="button" className="gd-mobile-toggle" onClick={()=>setDrawer(true)} aria-label="Open documentation navigation"><Menu size={21}/></button>
     </div>
   </header>

   {drawer&&<button type="button" className="gd-drawer-backdrop" aria-label="Close documentation menu" onClick={()=>setDrawer(false)}/>}
   <div className="gd-layout">
     <aside className={"gd-sidebar"+(drawer?" is-open":"")} aria-label="Documentation topics">
       <div className="gd-sidebar-top">
         <div className="gd-sidebar-label"><BookOpen size={16}/> <strong>GUIDE / V1</strong></div>
         <button className="gd-drawer-close" onClick={()=>setDrawer(false)} type="button" aria-label="Close navigation"><X size={18}/></button>
       </div>
       <label className="gd-filter"><Search size={16}/>
         <input ref={search} type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search documentation..." aria-label="Filter documentation topics"/>
         {query?<button type="button" onClick={()=>{setQuery("");search.current?.focus()}} aria-label="Clear search"><X size={13}/></button>:<kbd>⌘ K</kbd>}
       </label>
       <nav className="gd-nav">
         {docsGroups.map(group=>{
          const entries=matches.filter(item=>item.group===group.name);
          return entries.length?<div key={group.name} className="gd-nav-group">
            <div className="gd-nav-label">{group.name}</div>
            {entries.map(doc=><Link key={doc.slug} href={docHref(doc.slug)}
             className={"gd-nav-link"+(doc.slug===article.slug?" is-active":"")}
             aria-current={doc.slug===article.slug?"page":undefined}
             onClick={()=>setDrawer(false)}>
               <span>{doc.title}</span>{doc.slug===article.slug?<span className="gd-nav-active-dot"/>:null}
             </Link>)}
          </div>:null;
         })}
         {!matches.length&&<div className="gd-no-results"><Search size={19}/><strong>No matching topics</strong><span>Try another word or clear the search.</span></div>}
       </nav>
       <div className="gd-sidebar-bottom"><span className="gd-small-status"><span/> PRODUCT DOCUMENTATION</span>
         <a href="https://x.com/gravitydottrade" target="_blank" rel="noopener noreferrer">Updates on X <ArrowUpRight size={13}/></a>
       </div>
     </aside>

     <main className="gd-main" id="docs-content">
       <div className="gd-crumbs"><Link href="/docs"><Home size={14}/><span>Docs</span></Link><ChevronRight size={13}/><span>{article.group.toLowerCase()}</span><ChevronRight size={13}/><strong>{article.title}</strong></div>
       <div className="gd-article-header">
         <span className="gd-eyebrow"><span className="gd-green-dot"/> THE GRAVITY HANDBOOK <span className="gd-eyebrow-number">{String(index+1).padStart(2,"0")}/{String(docs.length).padStart(2,"0")}</span></span>
         <h1>{article.slug==="overview"?"The Gravity docs.":article.title+"."}</h1>
         <p>{article.description}</p>
         <div className="gd-article-meta"><span><BookOpen size={14}/> {article.readingMinutes} min read</span><span className="gd-meta-divider"/><span>Updated for the current terminal</span><button onClick={()=>void copyLink()} type="button"><span>{copied?"Link copied":"Copy page link"}</span>{copied?<Check size={14}/>:<Link2 size={14}/>}</button></div>
       </div>

       {article.slug==="overview"&&<div className="gd-overview">
         <div className="gd-overview-label"><span>01 / EXPLORE</span><strong>Find your way around.</strong></div>
         <div className="gd-overview-grid">
          {quickLinks.map(({slug,title,desc,icon:Icon},i)=><Link key={slug} href={docHref(slug)} className="gd-overview-card">
             <div className="gd-overview-card-top"><span className="gd-overview-card-icon"><Icon size={21} strokeWidth={1.7}/></span><span>0{i+1}</span></div>
             <strong>{title}</strong><p>{desc}</p>
             <span className="gd-overview-arrow"><ArrowUpRight size={17}/></span>
           </Link>)}
         </div>
       </div>}

       <div className="gd-article-sections">
         {article.sections.map(section=><Section section={section} key={section.id}/>)}
       </div>
       {article.slug==="quickstart"&&<Link className="gd-inline-cta" href="/app"><span><strong>Ready to explore?</strong><small>Open the Gravity terminal and follow along.</small></span><ArrowUpRight size={20}/></Link>}

       <div className="gd-pager">
         {previous?<Link href={docHref(previous.slug)} className="gd-page-prev"><span><ArrowLeft size={15}/> PREVIOUS</span><strong>{previous.title}</strong></Link>:<div/>}
         {next?<Link href={docHref(next.slug)} className="gd-page-next"><span>NEXT <ArrowRight size={15}/></span><strong>{next.title}</strong></Link>:<div/>}
       </div>
       <footer className="gd-footer"><span>© 2026 Gravity</span><span>Documentation for the current Gravity experience.</span><Link href="/">Back to website <ArrowUpRight size={13}/></Link></footer>
     </main>

     <aside className="gd-toc" aria-label="On this page">
       <div className="gd-toc-head">ON THIS PAGE</div>
       {article.sections.map((section,i)=><a key={section.id} href={"#"+section.id}><span>{String(i+1).padStart(2,"0")}</span>{section.title}</a>)}
       <div className="gd-toc-bottom"><span className="gd-toc-status"><span/> Virtual positions</span><strong>Market data is real. Orders are not.</strong><Link href={docHref("risk-and-limits")}>Understand the limits <ArrowUpRight size={14}/></Link></div>
     </aside>
   </div>
 </div>;
}
