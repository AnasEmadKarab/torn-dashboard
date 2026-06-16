// hooks/useXanaxPredictions.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { projectXanaxTimeline } from "@/lib/predictions";

export function useXanaxPredictions() {
  return useQuery({
    queryKey: ["xanax-predictions"],
    queryFn: async () => {
      const res = await fetch("/api/yata/xanax");
      if (!res.ok) throw new Error("Failed to fetch YATA Xanax data");
      const raw = await res.json();

      // تم الاستغناء عن sessionStorage لأن الباك إند أصبح يقوم بكل الحسابات الذكية!
      // نقوم بتمرير الداتا الجاهزة مباشرة للرسم البياني

      const ukPrediction = projectXanaxTimeline(
        "uk",
        raw.uk.quantity,
        raw.uk.timestamp,
        raw.uk.next_expected,
        raw.uk.max_stock
      );
      
      const japanPrediction = projectXanaxTimeline(
        "japan",
        raw.japan.quantity,
        raw.japan.timestamp,
        raw.japan.next_expected,
        raw.japan.max_stock
      );

      return { 
        uk: ukPrediction, 
        japan: japanPrediction, 
        rawUk: raw.uk, 
        rawJapan: raw.japan 
      };
    },
    refetchInterval: 60000, // تحديث كل دقيقة
  });
}