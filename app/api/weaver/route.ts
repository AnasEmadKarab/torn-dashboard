// app/api/weaver/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio"; // رح نستخدمها لتحليل الـ HTML

export async function GET() {
  try {
    const targetUrl =
      "https://tornexchange.com/listings?model_name_contains=Xanax&page=1";

    // سحب صفحة الـ HTML من الموقع
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 60 }, // كاش لمدة دقيقة متل ما كنت عامل
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Torn Exchange: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const items: any[] = [];

    // سحب الداتا من كروت الـ HTML
    $(".listing-card").each((index, element) => {
      // بناخد أول 10 عناصر فقط من الصفحة
      if (index >= 10) return false;

      // 1. استخراج اسم اللاعب والـ ID
      const playerText = $(element).find(".listing-player a").text().trim();
      // النص بيكون هيك: "Sh-Sh [3653148]"
      const name = playerText
        .split("[")[0]
        .replace(/\u00a0/g, " ")
        .trim(); // تنظيف المسافات
      const idMatch = playerText.match(/\[(\d+)\]/);
      const id = idMatch ? idMatch[1] : "";

      // 2. استخراج التقييم (Rating)
      const ratingText = $(element)
        .find(".listing-player .text-end")
        .text()
        .trim();
      const rating = parseInt(ratingText, 10) || 0; // بيحول الرقم (حتى لو سالب متل -1)

      // 3. استخراج السعر
      const priceText = $(element).find(".listing-price strong").text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, ""), 10) || 0; // سحب الأرقام فقط

      // 4. تجهيز رابط التريد
      const tradeLink = `https://www.torn.com/trade.php#step=start&userID=${id}`;

      // إضافة البيانات للمصفوفة
      items.push({
        seller_name: name,
        seller_id: id,
        price: price,
        formatted_price: priceText, // السعر مع إشارة الـ $ والفاصلة
        rating: rating,
        trade_url: tradeLink, // الرابط المباشر للتريد
      });
    });

    // ترتيب الـ 10 عناصر حسب التقييم (من الأعلى للأقل) وأخذ أفضل 3 فقط
    const top3Deals = items.sort((a, b) => b.rating - a.rating).slice(0, 3);

    // إرجاع البيانات بنفس الهيكلية (deals array) مشان الواجهة تستقبلها طبيعي
    return NextResponse.json({ deals: top3Deals });
  } catch (error) {
    console.error("Fetch Catch Error:", error);
    return NextResponse.json({ deals: [] }, { status: 500 });
  }
}
