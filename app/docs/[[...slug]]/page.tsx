import type {Metadata} from "next";
import {notFound} from "next/navigation";
import DocsShell from "@/components/DocsShell";
import {docs,findDoc} from "@/lib/docs-content";
import "../docs.css";

type Params={slug?:string[]};
export const dynamicParams=false;
export function generateStaticParams():Params[]{
  return [{slug:[]},...docs.filter(article=>article.slug!=="overview").map(article=>({slug:[article.slug]}))];
}
export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
  const {slug=[]}=await params;
  if(slug.length>1)return {};
  const article=findDoc(slug[0]||"overview");
  if(!article)return {};
  return {
    title:article.slug==="overview"?"Documentation | Gravity":article.title+" | Gravity Docs",
    description:article.description,
    alternates:{canonical:article.slug==="overview"?"/docs":"/docs/"+article.slug},
    openGraph:{title:article.title+" | Gravity Docs",description:article.description}
  };
}
export default async function DocumentationPage({params}:{params:Promise<Params>}){
  const {slug=[]}=await params;
  if(slug.length>1)notFound();
  const article=findDoc(slug[0]||"overview");
  if(!article)notFound();
  return <DocsShell article={article}/>;
}
