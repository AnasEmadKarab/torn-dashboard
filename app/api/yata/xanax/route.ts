// app/api/yata/xanax/route.ts
import { NextResponse } from "next/server";

// YATA Docs Country Keys
const COUNTRY_KEYS: Record<"uk" | "japan", string> = { uk: "uni", japan: "jap" };

export async function GET(request: Request) {
  try {
    const res = await fetch("https://yata.yt/api/v1/travel/export/", { 
      cache: "no-store",
      headers: { "User-Agent": "Torn-Smart-Dashboard-App" }
    });
    
    if (!res.ok) throw new Error(`YATA API error: ${res.status}`);

    const raw = await res.json();
    const result: Record<string, any> = {};

    for (const [key, yataKey] of Object.entries(COUNTRY_KEYS)) {
      const country = raw.stocks?.[yataKey];
      
      if (!country) {
        result[key] = { quantity: 0, cost: 0, timestamp: Math.floor(Date.now() / 1000) };
        continue;
      }

      // الآي دي تبع الزاناكس هو 206
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
    console.error("[/api/yata/xanax] ERROR:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}