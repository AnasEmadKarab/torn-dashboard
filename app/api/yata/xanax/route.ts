import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng",
    });

    // 1. نقرأ المفتاح الجديد اللي بيحتوي على المتوسطات
    const rawData: any = await redis.get("xanax_advanced_v1");
    const now = Math.floor(Date.now() / 1000);
    
    // حالة الطوارئ إذا الداتا لسا ما تجمعت
    if (!rawData) {
      return Response.json({ 
        uk: { quantity: 0, cost: 0, timestamp: now, next_expected: now + 7200, last_restock: now }, 
        japan: { quantity: 0, cost: 0, timestamp: now, next_expected: now + 9900, last_restock: now } 
      });
    }

    const result: Record<string, any> = {};

    // 2. معالجة الداتا وتجهيزها للواجهة
    for (const key of ["uk", "japan"]) {
      const countryData = rawData[key];
      if (!countryData) continue;

      const qty = countryData.current_quantity;
      const stats = countryData.stats;
      const lastUpdate = countryData.last_update;

      // حساب وقت الريستوك القادم بذكاء
      let nextExpected = 0;

      if (qty === 0) {
        // إذا كان الستوك صفر: الوقت القادم = وقت ما فضي + متوسط التأخير الحقيقي
        nextExpected = countryData.last_empty_time + stats.avg_restock_delay;
      } else {
        // إذا لسا في ستوك: نحسب متى رح يخلص، وبعدين نضيف عليه متوسط التأخير
        // (إذا لسا ما في هيستوري، بنفترض سرعة سحب افتراضية 5 حبات بالثانية)
        const depletionRate = stats.avg_depletion_rate > 0 ? stats.avg_depletion_rate : 5;
        const secondsToEmpty = qty / depletionRate;
        nextExpected = Math.round(lastUpdate + secondsToEmpty + stats.avg_restock_delay);
      }

      // 3. تغليف الداتا بالشكل النهائي النظيف
      result[key] = {
        quantity: qty,
        cost: countryData.cost,
        timestamp: lastUpdate,
        last_restock: countryData.last_restock_time, // وقت آخر بضاعة نزلت
        next_expected: nextExpected,                 // وقت البضاعة القادمة (ديناميكي)
        max_stock: stats.empirical_max_stock > 0 ? stats.empirical_max_stock : 2500
      };
    }

    return Response.json(result, { 
      headers: { 
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    console.error("[/api/yata/xanax] ERROR:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}