// components/MoneyVaultCard.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  cashOnHand: number;
  vaultBalance: number;
}

export default function MoneyVaultCard({ cashOnHand, vaultBalance }: Props) {
  const [alertActive, setAlertActive] = useState(false);

  useEffect(() => {
    setAlertActive(cashOnHand > 1_000_000);
  }, [cashOnHand]);

  return (
    <div className={`glass-panel p-5 ${alertActive ? "flash-alert glow-pink" : "glow-cyan"}`}>
      <h2 className="text-lg font-semibold mb-3 text-cyan-300">Finances</h2>

      <div className="flex justify-between items-baseline mb-2">
        <span className="text-gray-400 text-sm">Cash on Hand</span>
        <span className="text-2xl font-bold font-mono">${cashOnHand.toLocaleString()}</span>
      </div>

      <div className="flex justify-between items-baseline mb-4">
        <span className="text-gray-400 text-sm">Faction Vault (You)</span>
        <span className="text-xl font-mono text-emerald-300">${vaultBalance.toLocaleString()}</span>
      </div>

      {alertActive && (
        <motion.a
          href="https://www.torn.com/factions.php?step=your#/tab=armory"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="block w-full text-center py-3 rounded-xl font-bold bg-pink-500/90 hover:bg-pink-400 transition-colors text-white shadow-lg"
        >
          🚨 Deposit Cash to Faction Vault Now
        </motion.a>
      )}
    </div>
  );
}