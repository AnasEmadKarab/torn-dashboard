"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
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
  showCanada: boolean; // 👈 ضفنا هاد البروب للتحكم
}

function formatTime(ts: number) {
  if (!ts) return "--:--";
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function CustomTooltip({ active, payload, label, flightType }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-3 text-sm z-50 relative border-t-2 border-cyan-500/50 shadow-xl">
      <p className="text-gray-300 mb-2 border-b border-gray-700/50 pb-1">
        Restock Time: <span className="text-white font-bold">{formatTime(label)}</span>
      </p>
      {payload.map((entry: any) => {
        const country = entry.name.toLowerCase() as "uk" | "japan" | "can"; 
        const isSpike = entry.payload.isRestock;
        const stockValue = Math.round(entry.value);
        
        return (
          <div key={entry.name} className="mb-3 last:mb-0">
            <p style={{ color: entry.color }} className="font-bold flex justify-between gap-4">
              <span>{entry.name.toUpperCase()}:</span> 
              <span>{stockValue.toLocaleString()} stock</span>
            </p>
            {isSpike && stockValue > 0 && (
              <p className="text-emerald-300 font-semibold text-xs mt-1 bg-emerald-900/30 px-2 py-1 rounded text-center">
                ✈ Leave Torn at {formatTime(leaveTimeForArrival(label, country, flightType || "standard"))}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 👈 استقبلنا showCanada هنا
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
        <span>Next Expected:</span> <span className={`${colorClass} font-bold`}>{formatTime(raw?.next_predicted_restock)}</span>
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

      <div className="w-full overflow-x-auto pb-2">
        <div style={{ minWidth: "300%", height: "180px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" type="number" domain={[now, 'dataMax']} tickFormatter={formatTime} stroke="#666" />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip flightType={flightType} />} />
              <Line data={ukData} type="linear" dataKey="predictedStock" stroke="#00f0ff" strokeWidth={2} dot={false} name="UK" />
              <Line data={japanData} type="linear" dataKey="predictedStock" stroke="#ff2d75" strokeWidth={2} dot={false} name="Japan" />
              {showCanada && <Line data={canData} type="linear" dataKey="predictedStock" stroke="#10b981" strokeWidth={2} dot={false} name="CAN" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}