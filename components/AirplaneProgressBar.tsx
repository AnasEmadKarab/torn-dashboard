// components/AirplaneProgressBar.tsx
"use client";
import { motion } from "framer-motion";

export default function AirplaneProgressBar({ progressPct }: { progressPct: number }) {
  return (
    <div className="relative h-6 my-4">
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-white/10" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
        style={{ width: `${progressPct}%`, boxShadow: "0 0 12px rgba(0,240,255,0.6)" }}
      />
      <motion.div
        className="absolute top-1/2 text-2xl"
        style={{ left: `calc(${progressPct}% - 14px)`, transform: "translateY(-50%)" }}
        animate={{ y: ["-50%", "-65%", "-50%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        ✈️
      </motion.div>
    </div>
  );
}