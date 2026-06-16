"use client";
import { useState, useEffect } from "react";

// دالة صغيرة لتحويل الثواني لوقت مقروء (ساعات:دقائق:ثواني)
function formatDuration(totalSeconds: number) {
  if (totalSeconds <= 0) return "Ready";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function OCFilterList({ crimes }: { crimes: any[] }) {
  // جلب الـ OC الحالي (إذا كان موجود)
  const activeCrime = crimes && crimes.length > 0 ? crimes[0] : null;

  // حالة لتخزين الوقت المتبقي وتحديثه
  const [timeLeft, setTimeLeft] = useState(activeCrime?.time_left ?? 0);

  // تأثير (Effect) لعمل عداد تنازلي حي للوقت المتبقي
  useEffect(() => {
    if (!activeCrime || activeCrime.time_left <= 0) return;
    
    setTimeLeft(activeCrime.time_left);
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [activeCrime]);

  // حالة 1: المستخدم غير مسجل في أي OC
  if (!activeCrime) {
    return (
      <div className="glass-panel p-5">
        <h2 className="text-lg font-semibold text-cyan-300 mb-2">Organized Crimes</h2>
        <p className="text-gray-400 text-sm">
          You are not currently enrolled in any Organized Crime. Check with your faction.
        </p>
      </div>
    );
  }

  // حالة 2: المستخدم مسجل في OC (جلب البيانات بذكاء لتفادي أي تغيير في مسميات الـ API)
  const crimeName = activeCrime.crime?.name || activeCrime.name || "Unknown OC";
  const rawStatus = activeCrime.status || activeCrime.state || "Unknown Stage";
  
  // 👈 الفلتر الذكي: إذا الـ API بعت Recruiting، بنعرضها Planning
  let displayStatus = rawStatus.replace("_", " ");
  if (displayStatus.toLowerCase() === "recruiting") {
    displayStatus = "Planning";
  }

  return (
    <div className="glass-panel p-5 border border-cyan-500/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

      <h2 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        Active Organized Crime
      </h2>

      <div className="bg-gray-900/60 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <div className="text-center md:text-left">
          <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Crime Name</span>
          <span className="text-white font-bold text-base md:text-lg">{crimeName}</span>
        </div>

        <div className="w-full md:w-px h-px md:h-10 bg-gray-700/50"></div>

        <div className="text-center">
          <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Current Stage</span>
          <span className="text-cyan-400 font-medium capitalize px-3 py-1 bg-cyan-900/30 rounded-full border border-cyan-800/50">
            {/* عرض الحالة بعد الفلترة */}
            {displayStatus}
          </span>
        </div>

        <div className="w-full md:w-px h-px md:h-10 bg-gray-700/50"></div>

        <div className="text-center md:text-right">
          <span className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Time Remaining</span>
          <span className="text-pink-400 font-mono font-bold text-lg md:text-xl">
            {formatDuration(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
}