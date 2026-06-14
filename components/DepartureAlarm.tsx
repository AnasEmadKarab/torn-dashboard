// components/DepartureAlarm.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { FlightOption } from "@/lib/flight-rankings";
import { motion, AnimatePresence } from "framer-motion";

export default function DepartureAlarm({ flight }: { flight: FlightOption | null }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const alarmFired = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!flight) return;
    alarmFired.current = false;

    const id = setInterval(() => {
      const r = flight.leaveTime - Date.now() / 1000;
      setRemaining(r);
      if (r <= 180 && r > 0 && !alarmFired.current) {
        alarmFired.current = true;
        audioRef.current?.play().catch(() => {});
      }
    }, 1000);
    return () => clearInterval(id);
  }, [flight]);

if (!flight || remaining === null || remaining <= 0) {
    return flight ? (
      <div className="glass-panel p-5 text-center text-gray-400 flex items-center justify-center h-full">
        Scheduled flight departed / window passed.
      </div>
    ) : (
      <div className="glass-panel p-5 text-center text-gray-400 flex items-center justify-center h-full">
        👈 Click on a flight from the left list to set your alarm.
      </div>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const critical = remaining <= 180;

  return (
    <>
      <div className={`glass-panel p-5 ${critical ? "glow-pink flash-alert" : "glow-cyan"}`}>
        <h2 className="text-lg font-semibold mb-2 text-cyan-300">Scheduled Departure</h2>
        <p className="text-gray-300">
          Destination: <span className="font-semibold text-white">{flight.country.toUpperCase()}</span>
        </p>
        <p className="text-3xl font-bold font-mono mt-2">
          {mins}m {secs.toString().padStart(2, "0")}s
        </p>
      </div>

      <audio ref={audioRef} src="/sounds/departure-alarm.mp3" preload="auto" />

      <AnimatePresence>
        {critical && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            
              <a href="https://www.torn.com/travelagency.php"
              target="_blank"
              rel="noopener noreferrer"
              className="px-16 py-10 rounded-3xl text-4xl font-extrabold bg-pink-500 text-white shadow-2xl glow-pink hover:bg-pink-400 transition-colors text-center"
            >
              🚀 BOOK FLIGHT NOW
              <div className="text-lg mt-2 font-mono">{mins}m {secs}s left to depart</div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}