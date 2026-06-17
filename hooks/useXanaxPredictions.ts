"use client";
import { useQuery } from "@tanstack/react-query";
import { projectXanaxTimeline } from "@/lib/predictions";
import { useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";

export function useXanaxPredictions() {
  const { settings, sendNotification } = useNotifications();
  
  // نستخدم useRef عشان نحتفظ بوقت الستوك القديم ونقارنه بالجديد
  const prevRestockUK = useRef<number | null>(null);
  const prevRestockJP = useRef<number | null>(null);

  const query = useQuery({
    queryKey: ["xanax-predictions"],
    queryFn: async () => {
      const res = await fetch("/api/yata/xanax");
      if (!res.ok) throw new Error("Failed to fetch YATA Xanax data");
      const raw = await res.json();

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

  // 👈 مراقب الستوك الذكي: بيشتغل كل ما تجي داتا جديدة من السيرفر
  useEffect(() => {
    if (query.data) {
      const currentUkRestock = query.data.rawUk.last_restock;
      const currentJpRestock = query.data.rawJapan.last_restock;

      // إذا كان في ستوك قديم محفوظ، والستوك الجديد وقته أحدث، والإشعار مفعل
      if (prevRestockUK.current && currentUkRestock > prevRestockUK.current && settings.stockDrop) {
        sendNotification("🇬🇧 UK Xanax Restocked!", { body: "Xanax is now available in the UK! Check the chart." });
      }
      if (prevRestockJP.current && currentJpRestock > prevRestockJP.current && settings.stockDrop) {
        sendNotification("🇯🇵 Japan Xanax Restocked!", { body: "Xanax is now available in Japan! Check the chart." });
      }

      // تحديث الذاكرة للوقت الجديد
      prevRestockUK.current = currentUkRestock;
      prevRestockJP.current = currentJpRestock;
    }
  }, [query.data, settings.stockDrop, sendNotification]);

  return query;
}