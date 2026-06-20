import { tornFetch } from "@/lib/torn-api";

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return Response.json({ error: "TORN_API_KEY is missing from request" }, { status: 400 });
  }

  try {
    // 👈 السحر هنا: طلبنا organizedcrimes (الكل) و organizedcrime (المشارك فيها حالياً) مع بعض
    const data = await tornFetch<any>("user", apiKey, `bars,cooldowns,money,travel,properties,organizedcrimes,organizedcrime&_t=${Date.now()}`);

    return Response.json(data, { 
      headers: { 
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    if (e.message.includes("Incorrect ID-entity relation") || e.message.includes("Error 6")) {
      try {
        const safeData = await tornFetch<any>("user", apiKey, `bars,cooldowns,money,travel,properties&_t=${Date.now()}`);
        
        // تصفير الاثنين إذا اللاعب بدون فاكشن
        safeData.organizedcrimes = []; 
        safeData.organizedCrime = null;
        
        return Response.json(safeData, { 
          headers: { 
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Access-Control-Allow-Origin": "*" 
          } 
        });
      } catch (fallbackError: any) {
        return Response.json({ error: fallbackError.message }, { status: 500 });
      }
    }

    console.error("[/api/torn/user] ERROR:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}