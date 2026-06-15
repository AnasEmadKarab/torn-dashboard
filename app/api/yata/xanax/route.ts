import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng",
    });

    const data = await redis.get("xanax_data");
    
    if (!data) {
      return Response.json({ 
        uk: { quantity: 0, cost: 0, timestamp: Date.now() / 1000 }, 
        japan: { quantity: 0, cost: 0, timestamp: Date.now() / 1000 } 
      });
    }

    const COUNTRY_KEYS: Record<"uk" | "japan", string> = { uk: "uni", japan: "jap" };
    const raw: any = data;
    const result: Record<string, any> = {};

    for (const [key, yataKey] of Object.entries(COUNTRY_KEYS)) {
      const country = raw.stocks?.[yataKey];
      if (!country) {
        result[key] = { quantity: 0, cost: 0, timestamp: Math.floor(Date.now() / 1000) };
        continue;
      }
      const xanax = country.stocks?.find((item: any) => item.name === "Xanax" || item.id === 206);
      result[key] = {
        quantity: xanax?.quantity ?? 0,
        cost: xanax?.cost ?? 0,
        timestamp: country.update ?? Math.floor(Date.now() / 1000),
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