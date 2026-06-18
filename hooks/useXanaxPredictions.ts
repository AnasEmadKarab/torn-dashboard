"use client";
import { useQuery } from "@tanstack/react-query";
import { projectXanaxTimeline } from "@/lib/predictions";
import { useEffect, useRef } from "react";
import { useNotifications } from "./useNotifications";

export function useXanaxPredictions() {
  const { settings, sendNotification } = useNotifications();
  
  const prevRestockUK = useRef<number | null>(null);
  const prevRestockJP = useRef<number | null>(null);
  const prevRestockCAN = useRef<number | null>(null); // 👈 ضفنا ذاكرة لكندا

  const query = useQuery({
    queryKey: ["xanax-predictions"],
    queryFn: async () => {
      // 1. جلب بيانات الزاناكس من الـ API تبعنا (اللي عدلناه بالباك إند)
      const res = await fetch("/api/cron/update"); // تأكد إن هاد الرابط هو اللي بيرجع بيانات Redis
      if (!res.ok) throw new Error("Failed to fetch Xanax data");
      const json = await res.json();
      const raw = json.data; // الباك إند صار يرجع الداتا جوا object اسمه data

      // 2. جلب بيانات التجار (Weaver) عشان ناخذ أعلى سعر بيع
      let highestSellPrice = 835000; // سعر افتراضي احتياطي
      try {
        const weaverRes = await fetch("/api/weaver");
        if (weaverRes.ok) {
          const weaverJson = await weaverRes.json();
          const traders = weaverJson.data || [];
          if (traders.length > 0) {
            // سحب أعلى سعر بين التوب 3 تجار
            highestSellPrice = Math.max(...traders.map((t: any) => t.price));
          }
        }
      } catch (e) {
        console.error("Failed to fetch traders for profit calculation");
      }

      // 3. حساب الربح الحي (Live Profit) لكل دولة
      const calculateProfit = (cost: number) => cost > 0 ? (highestSellPrice - cost) : 0;
      if (raw.uk) raw.uk.profit = calculateProfit(raw.uk.cost);
      if (raw.japan) raw.japan.profit = calculateProfit(raw.japan.cost);
      if (raw.can) raw.can.profit = calculateProfit(raw.can.cost);

      // 4. توليد الجراف لكل دولة بناءً على المتغيرات الجديدة
      const ukPrediction = projectXanaxTimeline("uk", raw.uk.current_quantity, raw.uk.last_update, raw.uk.next_predicted_restock, raw.uk.stats.empirical_max_stock);
      const japanPrediction = projectXanaxTimeline("japan", raw.japan.current_quantity, raw.japan.last_update, raw.japan.next_predicted_restock, raw.japan.stats.empirical_max_stock);
      const canPrediction = projectXanaxTimeline("can", raw.can.current_quantity, raw.can.last_update, raw.can.next_predicted_restock, raw.can.stats.empirical_max_stock);

      return { 
        uk: ukPrediction, 
        japan: japanPrediction, 
        can: canPrediction, // 👈 كندا
        rawUk: raw.uk, 
        rawJapan: raw.japan,
        rawCan: raw.can,    // 👈 كندا
        highestSellPrice    // 👈 رح نمرره للواجهة عشان نطبعه
      };
    },
    refetchInterval: 60000, 
  });

  useEffect(() => {
    if (query.data) {
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