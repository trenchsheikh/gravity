import { NextRequest, NextResponse } from "next/server";
import { isMint } from "@/lib/markets";
export const runtime="nodejs";
const safe=(url:unknown):string|null=>typeof url==="string"&&url.length<1800&&url.startsWith("https://")?url:null;
export async function GET(req:NextRequest){
  const mint=(req.nextUrl.searchParams.get("mint")||"").trim();
  if(!isMint(mint))return NextResponse.json({icon:null,error:"Invalid mint"},{status:400});
  // Prefer the current Jupiter metadata endpoint; only fall back to its historical registry.
  const providers=[
    {url:"https://api.jup.ag/tokens/v2/search?query="+encodeURIComponent(mint),headers:process.env.JUPITER_API_KEY?{"x-api-key":process.env.JUPITER_API_KEY}:{}},
    {url:"https://tokens.jup.ag/token/"+encodeURIComponent(mint),headers:{}}
  ];
  for(const provider of providers){
    try{
      const headers: Record<string,string> = {"Accept":"application/json"};
      if(provider.url.includes("/tokens/v2/")&&process.env.JUPITER_API_KEY) headers["x-api-key"]=process.env.JUPITER_API_KEY;
      const res=await fetch(provider.url,{headers,
        next:{revalidate:3600},signal:AbortSignal.timeout(5500)});
      if(!res.ok)continue;
      const data:unknown=await res.json();
      const item=Array.isArray(data)?data.find(x=>x&&typeof x==="object"&&x.id===mint):data;
      if(!item||typeof item!=="object")continue;
      const obj=item as Record<string,unknown>;
      const icon=safe(obj.icon)||safe(obj.logoURI);
      if(icon)return NextResponse.json({icon},{headers:{"Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}});
    }catch{}
  }
  return NextResponse.json({icon:null},{headers:{"Cache-Control":"public, s-maxage=600"}});
}