// app/api/users-online/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://clever-hedgehog-148614.upstash.io",
  token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng",
});

export async function GET() {
  try {
    // نجيب كل المفاتيح اللي بتبدأ بـ active_user
    const keys = await redis.keys("active_user:*");
    return NextResponse.json({ count: keys.length });
  } catch (e) {
    return NextResponse.json({ count: 0 });
  }
}
