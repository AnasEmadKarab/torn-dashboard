"use client";
import { leaveTimeForArrival } from "@/lib/travel-data";

interface ChartProps {
  ukData: any[];
  japanData: any[];
  canData: any[];
  rawUk?: any;
  rawJapan?: any;
  rawCan?: any;
  highestSellPrice?: number;
  flightType?: "standard" | "airstrip";
  showCanada: boolean; 
}

function formatTime(ts: number) {
  if (!ts) return "--:--";
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function XanaxTimelineChart({ ukData, japanData, canData, rawUk, rawJapan, rawCan, highestSellPrice, flightType = "standard", showCanada }: ChartProps) {
  const now = Math.floor(Date.now() / 1000);

  const renderCountryCard = (title: string, raw: any, colorClass: string, borderClass: string) => (
    <div className={`flex flex-col p-3 bg-gray-900/60 rounded-lg border ${borderClass} shadow-inner`}>
      <span className={`${colorClass} font-bold border-b border-gray-700/50 pb-1 mb-2 text-center text-lg`}>{title}</span>
      <div className="text-xs text-gray-400 flex justify-between gap-2 mb-1">
        <span>Current Stock:</span> <span className="text-white font-bold">{raw?.current_quantity?.toLocaleString() ?? 0}</span>
      </div>
      <div className="text-xs text-gray-400 flex justify-between gap-2 mb-1">
        <span>Last Restock:</span> 
        <span className="text-gray-300 text-right">
          {formatTime(raw?.last_restock_time)} <br/>
          <span className="text-[10px] text-gray-500">(predicted at {formatTime(raw?.last_predicted_restock)})</span>
        </span>
      </div>
      <div className="text-xs text-gray-400 flex justify-between gap-2 mb-1">
        <span>StockOut In:</span> <span className="text-pink-300 font-semibold">{raw?.empty_duration_minutes ?? 0} mins</span>
      </div>
      <div className="text-xs text-gray-400 flex justify-between gap-2 mb-1 border-b border-gray-800 pb-2">
        <span>Next Expected:</span> 
        <span className={`${colorClass} font-bold text-right`}>
          {formatTime(raw?.next_predicted_restock)}
        </span>
      </div>
      <div className="text-xs text-gray-400 flex justify-between gap-2 mt-2">
        <span>Buy Price:</span> <span className="text-white font-mono">${raw?.cost?.toLocaleString() ?? "N/A"}</span>
      </div>
      <div className="text-xs text-gray-400 flex justify-between gap-2 mt-1 border-b border-gray-800 pb-2">
        <span>Sell (Top Trader):</span> <span className="text-yellow-400 font-mono">${highestSellPrice?.toLocaleString() ?? "N/A"}</span>
      </div>
      <div className="text-xs text-emerald-400 flex justify-between gap-2 font-bold mt-2 bg-emerald-900/20 p-1.5 rounded border border-emerald-800/30">
        <span>Profit/Item:</span> <span>${raw?.profit?.toLocaleString() ?? "N/A"}</span>
      </div>
    </div>
  );

  const upcomingDrops = [
    ...(ukData || []).filter(d => d.isRestock).map(d => ({ ...d, id: 'uk', label: "UK", color: "text-cyan-400", bg: "bg-cyan-950/40", border: "border-cyan-500/50" })),
    ...(japanData || []).filter(d => d.isRestock).map(d => ({ ...d, id: 'japan', label: "Japan", color: "text-pink-400", bg: "bg-pink-950/40", border: "border-pink-500/50" })),
    ...(showCanada ? (canData || []).filter(d => d.isRestock).map(d => ({ ...d, id: 'can', label: "Canada", color: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-500/50" })) : [])
  ]
  .filter(d => d.timestamp > now)
  .sort((a, b) => a.timestamp - b.timestamp)
  .slice(0, 15); 

  return (
    <div className="glass-panel p-5">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-cyan-300 mb-4 text-center md:text-left">Xanax Market Radar</h2>
        <div className={`grid gap-4 ${showCanada ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {renderCountryCard("🇬🇧 UK", rawUk, "text-cyan-400", "border-cyan-800/50")}
          {renderCountryCard("🇯🇵 Japan", rawJapan, "text-pink-400", "border-pink-800/50")}
          {showCanada && renderCountryCard("🇨🇦 Canada", rawCan, "text-emerald-400", "border-emerald-800/50")} 
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
          <span className="bg-gray-800 p-1.5 rounded-md text-sm">⏱</span> Upcoming Drops Timeline
        </h3>
        
        {/* تم تعديل الكونتينر هون: ضفنا pt-2 عشان الهوفر، وعدلنا كلاسات السكرول بار */}
        <div className="flex overflow-x-auto gap-2 md:gap-3 pb-4 pt-2 px-1 scrollbar-thin scrollbar-thumb-cyan-800 hover:scrollbar-thumb-cyan-600 scrollbar-track-transparent snap-x">
          {upcomingDrops.length === 0 ? (
             <div className="w-full text-center py-6 text-gray-500 text-sm border border-dashed border-gray-700 rounded-lg">
               Waiting for prediction data...
             </div>
          ) : (
            upcomingDrops.map((drop, idx) => (
              // تم تصغير العرض عالموبايل (min-w-[110px]) وتقليل البادينج (p-2)
              <div key={idx} className={`snap-start min-w-[110px] md:min-w-[150px] flex-shrink-0 rounded-xl border ${drop.border} ${drop.bg} p-2 md:p-3 shadow-lg flex flex-col justify-between transition-transform hover:-translate-y-2`}>
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className={`font-bold ${drop.color} text-[10px] md:text-sm uppercase tracking-wider`}>{drop.label}</span>
                  <span className="text-[9px] md:text-[10px] text-gray-400 bg-black/40 px-1 md:px-1.5 py-0.5 rounded">Drop {idx + 1}</span>
                </div>
                
                <div className="text-white font-mono text-lg md:text-2xl font-bold tracking-tight mb-2 md:mb-3 text-center">
                  {formatTime(drop.timestamp)}
                </div>
                
                <div className="mt-auto bg-black/40 rounded-lg p-1.5 md:p-2 border border-white/5 text-center">
                  <div className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">✈ Fly At</div>
                  <div className={`font-mono text-xs md:text-sm font-semibold ${drop.color}`}>
                    {formatTime(leaveTimeForArrival(drop.timestamp, drop.id as any, flightType))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}