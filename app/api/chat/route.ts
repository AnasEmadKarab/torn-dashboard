// app/api/chat/route.ts
import Pusher from "pusher";
import { NextResponse } from "next/server";

const pusher = new Pusher({
  appId: "2175907",
  key: "4d6bb7f0a2ed140fe2a3",
  secret: "4c5eeecf2a608184f107",
  cluster: "eu",
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const { message, sender } = await req.json();

    // بث الرسالة على قناة اسمها "habibi-chat"
    await pusher.trigger("habibi-chat", "new-message", {
      message,
      sender,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}