// components/WeaverTraders.tsx
"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function WeaverTraders({ currentDestination }: { currentDestination?: string }) {
  const [blacklist, setBlacklist] = useState<number[]>([]);
  const [newBlacklistId, setNewBlacklistId] = useState("");
  const [showBlacklist, setShowBlacklist] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("torn_trader_blacklist");
    if (saved) setBlacklist(JSON.parse(saved));
  }, []);

  const addToBlacklist = () => {
    const id = parseInt(newBlacklistId);
    if (!isNaN(id) && !blacklist.includes(id)) {
      const updated = [...blacklist, id];
      setBlacklist(updated);
      localStorage.setItem("torn_trader_blacklist", JSON.stringify(updated));
      setNewBlacklistId("");
    }
  };

  const removeFromBlacklist = (id: number) => {
    const updated = blacklist.filter(bId => bId !== id);
    setBlacklist(updated);
    localStorage.setItem("torn_trader_blacklist", JSON.stringify(updated));
  };

  const { data, isLoading } = useQuery({
    queryKey: ["weaver-traders"],
    queryFn: async () => {
      const res = await fetch("/api/weaver");
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="glass-panel p-4 text-cyan-300 text-center text-sm">Loading Market Traders...</div>;

  let deals = data?.deals || [];

  // 1. الفلترة: استبعاد البلاك ليست + استبعاد أسعار البيع العالية (أعلى من 833k)
  deals = deals.filter((d: any) => {
    const traderId = d.playerId;
    return !blacklist.includes(traderId) && d.price < 833000;
  });

  // 2. الترتيب: أعلى سعر (للشراء منك)
  deals.sort((a: any, b: any) => b.price - a.price);

  // 3. أخذ أعلى 10، ثم ترتيبهم حسب التقييم (Score = upvotes - downvotes)
  const top3Traders = deals
    .slice(0, 10)
    .sort((a: any, b: any) => {
      const scoreA = (a.rating.upvotes - a.rating.downvotes);
      const scoreB = (b.rating.upvotes - b.rating.downvotes);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  return (
    <div className="glass-panel p-5 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
          💰 Top Buyers <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">Xanax</span>
        </h2>
        <button 
          onClick={() => setShowBlacklist(!showBlacklist)}
          className="text-xs bg-gray-800 hover:bg-pink-900/50 text-gray-300 border border-gray-600 px-3 py-1.5 rounded transition-colors"
        >
          {showBlacklist ? "Close" : "Blacklist 🚫"}
        </button>
      </div>

      {showBlacklist && (
        <div className="mb-5 bg-black/40 p-4 rounded-lg border border-pink-900/30">
          <h3 className="text-sm font-bold text-pink-400 mb-2">🚫 Blacklist</h3>
          <div className="flex gap-2 mb-3">
            <input 
              type="number" 
              value={newBlacklistId} 
              onChange={(e) => setNewBlacklistId(e.target.value)}
              placeholder="Enter ID..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
            />
            <button onClick={addToBlacklist} className="bg-pink-700 hover:bg-pink-600 text-white px-3 py-1.5 rounded text-sm font-bold">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {blacklist.map(id => (
              <span key={id} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                ID: {id} <button onClick={() => removeFromBlacklist(id)} className="text-pink-400 ml-1">✖</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {top3Traders.length === 0 ? (
        <p className="text-gray-400 text-sm">No buyers found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {top3Traders.map((trader: any, index: number) => {
            const score = (trader.rating.upvotes - trader.rating.downvotes);
            return (
              <a 
                key={index} 
                href={`https://www.torn.com/trade.php#p=start&userID=${trader.playerId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-900/60 border border-cyan-800/40 hover:border-cyan-400 p-3 rounded-lg flex flex-col justify-between transition-all"
              >
                <div className="flex justify-between items-start mb-2 border-b border-gray-800 pb-2">
                  <div className="flex flex-col truncate max-w-[70%]">
                    <span className="font-bold text-cyan-400 text-sm truncate">{trader.playerName}</span>
                    <span className="text-[10px] text-gray-500 font-mono">ID: {trader.playerId}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${score >= 0 ? "bg-emerald-900/50 text-emerald-400" : "bg-pink-900/50 text-pink-400"}`}>
                    👍 {score}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <span className="text-xs text-gray-400">Buy Price:</span>
                  <span className="font-mono text-lg font-bold text-yellow-400">${trader.price.toLocaleString()}</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}