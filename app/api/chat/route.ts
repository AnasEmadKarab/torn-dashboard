export const dynamic = 'force-dynamic'; 

import Pusher from "pusher";
import { NextResponse } from "next/server";

// 2️⃣ إعدادات بوشر
const pusher = new Pusher({
  appId: "2175907",
  key: "4d6bb7f0a2ed140fe2a3", 
  secret: "4c5eeecf2a608184f107",
  cluster: "eu",
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sender } = body;

    // إرسال الرسالة إلى Pusher
    await pusher.trigger("habibi-chat", "new-message", {
      message: message,
      sender: sender,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("CHAT ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}