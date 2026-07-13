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
console.log("Before trigger");
    // بث الرسالة على قناة اسمها "habibi-chat"
    await pusher.trigger("habibi-chat", "new-message", {
      message,            
      sender,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
console.log("After trigger");
    return NextResponse.json({ success: true });
  } catch (error: any) {
  console.error("FULL ERROR:", error);
  console.error("MESSAGE:", error?.message);
  console.error("STACK:", error?.stack);
  console.error("DETAILS:", error?.error);

  return NextResponse.json(
    {
      success: false,
      message: error?.message,
      details: error?.error,
    },
    { status: 500 }
  );
}
}