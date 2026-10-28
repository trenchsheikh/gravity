"use client";

import {useEffect, useMemo, useRef} from "react";
import {CandlestickSeries, ColorType, CrosshairMode, HistogramSeries, createChart} from "lightweight-charts";
import type {IChartApi, ISeriesApi, Time, CandlestickData, HistogramData} from "lightweight-charts";

export type OhlcvCandle={time:number;open:number;high:number;low:number;close:number;volume:number};

function formatPrice(v:number):string {
  if(!Number.isFinite(v))return "—";
  if(Math.abs(v)<0.000001)return "$"+v.toExponential(3);
  if(Math.abs(v)<0.001)return "$"+v.toPrecision(5);
  if(Math.abs(v)<1)return "$"+v.toFixed(5);
  return "$"+v.toLocaleString("en-US",{maximumFractionDigits:4});
}
export default function MarketCandlestickChart({candles}:{candles:OhlcvCandle[]}) {
  const container=useRef<HTMLDivElement|null>(null);
  const chartRef=useRef<IChartApi|null>(null);
  const candleRef=useRef<ISeriesApi<"Candlestick">|null>(null);
  const volumeRef=useRef<ISeriesApi<"Histogram">|null>(null);
  const firstData=useRef(false);
  const sorted=useMemo(()=>{
    const seen=new Map<number,OhlcvCandle>();
    candles.forEach(c=>{if(Number.isFinite(c.time)&&c.time>0&&c.open>0&&c.high>0&&c.low>0&&c.close>0)seen.set(Math.floor(c.time),c)});
    return [...seen.values()].sort((a,b)=>a.time-b.time);
  },[candles]);
  useEffect(()=>{
    if(!container.current)return;
    const chart=createChart(container.current,{
      autoSize:true,
      layout:{background:{type:ColorType.Solid,color:"#090f1c"},textColor:"#9cb0cb",fontFamily:"Manrope, Arial, sans-serif",fontSize:11,attributionLogo:true},
      grid:{vertLines:{color:"#17263c"},horzLines:{color:"#20324a"}},
      crosshair:{mode:CrosshairMode.Normal,vertLine:{color:"#658cbf",labelBackgroundColor:"#244876"},horzLine:{color:"#658cbf",labelBackgroundColor:"#244876"}},
      rightPriceScale:{borderColor:"#2a4263",scaleMargins:{top:0.12,bottom:0.18}},
      timeScale:{borderColor:"#2a4263",timeVisible:true,secondsVisible:false,rightOffset:5,barSpacing:7,fixLeftEdge:false},
      handleScale:{mouseWheel:true,pinch:true,axisPressedMouseMove:true},
      handleScroll:{mouseWheel:true,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:false},
      localization:{priceFormatter:formatPrice}
    });
    const series=chart.addSeries(CandlestickSeries,{
      upColor:"#17d4aa",downColor:"#ff5978",borderVisible:false,wickUpColor:"#49e4c1",wickDownColor:"#ff7991",
      priceFormat:{type:"custom",formatter:formatPrice,minMove:0.000000000001},
      lastValueVisible:true,priceLineVisible:true
    });
    const volume=chart.addSeries(HistogramSeries,{
      priceScaleId:"volume",priceFormat:{type:"volume"},lastValueVisible:false,priceLineVisible:false
    });
    chart.priceScale("volume").applyOptions({scaleMargins:{top:0.84,bottom:0},visible:false});
    chartRef.current=chart;
    candleRef.current=series;
    volumeRef.current=volume;
    return()=>{
      firstData.current=false;
      chartRef.current=null;candleRef.current=null;volumeRef.current=null;
      chart.remove();
    };
  },[]);
  useEffect(()=>{
    if(!candleRef.current||!volumeRef.current||!chartRef.current||!sorted.length)return;
    const ohlcv:CandlestickData<Time>[]=sorted.map(c=>({
      time:c.time as Time,open:c.open,high:c.high,low:c.low,close:c.close
    }));
    const volumes:HistogramData<Time>[]=sorted.map(c=>({
      time:c.time as Time,value:Math.max(0,c.volume||0),
      color:c.close>=c.open?"rgba(23,212,170,.26)":"rgba(255,89,120,.26)"
    }));
    candleRef.current.setData(ohlcv);
    volumeRef.current.setData(volumes);
    if(!firstData.current){
      chartRef.current.timeScale().fitContent();
      firstData.current=true;
    }
  },[sorted]);
  return <div className="gravity-lwc-chart" ref={container} role="img" aria-label="Interactive candlestick chart showing actual open, high, low, close and volume bars. Drag to pan and scroll to zoom."/>;
}
