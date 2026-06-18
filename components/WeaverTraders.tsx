//components/WeaverTraders.tsx
"use client";
import { useQuery } from "@tanstack/react-query";

export default function WeaverTraders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["weaver-traders"],
    queryFn: async () => {
      const res = await fetch("/api/weaver");
      if (!res.ok) throw new Error("Failed to fetch traders");
      return res.json();
    },
    refetchInterval: 60000, // تحديث الداتا كل دقيقة
  });

  if (isLoading) return <div className="glass-panel p-5 text-gray-400 animate-pulse border-t-2 border-emerald-500/30">Loading top traders...</div>;
  if (error || !data?.success) return null; // إخفاء المكون في حال حدوث خطأ

  const traders = data.data || [];

  return (
    <div className="glass-panel p-5 border-t-2 border-emerald-500/50 glow-emerald relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2 relative z-10">
        🥇 Top 3 Xanax Buyers
      </h2>
      
      <div className="space-y-3 relative z-10">
        {traders.map((trader: any) => (
          <a
            key={trader.id}
            href={`https://www.torn.com/trade.php#step=start&userID=${trader.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-gray-900/60 hover:bg-gray-800 p-3 rounded-lg border border-gray-700/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${trader.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : trader.rank === 2 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-700/20 text-orange-400'}`}>
                #{trader.rank}
              </span>
              <div>
                <p className="text-white font-medium group-hover:text-cyan-300 transition-colors">{trader.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                   Rating: <span className={trader.ratingScore >= 0 ? "text-emerald-400" : "text-pink-400"}>{trader.ratingScore > 0 ? "+" : ""}{trader.ratingScore}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-300 font-bold">${trader.price?.toLocaleString()}</p>
              <p className="text-xs text-gray-400 bg-emerald-900/40 px-2 py-1 rounded mt-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                Trade Now ↗
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}