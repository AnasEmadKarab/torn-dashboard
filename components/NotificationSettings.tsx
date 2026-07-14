"use client";
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, toggleSetting, isLoaded } = useNotifications();
  const [apiKey, setApiKey] = useState("");
  
  // 👈 حالات جديدة لإدارة الفحص والأخطاء
  const [isVerifying, setIsVerifying] = useState(false);
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    setApiKey(localStorage.getItem("TORN_API_KEY") || "");
    setKeyError(""); // تصفير الخطأ لما يفتح الإعدادات
  }, [isOpen]);

  const saveApiKey = async () => {
    setKeyError("");
    const keyToSave = apiKey.trim();

    // إذا مسح المفتاح وبده يكمل كزائر
    if (!keyToSave) {
      localStorage.removeItem("TORN_API_KEY");
      window.location.reload();
      return;
    }

    setIsVerifying(true);

    try {
      // 👈 السحر هنا: نعمل فحص سريع للمفتاح قبل ما نحفظه
      const res = await fetch(`/api/torn/user?key=${keyToSave}`);
      const data = await res.json();

      // إذا الـ API رد بخطأ (صلاحية ضعيفة أو مفتاح غلط)
      if (!res.ok || data.error) {
        setKeyError("❌ Invalid API Key! Please use a Limited API Key.");
        setIsVerifying(false);
        return; // نوقف الشغل وما نحفظه باللوكل ستورج
      }

      // إذا المفتاح سليم 100%
      localStorage.setItem("TORN_API_KEY", keyToSave);
      window.location.reload(); 
    } catch (err) {
      setKeyError("❌ Connection failed. Please try again.");
      setIsVerifying(false);
    }
  };

  if (!isLoaded) return null;

  const ToggleSwitch = ({ label, desc, active, onClick, color }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button onClick={onClick} className={`w-10 h-5 rounded-full transition-colors relative ${active ? color : "bg-gray-700"}`}>
        <span className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? "right-1" : "left-1"}`} />
      </button>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 md:p-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all text-base md:text-xl"
        title="Settings"
      >
        <span>⚙️</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-white">⚙️ Dashboard Settings</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-xl">✖</button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
              {/* API Key Section */}
              <div>
                <h3 className="text-cyan-400 font-bold mb-3 text-sm uppercase tracking-wider">🔑 API Connection</h3>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Torn API Key..."
                    className="flex-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    disabled={isVerifying}
                  />
                  <button 
                    onClick={saveApiKey} 
                    disabled={isVerifying}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    {isVerifying ? "Checking..." : "Save Key"}
                  </button>
                </div>
                
                {/* 👈 رسالة الخطأ تظهر هنا إن وجدت */}
                {keyError && (
                  <div className="mt-2 text-xs font-bold text-pink-400 bg-pink-500/10 p-2 rounded border border-pink-500/20">
                    {keyError}
                  </div>
                )}

                <div className="mt-3 bg-cyan-900/20 border border-cyan-800/50 rounded-lg p-3">
                  <p className="text-[10px] md:text-xs text-gray-400 leading-relaxed">
                    ⚠️ A <strong className="text-cyan-400">Limited API Key</strong> is required for Vitals, Properties, and Vault data. 
                    Your API key is <span className="text-pink-400 font-bold">NEVER</span> sent to our servers; it is stored securely in your browser's local storage.
                  </p>
                </div>
              </div>

               {/* Notifications */}
               <div>
                <h3 className="text-pink-400 font-bold mb-2 text-sm uppercase tracking-wider">🔔 Notifications</h3>
                <p className="text-[10px] text-gray-500 mb-2">Changes are saved automatically.</p>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <ToggleSwitch label="Arrival Alert" desc="Notify when landing" active={settings.arrival} onClick={() => toggleSetting("arrival")} color="bg-cyan-500" />
                  <ToggleSwitch label="Stock Drop" desc="Notify on Xanax restock" active={settings.stockDrop} onClick={() => toggleSetting("stockDrop")} color="bg-pink-500" />
                  <ToggleSwitch label="Flight Alarm" desc="Notify when it's time to fly" active={settings.flightAlarm} onClick={() => toggleSetting("flightAlarm")} color="bg-emerald-500" />
                </div>
              </div>

              {/* Visibility Settings */}
              <div>
                <h3 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wider">👁️ Layout Visibility</h3>
                <p className="text-[10px] text-gray-500 mb-2">Changes are saved automatically.</p>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <ToggleSwitch label="Show Canada" desc="Include Canada in predictions" active={settings.showCanada} onClick={() => toggleSetting("showCanada")} color="bg-emerald-500" />
                  <ToggleSwitch label="Stats Panel" desc="Show Energy & Nerve" active={settings.showStats} onClick={() => toggleSetting("showStats")} color="bg-emerald-500" />
                  <ToggleSwitch label="Property Card" desc="Show Island details" active={settings.showProperty} onClick={() => toggleSetting("showProperty")} color="bg-emerald-500" />
                  <ToggleSwitch label="Finances Vault" desc="Show Cash & Vault" active={settings.showVault} onClick={() => toggleSetting("showVault")} color="bg-emerald-500" />
                  <ToggleSwitch label="Cooldowns" desc="Show Drug & Booster timers" active={settings.showCooldowns} onClick={() => toggleSetting("showCooldowns")} color="bg-emerald-500" />
                  <ToggleSwitch label="Travel Radar" desc="Show active travel status" active={settings.showRadar} onClick={() => toggleSetting("showRadar")} color="bg-emerald-500" />
                  <ToggleSwitch label="Organized Crimes" desc="Show faction OCs" active={settings.showOC} onClick={() => toggleSetting("showOC")} color="bg-emerald-500" />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}