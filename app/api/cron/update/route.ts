import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng", 
    });

    const res = await fetch("https://yata.yt/api/v1/travel/export/");
    const raw = await res.json();

    // ضفنا كندا لمفاتيح YATA
    const COUNTRY_KEYS: Record<"uk" | "japan" | "can", string> = { uk: "uni", japan: "jap", can: "can" };
    const now = Math.floor(Date.now() / 1000);

    const dbData: any = await redis.get("xanax_advanced_v1") || {};
    const newData: Record<string, any> = {};

    for (const [key, yataKey] of Object.entries(COUNTRY_KEYS)) {
      const country = raw.stocks?.[yataKey];
      const xanax = country?.stocks?.find((item: any) => item.name === "Xanax" || item.id === 206);

      const currentQty = xanax?.quantity ?? 0;
      const cost = xanax?.cost ?? 0;
      const updateTime = country?.update ?? now;

      let oldState = dbData[key] || {
        current_quantity: 0,
        last_restock_time: now,
        last_empty_time: now,
        last_predicted_restock: now, // 👈 الجديد: التوقع القديم
        empty_duration_minutes: 0,   // 👈 الجديد: كم دقيقة أخد ليفضى
        next_predicted_restock: now, 
        history: [],
        stats: { avg_depletion_rate: 0, avg_restock_delay: key === 'japan' ? 9900 : 7200, max_stock: 0 }
      };

      let history = [...oldState.history];
      let last_restock_time = oldState.last_restock_time;
      let last_empty_time = oldState.last_empty_time;
      let start_qty = oldState.start_qty || currentQty; 
      
      // جلب المتغيرات الجديدة من القديم
      let last_predicted_restock = oldState.last_predicted_restock || now;
      let empty_duration_minutes = oldState.empty_duration_minutes || 0;
      let next_predicted_restock = oldState.next_predicted_restock || now;

      // 1. لحظة نزول الستوك الجديد (Restock)
      if (currentQty > oldState.current_quantity && oldState.current_quantity === 0) {
        last_restock_time = updateTime;
        start_qty = currentQty;
        // بنحفظ التوقع اللي كان محسوب كـ "توقع قديم"
        last_predicted_restock = oldState.next_predicted_restock || (oldState.last_empty_time + oldState.stats.avg_restock_delay);
      } 
      // 2. لحظة نفاذ الستوك (Empty)
      else if (currentQty === 0 && oldState.current_quantity > 0) {
        last_empty_time = updateTime;

        const cycleDuration = last_empty_time - last_restock_time; 
        const restockDelay = last_restock_time - oldState.last_empty_time; 

        if (cycleDuration > 0 && cycleDuration < 86400) {
            // بنسجل كم دقيقة أخد السوق ليفضى
            empty_duration_minutes = Math.round(cycleDuration / 60);

            history.unshift({
              start_amount: start_qty,
              duration: cycleDuration,
              restock_delay: (restockDelay > 3000 && restockDelay < 15000) ? restockDelay : (key === 'japan' ? 9900 : 7200)
            });

            if (history.length > 10) history.pop();
        }
      }

      // حساباتك الأصلية زي ما هي
      let avgDepletionRate = 0; 
      let avgDelay = key === 'japan' ? 9900 : 7200;
      let maxStock = start_qty;

      if (history.length > 0) {
        let totalAmount = 0;
        let totalDuration = 0;
        let totalDelay = 0;

        history.forEach((cycle: any) => {
          totalAmount += cycle.start_amount;
          totalDuration += cycle.duration;
          totalDelay += cycle.restock_delay;
          if (cycle.start_amount > maxStock) maxStock = cycle.start_amount;
        });

        avgDepletionRate = totalAmount / totalDuration; 
        avgDelay = totalDelay / history.length; 
      }

      // تحديث التوقع المستقبلي
      if (currentQty === 0) {
        next_predicted_restock = last_empty_time + Math.round(avgDelay);
      }

      // حساب الربح الصافي (سعر السوق تقريباً 835,000 ناقص سعر الشراء)
      const estimated_profit = cost > 0 ? (835000 - cost) : 0;

      newData[key] = {
        current_quantity: currentQty,
        cost: cost,
        profit: estimated_profit, // 👈 الجديد: الربح الصافي للرحلة
        last_update: updateTime,
        last_restock_time,
        last_empty_time,
        last_predicted_restock, // 👈 الجديد: التوقع لحظة النزول الفعلي
        empty_duration_minutes, // 👈 الجديد: كم دقيقة ليخلص الستوك
        next_predicted_restock,
        start_qty,
        history,
        stats: {
          avg_depletion_rate: avgDepletionRate,
          avg_restock_delay: Math.round(avgDelay),
          empirical_max_stock: maxStock 
        }
      };
    }

    await redis.set("xanax_advanced_v1", JSON.stringify(newData));
    
    return Response.json({ success: true, timestamp: Date.now(), data: newData });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}