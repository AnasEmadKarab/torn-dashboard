// app/api/users-online/route.ts
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    // نجيب كل المفاتيح اللي بتبدأ بـ active_user
    const keys = await redis.keys('active_user:*');
    return NextResponse.json({ count: keys.length });
  } catch (e) {
    return NextResponse.json({ count: 0 });
  }
}