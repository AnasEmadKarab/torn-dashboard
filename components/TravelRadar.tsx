"use client";
import { useState, useEffect, useRef } from "react";
import AirplaneProgressBar from "./AirplaneProgressBar";
import { useNotifications } from "@/hooks/useNotifications";

interface TravelData {
  destination: string;
  method: string;
  departed_at: number;
  arrival_at: number;
  time_left: number;
}

export default function TravelRadar({ travel }: { travel: TravelData }) {
  const { settings, sendNotification } = useNotifications();
  const [now, setNow] = useState(Date.now() / 1000);
  const alarmFired = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(id);
  }, []);

  const total = travel.arrival_at - travel.departed_at;
  const elapsed = now - travel.departed_at;
  const remaining = Math.max(0, travel.arrival_at - now);
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));

  const isTraveling = remaining > 0;
  const isAbroad = !isTraveling && travel.destination !== "Torn";
  const isInTorn = !isTraveling && travel.destination === "Torn";

// تفعيل إشعار الوصول عند انتهاء الوقت
  useEffect(() => {
    if (remaining <= 0 && travel.departed_at > 0 && !alarmFired.current) {
      alarmFired.current = true;
      audioRef.current?.play().catch(() => {});
      
      // 👈 هنا بنشيك إذا مفعل خيار arrival
      if (settings.arrival && travel.destination !== "Torn") {
        sendNotification(`🛬 Arrived in ${travel.destination}!`, {
          body: "Click here to buy your items.",
        });
      }
    }
  }, [remaining, travel.destination, travel.departed_at, settings.arrival]);

  // الحالة 1: أنت في تورن (جاهز للسفر)
  if (isInTorn) {
    return (
      <div className="glass-panel p-5 text-gray-400">
        No active travel. Currently in <span className="text-emerald-400 font-bold">Torn City</span>.
      </div>
    );
  }

  // الحالة 2: أنت في الخارج (زر المتجر)
  if (isAbroad) {
    return (
      <div className="glass-panel p-5 glow-pink border-t-2 border-pink-500/50">
        <h2 className="text-xl font-bold text-pink-300 mb-2">🛬 Arrived in {travel.destination}</h2>
        <p className="text-gray-300 mb-4">
          Time to buy your items! Fill your capacity and return to Torn.
        </p>
        <a 
          href="https://www.torn.com/index.php?page=travelagency" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg text-center transition-colors shadow-lg shadow-pink-500/20"
        >
          🛍️ Open {travel.destination} Travel Agency
        </a>
        <audio ref={audioRef} src="/sounds/arrival-alarm.mp3" preload="none" />
      </div>
    );
  }

  // الحالة 3: أنت بالطريق (الطيارة)
  const arrivalLocal = new Date(travel.arrival_at * 1000).toLocaleTimeString();
  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = Math.floor(remaining % 60);
  const warning = remaining <= 300;

  return (
    <div className={`glass-panel p-5 ${warning ? "glow-pink flash-alert" : "glow-cyan"}`}>
      <h2 className="text-lg font-semibold mb-2 text-cyan-300">Travel Radar</h2>
      <p className="text-gray-300">
        Destination: <span className="font-semibold text-white">{travel.destination}</span>
        {" "}via <span className="text-gray-400">{travel.method}</span>
      </p>
      <p className="text-gray-300">Local ETA: <span className="font-mono">{arrivalLocal}</span></p>
      <p className="text-2xl font-bold mt-1 font-mono">
        {hours > 0 && `${hours}h `}{mins}m {secs}s remaining
      </p>

      <AirplaneProgressBar progressPct={pct} />

      {warning && <p className="text-pink-400 font-semibold mt-2">🛬 Arriving soon — get ready!</p>}

      <audio ref={audioRef} src="/sounds/arrival-alarm.mp3" preload="none" />
    </div>
  );
}