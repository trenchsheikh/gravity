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
      "virtual-positions",
      "portfolio-and-pnl",
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
    "description": "One terminal for memecoins, stock tokens and two-sided market exploration.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "what-is-gravity",
        "title": "What is Gravity?",
        "body": [
          "Gravity brings two types of Solana markets into one streamlined trading workspace: memecoins and tokenized stocks. Discover tokens, inspect price action, select long or short, and follow how a virtual position performs as market prices move.",
          "The interface uses real market data for charts and quotes. Position balances and P&L are virtual. Gravity currently does not submit live trades, custody funds or execute on-chain orders."
        ]
      },
      {
        "id": "what-you-can-do",
        "title": "Explore the essentials",
        "body": [
          "A single view connects discovery, charts and position tracking, without making you jump between unrelated interfaces."
        ],
        "bullets": [
          "Browse separate Memecoins and Stock tokens markets.",
          "Filter by timeframe, sort by market statistics, and search by name, symbol or Solana token address.",
          "Study historical candles, price changes, liquidity and volume where data is available.",
          "Open and close virtual long or short positions, then monitor them in Portfolio.",
          "Save tokens to a browser-based watchlist and connect a compatible Solana wallet."
        ]
      },
      {
        "id": "built-for-clarity",
        "title": "Designed for clarity",
        "body": [
          "Gravity keeps important controls close to the chart and makes the state of the market visible. Values that are unavailable are marked as unavailable rather than invented.",
          "We document both what works today and what the interface does not do. Start with the quickstart for a guided tour of your first virtual position."
        ],
        "note": {
          "title": "A clear distinction",
          "text": "Market quotes can be live even when your position is virtual. Connecting a wallet does not change that.",
          "tone": "info"
        }
      }
    ]
  },
  {
    "slug": "quickstart",
    "group": "GETTING STARTED",
    "title": "Your first session",
    "description": "From opening Gravity to tracking a position in a few steps.",
    "readingMinutes": 4,
    "sections": [
      {
        "id": "step-one",
        "title": "01. Open the terminal",
        "body": [
          "Select Launch app on the website or open the terminal directly. No wallet connection is required to explore markets or use virtual positions."
        ]
      },
      {
        "id": "step-two",
        "title": "02. Choose a market",
        "body": [
          "Switch between Memecoins and Stock tokens at the top of the app. Browse the list, adjust the change window, or search for a token by symbol, name or mint address."
        ]
      },
      {
        "id": "step-three",
        "title": "03. Read the chart",
        "body": [
          "Open a token to view its detail screen. Switch between 1m, 5m, 15m, 1H, 4H and 1D candles, then review price and the available market statistics.",
          "Historical coverage varies by token and interval. If no candles are available, the interface explains that instead of drawing fake price history."
        ]
      },
      {
        "id": "step-four",
        "title": "04. Choose a side",
        "body": [
          "In the position panel, choose Long or Short. Enter virtual collateral from $5 to $1,000, select 1x, 2x or 3x leverage, and review the estimated notional exposure.",
          "The Open button requires a recent valid market quote and sufficient free virtual balance."
        ],
        "note": {
          "title": "Virtual only",
          "text": "Opening a position records it locally in this browser. It does not spend wallet funds or create a real trade.",
          "tone": "info"
        }
      },
      {
        "id": "step-five",
        "title": "05. Monitor and close",
        "body": [
          "Open Portfolio to see open positions, unrealized P&L and your trade history. Close an open position when a current market quote is available.",
          "Your starting virtual balance is $10,000. Existing positions remain in the browser used to create them."
        ]
      }
    ]
  },
  {
    "slug": "market-discovery",
    "group": "THE MARKETS",
    "title": "Discover markets",
    "description": "Find tokens quickly and understand what the market list is showing.",
    "readingMinutes": 4,
    "sections": [
      {
        "id": "browse",
        "title": "Two market categories",
        "body": [
          "Gravity separates Memecoins from Stock tokens. Use the header to move between categories without losing your place in the app.",
          "The feed updates periodically while the app is visible. Previously retrieved market lists may be displayed during a refresh."
        ]
      },
      {
        "id": "search",
        "title": "Search and sorting",
        "body": [
          "Search by token name, symbol or a valid Solana token address. Sort by market cap, liquidity, volume or price change. A time-window selector changes the movement and volume figures used in the list.",
          "Not every token reports every metric. Missing values are shown as N/A instead of being treated as zero."
        ],
        "bullets": [
          "Top displays market discovery ranked for the selected category.",
          "New is available for memecoins; stock tokens offer an alphabetical view.",
          "The star action adds a token to your watchlist."
        ]
      },
      {
        "id": "market-row",
        "title": "Reading a market row",
        "body": [
          "A market row can include the token symbol, image, latest USD price, market capitalization, liquidity, movement, trading volume, transaction activity, holders and an available verification or risk indicator.",
          "These figures are informational signals, not a guarantee of quality or safety."
        ]
      },
      {
        "id": "refresh",
        "title": "Refresh and data availability",
        "body": [
          "Market discovery refreshes roughly every 15 seconds when active, subject to network and feed availability. You can request a refresh manually.",
          "Short-term data can be delayed, temporarily absent or revised as the underlying sources update."
        ]
      }
    ]
  },
  {
    "slug": "memecoins",
    "group": "THE MARKETS",
    "title": "Memecoins",
    "description": "Explore fast-moving Solana memecoin markets with context.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "what-you-see",
        "title": "What the memecoin feed includes",
        "body": [
          "The Memecoins category focuses on emerging Solana tokens. Gravity displays available price, market capitalization, liquidity, activity and short-window changes in a compact screener.",
          "Use Top or New to browse, or search for a specific mint address."
        ]
      },
      {
        "id": "interpreting",
        "title": "Interpreting the signals",
        "body": [
          "Rapid price changes or a large reported volume figure do not establish a token's legitimacy, liquidity depth or ability to be traded at the displayed price."
        ],
        "bullets": [
          "Check liquidity and volume together rather than relying on price movement alone.",
          "Verification or risk markers are based on the available token metadata and are not endorsements.",
          "A new or thinly traded token may have sparse historical price data."
        ]
      },
      {
        "id": "from-list-to-chart",
        "title": "From list to chart",
        "body": [
          "Select a token row to open its chart and virtual position panel. Choose an interval to view recorded candles. If history is missing, switch intervals or inspect another token.",
          "The long and short controls track virtual exposure only; they do not create a position on a decentralized exchange."
        ]
      }
    ]
  },
  {
    "slug": "stock-tokens",
    "group": "THE MARKETS",
    "title": "Stock tokens",
    "description": "Follow tokenized stock markets in the same Gravity terminal.",
    "readingMinutes": 4,
    "sections": [
      {
        "id": "what-are-stock-tokens",
        "title": "What is a stock token?",
        "body": [
          "Stock tokens are blockchain tokens linked to equity-market exposure or reference values, depending on their issuer and structure. They are not the same thing as directly holding a company's shares.",
          "Gravity lists supported Solana stock tokens for discovery, price monitoring and virtual position tracking."
        ]
      },
      {
        "id": "market-data",
        "title": "Availability and pricing",
        "body": [
          "Price information and recorded candles depend on the available token-market feeds. Coverage can differ from traditional exchange hours and from the underlying company's quoted share price.",
          "A stock token can trade differently from the reference asset because of issuer terms, liquidity, market hours, spreads or other factors."
        ]
      },
      {
        "id": "trading-experience",
        "title": "Using stock tokens in Gravity",
        "body": [
          "Select Stock tokens in the terminal header, then browse the list or search a name or symbol. Open an asset to read its chart and inspect long or short virtual exposure.",
          "The position ticket works the same way as for memecoins, with virtual collateral and 1x to 3x leverage."
        ]
      },
      {
        "id": "important-context",
        "title": "Important distinction",
        "body": [
          "Gravity does not issue the listed stock tokens, grant shareholder rights, or represent that any displayed token is a direct company share."
        ],
        "note": {
          "title": "Not direct equity ownership",
          "text": "Tokenized stocks may have different rights, restrictions and risks from conventional shares. Review the token issuer's own terms before making any outside investment decision.",
          "tone": "warning"
        }
      }
    ]
  },
  {
    "slug": "charts-and-data",
    "group": "THE MARKETS",
    "title": "Charts & market data",
    "description": "Understand the price chart, intervals and the limits of live data.",
    "readingMinutes": 4,
    "sections": [
      {
        "id": "candlesticks",
        "title": "Candlesticks",
        "body": [
          "A candlestick shows the opening price, highest price, lowest price and closing price over a selected interval. Gravity also displays volume bars where data is available.",
          "The chart uses recorded market candles. It does not manufacture a price path when market history cannot be retrieved."
        ]
      },
      {
        "id": "timeframes",
        "title": "Chart intervals",
        "body": [
          "Choose 1m, 5m, 15m, 1H, 4H or 1D. The terminal can update candles while you are looking at a token. Switching tokens or intervals loads the corresponding history.",
          "Some newly launched or lightly traded assets have limited coverage at particular intervals."
        ],
        "bullets": [
          "1m and 5m help inspect recent movements.",
          "15m and 1H provide more context around short-term changes.",
          "4H and 1D are useful for a wider historical perspective when available."
        ]
      },
      {
        "id": "read-stats",
        "title": "Market statistics",
        "body": [
          "The terminal may surface USD price, market cap, liquidity, 24-hour volume, buy and sell counts, holders and relative changes. Not all values are available for all tokens.",
          "Prices can become stale during network interruptions; opening a virtual position requires a recent usable quote."
        ]
      },
      {
        "id": "not-execution-price",
        "title": "A quote is not an execution price",
        "body": [
          "A displayed price is market information, not a guaranteed executable quote. Slippage, execution costs, liquidity gaps and latency may affect actual trading elsewhere. Gravity currently does not execute those trades."
        ]
      }
    ]
  },
  {
    "slug": "virtual-positions",
    "group": "THE TERMINAL",
    "title": "Virtual positions",
    "description": "Go long or short and follow the outcome without sending real orders.",
    "readingMinutes": 5,
    "sections": [
      {
        "id": "positions-explained",
        "title": "How a virtual position works",
        "body": [
          "Gravity uses real price updates to mark virtual long or short positions. Select Paper in the token ticket to use the $10,000 virtual account. Select Live to view a separate wallet-connected interface; live order execution is not enabled. Long exposure increases in value when the reference token price rises; short exposure increases in value when it falls.",
          "Opening a position changes your locally recorded virtual balance and open-position list. It does not submit a transaction to Solana or another trading venue."
        ]
      },
      {
        "id": "collateral-leverage",
        "title": "Collateral and leverage",
        "body": [
          "Enter virtual collateral between $5 and $1,000, choose 1x, 2x or 3x leverage, and review your exposure. You cannot allocate more than your available virtual collateral."
        ],
        "table": {
          "columns": [
            "Setting",
            "Current behavior"
          ],
          "rows": [
            [
              "Starting virtual balance",
              "$10,000"
            ],
            [
              "Collateral per position",
              "$5 to $1,000"
            ],
            [
              "Leverage options",
              "1x, 2x, 3x"
            ],
            [
              "Order execution",
              "No real orders"
            ],
            [
              "Price requirement",
              "Recent valid market quote"
            ]
          ]
        }
      },
      {
        "id": "pnl-formula",
        "title": "How P&L is estimated",
        "body": [
          "A simplified unrealized P&L estimate uses the percentage change from entry to the latest market price, multiplied by collateral and leverage. For a short position, the direction is reversed.",
          "Example: a $100 virtual long at 2x leverage sees an approximate $20 P&L if the reference price increases 10%. This simplified illustration excludes fees, funding, slippage and execution costs."
        ],
        "note": {
          "title": "Simplified model",
          "text": "Gravity is not a production margin, liquidation or funding engine. At closing, calculated losses are capped at the position's virtual collateral by the current model.",
          "tone": "info"
        }
      },
      {
        "id": "closing",
        "title": "Closing a position",
        "body": [
          "Use the Close control on the position or within Portfolio. Gravity requires an available current market price to record the exit and realized virtual P&L.",
          "The position is then moved to your local trade history."
        ]
      }
    ]
  },
  {
    "slug": "portfolio-and-pnl",
    "group": "THE TERMINAL",
    "title": "Portfolio & P&L",
    "description": "Track open positions, virtual equity and your recorded trade history.",
    "readingMinutes": 4,
    "sections": [
      {
        "id": "portfolio-overview",
        "title": "Inside Portfolio",
        "body": [
          "The Portfolio tab shows virtual equity, available collateral, locked collateral, open positions and recorded trade history.",
          "The displayed funds are not a wallet balance, withdrawable assets or deposited cryptocurrency."
        ]
      },
      {
        "id": "open-vs-realized",
        "title": "Unrealized vs realized P&L",
        "body": [
          "Unrealized P&L is the estimated change in an open position at its latest available market price. Realized P&L is the amount recorded when a virtual position closes.",
          "Virtual equity reflects starting funds, realized results and the estimated results of open positions. When market quotes are unavailable, an estimated mark may be missing or stale."
        ],
        "bullets": [
          "Available collateral is virtual equity from starting funds and realized results, minus collateral allocated to open positions.",
          "Locked collateral is the virtual collateral allocated to positions that are still open.",
          "Trade history contains positions you have closed in this browser."
        ]
      },
      {
        "id": "storage",
        "title": "Where your history is stored",
        "body": [
          "Positions and watchlists are saved to browser storage on your device. They are not synchronized across browsers, devices or wallet accounts.",
          "Clearing browser site data, using private browsing, or switching devices may remove access to your local history."
        ],
        "note": {
          "title": "Local to your browser",
          "text": "Connecting a Solana wallet does not back up, transfer or synchronize your virtual positions.",
          "tone": "info"
        }
      }
    ]
  },
  {
    "slug": "watchlist",
    "group": "THE TERMINAL",
    "title": "Watchlist",
    "description": "Keep interesting markets within reach.",
    "readingMinutes": 2,
    "sections": [
      {
        "id": "save",
        "title": "Save a token",
        "body": [
          "Select the star icon in a market row or on a token's detail page to add that mint address to your watchlist. Selecting the star again removes it.",
          "Open Watchlist from the terminal header to see saved tokens."
        ]
      },
      {
        "id": "how-it-works",
        "title": "How it works",
        "body": [
          "The watchlist uses browser storage and the token information available from markets you have viewed. It does not represent a funded position or a wallet holding.",
          "If a saved token is absent from the currently loaded feed, Gravity may use previously discovered token information. Some prices may be unavailable until refreshed."
        ]
      },
      {
        "id": "sync",
        "title": "Privacy and syncing",
        "body": [
          "Watchlist selections are local to the current browser. They are not connected to a Solana wallet and do not automatically appear on another device."
        ]
      }
    ]
  },
  {
    "slug": "wallet-connection",
    "group": "THE TERMINAL",
    "title": "Solana wallets",
    "description": "Connect a compatible Solana wallet to identify your address.",
    "readingMinutes": 4,
    "sections": [
      {
        "id": "connect",
        "title": "Connecting",
        "body": [
          "Select Connect wallet in the top-right corner of the terminal. Gravity detects installed wallets that support Solana through the wallet standard and lets you choose one.",
          "Approve the connection in your wallet. Once connected, Gravity shows a shortened Solana address."
        ]
      },
      {
        "id": "manage",
        "title": "Managing your connection",
        "body": [
          "Open the wallet menu to copy your public address or disconnect. Compatible wallets can also report account changes or disconnection to the website.",
          "On mobile, you may need to open Gravity in a wallet's in-app browser if the external browser cannot detect the wallet."
        ]
      },
      {
        "id": "permissions",
        "title": "What a connection does",
        "body": [
          "A wallet connection lets Gravity see the public address you approved. The connection flow does not request a transfer, a trade or a transaction signature.",
          "Gravity's virtual positions, virtual balance and watchlist are not tied to your wallet account."
        ],
        "note": {
          "title": "No deposits required",
          "text": "You do not need to connect or fund a wallet to explore markets or open virtual positions.",
          "tone": "info"
        }
      },
      {
        "id": "safety",
        "title": "Wallet safety",
        "body": [
          "Always inspect the domain and wallet approval prompt. Gravity will not ask for your seed phrase or private key. Never share recovery words with anyone."
        ]
      }
    ]
  },
  {
    "slug": "risk-and-limits",
    "group": "REFERENCE",
    "title": "Risk & limits",
    "description": "Understand the boundaries of the current product and market data.",
    "readingMinutes": 5,
    "sections": [
      {
        "id": "market-risks",
        "title": "Market data risks",
        "body": [
          "Memecoins may move sharply, have limited liquidity, or display misleading activity. Stock tokens have issuer, pricing and rights considerations that differ from conventional shares.",
          "Market data can be delayed, incomplete or unavailable. Neither a verification indicator nor a price chart is a recommendation to buy or sell."
        ]
      },
      {
        "id": "virtual-model",
        "title": "Virtual model limits",
        "body": [
          "Gravity tracks virtual exposure, not actual perpetual futures positions. The position model does not incorporate an exchange order book, fills, slippage, trading commissions, funding, borrowing costs or a production liquidation engine.",
          "Real trading elsewhere can produce materially different returns, including rapid losses."
        ],
        "bullets": [
          "Current collateral per position is $5 to $1,000 in virtual funds.",
          "Leverage choices are 1x, 2x and 3x.",
          "Closing requires a usable market quote.",
          "Funds and positions are stored only within the browser."
        ]
      },
      {
        "id": "not-financial-advice",
        "title": "Informational use",
        "body": [
          "Gravity is an interface for market exploration and virtual position tracking. It is not a brokerage, custody service or investment adviser, and it does not currently execute real orders.",
          "Nothing in the site or this documentation is financial advice. You are responsible for evaluating any real asset or service before using it."
        ]
      }
    ]
  },
  {
    "slug": "faq",
    "group": "REFERENCE",
    "title": "Frequently asked questions",
    "description": "Short answers to the things people ask first.",
    "readingMinutes": 4,
    "sections": [
      {
        "id": "real-trades",
        "title": "Does Gravity place real trades?",
        "body": [
          "No. Gravity currently displays real market data and tracks virtual long or short positions in browser storage. No exchange orders are submitted."
        ]
      },
      {
        "id": "wallet-required",
        "title": "Do I need a wallet to use Gravity?",
        "body": [
          "No. Wallet connection is optional for browsing markets and virtual-position tracking. Only compatible Solana wallets can connect through the current wallet selector."
        ]
      },
      {
        "id": "starting-balance",
        "title": "What is the starting balance?",
        "body": [
          "Every new browser with no saved position history starts from $10,000 in virtual funds. This is not cryptocurrency and cannot be withdrawn."
        ]
      },
      {
        "id": "stocks",
        "title": "Am I buying actual stocks?",
        "body": [
          "No. Gravity shows tokenized stock markets, which are not direct company shares. Gravity does not currently place purchases of those tokens or traditional shares."
        ]
      },
      {
        "id": "data-history",
        "title": "Why are some charts empty?",
        "body": [
          "Not every token and timeframe has retrievable historical candles. Change the interval or try another market."
        ]
      },
      {
        "id": "positions-missing",
        "title": "Where did my positions go?",
        "body": [
          "Position history is saved in the browser that created it. Clearing site data or changing browser, device or profile can make that local history unavailable."
        ]
      },
      {
        "id": "fees",
        "title": "Does Gravity charge trading or funding fees?",
        "body": [
          "Gravity does not execute real orders. Its current virtual P&L calculations do not model trading fees, funding payments or slippage."
        ]
      },
      {
        "id": "support",
        "title": "Where can I follow updates?",
        "body": [
          "Follow Gravity at @gravitydottrade on X. The platform status page here also summarizes what is currently available."
        ]
      }
    ]
  },
  {
    "slug": "product-status",
    "group": "REFERENCE",
    "title": "Product status",
    "description": "What is currently available and what is not implemented.",
    "readingMinutes": 3,
    "sections": [
      {
        "id": "available-now",
        "title": "Available in Gravity today",
        "body": [
          "The current website and terminal include memecoin discovery, stock token discovery, token search and sorting, market charts, wallet connection, watchlists, virtual long/short positions, local portfolio tracking and trade history. The token page now has a Paper / Live selector. Paper operates entirely with virtual funds; Live presents a wallet-connected view but does not execute orders."
        ],
        "bullets": [
          "Solana-only compatible wallet connection.",
          "Memecoin and stock-token listings with available market statistics.",
          "Historical candlestick chart timeframes and periodic quote refresh.",
          "Browser-stored virtual position and watchlist data."
        ]
      },
      {
        "id": "not-available",
        "title": "Not implemented as live trading",
        "body": [
          "Gravity does not currently send orders to decentralized exchanges, debit a connected wallet, settle trades on-chain, or process deposits and withdrawals.",
          "Real trading, custody, liquidation mechanics, wallet-synced positions and a public developer API should not be assumed to exist."
        ],
        "note": {
          "title": "Feature status",
          "text": "Only functionality visible and working in the current terminal is documented as available. Do not rely on this page as a promise of future features.",
          "tone": "warning"
        }
      },
      {
        "id": "updates",
        "title": "Follow development",
        "body": [
          "For announcements and product news, use the official @gravitydottrade account on X. The Docs link remains available from the website and terminal."
        ]
      }
    ]
  }
];
export const docsBySlug=new Map(docs.map(article=>[article.slug,article]));
export const findDoc=(slug:string):DocArticle|undefined=>docsBySlug.get(slug);
export const docHref=(slug:string):string=>slug==="overview"?"/docs":"/docs/"+slug;
