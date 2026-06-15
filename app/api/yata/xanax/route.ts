import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = 'edge';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  try {
    // نقرأ الداتا من قاعدة البيانات (Redis) بدل ما نطلبها من YATA مباشرة
    const data = await redis.get("xanax_data");
    
    if (!data) {
      return NextResponse.json({ error: "No data in Redis yet. Waiting for cron." }, { status: 404 });
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

    return NextResponse.json(result, { 
      headers: { 
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}