// app/api/users-online/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://clever-hedgehog-148614.upstash.io",
  token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng",
});

const ONLINE_WINDOW = 3 * 60 * 1000; // 3 دقائق

export async function GET() {
  try {
    const users = await redis.hgetall<Record<string, number>>("online_users");

    const now = Date.now();

    let count = 0;

    for (const timestamp of Object.values(users || {})) {
      if (now - Number(timestamp) < ONLINE_WINDOW) {
        count++;
      }
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ count: 0 });
  }
}
