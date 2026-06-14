// hooks/useXanaxPredictions.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { projectXanaxTimeline } from "@/lib/predictions";

interface RawReading {
  quantity: number;
  timestamp: number;
}

export function useXanaxPredictions() {
  return useQuery({
    queryKey: ["xanax-predictions"],
    queryFn: async () => {
      const res = await fetch("/api/yata/xanax");
      if (!res.ok) throw new Error("Failed to fetch YATA Xanax data");
      const raw = await res.json();

      // جلب الداتا القديمة من sessionStorage
      const storedUk = sessionStorage.getItem("prevUk");
      const storedJapan = sessionStorage.getItem("prevJapan");
      const prevUk = storedUk ? JSON.parse(storedUk) : null;
      const prevJapan = storedJapan ? JSON.parse(storedJapan) : null;

      const ukPrediction = projectXanaxTimeline(
        "uk",
        raw.uk.quantity,
        raw.uk.timestamp,
        prevUk?.quantity ?? null,
        prevUk?.timestamp ?? null
      );
      
      const japanPrediction = projectXanaxTimeline(
        "japan",
        raw.japan.quantity,
        raw.japan.timestamp,
        prevJapan?.quantity ?? null,
        prevJapan?.timestamp ?? null
      );

      // تحديث sessionStorage إذا وصلت قراءة أحدث
      if (!prevUk || raw.uk.timestamp > prevUk.timestamp) {
        sessionStorage.setItem("prevUk", JSON.stringify({ quantity: raw.uk.quantity, timestamp: raw.uk.timestamp }));
      }
      if (!prevJapan || raw.japan.timestamp > prevJapan.timestamp) {
        sessionStorage.setItem("prevJapan", JSON.stringify({ quantity: raw.japan.quantity, timestamp: raw.japan.timestamp }));
      }

      return { uk: ukPrediction, japan: japanPrediction, rawUk: raw.uk, rawJapan: raw.japan };
    },
    refetchInterval: 60000,
  });
}