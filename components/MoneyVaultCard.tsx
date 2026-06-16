"use client";

interface Props {
  cashOnHand: number;
  vaultBalance: number;
  hasFaction?: boolean; // 👈 المتغير الجديد
}

export default function MoneyVaultCard({ cashOnHand, vaultBalance, hasFaction = false }: Props) {
  return (
    <div className="glass-panel p-5 border-t-2 border-pink-500/50 relative overflow-hidden">
      <h2 className="text-xl font-bold text-cyan-300 mb-4">Finances</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Cash on Hand</span>
          <span className="text-lg font-bold text-white">${cashOnHand.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Faction Vault (You)</span>
          <span className="text-lg font-bold text-emerald-400">${vaultBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* 👈 الزر ما رح يظهر إلا إذا اللاعب عنده فاكشن! */}
      {hasFaction && (
        <button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 rounded-lg transition-colors flex justify-center items-center gap-2">
          🚨 Deposit Cash to Faction Vault Now
        </button>
      )}
    </div>
  );
}