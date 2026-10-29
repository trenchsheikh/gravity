"use client";
import {useEffect, useState} from "react";
import Link from "next/link";
import Brand from "@/components/Brand";
import XSocialLink from "@/components/XSocialLink";

export default function MarketingHeader(){
 const [compact,setCompact]=useState(false);
 useEffect(()=>{
  const sync=()=>setCompact(window.scrollY>42);
  sync();
  window.addEventListener("scroll",sync,{passive:true});
  return ()=>window.removeEventListener("scroll",sync);
 },[]);
 return <header className={`marketing-nav frame gravity-glass-header ${compact?"is-compact":""}`}>
  <Brand/>
  <nav aria-label="Primary navigation">
   <a href="#product">The platform</a><a href="#how">How it works</a><a href="#about">About Gravity</a>
  </nav>
  <div className="gravity-header-actions"><XSocialLink placement="header"/><Link href="/app" className="pill pill-nav">Launch app</Link></div>
 </header>;
}
