import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gravity-one-lime.vercel.app"),
  applicationName: "Gravity",
  title: {
    default: "Gravity | Memecoins & Stock Tokens",
    template: "%s | Gravity",
  },
  description: "Explore memecoins and tokenized stocks, view live charts, and preview long or short directions. Live market data; on-chain orders not yet enabled.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Gravity",
    title: "Gravity | Memecoins & Stock Tokens",
    description: "Two markets. One trading terminal. Discover tokens and follow live market prices across memecoins and stock tokens.",
    url: "/",
    images: [{ url: "/gravity-cinematic-hero.webp", alt: "Gravity market trading platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gravity | Memecoins & Stock Tokens",
    description: "Memecoins and stock tokens in one clean trading terminal. Real market data. Orders not yet enabled.",
    images: ["/gravity-cinematic-hero.webp"],
  },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="en"><body>{children}</body></html>;
}
