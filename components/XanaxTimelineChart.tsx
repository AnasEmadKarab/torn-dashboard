"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { leaveTimeForArrival } from "@/lib/travel-data";

interface ChartProps {
  ukData: any[];
  japanData: any[];
  ukPrice?: number;
  japanPrice?: number;
}

function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel p-3 text-sm z-50 relative">
      <p className="text-gray-300 mb-1">{formatTime(label)}</p>
      {payload.map((entry: any) => {
        const country = entry.name.toLowerCase() as "uk" | "japan";
        const isSpike = entry.payload.isRestock;
        return (
          <div key={entry.name} className="mb-2">
            <p style={{ color: entry.color }} className="font-bold">
              {entry.name.toUpperCase()}: {Math.round(entry.value).toLocaleString()} stock
            </p>
            {isSpike && (
              <p className="text-emerald-300 font-semibold text-xs mt-1">
                ✈ Leave Torn at {formatTime(leaveTimeForArrival(label, country))}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function XanaxTimelineChart({ ukData, japanData, ukPrice, japanPrice }: ChartProps) {
  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="glass-panel p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-cyan-300">Xanax Stock — TTP Precision Forecast</h2>
        <div className="flex gap-6 font-mono text-xs">
          <div className="flex flex-col items-center">
            <span className="text-cyan-400 font-bold">UK</span>
            <span className="text-white">{ukData[0]?.predictedStock?.toLocaleString() ?? 0} <span className="text-[10px] text-gray-500">Stock</span></span>
            <span className="text-cyan-200">${ukPrice?.toLocaleString() ?? "N/A"} <span className="text-[10px] text-gray-500">Price</span></span>
          </div>
          <div className="flex flex-col items-center border-l border-white/10 pl-6">
            <span className="text-pink-400 font-bold">JP</span>
            <span className="text-white">{japanData[0]?.predictedStock?.toLocaleString() ?? 0} <span className="text-[10px] text-gray-500">Stock</span></span>
            <span className="text-pink-200">${japanPrice?.toLocaleString() ?? "N/A"} <span className="text-[10px] text-gray-500">Price</span></span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="timestamp" 
            type="number" 
            // السطر التالي يجبر الرسم البياني أن يبدأ من "الآن" بالضبط ويقص أي بيانات سابقة
            domain={[now, 'dataMax']} 
            allowDataOverflow={true}
            tickFormatter={formatTime} 
            stroke="#666" 
            minTickGap={40} 
          />
          {/* السطر التالي يخلي الارتفاع متجاوب مع الستوك الحقيقي (مثلاً 2500) بدل ما يكون ثابت 55000 */}
          <YAxis 
            stroke="#666" 
            domain={[0, 'dataMax + 200']} 
            allowDataOverflow={true}
            tickFormatter={(v) => Math.round(v).toString()} 
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={now} stroke="#888" strokeDasharray="4 4" label={{ value: "Now", position: "top", fill: "#888", fontSize: 11 }} />
          
          <Line data={ukData} type="linear" dataKey="predictedStock" stroke="#00f0ff" strokeWidth={2} dot={false} name="UK" />
          <Line data={japanData} type="linear" dataKey="predictedStock" stroke="#ff2d75" strokeWidth={2} dot={false} name="Japan" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}