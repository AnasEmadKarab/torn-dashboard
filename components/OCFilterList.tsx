"use client";
import { useState, useEffect } from "react";

function formatTimeLeft(targetTimestamp: number | null, currentTimestamp: number) {
  if (!targetTimestamp) return "N/A";
  const diff = targetTimestamp - currentTimestamp;
  if (diff <= 0) return "Ready";
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function OCFilterList({ allCrimes = [], activeCrime = null }: { allCrimes?: any[], activeCrime?: any }) {
  const [filterCpr, setFilterCpr] = useState<number>(30);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. إذا كنت في مهمة حالية، اعرضها بوضوح
  if (activeCrime) {
    return (
      <div className="glass-panel p-5 border border-emerald-500/30">
        <h2 className="text-lg font-bold text-emerald-300 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Current OC: {activeCrime.name}
        </h2>
        <div className="bg-gray-900/60 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
             <p className="text-xs text-gray-500 uppercase">Status</p>
             <p className="text-emerald-400 font-bold capitalize">{activeCrime.status.replace("_", " ")}</p>
           </div>
           <div>
             <p className="text-xs text-gray-500 uppercase">Ready In</p>
             <p className="text-pink-400 font-mono font-bold">{formatTimeLeft(activeCrime.ready_at, now)}</p>
           </div>
           <div>
             <p className="text-xs text-gray-500 uppercase">Slots Filled</p>
             <p className="text-white font-bold">{activeCrime.slots.filter((s:any) => s.user).length} / {activeCrime.slots.length}</p>
           </div>
        </div>
      </div>
    );
  }

  // 2. إذا مافي مهمة، اعرض القائمة مع الفلتر
  const filteredOcs = allCrimes.filter((oc: any) => 
    oc.slots.some((s: any) => s.checkpoint_pass_rate >= filterCpr)
  );

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-cyan-300">Available OCs</h2>
        <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
          <span className="text-xs text-gray-400">Min CPR:</span>
          <input type="number" value={filterCpr} onChange={(e) => setFilterCpr(Number(e.target.value))} className="w-10 bg-transparent text-white font-mono outline-none text-center" />
          <span className="text-xs text-gray-400">%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOcs.map((oc: any) => (
          <div key={oc.id} className="bg-gray-900/60 rounded-xl p-4 border border-white/5 hover:border-cyan-500/50 transition-all flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-bold text-white">{oc.name}</span>
              <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded">Diff {oc.difficulty}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {oc.slots.map((slot: any, idx: number) => (
                <div key={idx} className="bg-black/20 p-2 rounded flex flex-col items-center flex-1 min-w-[80px]">
                  <span className="text-[9px] text-gray-500 uppercase">{slot.position_info.label}</span>
                  <span className="text-pink-400 font-bold text-sm">{slot.checkpoint_pass_rate}%</span>
                  
                  {slot.item_requirement && (
                    <a 
                      href={`https://www.torn.com/page.php?sid=ItemMarket#/market/view=search&itemID=${slot.item_requirement.id}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex flex-col items-center group"
                    >
                      <img src={`https://www.torn.com/images/items/${slot.item_requirement.id}/large.png`} className="w-10 h-6 object-contain" />
                      <span className={`text-[9px] px-1 mt-1 rounded ${slot.item_requirement.is_available ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                        {slot.item_requirement.is_available ? "Ready" : "Missing"}
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}