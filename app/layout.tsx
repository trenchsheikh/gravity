import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "Gravity — Long or Short Memecoins",
 description: "Discover Pump.fun memecoins, explore live Solana token prices, and simulate long or short positions. Paper trading only. No deposits or real trades.",
 openGraph: {title:"Gravity — Long or Short Memecoins",description:"Discover fresh Pump.fun launches and paper-trade the upside or downside using real market data.",images:["/gravity-scenes.webp"]},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
