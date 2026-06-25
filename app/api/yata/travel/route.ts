export async function GET(request: Request) {
  try {
    const res = await fetch("https://prombot.co.uk:8443/api/travel", { 
      cache: "no-store",
      headers: { "User-Agent": "Torn-Smart-Dashboard-App" } 
    });
    
    if (!res.ok) throw new Error(`Prombot travel API error: ${res.status}`);
    const raw = await res.json();

    // ربط الاختصارات
    const countryMap = { uk: "uni", japan: "jap", can: "can" };
    const result: Record<string, any> = {};

    for (const [key, prombotKey] of Object.entries(countryMap)) {
      const country = raw.stocks?.[prombotKey];
      result[key] = {
        name: key === 'uk' ? "United Kingdom" : (key === 'japan' ? "Japan" : "Canada"),
        update: country?.update ?? Math.floor(Date.now() / 1000),
        stocks: country?.stocks ?? [],
      };
    }

    return Response.json(result, { 
      headers: { 
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    console.error("[/api/travel] ERROR:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}