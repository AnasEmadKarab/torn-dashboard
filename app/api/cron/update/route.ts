import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// هذا السطر إجباري لكي يعمل الكود على سيرفرات Cloudflare
export const runtime = 'edge'; 

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  try {
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