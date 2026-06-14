import { NextResponse } from "next/server";
import { tornFetch } from "@/lib/torn-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return NextResponse.json({ error: "TORN_API_KEY is missing from request" }, { status: 400 });
  }

  try {
    // جلب الداتا بناءً على المفتاح المرسل ديناميكياً
    const data = await tornFetch<any>("user", apiKey, "bars,cooldowns,money,travel,properties,organizedcrimes");

    return NextResponse.json(data, { 
      headers: { 
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    console.error("[/api/torn/user] ERROR:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}