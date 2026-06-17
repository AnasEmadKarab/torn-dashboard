import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // الرابط السري اللي اصطدته إنت من الـ Network
    const targetUrl = 'https://weav3r.dev/api/search-deals/find?id=206&type=item'; 
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 60 } // تحديث الداتا كل دقيقة عشان ما نعمل ضغط على سيرفراتهم
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Weaver API: ${response.status}`);
    }

    const data = await response.json();
    const deals = data.deals || [];

    // 1. ترتيب البائعين حسب التقييم الأفضل (upvotes - downvotes)
    const sortedByRating = deals.sort((a: any, b: any) => {
      const scoreA = (a.rating?.upvotes || 0) - (a.rating?.downvotes || 0);
      const scoreB = (b.rating?.upvotes || 0) - (b.rating?.downvotes || 0);
      return scoreB - scoreA; // ترتيب تنازلي (الأعلى أولاً)
    });

    // 2. سحب أول 3 وتجهيزهم للداشبورد
    const top3 = sortedByRating.slice(0, 3).map((trader: any, index: number) => ({
      rank: index + 1,
      id: trader.playerId,
      name: trader.playerName,
      price: trader.price,
      // حساب التقييم الصافي عشان نعرضه باللون الأخضر أو الأحمر
      ratingScore: (trader.rating?.upvotes || 0) - (trader.rating?.downvotes || 0) 
    }));

    return NextResponse.json({ success: true, data: top3 });

  } catch (error: any) {
    console.error("[/api/weaver] Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}