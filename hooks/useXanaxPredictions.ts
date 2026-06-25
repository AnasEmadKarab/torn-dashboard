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

      let highestSellPrice = 0; // خليها 0 بالبداية
      try {
        const weaverRes = await fetch("/api/weaver");
        if (weaverRes.ok) {
          const weaverJson = await weaverRes.json();
          let deals = (weaverJson.deals || []).filter((d: any) => d.price < 833000); 
          
          // فلترة البلاك ليست (جلبها من اللوكل ستورج)
          const blacklist = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("torn_trader_blacklist") || "[]") : [];
          deals = deals.filter((d: any) => !blacklist.includes(d.playerId));

          // 1. الترتيب حسب السعر الأعلى وأخذ أفضل 10
          deals.sort((a: any, b: any) => b.price - a.price);
          const top10 = deals.slice(0, 10);

          // 2. الترتيب حسب التقييم وأخذ أفضل 3
          top10.sort((a: any, b: any) => {
            const scoreA = (a.rating.upvotes - a.rating.downvotes);
            const scoreB = (b.rating.upvotes - b.rating.downvotes);
            return scoreB - scoreA;
          });
          const top3 = top10.slice(0, 3);

          // 3. أخذ أعلى سعر بين هدول الـ 3 (هاد هو الرقم اللي بدك ياه)
          if (top3.length > 0) {
            highestSellPrice = Math.max(...top3.map((t: any) => t.price));
          }
        }
      } catch (e) {
        console.error("Failed to sync trader price");
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
        sendNotification("Habibi! Stock Alert 🇬🇧", { body: "Yala habibi yala! Xanax is dropped in UK! Hurry up!" });
      }
      if (prevRestockJP.current && currentJpRestock > prevRestockJP.current && settings.stockDrop) {
        sendNotification("Habibi! Stock Alert 🇯🇵", { body: "Yala habibi yala! Xanax is dropped in Japan! Go grab it!" });
      }
      if (prevRestockCAN.current && currentCanRestock > prevRestockCAN.current && settings.stockDrop) {
        sendNotification("Habibi! Stock Alert 🇨🇦", { body: "Yala habibi yala! Xanax is dropped in Canada! Don't miss out!" });
      }

      // تحديث القيم السابقة
      prevRestockUK.current = currentUkRestock;
      prevRestockJP.current = currentJpRestock;
      prevRestockCAN.current = currentCanRestock;
    }
  }, [query.data, settings.stockDrop, sendNotification]);

  return query;
}