// app/api/heartbeat/route.ts
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// تأكد من ضبط متغيرات البيئة UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    // نجيب الـ IP أو معرف فريد للجهاز (ممكن نستخدم الـ API Key كمعرف إذا كان مسجل)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const userId = ip; // أو استخدم API Key اللاعب كمعرف فريد

    // نحفظ المستخدم في Redis بـ TTL مدته 60 ثانية (أوتوماتيكياً بيحذف نفسه)
    await redis.set(`active_user:${userId}`, "online", { ex: 60 });
    
    return NextResponse.json({ status: 'ok' });
  } catch (e) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}