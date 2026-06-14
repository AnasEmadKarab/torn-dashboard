"use client";
import { useState } from "react";

export default function OCFilterList({ crimes }: { crimes: any[] }) {
  const [filterCpr, setFilterCpr] = useState<number>(30);
  
  if (!crimes || crimes.length === 0) {
    return (
      <div className="glass-panel p-5">
        <h2 className="text-lg font-semibold mb-3 text-cyan-300">Available Organized Crimes</h2>
        <p className="text-gray-400 text-sm">No recruiting OCs found right now.</p>
      </div>
    );
  }

  const filteredOcs = crimes.filter((oc: any) => {
    if (!oc.slots) return false;
    return oc.slots.some((s: any) => s.checkpoint_pass_rate >= filterCpr);
  });

  return (
    <div className="glass-panel p-5 flex flex-col gap-4 relative">
      <style>{`
        .hide-arrows::-webkit-inner-spin-button,
        .hide-arrows::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
        .custom-oc-scroll::-webkit-scrollbar { width: 6px; }
        .custom-oc-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .custom-oc-scroll::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.2); border-radius: 10px; }
        .custom-oc-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0, 240, 255, 0.5); }
      `}</style>

      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-cyan-300">Available Organized Crimes</h2>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <span className="text-sm text-gray-400">Min CPR:</span>
          <input 
            type="number" 
            value={filterCpr}
            onChange={(e) => setFilterCpr(Number(e.target.value))}
            className="hide-arrows w-10 bg-transparent text-white font-mono outline-none text-center border-b border-cyan-500/50 focus:border-cyan-300 transition-colors"
            min="0"
            max="100"
          />
          <span className="text-sm text-gray-400">%</span>
        </div>
      </div>
      
      {filteredOcs.length === 0 ? (
        <p className="text-gray-400 text-sm">No OCs match the {filterCpr}% CPR requirement.</p>
      ) : (
        <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-3 custom-oc-scroll">
          {filteredOcs.map((oc: any) => {
            const validSlots = oc.slots.filter((s: any) => s.checkpoint_pass_rate >= filterCpr);

            return (
              <li 
                key={oc.id} 
                // الرابط اللي بيوديك على صفحة الجرائم بالفاكشن
                onClick={() => window.open('https://www.torn.com/factions.php?step=your#/tab=crimes', '_blank')}
                // ضفنا cursor-pointer وتأثيرات الـ hover للكارت
                className="bg-[#11131c] rounded-xl px-3 py-2.5 border border-white/5 hover:border-cyan-500/50 hover:bg-[#141722] cursor-pointer transition-all shadow-inner group"
              >
                
                {/* قللنا الـ padding و margin عشان نصغر الارتفاع */}
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5">
                  <span className="font-bold text-gray-100 text-md group-hover:text-cyan-300 transition-colors">{oc.name}</span>
                  <div className="flex gap-2">
                    {oc.difficulty && (
                      <span className="text-cyan-300 font-mono text-[10px] px-2 py-0.5 bg-cyan-500/10 rounded-full border border-cyan-500/20 uppercase">
                        Diff {oc.difficulty}
                      </span>
                    )}
                    {/* شلنا بادج Recruiting من هون */}
                  </div>
                </div>
                
                {/* قللنا الـ gap بين السلوتات شوي */}
                <div className="flex flex-wrap gap-2">
                  {validSlots.map((slot: any) => {
                    const positionName = slot.position_info?.label || slot.position;
                    const item = slot.item_requirement; 

                    return (
                       <div key={slot.position_info?.id} className="bg-white/5 border border-white/10 rounded-lg p-1.5 flex flex-col items-center justify-center flex-1 min-w-[90px] transition-colors relative">
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5 text-center font-semibold">
                            {positionName}
                          </span>
                          <span className="text-pink-400 font-mono font-bold text-lg my-0.5">
                            {slot.checkpoint_pass_rate}%
                          </span>
                          
                            {item && (
                            <a 
                              href={`https://www.torn.com/page.php?sid=ItemMarket#/market/view=search&itemID=${item.id}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()} 
                              /* هون ضفنا الإطار والخلفية عشان يبين إنه زر */
                              className="mt-1 flex flex-col items-center justify-center w-full p-1 rounded-lg border border-white/10 bg-black/20 hover:border-cyan-500/50 hover:bg-black/60 transition-all cursor-pointer group"
                              title="Click to buy from Item Market"
                            >
                              <img 
                                src={`https://www.torn.com/images/items/${item.id}/large.png`} 
                                alt="Required Item" 
                                className="w-16 h-10 object-contain drop-shadow-xl mb-1 group-hover:scale-110 transition-transform"
                              />
                              <span className={`text-[9px] font-bold px-1 py-0.5 rounded w-full text-center uppercase tracking-wide ${item.is_available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {item.is_available ? "✓ Ready" : "✗ Miss"}
                              </span>
                            </a>
                          )}
                       </div>
                    );
                  })}
                </div>

              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}