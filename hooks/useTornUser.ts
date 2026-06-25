// hooks/useTornUser.ts
"use client";
import { useQuery } from "@tanstack/react-query";

export function useTornUser() {
  return useQuery({
    queryKey: ["torn-user"],
    queryFn: async () => {
      const apiKey = localStorage.getItem("TORN_API_KEY");
      
      // 👈 تفعيل وضع الزائر: نرجع null بدون ما نطلب إدخال
      if (!apiKey) {
        return null; 
      }

      const res = await fetch(`/api/torn/user?key=${apiKey}`);
      
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("TORN_API_KEY");
        }
        throw new Error(err.error || "Failed to fetch user data");
      }
      return res.json();
    },
    refetchInterval: 15000,
    retry: false, 
  });
}