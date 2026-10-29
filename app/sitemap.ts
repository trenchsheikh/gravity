import type {MetadataRoute} from "next";
import {docs,docHref} from "@/lib/docs-content";

export default function sitemap():MetadataRoute.Sitemap{
 const base="https://gravity-one-lime.vercel.app";
 return [
  {url:base,changeFrequency:"weekly",priority:1},
  {url:base+"/app",changeFrequency:"daily",priority:.8},
  ...docs.map(article=>({
   url:base+docHref(article.slug),
   changeFrequency:"weekly" as const,
   priority:article.slug==="overview"?.9:.65
  }))
 ];
}
