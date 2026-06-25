// app/api/weaver/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const targetUrl = 'https://weav3r.dev/api/search-deals/find?id=206&type=item'; 
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Weaver API: ${response.status}`);
    }

    const data = await response.json();
    
    // إرسال الداتا الخام للواجهة مشان نطبق عليها شروطك (البلاك ليست، والسعر، والتقييم)
    return NextResponse.json({ deals: data.deals || [] });
  } catch (error) {
    return NextResponse.json({ deals: [] });
  }
}