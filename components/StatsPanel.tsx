// components/StatsPanel.tsx
"use client";
import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";

interface BarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  fullTimeSeconds: number;
}

function StatBar({ label, current, max, color, fullTimeSeconds }: BarProps) {
  const pct = Math.min(100, (current / max) * 100);
  const { formatted, remaining } = useCountdown(fullTimeSeconds);
  const isFull = current >= max || remaining <= 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-gray-300 font-medium">{label}</span>
        <div className="flex flex-col items-end">
          <span className="font-mono text-sm">{current}/{max}</span>
          <span className="text-xs text-gray-400 font-mono mt-1">
            {isFull ? <span className="text-emerald-400">Full</span> : `Full in: ${formatted}`}
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function StatsPanel({ bars }: { bars: any }) {
  return (
    <div className="glass-panel p-5 border-t-2 border-blue-500/50 relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      <h2 className="text-xl font-bold mb-4 text-cyan-300 relative z-10">Stats</h2>
      <div className="relative z-10">
        <StatBar 
          label="Energy" 
          current={bars?.energy?.current || 0} 
          max={bars?.energy?.maximum || 100} 
          color="linear-gradient(90deg,#00f0ff,#0080ff)" 
          fullTimeSeconds={bars?.energy?.full_time || 0} 
        />
        <StatBar 
          label="Nerve" 
          current={bars?.nerve?.current || 0} 
          max={bars?.nerve?.maximum || 100} 
          color="linear-gradient(90deg,#ff2d75,#ff8c00)" 
          fullTimeSeconds={bars?.nerve?.full_time || 0} 
        />
      </div>
    </div>
  );
}