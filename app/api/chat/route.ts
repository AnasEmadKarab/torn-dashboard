// إجبار السيرفر على عدم التخزين المؤقت
export const dynamic = 'force-dynamic';

import Pusher from "pusher";

// تأكد أن المفاتيح مطابقة لما أضفته في إعدادات Cloudflare
const pusher = new Pusher({
  appId: "2175907",
  key: "4d6bb7f0a2ed140fe2a3",
  secret:"4c5eeecf2a608184f107",
  cluster: "eu",
  useTLS: true, // ضروري جداً لبيئة Edge
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // إرسال الرسالة إلى بوشر
    await pusher.trigger("habibi-chat", "new-message", body);

    // التعديل السحري: استخدام Response العادية لتجنب انهيار OpenNext
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("CHAT ERROR:", error.message);
    
    // إرجاع الخطأ بطريقة آمنة لا تكسر كلاود فلير
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}