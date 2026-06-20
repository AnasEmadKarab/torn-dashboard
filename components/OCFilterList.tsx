"use client";
import { useState, useEffect } from "react";

// دالة لحساب الوقت المتبقي بناءً على الـ Timestamp
function formatTimeLeft(targetTimestamp: number | null, currentTimestamp: number) {
  if (!targetTimestamp) return "--:--:--";
  const diff = targetTimestamp - currentTimestamp;
  if (diff <= 0) return "Ready / Executing";
  
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h}h ${m}m ${s}s`;
}

interface OCProps {
  allCrimes?: any[];
  activeCrime?: any;
}

export default function OCFilterList({ allCrimes = [], activeCrime = null }: OCProps) {
  // استخدام الوقت الحالي لتحديث العدادات التنازلية
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --------------------------------------------------------
  // حالة 1: المستخدم مسجل في جريمة حالية (Active OC)
  // --------------------------------------------------------
  if (activeCrime) {
    const crimeName = activeCrime.name || "Unknown OC";
    let displayStatus = (activeCrime.status || "Unknown").replace("_", " ");
    if (displayStatus.toLowerCase() === "recruiting") displayStatus = "Planning";

    return (
      <div className="glass-panel p-5 border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

        <h2 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2 relative z-10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Your Active Organized Crime
        </h2>

        <div className="bg-gray-900/60 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <div className="text-center md:text-left">
            <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Crime Name</span>
            <span className="text-white font-bold text-base md:text-lg">{crimeName}</span>
          </div>

          <div className="w-full md:w-px h-px md:h-10 bg-gray-700/50"></div>

          <div className="text-center">
            <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Current Stage</span>
            <span className="text-emerald-400 font-medium capitalize px-3 py-1 bg-emerald-900/30 rounded-full border border-emerald-800/50">
              {displayStatus}
            </span>
          </div>

          <div className="w-full md:w-px h-px md:h-10 bg-gray-700/50"></div>

          <div className="text-center md:text-right">
            <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Time Remaining</span>
            <span className="text-pink-400 font-mono font-bold text-lg md:text-xl">
              {formatTimeLeft(activeCrime.ready_at, now)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // حالة 2: المستخدم غير مسجل، نعرض كروت لكل جرائم الفاكشن المتاحة
  // --------------------------------------------------------
  if (allCrimes && allCrimes.length > 0) {
    return (
      <div className="glass-panel p-5">
        <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
          Faction Organized Crimes ({allCrimes.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCrimes.map((crime: any) => {
            let displayStatus = (crime.status || "Unknown").replace("_", " ");
            if (displayStatus.toLowerCase() === "recruiting") displayStatus = "Planning";

            return (
              <div key={crime.id} className="bg-gray-900/60 p-4 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-bold truncate max-w-[70%]">{crime.name}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold ${displayStatus.toLowerCase() === 'planning' ? 'bg-orange-900/40 text-orange-400' : 'bg-cyan-900/40 text-cyan-400'}`}>
                      {displayStatus}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 flex justify-between mt-3">
                    <span>Difficulty: <span className="text-gray-200">{crime.difficulty}</span></span>
                    <span>Slots: <span className="text-gray-200">{crime.slots?.length || 0}</span></span>
                  </div>
                </div>

                <div className="mt-4 text-center bg-black/40 p-2 rounded border border-gray-800">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Time until Ready</span>
                  <span className="text-pink-300 font-mono text-sm font-semibold">
                     {formatTimeLeft(crime.ready_at, now)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // حالة 3: مافي أي جريمة بالفاكشن أساساً
  // --------------------------------------------------------
  return (
    <div className="glass-panel p-5 text-center">
      <h2 className="text-lg font-semibold text-cyan-300 mb-2">Organized Crimes</h2>
      <p className="text-gray-400 text-sm">
        No Organized Crimes are currently available in your faction.
      </p>
    </div>
  );
}