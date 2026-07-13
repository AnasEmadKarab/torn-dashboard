export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json(); 
    
    // تأكد أن هذه المفاتيح موجودة في Cloudflare Variables
    const appId ="2175907"
    const key = "4d6bb7f0a2ed140fe2a3"
    const secret = "4c5eeecf2a608184f107"
    const cluster = "eu";

    // 1. تجهيز الرسالة بالطريقة التي يفهمها بوشر (يجب أن يكون الحقل data عبارة عن نص String)
    const pusherBody = JSON.stringify({
      name: "new-message",
      channels: ["habibi-chat"],
      data: JSON.stringify(body) 
    });

    // 2. تشفير MD5 لرسالتك (مدعوم أصلياً في كلاود فلير)
    const md5Buffer = await crypto.subtle.digest("MD5", new TextEncoder().encode(pusherBody));
    const bodyMd5 = Array.from(new Uint8Array(md5Buffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. تجهيز التوقيع (Authentication Signature)
    const timestamp = Math.floor(Date.now() / 1000);
    const path = `/apps/${appId}/events`;
    const params = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyMd5}`;
    const stringToSign = `POST\n${path}\n${params}`;

    // 4. تشفير التوقيع بـ HMAC SHA-256
    const cryptoKey = await crypto.subtle.importKey(
      "raw", 
      new TextEncoder().encode(secret), 
      { name: "HMAC", hash: "SHA-256" }, 
      false, 
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(stringToSign));
    const authSignature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 5. إرسال الطلب المباشر عبر fetch (لن ينهار أبداً على Cloudflare)
    const url = `https://api-${cluster}.pusher.com${path}?${params}&auth_signature=${authSignature}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: pusherBody
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Pusher API Error: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("CHAT ERROR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}