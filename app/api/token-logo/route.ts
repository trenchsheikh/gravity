import { NextRequest, NextResponse } from "next/server";
import { isMint } from "@/lib/markets";
export const runtime="nodejs";
const fetchTimeout=6000;
export async function GET(req:NextRequest){
  const mint=(req.nextUrl.searchParams.get("mint")||"").trim();
  if(!isMint(mint))return NextResponse.json({icon:null,error:"Invalid mint"},{status:400});
  try{
    const res=await fetch("https://tokens.jup.ag/token/"+encodeURIComponent(mint),{
      headers:{Accept:"application/json"},next:{revalidate:86400},signal:AbortSignal.timeout(fetchTimeout)
    });
    if(!res.ok)return NextResponse.json({icon:null},{headers:{"Cache-Control":"public, s-maxage=600"}});
    const data=await res.json() as Record<string,unknown>;
    const candidate=typeof data.logoURI==="string"?data.logoURI:typeof data.icon==="string"?data.icon:null;
    const valid=candidate&&/^https:\/\//.test(candidate)&&candidate.length<1800?candidate:null;
    return NextResponse.json({icon:valid},{headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=86400"}});
  }catch{return NextResponse.json({icon:null},{headers:{"Cache-Control":"public, s-maxage=300"}})}
}