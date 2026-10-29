"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import {getWallets} from "@wallet-standard/app";
import type {Wallet as StandardWallet,WalletAccount} from "@wallet-standard/base";
import type {StandardConnectFeature,StandardDisconnectFeature,StandardEventsFeature} from "@wallet-standard/features";
import {Check,ChevronDown,Copy,ExternalLink,LoaderCircle,LogOut,Wallet as WalletIcon,X} from "lucide-react";

const PREFERRED_WALLET_KEY="gravity.solana.wallet.v1";
function solanaAccount(account:WalletAccount|undefined):account is WalletAccount{
  return !!account &&
    account.chains.some(chain=>chain.startsWith("solana:")) &&
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(account.address);
}
function supportedWallet(wallet:StandardWallet):boolean{
  const connect=wallet.features["standard:connect"] as StandardConnectFeature["standard:connect"]|undefined;
  return wallet.chains.some(chain=>chain.startsWith("solana:")) && typeof connect?.connect==="function";
}
function shortAddress(address:string){return address.slice(0,4)+"..."+address.slice(-4)}
function WalletGlyph({wallet}:{wallet:StandardWallet}){
  const [broken,setBroken]=useState(false);
  return <span className="gravity-wallet-provider-icon">
    {!broken&&wallet.icon?<img src={wallet.icon} alt="" onError={()=>setBroken(true)}/>:<WalletIcon size={18}/>}
  </span>;
}

