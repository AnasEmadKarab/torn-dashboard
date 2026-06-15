import { tornFetch } from "@/lib/torn-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return Response.json({ error: "TORN_API_KEY is missing from request" }, { status: 400 });
  }

  try {
    const data = await tornFetch<any>("user", apiKey, "bars,cooldowns,money,travel,properties,organizedcrimes");

    return Response.json(data, { 
      headers: { 
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    console.error("[/api/torn/user] ERROR:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}