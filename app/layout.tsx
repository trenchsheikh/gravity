import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 icons: {
  icon: [{url:"/icon.svg",type:"image/svg+xml",sizes:"any"}],
  shortcut: "/icon.svg",
 },
 title: "Gravity — Memecoins & Stock Tokens",
 description: "Discover Pump.fun memecoins and StonkFun-listed stock tokens with market data and virtual long/short positions. No real orders.",
 openGraph: {title:"Gravity — Memecoins & Stock Tokens",description:"Explore memecoins and tokenized stocks on Solana with live market data and long/short position tracking.",images:["/gravity-scenes.webp"]},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
