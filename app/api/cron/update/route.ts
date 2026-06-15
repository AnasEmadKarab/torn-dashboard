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

    // 2. تحضير البيانات الجديدة بالشكل اللي بتفهمه الواجهة
    const COUNTRY_KEYS: Record<"uk" | "japan", string> = { uk: "uni", japan: "jap" };
    const newData: Record<string, any> = {};
    const now = Math.floor(Date.now() / 1000);

    for (const [key, yataKey] of Object.entries(COUNTRY_KEYS)) {
      const country = raw.stocks?.[yataKey];
      const xanax = country?.stocks?.find((item: any) => item.name === "Xanax" || item.id === 206);
      newData[key] = {
        quantity: xanax?.quantity ?? 0,
        cost: xanax?.cost ?? 0,
        timestamp: country?.update ?? now,
      };
    }

    // 3. السحر هنا: جلب البيانات القديمة لتجميد الوقت إذا كان الستوك 0
    const oldData: any = await redis.get("xanax_data_smart") || {};

    for (const key of ["uk", "japan"]) {
      if (newData[key].quantity === 0) {
        // إذا كان الستوك صفر حالياً، وكان صفر في التحديث السابق أيضاً
        if (oldData[key] && oldData[key].quantity === 0) {
          // جمد التوقيت القديم ولا تسمح له بالتقدم!
          newData[key].timestamp = oldData[key].timestamp;
        }
      }
    }

    // 4. حفظ البيانات الذكية الجديدة
    await redis.set("xanax_data_smart", JSON.stringify(newData));
    
    return Response.json({ success: true, timestamp: Date.now(), data: newData });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}