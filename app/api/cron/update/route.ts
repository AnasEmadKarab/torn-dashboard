import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng", 
    });

    // 1. جلب البيانات من YATA
    const res = await fetch("https://yata.yt/api/v1/travel/export/");
    const raw = await res.json();

    const COUNTRY_KEYS: Record<"uk" | "japan", string> = { uk: "uni", japan: "jap" };
    const now = Math.floor(Date.now() / 1000);

    // 2. نجلب الداتا القديمة (غيّرت اسم المفتاح عشان نبدأ بداية نظيفة ببيانات مهيكلة)
    const dbData: any = await redis.get("xanax_advanced_v1") || {};
    const newData: Record<string, any> = {};

    for (const [key, yataKey] of Object.entries(COUNTRY_KEYS)) {
      const country = raw.stocks?.[yataKey];
      const xanax = country?.stocks?.find((item: any) => item.name === "Xanax" || item.id === 206);

      const currentQty = xanax?.quantity ?? 0;
      const cost = xanax?.cost ?? 0;
      const updateTime = country?.update ?? now;

      // تهيئة الهيكل إذا كان أول مرة يشتغل فيها الكود
      let oldState = dbData[key] || {
        current_quantity: 0,
        last_restock_time: now,
        last_empty_time: now,
        history: [], // المصفوفة اللي رح تحفظ آخر 10 دورات
        stats: { avg_depletion_rate: 0, avg_restock_delay: key === 'uk' ? 7200 : 9900, max_stock: 0 }
      };

      let history = [...oldState.history];
      let last_restock_time = oldState.last_restock_time;
      let last_empty_time = oldState.last_empty_time;
      let start_qty = oldState.start_qty || currentQty; // عشان نعرف كمية الريستوك اللي بدأنا فيها

      // --- 3. محرك اكتشاف الأحداث (Event Detection Engine) ---
      
      // حدث A: ريستوك جديد! (الكمية زادت وكانت صفر، أو زادت بشكل كبير)
      if (currentQty > oldState.current_quantity && oldState.current_quantity === 0) {
        last_restock_time = updateTime;
        start_qty = currentQty;
      } 
      // حدث B: انتهاء الستوك! (الكمية صارت صفر وكانت موجودة)
      else if (currentQty === 0 && oldState.current_quantity > 0) {
        last_empty_time = updateTime;

        // بما إن الدورة خلصت، بنحفظ تفاصيلها في التاريخ
        const cycleDuration = last_empty_time - last_restock_time; // قديش أخد وقت ليخلص
        const restockDelay = last_restock_time - oldState.last_empty_time; // قديش تأخر لعمل ريستوك من آخر مرة فضي فيها

        // نتأكد إن الأرقام منطقية (عشان نتجاهل تخاريف سيرفرات تورن)
        if (cycleDuration > 0 && cycleDuration < 86400) {
            history.unshift({
              start_amount: start_qty,
              duration: cycleDuration,
              restock_delay: (restockDelay > 3000 && restockDelay < 15000) ? restockDelay : (key === 'uk' ? 7200 : 9900)
            });

            // نحتفظ بآخر 10 دورات فقط (Moving Average)
            if (history.length > 10) history.pop();
        }
      }

      // --- 4. حساب المتوسطات (Data Science Magic) ---
      let avgDepletionRate = 0; 
      let avgDelay = key === 'uk' ? 7200 : 9900;
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

        // كم حبة بتنباع بالثانية
        avgDepletionRate = totalAmount / totalDuration; 
        // متوسط التأخير الفعلي من ارض الواقع
        avgDelay = totalDelay / history.length; 
      }

      // 5. حفظ الهيكل النهائي
      newData[key] = {
        current_quantity: currentQty,
        cost: cost,
        last_update: updateTime,
        last_restock_time,
        last_empty_time,
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