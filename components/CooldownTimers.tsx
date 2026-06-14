// components/CooldownTimers.tsx
"use client";
import { useCountdown } from "@/hooks/useCountdown";

interface CooldownData {
  drug: number;
  medical: number;
  booster: number;
}

function CooldownCard({ label, seconds, icon }: { label: string; seconds: number; icon: string }) {
  const { formatted, remaining } = useCountdown(seconds);
  const active = remaining > 0;

  return (
    <div className={`glass-panel p-4 flex items-center justify-between ${active ? "glow-cyan" : "opacity-50"}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium text-gray-200">{label}</span>
      </div>
      <span className="font-mono text-lg text-cyan-300">{active ? formatted : "Ready"}</span>
    </div>
  );
}

export default function CooldownTimers({ cooldowns }: { cooldowns: CooldownData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <CooldownCard label="Drug" seconds={cooldowns.drug} icon="💊" />
      <CooldownCard label="Medical" seconds={cooldowns.medical} icon="🩹" />
      <CooldownCard label="Booster" seconds={cooldowns.booster} icon="🚀" />
    </div>
  );
}