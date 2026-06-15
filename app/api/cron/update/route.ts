import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// هذا السطر إجباري لكي يعمل الكود على سيرفرات Cloudflare


export async function GET(request: Request) {
  try {
    const redis = new Redis({
      url: "https://clever-hedgehog-148614.upstash.io",
      token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng", // انسخ التوكن الطويل هنا
    });
    // 1. سحب الداتا من YATA
    const res = await fetch("https://yata.yt/api/v1/travel/export/");
    const data = await res.json();
    
    // 2. تخزينها في Redis
    await redis.set("xanax_data", JSON.stringify(data));
    
    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}