export default function SolanaWalletButton({onAddressChange}:{onAddressChange?:(address:string|null)=>void}){
  const [wallets,setWallets]=useState<StandardWallet[]>([]);
  const [selected,setSelected]=useState<StandardWallet|null>(null);
  const [address,setAddress]=useState<string|null>(null);
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [copied,setCopied]=useState(false);
  const root=useRef<HTMLDivElement|null>(null);
  const busyRef=useRef(false);
  useEffect(()=>{onAddressChange?.(address)},[address,onAddressChange]);
  useEffect(()=>{
    const handle=()=>{setOpen(true);setError("")};
    window.addEventListener("gravity:open-wallet",handle);
    return()=>window.removeEventListener("gravity:open-wallet",handle);
  },[]);

  useEffect(()=>{
    const registry=getWallets();
    const update=()=>{
      const compatible=registry.get().filter(supportedWallet).sort((a,b)=>a.name.localeCompare(b.name));
      setWallets(compatible);
      const preferred=localStorage.getItem(PREFERRED_WALLET_KEY);
      if(preferred){
        const found=compatible.find(wallet=>wallet.name===preferred);
        const account=found?.accounts.find(solanaAccount);
        if(found&&account){
          setSelected(found);
          setAddress(account.address);
        }
      }
    };
    update();
    const offRegister=registry.on("register",update);
    const offUnregister=registry.on("unregister",update);
    return()=>{offRegister();offUnregister()};
  },[]);

  useEffect(()=>{
    if(!selected)return;
    const events=selected.features["standard:events"] as StandardEventsFeature["standard:events"]|undefined;
    const off=events?.on("change",event=>{
      if(event.accounts){
        const account=event.accounts.find(solanaAccount);
        if(account)setAddress(account.address);
        else{setAddress(null);setSelected(null);localStorage.removeItem(PREFERRED_WALLET_KEY);}
      }
      if(event.chains&&!selected.chains.some(chain=>chain.startsWith("solana:"))){
        setAddress(null);setSelected(null);localStorage.removeItem(PREFERRED_WALLET_KEY);
      }
    });
    return()=>{off?.()};
  },[selected]);

  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{if(root.current&&!root.current.contains(event.target as Node))setOpen(false)};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    document.addEventListener("pointerdown",outside);
    document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape)};
  },[open]);

  const connect=useCallback(async(wallet:StandardWallet)=>{
    if(busyRef.current)return;
    busyRef.current=true;setBusy(true);setError("");
    try{
      const feature=wallet.features["standard:connect"] as StandardConnectFeature["standard:connect"]|undefined;
      if(!supportedWallet(wallet)||!feature)throw new Error("This wallet cannot connect to Solana.");
      const result=await feature.connect();
      const account=result.accounts.find(solanaAccount);
      if(!account)throw new Error("No Solana account was returned. Select a Solana account in your wallet.");
      setSelected(wallet);
      setAddress(account.address);
      localStorage.setItem(PREFERRED_WALLET_KEY,wallet.name);
      setOpen(false);
    }catch(err){
      const message=err instanceof Error?err.message:"Unable to connect wallet.";
      setError(/rejected|denied|cancel/i.test(message)?"Connection cancelled in your wallet.":message);
    }finally{busyRef.current=false;setBusy(false)}
  },[]);

  const disconnect=useCallback(async()=>{
    if(busyRef.current)return;
    busyRef.current=true;setBusy(true);setError("");
    try{
      const feature=selected?.features["standard:disconnect"] as StandardDisconnectFeature["standard:disconnect"]|undefined;
      if(feature)await feature.disconnect();
      setAddress(null);setSelected(null);setCopied(false);
      localStorage.removeItem(PREFERRED_WALLET_KEY);
      setOpen(false);
    }catch(err){
      setError(err instanceof Error?err.message:"Unable to disconnect wallet.");
    }finally{busyRef.current=false;setBusy(false)}
  },[selected]);

  const copy=useCallback(async()=>{
    if(!address)return;
    try{await navigator.clipboard.writeText(address);setCopied(true);
      window.setTimeout(()=>setCopied(false),1800);
    }catch{setError("Copy failed. Select the address and copy it manually.")}
  },[address]);

  return <div className="gravity-wallet-root" ref={root}>
    <button
      type="button"
      className={"gravity-connect-wallet"+(address?" is-connected":"")}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={address?"Connected Solana wallet "+shortAddress(address)+". Manage wallet":"Connect a Solana wallet"}
      onClick={()=>{setOpen(!open);setError("")}}
    >
      {busy?<LoaderCircle size={16} className="spin"/>:<WalletIcon size={16}/>}
      <span>{address?shortAddress(address):"Connect wallet"}</span>
      <ChevronDown size={13} className="gravity-wallet-chevron"/>
    </button>
    {open&&<div className="gravity-wallet-menu" role="dialog" aria-label="Solana wallet connection">
      <div className="gravity-wallet-menu-head">
        <div><strong>{address?"Wallet connected":"Connect wallet"}</strong><small>Solana only</small></div>
        <button className="gravity-wallet-close" type="button" onClick={()=>setOpen(false)} aria-label="Close wallet menu"><X size={16}/></button>
      </div>
      {address&&selected?<div className="gravity-wallet-connected">
        <div className="gravity-wallet-connected-name"><WalletGlyph wallet={selected}/><span><strong>{selected.name}</strong><small>Connected to Gravity</small></span><span className="gravity-wallet-dot"/></div>
        <div className="gravity-wallet-address"><span title={address}>{shortAddress(address)}</span>
          <button type="button" onClick={copy} aria-label="Copy wallet address">{copied?<Check size={16}/>:<Copy size={16}/>}</button>
        </div>
        <button className="gravity-wallet-disconnect" type="button" onClick={()=>void disconnect()} disabled={busy}><LogOut size={16}/> Disconnect</button>
      </div>:<div className="gravity-wallet-options">
        {wallets.length>0?wallets.map(wallet=><button
          className="gravity-wallet-option" type="button" key={wallet.name}
          onClick={()=>void connect(wallet)} disabled={busy}
        ><WalletGlyph wallet={wallet}/><span>{wallet.name}</span>{busy?<LoaderCircle className="spin" size={15}/>:<span className="gravity-wallet-option-tag">Connect</span>}</button>):
        <div className="gravity-wallet-none"><WalletIcon size={25}/><strong>No Solana wallet detected</strong>
          <p>Install a Solana wallet extension, or open this site inside a Solana wallet's mobile browser.</p>
          <div className="gravity-wallet-install"><a href="https://phantom.com/" target="_blank" rel="noopener noreferrer">Phantom <ExternalLink size={12}/></a>
          <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer">Solflare <ExternalLink size={12}/></a></div>
        </div>}
      </div>}
      {error&&<div className="gravity-wallet-error" role="alert">{error}</div>}
      <div className="gravity-wallet-menu-foot">Wallet connection only. No transactions or signature requests.</div>
    </div>}
  </div>;
}
