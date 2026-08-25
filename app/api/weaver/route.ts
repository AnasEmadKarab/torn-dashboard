// app/api/weaver/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const targetUrl = 'https://weav3r.dev/api/search-deals/find?id=206&type=item'; 
    
    const response = await fetch(targetUrl, {
      headers: {
        // الترويسات التي تثبت لـ Cloudflare أنك متصفح حقيقي
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-EG,en;q=0.9,ar-EG;q=0.8,ar;q=0.7",
        "sec-ch-ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Referer": "https://weav3r.dev/item/206?timeframe=7d&tab=all&mode=sell",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
        
        // ⚠️ مهم جداً: استبدل النص بالأسفل بالكوكي الكامل الذي نسخته من المتصفح ⚠️
        "cookie": "_ga=GA1.1.912021324.1783278754; tornw3b_privacy_policy_version=2026-06-10; cookieyes-consent=consentid:c0FxVThZb0dNVTF4M3lVOTE5ZkhjZnBwZ3VYM1B2dHc,consent:yes,action:no,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes; cc_cookie=%7B%22categories%22%3A%5B%22necessary%22%2C%22analytics%22%2C%22advertisement%22%5D%2C%22revision%22%3A20260730%2C%22data%22%3Anull%2C%22consentTimestamp%22%3A%222026-07-31T15%3A27%3A55.983Z%22%2C%22consentId%22%3A%22c83a3860-82b8-4673-94bb-9831b320089f%22%2C%22services%22%3A%7B%22necessary%22%3A%5B%5D%2C%22analytics%22%3A%5B%5D%2C%22advertisement%22%3A%5B%5D%7D%2C%22languageCode%22%3A%22en%22%2C%22lastConsentTimestamp%22%3A%222026-07-31T15%3A27%3A55.983Z%22%2C%22expirationTime%22%3A1801236475983%7D; cc_id=c83a3860-82b8-4673-94bb-9831b320089f.55ed6ec0034b; _ga_PF693NSPW1=GS2.1.s1787660771$o61$g1$t1787661474$j57$l0$h1196469239; cf_clearance=.jL6lwi3RGZmCNuY2OtikN1hCoJ30CYK.CNrBxVSj4c-1787661479-1.2.1.1-0b8BnJ5juL2VfGk9TOlcVCf5pzqA_WGv_VlC8VdD4ZfI6_6qWyVbOMjasnk8AALEe8LTg4CT2tNQSLZFmHNSRLcpWjYzjt.HprsEaHjKQGXfJfekqVBp_RJJipnW.L4NNRsJRjleogH7ypNBap1.KuoLqgT.8NpbxnmN0N1wje54tr0Kdo3L43eNT2S.kCQiwB_1nmhEfE9tKL337lNBC8NM8mLaCr9XxdV7NJf7SNhnjFdpvFNrs9k43wYrN_nQh.jJdhRq8YNFgkeMf4XPpaESaJGVn5zHLXbD14JMnASDCRX9LG86T2FVwxoVdNMZsozzZtkbgpaDlofxngI77DqclBQH2HqaOiW8X9eYT22K1wdQ18smOLQVIjRUx0hLHSZZcruwBI4VqWYDlbAHfQ" 
      },
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) {
      console.error(`Cloudflare Block or API Error: ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch Weaver API: ${response.status}`);
    }

    const data = await response.json();
    
    // إرسال الداتا الخام للواجهة مشان نطبق عليها شروطك (البلاك ليست، والسعر، والتقييم)
    return NextResponse.json({ deals: data.deals || [] });
  } catch (error) {
    console.error("Fetch Catch Error:", error);
    return NextResponse.json({ deals: [] }, { status: 500 });
  }
}