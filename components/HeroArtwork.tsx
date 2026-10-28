"use client";
import {useState} from "react";

/** Uses the exact source artwork when available, gracefully retaining the older
 * chart asset until the PNG is present in public/gravity-hero-exact.png. */
export default function HeroArtwork(){
 const [source,setSource]=useState("/gravity-hero-exact.png");
 return <img
   src={source}
   width={1983}
   height={793}
   alt="Blue candlestick chart with floating green Long and red Short trading markers"
   decoding="async"
   fetchPriority="high"
   onError={()=>{if(source!=="/gravity-chart-hero.svg")setSource("/gravity-chart-hero.svg")}}
 />;
}
