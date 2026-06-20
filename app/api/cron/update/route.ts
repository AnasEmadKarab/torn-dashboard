import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng", 
    });

    const dbData: any = await redis.get("xanax_advanced_v1") || {};
    let yataRaw: any = null;
    let droqsRaw: any = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); 
      
      // 👈 الضرب المزدوج: استدعاء YATA و DroqsDB معاً
      const [yataRes, droqsRes] = await Promise.allSettled([
        fetch("https://yata.yt/api/v1/travel/export/", { signal: controller.signal }),
        fetch("https://droqsdb.com/api/public/v1/export", { signal: controller.signal })
      ]);
      clearTimeout(timeoutId);

      if (yataRes.status === "fulfilled" && yataRes.value.ok) yataRaw = await yataRes.value.json();
      if (droqsRes.status === "fulfilled" && droqsRes.value.ok) droqsRaw = await droqsRes.value.json();

      if (!yataRaw && !droqsRaw) throw new Error("Both APIs failed to respond.");
      
    } catch (apiError: any) {
      console.warn("APIs Warning - Using Redis Fallback:", apiError.message);
      if (Object.keys(dbData).length > 0) {
        return Response.json({ success: true, timestamp: Date.now(), data: dbData, isFallback: true });
      }
      throw new Error("APIs failed and no cache is available.");
    }

    const COUNTRY_KEYS: Record<"uk" | "japan" | "can", string> = { uk: "uni", japan: "jap", can: "can" };
    const now = Math.floor(Date.now() / 1000);
    const newData: Record<string, any> = {};

    for (const [key, yataKey] of Object.entries(COUNTRY_KEYS)) {
      // --- 1. قراءة بيانات YATA ---
      const yataCountry = yataRaw?.stocks?.[yataKey];
      const yataXanax = yataCountry?.stocks?.find((item: any) => item.name === "Xanax" || item.id === 206);
      const yataTime = yataCountry?.update || 0;

      // --- 2. قراءة بيانات DroqsDB ---
      let droqsXanax: any = null;
      let droqsTime = 0;
      let droqsPredictedRestock = dbData[key]?.droqs_predicted_restock || 0; 
      let bazaarPrice = 0;

      if (droqsRaw && droqsRaw.countries) {
        const droqsCountry = droqsRaw.countries.find((c: any) => c.yataCode === yataKey);
        droqsXanax = droqsCountry?.items?.find((item: any) => item.itemId === 206);
        if (droqsXanax) {
          droqsTime = Math.floor(new Date(droqsXanax.stockUpdatedAt).getTime() / 1000);
          bazaarPrice = droqsXanax.bazaarPrice || 0;
          
          // سحب وقت التوقع المباشر
          if (droqsXanax.restockEstimate?.estimatedAt) {
            droqsPredictedRestock = Math.floor(new Date(droqsXanax.restockEstimate.estimatedAt).getTime() / 1000);
          } else if (droqsXanax.restockEstimate?.estimatedMinutes) {
            droqsPredictedRestock = now + Math.floor(droqsXanax.restockEstimate.estimatedMinutes * 60);
          }
        }
      }

      // --- 3. المقارنة الذكية: الأحدث يفوز ---
      let currentQty = 0;
      let cost = 0;
      let updateTime = now;

      if (droqsXanax && droqsTime >= yataTime) {
        currentQty = droqsXanax.stock ?? 0;
        cost = droqsXanax.buyPrice ?? 0;
        updateTime = droqsTime;
      } else if (yataXanax) {
        currentQty = yataXanax.quantity ?? 0;
        cost = yataXanax.cost ?? 0;
        updateTime = yataTime;
      } else {
        currentQty = dbData[key]?.current_quantity ?? 0;
        cost = dbData[key]?.cost ?? 0;
        updateTime = dbData[key]?.last_update ?? now;
      }

      let oldState = dbData[key] || {
        current_quantity: 0,
        last_restock_time: updateTime,
        last_empty_time: updateTime,
        last_predicted_restock: updateTime, 
        empty_duration_minutes: 0,   
        next_predicted_restock: updateTime, 
        history: [],
        stats: { avg_depletion_rate: 0, avg_restock_delay: key === 'japan' ? 9900 : 7200, max_stock: 0 }
      };

      let history = [...oldState.history];
      let last_restock_time = oldState.last_restock_time;
      let last_empty_time = oldState.last_empty_time;
      let start_qty = oldState.start_qty || currentQty; 
      
      let last_predicted_restock = oldState.last_predicted_restock || now;
      let empty_duration_minutes = oldState.empty_duration_minutes || 0;
      let next_predicted_restock = oldState.next_predicted_restock || now;

      if (currentQty > oldState.current_quantity && oldState.current_quantity === 0) {
        last_restock_time = updateTime;
        start_qty = currentQty;
        last_predicted_restock = oldState.next_predicted_restock || (oldState.last_empty_time + oldState.stats.avg_restock_delay);
      } 
      else if (currentQty === 0 && oldState.current_quantity > 0) {
        last_empty_time = updateTime;
        const cycleDuration = last_empty_time - last_restock_time; 
        const restockDelay = last_restock_time - oldState.last_empty_time; 

        if (cycleDuration > 0 && cycleDuration < 86400) {
            empty_duration_minutes = Math.round(cycleDuration / 60);
            history.unshift({
              start_amount: start_qty,
              duration: cycleDuration,
              restock_delay: (restockDelay > 3000 && restockDelay < 15000) ? restockDelay : (key === 'japan' ? 9900 : 7200)
            });
            if (history.length > 10) history.pop();
        }
      }

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

      if (currentQty === 0) {
        next_predicted_restock = last_empty_time + Math.round(avgDelay);
      }

      // إذا توافر سعر البازار من DroqsDB نستخدمه، وإلا نستخدم الرقم الافتراضي للـ Weaver
      const sellPrice = bazaarPrice > 0 ? bazaarPrice : 835000;
      const estimated_profit = cost > 0 ? (sellPrice - cost) : 0;

      newData[key] = {
        current_quantity: currentQty,
        cost: cost,
        profit: estimated_profit,
        last_update: updateTime,
        last_restock_time,
        last_empty_time,
        last_predicted_restock,
        empty_duration_minutes,
        next_predicted_restock,
        droqs_predicted_restock: droqsPredictedRestock, // 👈 وقت توقع DroqsDB سيفناه هنا
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