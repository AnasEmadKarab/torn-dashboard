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
      
      if (!res.ok) throw new Error("Failed to fetch faction data");
      return res.json();
    },
    refetchInterval: 30000,
  });
}