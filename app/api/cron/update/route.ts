import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng", 
    });

    const res = await fetch("https://yata.yt/api/v1/travel/export/");
    const raw = await res.json();

    const COUNTRY_KEYS: Record<"uk" | "japan", string> = { uk: "uni", japan: "jap" };
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
        history: [],
        stats: { avg_depletion_rate: 0, avg_restock_delay: key === 'uk' ? 7200 : 9900, max_stock: 0 }
      };

      let history = [...oldState.history];
      let last_restock_time = oldState.last_restock_time;
      let last_empty_time = oldState.last_empty_time;
      let start_qty = oldState.start_qty || currentQty; 

      
      if (currentQty > oldState.current_quantity && oldState.current_quantity === 0) {
        last_restock_time = updateTime;
        start_qty = currentQty;
      } 
      else if (currentQty === 0 && oldState.current_quantity > 0) {
        last_empty_time = updateTime;

        const cycleDuration = last_empty_time - last_restock_time; 
        const restockDelay = last_restock_time - oldState.last_empty_time; 

        if (cycleDuration > 0 && cycleDuration < 86400) {
            history.unshift({
              start_amount: start_qty,
              duration: cycleDuration,
              restock_delay: (restockDelay > 3000 && restockDelay < 15000) ? restockDelay : (key === 'uk' ? 7200 : 9900)
            });

            if (history.length > 10) history.pop();
        }
      }

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

        avgDepletionRate = totalAmount / totalDuration; 
        avgDelay = totalDelay / history.length; 
      }

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