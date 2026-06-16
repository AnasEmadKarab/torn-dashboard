import { tornFetch } from "@/lib/torn-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return Response.json({ error: "TORN_API_KEY is missing from request" }, { status: 400 });
  }

  try {
    // المحاولة الأولى: طلب الداتا كاملة (بافتراض إن اللاعب عنده فاكشن)
    const data = await tornFetch<any>("user", apiKey, "bars,cooldowns,money,travel,properties,organizedcrimes");

    return Response.json(data, { 
      headers: { 
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*" 
      } 
    });
  } catch (e: any) {
    // 👈 السحر هنا: إذا كان الخطأ بسبب أن اللاعب ليس لديه فاكشن (Error 6)
    if (e.message.includes("Incorrect ID-entity relation")) {
      try {
        // المحاولة الثانية "الآمنة": جلب بيانات اللاعب الأساسية فقط بدون الجرائم المنظمة
        const safeData = await tornFetch<any>("user", apiKey, "bars,cooldowns,money,travel,properties");
        
        // نمرر مصفوفة فارغة للجرائم عشان الواجهة تشتغل طبيعي وتقولك "أنت مش بفاكشن"
        safeData.organizedcrimes = []; 
        
        return Response.json(safeData, { 
          headers: { 
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*" 
          } 
        });
      } catch (fallbackError: any) {
        return Response.json({ error: fallbackError.message }, { status: 500 });
      }
    }

    // إذا كان خطأ آخر غير الفاكشن، نطبعه ونعرضه
    console.error("[/api/torn/user] ERROR:", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}