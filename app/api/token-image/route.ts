import { NextRequest, NextResponse } from "next/server";
import { isMint } from "@/lib/markets";

export const runtime = "nodejs";

const MAX_BYTES = 1_500_000;
const ALLOWED_HOSTS = [
  "axiomtrading-v2.axiom-cdn.io", "ipfs.io", "dweb.link",
  "imagedelivery.net", "raw.githubusercontent.com",
  "arweave.net", "assets.coingecko.com", "metadata.j7tracker.io"
];
const ALLOWED_SUFFIXES = [
  ".quicknode-ipfs.com", ".jup.ag", ".axiom-cdn.io", ".cloudflare-ipfs.com",
  ".pinata.cloud", ".myfilebase.com", ".komododecks.com", ".arweave.net",
  ".dweb.link"
];

function allowedImageUrl(raw: unknown): URL | null {
  if (typeof raw !== "string" || raw.length > 1800) return null;
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (parsed.protocol !== "https:" || parsed.port || parsed.username || parsed.password) return null;
    if (!ALLOWED_HOSTS.includes(host) && !ALLOWED_SUFFIXES.some(s => host.endsWith(s))) return null;
    if (host === "localhost" || host.endsWith(".local")) return null;
    return parsed;
  } catch { return null; }
}

async function getJupiterIcon(mint: string): Promise<URL | null> {
  const headers: Record<string,string> = {Accept:"application/json"};
  if (process.env.JUPITER_API_KEY) headers["x-api-key"] = process.env.JUPITER_API_KEY;
  for (const endpoint of [
    "https://api.jup.ag/tokens/v2/search?query="+encodeURIComponent(mint),
    "https://tokens.jup.ag/token/"+encodeURIComponent(mint)
  ]) {
    try {
      const response = await fetch(endpoint, {
        headers, next: {revalidate:3600}, signal: AbortSignal.timeout(4000)
      });
      if (!response.ok) continue;
      const json:unknown = await response.json();
      const record = Array.isArray(json)
        ? json.find(v => v && typeof v==="object" && v.id === mint)
        : json;
      if (!record || typeof record !== "object") continue;
      const info = record as Record<string,unknown>;
      const url = allowedImageUrl(info.icon) || allowedImageUrl(info.logoURI);
      if (url) return url;
    } catch {}
  }
  return null;
}

function supportedImage(bytes:Uint8Array, header:string): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0]===0x89 && bytes[1]===0x50 && bytes[2]===0x4e && bytes[3]===0x47) return "image/png";
  if (bytes[0]===0xff && bytes[1]===0xd8) return "image/jpeg";
  if (bytes[0]===0x47 && bytes[1]===0x49 && bytes[2]===0x46) return "image/gif";
  if (String.fromCharCode(...bytes.slice(0,4))==="RIFF" && String.fromCharCode(...bytes.slice(8,12))==="WEBP") return "image/webp";
  if (String.fromCharCode(...bytes.slice(4,12)).includes("ftypavif")) return "image/avif";
  if (header.startsWith("image/svg")) return null;
  return null;
}

async function downloadImage(url:URL):Promise<{data:Uint8Array;type:string}|null> {
  try {
    const response=await fetch(url.href, {
      redirect:"error",
      headers:{Accept:"image/png,image/jpeg,image/webp,image/avif,image/gif;q=0.9"},
      next:{revalidate:43200},
      signal:AbortSignal.timeout(5500)
    });
    if (!response.ok) return null;
    const reportedSize=Number(response.headers.get("content-length")||0);
    if (reportedSize>MAX_BYTES) return null;
    // Do not stream potentially unbounded user-hosted images into the application.
    const stream=response.body?.getReader();
    if (!stream) return null;
    const chunks:Uint8Array[]=[];let total=0;
    try {
      while (true) {
        const next=await stream.read();
        if(next.done) break;
        total+=next.value.byteLength;
        if(total>MAX_BYTES) {await stream.cancel();return null;}
        chunks.push(next.value);
      }
    } finally {stream.releaseLock();}
    const data=new Uint8Array(total);
    let offset=0;
    for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}
    const type=supportedImage(data,response.headers.get("content-type")||"");
    return type?{data,type}:null;
  } catch {return null;}
}

export async function GET(req:NextRequest) {
  const mint=(req.nextUrl.searchParams.get("mint")||"").trim();
  if(!isMint(mint)) return NextResponse.json({error:"Invalid token mint"},{status:400});
  const supplied=allowedImageUrl(req.nextUrl.searchParams.get("src"));
  const seen=new Set<string>();
  async function attempt(base:URL|null):Promise<NextResponse|null> {
    if(!base)return null;
    const urls=[base];
    const path=base.pathname.match(/\/ipfs\/([^/?#]+)/);
    if(path && ["ipfs.io","dweb.link"].includes(base.hostname)) {
      urls.push(new URL("https://dweb.link/ipfs/"+encodeURIComponent(path[1])));
      urls.push(new URL("https://ipfs.io/ipfs/"+encodeURIComponent(path[1])));
    }
    for(const url of urls){
      if(seen.has(url.href))continue;
      seen.add(url.href);
      const image=await downloadImage(url);
      if(image) return new NextResponse(new Blob([image.data.buffer as ArrayBuffer],{type:image.type}),{
        status:200,
        headers:{
          "Content-Type":image.type,
          "Cache-Control":"public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400",
          "X-Content-Type-Options":"nosniff",
          "Content-Security-Policy":"default-src 'none'; sandbox"
        }
      });
    }
    return null;
  }
  // The Jupiter feed already supplies an image URL for most tokens; try it first
  // rather than waiting for an unnecessary metadata round trip.
  const initial=await attempt(supplied);
  if(initial)return initial;
  const discovered=await getJupiterIcon(mint);
  const alternative=await attempt(discovered);
  if(alternative)return alternative;
  return new NextResponse(null,{status:404,headers:{"Cache-Control":"public, s-maxage=300"}});
}
