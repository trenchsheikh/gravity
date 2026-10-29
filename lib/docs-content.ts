export type DocNote={title:string;text:string;tone:"info"|"warning"};
export type DocTable={columns:string[];rows:string[][]};
export type DocSection={id:string;title:string;body:string[];bullets?:string[];table?:DocTable;note?:DocNote};
export type DocArticle={slug:string;group:string;title:string;description:string;readingMinutes:number;sections:DocSection[]};
export type DocsGroup={name:string;slugs:string[]};
export const docsGroups:DocsGroup[]=[
  {
    "name": "GETTING STARTED",
    "slugs": [
      "overview",
      "quickstart"
    ]
  },
  {
    "name": "THE MARKETS",
    "slugs": [
      "market-discovery",
      "memecoins",
      "stock-tokens",
      "charts-and-data"
    ]
  },
  {
    "name": "THE TERMINAL",
    "slugs": [
      "live-trading",
      "watchlist",
      "wallet-connection"
    ]
  },
  {
    "name": "REFERENCE",
    "slugs": [
      "risk-and-limits",
      "faq",
      "product-status"
    ]
  }
];
export const docs:DocArticle[]=[
  {
    "slug": "overview",
    "group": "GETTING STARTED",
    "title": "Meet Gravity",
    "description": "Solana memecoins and stock tokens in one live market terminal.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "introduction",
        "title": "What is Gravity?",
        "body": [
          "Gravity is a market discovery and analysis terminal for Solana memecoins and tokenized stocks. Follow real prices, inspect historical charts and explore both directional possibilities in a clean workspace.",
          "Gravity does not currently execute on-chain orders. The Long and Short controls preview a direction and do not open a real position."
        ]
      },
      {
        "id": "capabilities",
        "title": "Built for both sides",
        "body": [
          "Browse memecoin and stock-token markets, inspect liquidity and volume when available, monitor candles, save a watchlist and connect a compatible Solana wallet."
        ]
      },
      {
        "id": "current-status",
        "title": "Live market data",
        "body": [
          "Live means market quotes and charts are sourced from real markets, not that real order execution is active. Deposits, withdrawals and trade settlement are not available in Gravity today."
        ]
      }
    ]
  },
  {
    "slug": "quickstart",
    "group": "GETTING STARTED",
    "title": "Quickstart",
    "description": "Explore the Gravity live market interface.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "open",
        "title": "Open the terminal",
        "body": [
          "Choose Launch app on Gravity. A wallet is not required to browse markets."
        ]
      },
      {
        "id": "explore",
        "title": "Choose your market",
        "body": [
          "Switch between Memecoins and Stock tokens. Use the list filters or token search to find a market."
        ]
      },
      {
        "id": "chart",
        "title": "Read market data",
        "body": [
          "Open a token to inspect its current quote and recorded candlesticks. Switch between 1m, 5m, 15m, 1H, 4H and 1D when history is available."
        ]
      },
      {
        "id": "direction",
        "title": "Preview direction",
        "body": [
          "Choose Long or Short in the token page sidebar. The selector does not submit a real order or create a financial position."
        ]
      },
      {
        "id": "connect",
        "title": "Connect Solana",
        "body": [
          "Connect a compatible Solana wallet to view your public address. Connection does not request a transaction signature."
        ]
      }
    ]
  },
  {
    "slug": "market-discovery",
    "group": "THE MARKETS",
    "title": "Discover markets",
    "description": "Find live Solana markets and useful market statistics.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "browse",
        "title": "Explore categories",
        "body": [
          "Gravity has separate Memecoins and Stock tokens markets. Navigate between them without leaving the terminal."
        ]
      },
      {
        "id": "search",
        "title": "Search and sort",
        "body": [
          "Search by token name, symbol or mint address. Sort by available market cap, liquidity, volume or movement and compare multiple time windows."
        ]
      },
      {
        "id": "signals",
        "title": "Reading the market list",
        "body": [
          "Market cards can show prices, market cap, liquidity, trading volume, holder counts and available token risk or verification indicators. Missing figures are marked unavailable."
        ]
      },
      {
        "id": "updates",
        "title": "Feed updates",
        "body": [
          "Market feeds refresh periodically while the app is active. Quotes or individual statistics may be delayed or temporarily unavailable."
        ]
      }
    ]
  },
  {
    "slug": "memecoins",
    "group": "THE MARKETS",
    "title": "Memecoins",
    "description": "Monitor Solana memecoins in one market view.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "browse",
        "title": "Discover memecoins",
        "body": [
          "Explore market lists for emerging and active Solana tokens."
        ]
      },
      {
        "id": "signals",
        "title": "Read the signals",
        "body": [
          "Look at liquidity, trading activity and recent price movements alongside the latest USD price. No single statistic guarantees that a token is safe or liquid."
        ]
      },
      {
        "id": "risks",
        "title": "Know the limits",
        "body": [
          "Memecoins can move abruptly, lose liquidity or contain misleading metadata. Always independently assess risk."
        ]
      }
    ]
  },
  {
    "slug": "stock-tokens",
    "group": "THE MARKETS",
    "title": "Stock tokens",
    "description": "Follow tokenized stock markets on Solana.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "what",
        "title": "What is a stock token?",
        "body": [
          "Stock tokens are blockchain assets that may reference traditional equities under specific issuer structures. They are not necessarily direct shares and may not grant shareholder rights."
        ]
      },
      {
        "id": "prices",
        "title": "Markets and prices",
        "body": [
          "Their market price can differ from the referenced asset because of issuer terms, liquidity, spreads and trading hours."
        ]
      },
      {
        "id": "monitor",
        "title": "Using Gravity",
        "body": [
          "Inspect available live stock-token prices and history. Gravity does not execute buys, sells, longs or shorts on these assets yet."
        ]
      }
    ]
  },
  {
    "slug": "charts-and-data",
    "group": "THE MARKETS",
    "title": "Charts & market data",
    "description": "Understand live prices and historic candlesticks.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "candles",
        "title": "Recorded candles",
        "body": [
          "Candlestick history represents open, high, low and closing market prices during each interval. Gravity does not manufacture price history when data is unavailable."
        ]
      },
      {
        "id": "intervals",
        "title": "Timeframes",
        "body": [
          "Review 1m, 5m, 15m, 1H, 4H or 1D. Some tokens lack trading history for certain timeframes."
        ]
      },
      {
        "id": "metrics",
        "title": "Market statistics",
        "body": [
          "Liquidity, capitalization, volume and holder counts are different signals. They may be unavailable or lag behind underlying activity."
        ]
      },
      {
        "id": "quotes",
        "title": "Quotes are informational",
        "body": [
          "Displayed prices are not guaranteed fills. Gravity's live page is a market monitor with no on-chain order execution yet."
        ]
      }
    ]
  },
  {
    "slug": "live-trading",
    "group": "THE TERMINAL",
    "title": "Live mode",
    "description": "Live price data, a directional preview and wallet status.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "experience",
        "title": "The Live interface",
        "body": [
          "The token page offers a single Live view, with current prices, historical charts, wallet status and Long/Short direction controls."
        ]
      },
      {
        "id": "direction",
        "title": "Long and Short",
        "body": [
          "Selecting Long previews an upward market view; selecting Short previews a downward one. These controls do not open trades, generate positions or affect a wallet."
        ]
      },
      {
        "id": "execution",
        "title": "Order execution",
        "body": [
          "Live orders are not enabled yet. Gravity does not take margin, create liquidations, accept deposits, withdraw balances or settle orders on Solana."
        ]
      },
      {
        "id": "wallet",
        "title": "Wallet connection",
        "body": [
          "Connecting a wallet only exposes its approved public address. It does not grant Gravity transaction authority."
        ]
      }
    ]
  },
  {
    "slug": "watchlist",
    "group": "THE TERMINAL",
    "title": "Watchlist",
    "description": "Save interesting tokens for quick access.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "save",
        "title": "Add a token",
        "body": [
          "Use the star icon in the market list or token detail view to save an asset to Watchlist."
        ]
      },
      {
        "id": "data",
        "title": "Local storage",
        "body": [
          "Watchlist entries are saved in the current browser and are not synchronized between devices or wallet accounts."
        ]
      },
      {
        "id": "quotes",
        "title": "Saved market prices",
        "body": [
          "Previously viewed token information may remain visible when the market feed is unavailable."
        ]
      }
    ]
  },
  {
    "slug": "wallet-connection",
    "group": "THE TERMINAL",
    "title": "Solana wallets",
    "description": "Connect compatible Solana wallets.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "connect",
        "title": "Connect",
        "body": [
          "Choose Connect wallet from the header or token panel to select a detected Solana wallet."
        ]
      },
      {
        "id": "manage",
        "title": "Manage",
        "body": [
          "Gravity displays the public address and supports copying it or disconnecting. Some mobile wallets require their built-in browser."
        ]
      },
      {
        "id": "permissions",
        "title": "Permissions",
        "body": [
          "Connecting does not sign transactions, open trades, transfer tokens or grant custody. Never share your private key or recovery phrase."
        ]
      }
    ]
  },
  {
    "slug": "risk-and-limits",
    "group": "REFERENCE",
    "title": "Risk & limits",
    "description": "Know the limitations of Gravity's current market product.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "markets",
        "title": "Market risks",
        "body": [
          "Memecoins and tokenized stocks can be volatile or have low liquidity. Market metadata may be incomplete or inaccurate."
        ]
      },
      {
        "id": "stock",
        "title": "Stock tokens",
        "body": [
          "Tokenized equities are not the same as direct shares. Issuer terms, restrictions and reference pricing can vary."
        ]
      },
      {
        "id": "execution",
        "title": "No on-chain trading yet",
        "body": [
          "Gravity currently provides live market information and direction previews. It does not execute positions, accept collateral, create liquidations or settle trades."
        ]
      },
      {
        "id": "advice",
        "title": "Not financial advice",
        "body": [
          "Content is provided for general information and is not investment advice."
        ]
      }
    ]
  },
  {
    "slug": "faq",
    "group": "REFERENCE",
    "title": "FAQs",
    "description": "Common questions about Gravity.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "trading",
        "title": "Can I trade using Gravity?",
        "body": [
          "No real on-chain trades can be placed yet. Long and Short are direction previews only."
        ]
      },
      {
        "id": "wallet",
        "title": "Do I need a wallet?",
        "body": [
          "No, wallet connection is optional for browsing charts and markets."
        ]
      },
      {
        "id": "share",
        "title": "Are stock tokens company shares?",
        "body": [
          "No direct company shares are bought through Gravity. Tokenized assets may have separate issuer terms."
        ]
      },
      {
        "id": "history",
        "title": "Why are charts sometimes blank?",
        "body": [
          "Historical data may be missing for individual assets or timeframes."
        ]
      },
      {
        "id": "news",
        "title": "How do I follow updates?",
        "body": [
          "Follow @gravitydottrade on X."
        ]
      }
    ]
  },
  {
    "slug": "product-status",
    "group": "REFERENCE",
    "title": "Product status",
    "description": "What's available and what hasn't launched.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "available",
        "title": "Available today",
        "body": [
          "Memecoin and stock-token discovery, live market statistics, recorded chart history, search, watchlists, Solana wallet connection and long or short direction previews."
        ]
      },
      {
        "id": "unavailable",
        "title": "Not available yet",
        "body": [
          "Live order execution, collateral deposits, positions, realized trade returns, liquidations, withdrawals and trade settlement."
        ]
      },
      {
        "id": "meaning",
        "title": "What Live means",
        "body": [
          "Live refers to the market feed and price monitoring. Gravity does not yet send orders to any on-chain execution venue."
        ]
      }
    ]
  }
];
export const docsBySlug=new Map(docs.map(article=>[article.slug,article]));
export const findDoc=(slug:string):DocArticle|undefined=>docsBySlug.get(slug);
export const docHref=(slug:string):string=>slug==="overview"?"/docs":"/docs/"+slug;
