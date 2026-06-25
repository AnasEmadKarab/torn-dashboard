"use client";
import { useState, useEffect, useRef } from "react";
import AirplaneProgressBar from "./AirplaneProgressBar";
import { useNotifications } from "@/hooks/useNotifications";

interface TravelData {
  destination?: string;
  method?: string;
  departed_at?: number;
  arrival_at?: number;
  time_left?: number;
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

  // 1. المتغيرات الآمنة (محمية من الـ undefined)
  const arrival_at = travel?.arrival_at || 0;
  const departed_at = travel?.departed_at || 0;
  const currentDestination = travel?.destination || "Torn";
  const currentMethod = travel?.method || "Unknown";

  const total = arrival_at - departed_at;
  const elapsed = now - departed_at;
  const remaining = Math.max(0, arrival_at - now);
   
  const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 0;

  const isTraveling = remaining > 0;
  const isAbroad = !isTraveling && currentDestination !== "Torn";
  const isInTorn = !isTraveling && currentDestination === "Torn";

  // 2. إعادة تهيئة المنبه: إذا بدأ رحلة جديدة (الوقت المتبقي > 0)، نرجع المنبه false عشان يرن لما يوصل
  useEffect(() => {
    if (isTraveling) {
      alarmFired.current = false;
    }
  }, [isTraveling]);

  // 3. تفعيل إشعار الوصول عند انتهاء الوقت (باستخدام المتغيرات الآمنة)

    useEffect(() => {
    if (remaining <= 0 && departed_at > 0 && !alarmFired.current) {
      alarmFired.current = true;
      audioRef.current?.play().catch(() => {});
      
      if (settings.arrival) {
        if (currentDestination !== "Torn") {
          // إشعار الوصول للوجهة
          sendNotification(`Habibi! Arrived in ${currentDestination} ✈️`, {
            body: "Yala habibi yala! You have arrived! Time to grab those items!",
          });
        } else {
          // إشعار الوصول لـ تورن (العودة)
          sendNotification(`Habibi! Back in Torn 🏠`, {
            body: "Welcome back habibi! Hope the trip was profitable!",
          });
        }
      }
    }
  }, [remaining, currentDestination, departed_at, settings.arrival, sendNotification]);

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
        <h2 className="text-xl font-bold text-pink-300 mb-2">🛬 Arrived in {currentDestination}</h2>
        <p className="text-gray-300 mb-4">
          Time to buy your items! Fill your capacity and return to Torn.
        </p>
        <a 
          href="https://www.torn.com/index.php?page=travelagency" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg text-center transition-colors shadow-lg shadow-pink-500/20"
        >
          🛍️ Open {currentDestination} Travel Agency
        </a>
        <audio ref={audioRef} src="/sounds/arrival-alarm.mp3" preload="none" />
      </div>
    );
  }

  // الحالة 3: أنت بالطريق (الطيارة)
  // استخدمنا المتغيرات الآمنة هنا لتجنب أي كراش
  const arrivalLocal = arrival_at > 0 ? new Date(arrival_at * 1000).toLocaleTimeString() : "--:--:--";
  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = Math.floor(remaining % 60);
  const warning = remaining <= 300 && remaining > 0;

  return (
    <div className={`glass-panel p-5 ${warning ? "glow-pink flash-alert" : "glow-cyan"}`}>
      <h2 className="text-lg font-semibold mb-2 text-cyan-300">Travel Radar</h2>
      <p className="text-gray-300">
        Destination: <span className="font-semibold text-white">{currentDestination}</span>
        {" "}via <span className="text-gray-400">{currentMethod}</span>
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