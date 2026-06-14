// hooks/useCountdown.ts
"use client";
import { useState, useEffect } from "react";

export function useCountdown(fullTimeSeconds: number) {
  // بنحسب وقت الانتهاء بالضبط بناءً على اللحظة اللي انفتح فيها التطبيق
  const [endTime] = useState(() => Date.now() + fullTimeSeconds * 1000);
  const [remaining, setRemaining] = useState(fullTimeSeconds);

  useEffect(() => {
    // تحديث الحالة بناءً على الوقت الحقيقي
    const update = () => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setRemaining(diff);
    };

    update(); // تحديث فوري
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const hours = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  return { 
    remaining, 
    formatted: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}` 
  };
}