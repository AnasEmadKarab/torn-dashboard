"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { leaveTimeForArrival } from "@/lib/travel-data";

interface ChartProps {
  ukData: any[];
  japanData: any[];
  rawUk?: any;
  rawJapan?: any;
  flightType?: "standard" | "airstrip"; // 👈 ضفناها عشان التولتيب يحسب صح
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
        const country = entry.name.toLowerCase() as "uk" | "japan";
        const isSpike = entry.payload.isRestock;
        const stockValue = Math.round(entry.value);
        
        return (
          <div key={entry.name} className="mb-2 last:mb-0">
            <p style={{ color: entry.color }} className="font-bold flex justify-between gap-4">
              <span>{entry.name.toUpperCase()}:</span> 
              <span>{stockValue.toLocaleString()} stock</span>
            </p>
            {/* 👈 ما بنعرض وقت المغادرة إلا على قمة الستوك */}
            {isSpike && stockValue > 0 && (
              <p className="text-emerald-300 font-semibold text-xs mt-1 bg-emerald-900/30 px-2 py-1 rounded">
                ✈ Leave Torn at {formatTime(leaveTimeForArrival(label, country, flightType || "standard"))}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function XanaxTimelineChart({ ukData, japanData, rawUk, rawJapan, flightType = "standard" }: ChartProps) {
  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4 md:mb-0">Xanax Stock</h2>
        
        <div className="flex w-full md:w-auto gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 shadow-inner">
          <div className="flex-1 md:flex-none flex flex-col">
            <span className="text-cyan-400 font-bold border-b border-cyan-800/50 pb-1 mb-1">🇬🇧 UK</span>
            <div className="text-xs text-gray-400 flex justify-between gap-4">
              <span>Current Stock:</span> <span className="text-white font-bold">{rawUk?.quantity?.toLocaleString() ?? 0}</span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between gap-4">
              <span>Last Restock:</span> <span className="text-gray-300">{formatTime(rawUk?.last_restock)}</span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between gap-4">
              <span>Next Expected:</span> <span className="text-cyan-300 font-bold">{formatTime(rawUk?.next_expected)}</span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between gap-4 mt-1 pt-1 border-t border-gray-800">
              <span>Price:</span> <span className="text-cyan-200">${rawUk?.cost?.toLocaleString() ?? "N/A"}</span>
            </div>
          </div>
          
          <div className="w-px bg-gray-700 hidden md:block mx-2"></div>
          
          <div className="flex-1 md:flex-none flex flex-col border-l border-gray-700 md:border-none pl-4 md:pl-0">
            <span className="text-pink-400 font-bold border-b border-pink-800/50 pb-1 mb-1">🇯🇵 Japan</span>
            <div className="text-xs text-gray-400 flex justify-between gap-4">
              <span>Current Stock:</span> <span className="text-white font-bold">{rawJapan?.quantity?.toLocaleString() ?? 0}</span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between gap-4">
              <span>Last Restock:</span> <span className="text-gray-300">{formatTime(rawJapan?.last_restock)}</span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between gap-4">
              <span>Next Expected:</span> <span className="text-pink-300 font-bold">{formatTime(rawJapan?.next_expected)}</span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between gap-4 mt-1 pt-1 border-t border-gray-800">
              <span>Price:</span> <span className="text-pink-200">${rawJapan?.cost?.toLocaleString() ?? "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div style={{ minWidth: "200%", height: "240px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="timestamp" 
                type="number" 
                domain={[now, 'dataMax']} 
                allowDataOverflow={true}
                tickFormatter={formatTime} 
                stroke="#666" 
                minTickGap={40} 
              />
              <YAxis hide={true} domain={[0, 'dataMax + 200']} allowDataOverflow={true} />
              <Tooltip content={<CustomTooltip flightType={flightType} />} />
              <ReferenceLine x={now} stroke="#888" strokeDasharray="4 4" label={{ value: "Now", position: "top", fill: "#888", fontSize: 11 }} />
              
              <Line data={ukData} type="linear" dataKey="predictedStock" stroke="#00f0ff" strokeWidth={2} dot={false} name="UK" />
              <Line data={japanData} type="linear" dataKey="predictedStock" stroke="#ff2d75" strokeWidth={2} dot={false} name="Japan" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}