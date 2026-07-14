import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://clever-hedgehog-148614.upstash.io",
  token: "gQAAAAAAAkSGAAIgcDFhYmMyOTk5NmY1Mjc0N2I5ODFmZGY4ZmIwYmY4ZjI3Ng",
});

export async function GET() {
  try {
    const data = await redis.get("hidden_items_tracker_v1");
    
    return NextResponse.json({
      success: true,
      message: "Here is your tracked data, Habibi!",
      data: data || {}
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}