// hooks/useTornUser.ts
"use client";
import { useQuery } from "@tanstack/react-query";

export function useTornUser() {
  return useQuery({
    queryKey: ["torn-user"],
    queryFn: async () => {
      // 1. جلب المفتاح من التخزين المحلي
      let apiKey = localStorage.getItem("TORN_API_KEY");

      // 2. إذا لم يوجد، اطلب من المستخدم إدخاله (يمكنك تطوير هذه الجزئية لاحقاً بواجهة UI)
      if (!apiKey) {
        apiKey = prompt("Please enter your TORN_API_KEY:");
        if (!apiKey) throw new Error("API Key is required to use the dashboard.");
        localStorage.setItem("TORN_API_KEY", apiKey);
      }

      // 3. إرسال المفتاح ضمن الـ headers أو query params (يجب تعديل الـ API Route لاستقباله)
      const res = await fetch(`/api/torn/user?key=${apiKey}`);
      
      if (!res.ok) {
        const err = await res.json();
        // إذا كان الخطأ بسبب مفتاح غير صحيح، احذف المفتاح الخاطئ من التخزين
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("TORN_API_KEY");
        }
        throw new Error(err.error || "Failed to fetch user data");
      }
      return res.json();
    },
    refetchInterval: 15000,
    retry: false, // لا نريد إعادة المحاولة تلقائياً إذا كان الـ API Key خاطئاً
  });
}