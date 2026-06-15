import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng",
    });

    const data = await redis.get("xanax_data_smart");
    
    if (!data) {
      return Response.json({ 
        uk: { quantity: 0, cost: 0, timestamp: Date.now() / 1000 }, 
        japan: { quantity: 0, cost: 0, timestamp: Date.now() / 1000 } 
      });
    }

    return Response.json(data, { 
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