import { Redis } from "@upstash/redis";

// تعريف قاعدة البيانات (كتبتلك المفاتيح جوا زي ما طلبت)
const redis = new Redis({
  url: "https://clever-hedgehog-148614.upstash.io",
  token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng",
});

// 👈 هون حط الـ IDs للـ 10 شغلات اللي بدك تراقبها (مثال: أسلحة، دباديب، ورود)
const TARGET_ITEMS = [397,21,399,361,421,651,654,332,653,652];

export async function GET(request: Request) {
  try {
    const res = await fetch("https://prombot.co.uk:8443/api/travel", { 
      cache: "no-store",
      headers: { "User-Agent": "Torn-Smart-Dashboard-App" } 
    });
    
    if (!res.ok) throw new Error(`Prombot travel API error: ${res.status}`);
    const raw = await res.json();

    const countryMap = { uk: "uni", japan: "jap", can: "can" };
    const result: Record<string, any> = {};

    // 1. تجهيز الداتا للواجهة (الكود الأصلي تبعك)
    for (const [key, prombotKey] of Object.entries(countryMap)) {
      const country = raw.stocks?.[prombotKey];
      result[key] = {
        name: key === 'uk' ? "United Kingdom" : (key === 'japan' ? "Japan" : "Canada"),
        update: country?.update ?? Math.floor(Date.now() / 1000),
        stocks: country?.stocks ?? [],
      };
    }

    // --- 🕵️‍♂️ 2. الكود السري: مراقبة الـ 10 أغراض وحفظها بالخلفية ---
    try {
      const now = Math.floor(Date.now() / 1000);
      const dbData: any = (await redis.get("hidden_items_tracker_v1")) || {};
      const newData: any = {};

      for (const [key, prombotKey] of Object.entries(countryMap)) {
        const countryData = raw.stocks?.[prombotKey];
        if (!countryData || !countryData.stocks) continue;

        newData[key] = {};
        const updateTime = countryData.update || now;

        for (const itemId of TARGET_ITEMS) {
          const itemObj = countryData.stocks.find((i: any) => i.id === itemId);
          if (!itemObj) continue; // إذا الغرض مو موجود بهي الدولة بنعمله سكيب

          const currentQty = itemObj.quantity ?? 0;
          const oldState = dbData[key]?.[itemId] || {
            current_quantity: 0,
            last_restock_time: updateTime,
            last_empty_time: updateTime,
            history: [],
          };

          let history = [...(oldState.history || [])];
          let last_restock_time = oldState.last_restock_time;
          let last_empty_time = oldState.last_empty_time;

          // خوارزمية حساب الوقت
          if (currentQty > oldState.current_quantity && oldState.current_quantity === 0) {
            last_restock_time = updateTime;
          } else if (currentQty === 0 && oldState.current_quantity > 0) {
            last_empty_time = updateTime;
            const durationAlive = last_empty_time - last_restock_time;
            const delayEmptyToRestock = last_restock_time - oldState.last_empty_time;

            if (durationAlive > 0 && durationAlive < 86400) {
              history.unshift({
                date: new Date().toISOString(),
                survived_seconds: durationAlive,
                restock_delay_seconds: delayEmptyToRestock > 0 ? delayEmptyToRestock : 0
              });
              if (history.length > 10) history.pop(); // بنحفظ آخر 10 دورات بس عشان ما يكبر الحجم
            }
          }

          newData[key][itemId] = {
            item_id: itemId,
            current_quantity: currentQty,
            cost: itemObj.cost ?? 0,
            last_update: updateTime,
            last_restock_time,
            last_empty_time,
            history
          };
        }
      }
      // حفظ الداتا في Redis بصمت
      await redis.set("hidden_items_tracker_v1", JSON.stringify(newData));
    } catch (trackerError) {
      // إذا صار أي مشكلة بالحفظ، الكود بيكمل وما بيخرب الموقع
      console.error("Tracker Background Error:", trackerError);
    }
    // --- نهاية الكود السري ---

    return Response.json(result, { 
      headers: { 
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    console.error("[/api/travel] ERROR:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}