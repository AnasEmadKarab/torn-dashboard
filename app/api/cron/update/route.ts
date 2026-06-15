import { Redis } from "@upstash/redis";

export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng", 
    });

    // 1. سحب الداتا من YATA
    const res = await fetch("https://yata.yt/api/v1/travel/export/");
    const data = await res.json();
    
    // 2. تخزينها في Redis
    await redis.set("xanax_data", JSON.stringify(data));
    
    // استخدام Response الطبيعي بدلاً من NextResponse لحل مشكلة Cloudflare
    return Response.json({ success: true, timestamp: Date.now() });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}