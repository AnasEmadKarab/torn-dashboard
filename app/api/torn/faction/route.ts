// app/api/torn/faction/route.ts
import { tornFetch } from "@/lib/torn-api";

export async function GET(request: Request) {
  // استخراج المفتاح من الرابط (الذي يمرره الـ Hook)
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return Response.json({ error: "TORN_API_KEY missing" }, { status: 400 });
  }

  let crimes: any[] = [];
  let vaultBalance = 0;

  try {
    // 1. جلب فلوس الفاكشن (من الـ User endpoint لأنها لا تتطلب صلاحيات خاصة)
    const moneyRes = await tornFetch<any>("user", apiKey, "money");
    vaultBalance = moneyRes?.faction?.money ?? 0;

    // 2. محاولة جلب الجرائم (Organized Crimes)
    // ملاحظة: بما أننا أصبحنا نستخدم الـ organizedcrimes من الـ user endpoint في الصفحة الرئيسية
    // لا نحتاج لجلبها من الـ faction endpoint إلا إذا كنت تريد الجرائم الكاملة للفاكشن
    try {
      const crimesRes = await tornFetch<any>("faction", apiKey, "crimes");
      crimes = crimesRes?.crimes ?? [];
    } catch (e: any) {
      console.warn(
        "[/api/torn/faction] Faction crimes endpoint access denied (Normal if no AA)",
      );
      crimes = [];
    }

    return Response.json(
      {
        crimes,
        vault: { money_balance: vaultBalance },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (e: any) {
    console.error("[/api/torn/faction] FATAL:", e.message);
    return Response.json({ crimes: [], vault: { money_balance: 0 } });
  }
}
