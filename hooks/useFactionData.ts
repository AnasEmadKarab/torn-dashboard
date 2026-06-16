// hooks/useFactionData.ts
"use client";
import { useQuery } from "@tanstack/react-query";

interface FactionDataResult {
  crimes: any[];
  vault: { money_balance: number };
}

export function useFactionData() {
  return useQuery<FactionDataResult>({
    queryKey: ["faction-data"],
    queryFn: async () => {
      // 1. جلب المفتاح المخزن في المتصفح
      const apiKey = localStorage.getItem("TORN_API_KEY");
      if (!apiKey) throw new Error("API Key missing");

      // 2. تمرير المفتاح في الرابط
      const res = await fetch(`/api/torn/faction?key=${apiKey}`);
      
      if (!res.ok) {
        // قراءة تفاصيل الخطأ القادم من الباك إند
        const errorData = await res.json().catch(() => ({}));
        
        // 👈 الفلتر الدفاعي: إذا الخطأ بسبب عدم وجود فاكشن، نرجع داتا صفرية بأمان
        if (errorData.error?.includes("Incorrect ID-entity relation") || res.status === 500) {
          return { crimes: [], vault: { money_balance: 0 } };
        }
        
        throw new Error(errorData.error || "Failed to fetch faction data");
      }
      
      return res.json();
    },
    refetchInterval: 30000,
  });
}