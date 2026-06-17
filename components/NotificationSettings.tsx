"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleSetting, isLoaded } = useNotifications();

  if (!isLoaded) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-full shadow-lg shadow-cyan-500/30 transition-transform hover:scale-110 z-40"
        title="Notification Settings"
      >
        🔔
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⚙️ Notifications
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Arrival Alert</p>
                  <p className="text-xs text-gray-400">Notify when landing at destination</p>
                </div>
                <button 
                  onClick={() => toggleSetting("arrival")}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.arrival ? "bg-cyan-500" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.arrival ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Stock Drop</p>
                  <p className="text-xs text-gray-400">Notify when Xanax restocks</p>
                </div>
                <button 
                  onClick={() => toggleSetting("stockDrop")}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.stockDrop ? "bg-pink-500" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.stockDrop ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Flight Alarm</p>
                  <p className="text-xs text-gray-400">Notify when it's time to fly</p>
                </div>
                <button 
                  onClick={() => toggleSetting("flightAlarm")}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.flightAlarm ? "bg-emerald-500" : "bg-gray-700"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.flightAlarm ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}