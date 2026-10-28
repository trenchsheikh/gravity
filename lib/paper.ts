import type { Market } from "./markets";

export type Position = {
  id: string; mint:string; name:string;symbol:string;image:string|null;
  side:"long"|"short"; margin:number; leverage:number; entry:number;
  openedAt:number; closedAt?:number; exit?:number; pnl?:number;
};
const STORE = "gravity.paper.positions.v1";
const INITIAL_BALANCE = 10000;
export const STARTING_BALANCE = INITIAL_BALANCE;

export function getPositions(): Position[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORE) || "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((p:Position)=>p && typeof p.id === "string" && typeof p.entry === "number" && Number.isFinite(p.entry) && p.entry>0 && (p.side === "long" || p.side === "short") && Number.isFinite(p.margin) && p.margin>0 && [1,2,3].includes(p.leverage));
  } catch {return []}
}
export function storePositions(positions: Position[]) {
  localStorage.setItem(STORE, JSON.stringify(positions));
}
export function getPnl(p:Position,mark:number):number {
  if (!Number.isFinite(mark) || mark<=0 || p.entry<=0) return 0;
  return (mark/p.entry - 1) * p.margin * p.leverage * (p.side === "long" ? 1 : -1);
}
export function realisedPnl(positions:Position[]) {return positions.filter(p=>p.closedAt).reduce((total,p)=>total+(p.pnl||0),0)}
export function lockedMargin(positions:Position[]) {return positions.filter(p=>!p.closedAt).reduce((total,p)=>total+p.margin,0)}
export function freeBalance(positions:Position[]) {return Math.max(0,STARTING_BALANCE+realisedPnl(positions)-lockedMargin(positions))}
export function newPosition(m:Market,side:"long"|"short",margin:number,leverage:number,positions:Position[]):Position {
  if (!m.priceUsd || !Number.isFinite(m.priceUsd) || m.priceUsd<=0) throw new Error("A verified live price is required before opening a paper trade.");
  if (!Number.isFinite(margin) || margin < 5 || margin > 1000 || margin > freeBalance(positions)) throw new Error("Enter $5–$1,000 within your available paper balance.");
  if (![1,2,3].includes(leverage)) throw new Error("Unsupported leverage.");
  return {id:crypto.randomUUID(),mint:m.mint,name:m.name,symbol:m.symbol,image:m.image,side,margin,leverage,entry:m.priceUsd,openedAt:Date.now()};
}
export function closePosition(p:Position,mark:number):Position {
  if (!mark || mark<=0) throw new Error("A current price is required to close this paper position.");
  const raw = getPnl(p,mark);
  // Simplified isolated margin: losses cannot exceed collateral. This is not a liquidation engine.
  const pnl = Math.max(-p.margin,raw);
  return {...p,closedAt:Date.now(),exit:mark,pnl};
}
