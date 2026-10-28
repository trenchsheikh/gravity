import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gravity — Trade the other direction",
  description: "Discover Pump.fun tokens and explore both sides of the market. Paper trading with live market data. No deposits. No real orders.",
  openGraph: {
    title: "Gravity — What goes up has another side",
    description: "The sharpest way to discover and paper-trade Solana's newest tokens.",
    images: ["/gravity-orbit.webp"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
