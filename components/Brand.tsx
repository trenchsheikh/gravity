import Link from "next/link";
export default function Brand({small=false}:{small?:boolean}) {
 return <Link className={`brand ${small?"brand-small":""}`} href="/" aria-label="Gravity home"><span className="brand-symbol"><img src="/gravity-mark.webp" alt="" /></span><span>gravity<span className="brand-period">.</span></span></Link>;
}
