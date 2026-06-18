"use client";
import { FlightOption } from "@/lib/flight-rankings";

interface Props {
  flights: FlightOption[];
  onSelect: (flight: FlightOption) => void;
}

// 👈 شلنا الثواني عشان يطابق الجراف 100%
function formatTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function FlightScheduler({ flights, onSelect }: Props) {
  if (!flights || flights.length === 0) return null;

  return (
    <div className="glass-panel p-5">
      <h2 className="text-lg font-semibold mb-3 text-cyan-300">Top 5 Upcoming Optimal Flights</h2>
      <ul className="space-y-2">
        {flights.map((f, index) => (
            <li
              key={`${f.destination}-${index}`} 
              onClick={() => onSelect(f)}
              className="bg-white/5 hover:bg-cyan-500/20 rounded-lg p-3 flex justify-between items-center cursor-pointer transition-colors"
            >
              <span className="font-medium">
                {/* 👈 دعم كندا والأسماء الصحيحة */}
                {f.destination === "uk" ? "🇬🇧 GB UK" : f.destination === "japan" ? "🇯🇵 JP Japan" : "🇨🇦 CA Canada"}
              </span>
              <span className="text-sm text-gray-300">
                Leave: <span className="font-mono text-cyan-300">{formatTime(f.departureTime)}</span>
                {" → "}
                Restock: <span className="font-mono text-pink-300">{formatTime(f.restockTime)}</span>
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}