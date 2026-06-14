import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: Request) {
  // التأكد إن الطلب جاي من Cron Job (اختياري للأمان)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 1. اسحب الداتا من YATA
  const res = await fetch("https://yata.yt/api/v1/travel/export/");
  const data = await res.json();

  // 2. خزن الداتا في Redis مع "تاريخ" (مثلاً تخزين آخر ساعة أو آخر 24 ساعة)
  await redis.set("xanax_data", JSON.stringify(data));

  return NextResponse.json({ success: true });
}