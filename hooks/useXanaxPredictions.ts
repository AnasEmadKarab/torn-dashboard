"use client";
import { useQuery } from "@tanstack/react-query";
import { projectXanaxTimeline } from "@/lib/predictions";
import { useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";

export function useXanaxPredictions() {
  const { settings, sendNotification } = useNotifications();
  
  const prevRestockUK = useRef<number | null>(null);
  const prevRestockJP = useRef<number | null>(null);
  const prevRestockCAN = useRef<number | null>(null);

  const query = useQuery({
    queryKey: ["xanax-predictions"],
    queryFn: async () => {
      // 1. جلب بيانات الزاناكس (هاد الوحيد اللي بيحتاج يتحدث كل دقيقة)
      const cronRes = await fetch("/api/cron/update").catch(() => null);
      if (!cronRes || !cronRes.ok) throw new Error("Failed to fetch Xanax data");
      
      const json = await cronRes.json();
      const raw = json.data;

      // 2. السحر هنا: جلب سعر التريدرز من الكاش (يُحدث مرة كل ساعة فقط)
      let highestSellPrice = 835000;
      const now = Date.now();
      const cachedWeaver = typeof window !== "undefined" ? localStorage.getItem("weaver_cached_price") : null;

      if (cachedWeaver) {
        const parsed = JSON.parse(cachedWeaver);
        // إذا كان الكاش عمره أقل من ساعة (3,600,000 ملي ثانية)، استخدمه!
        if (now - parsed.timestamp < 3600000) {
          highestSellPrice = parsed.price;
        }
      }

      // إذا ما في كاش، أو مرّت ساعة، وقتها بس بنروح نسأل الـ API
      if (highestSellPrice === 835000) {
        try {
          const weaverRes = await fetch("/api/weaver");
          if (weaverRes.ok) {
            const weaverJson = await weaverRes.json();
            const traders = weaverJson.data || [];
            if (traders.length > 0) {
              highestSellPrice = Math.max(...traders.map((t: any) => t.price));
              // حفظ السعر الجديد مع وقت الحفظ
              if (typeof window !== "undefined") {
                localStorage.setItem("weaver_cached_price", JSON.stringify({ price: highestSellPrice, timestamp: now }));
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse weaver data");
        }
      }

      // 3. حساب الربح الحي
      const calculateProfit = (cost: number) => cost > 0 ? (highestSellPrice - cost) : 0;
      if (raw.uk) raw.uk.profit = calculateProfit(raw.uk.cost);
      if (raw.japan) raw.japan.profit = calculateProfit(raw.japan.cost);
      if (raw.can) raw.can.profit = calculateProfit(raw.can.cost);

      // 4. توليد الجراف لكل دولة 
      const ukPrediction = projectXanaxTimeline(raw.uk, "uk");
      const japanPrediction = projectXanaxTimeline(raw.japan, "japan");
      const canPrediction = projectXanaxTimeline(raw.can, "can");

      const finalData = { 
        uk: ukPrediction, 
        japan: japanPrediction, 
        can: canPrediction, 
        rawUk: raw.uk, 
        rawJapan: raw.japan,
        rawCan: raw.can, 
        highestSellPrice 
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("xanax_fast_cache", JSON.stringify(finalData));
      }

      return finalData;
    },
    initialData: () => {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("xanax_fast_cache");
        if (cached) return JSON.parse(cached);
      }
      return undefined;
    },
    refetchInterval: 60000, 
  });

  useEffect(() => {
    if (query.data && query.data.rawUk) {
      const currentUkRestock = query.data.rawUk?.last_restock_time;
      const currentJpRestock = query.data.rawJapan?.last_restock_time;
      const currentCanRestock = query.data.rawCan?.last_restock_time;

      if (prevRestockUK.current && currentUkRestock > prevRestockUK.current && settings.stockDrop) {
        sendNotification("🇬🇧 UK Xanax Restocked!", { body: "Xanax is now available in the UK! Check the chart." });
      }
      if (prevRestockJP.current && currentJpRestock > prevRestockJP.current && settings.stockDrop) {
        sendNotification("🇯🇵 Japan Xanax Restocked!", { body: "Xanax is now available in Japan! Check the chart." });
      }
      if (prevRestockCAN.current && currentCanRestock > prevRestockCAN.current && settings.stockDrop) {
        sendNotification("🇨🇦 Canada Xanax Restocked!", { body: "Xanax is now available in Canada! Check the chart." });
      }

      prevRestockUK.current = currentUkRestock;
      prevRestockJP.current = currentJpRestock;
      prevRestockCAN.current = currentCanRestock;
    }
  }, [query.data, settings.stockDrop, sendNotification]);

  return query;
}