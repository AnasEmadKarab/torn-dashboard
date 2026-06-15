export async function GET(request: Request) {
  try {
    const res = await fetch("https://yata.yt/api/v1/travel/export/", { 
      cache: "no-store",
      headers: { "User-Agent": "Torn-Smart-Dashboard-App" } 
    });
    
    if (!res.ok) throw new Error(`YATA travel API error: ${res.status}`);
    const raw = await res.json();

    const countryMap = { uk: "uni", japan: "jap" };
    const result: Record<string, any> = {};

    for (const [key, yataKey] of Object.entries(countryMap)) {
      const country = raw.stocks?.[yataKey];
      result[key] = {
        name: key === 'uk' ? "United Kingdom" : "Japan",
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
    console.error("[/api/yata/travel] ERROR:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}