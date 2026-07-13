"use client";
import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [senderName, setSenderName] = useState("Anonymous");
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) setUnreadCount(0); // تصفير العداد لما تفتح الشات
  }, [isOpen]);

  // 1. جلب اسم اللاعب وعدد الأونلاين واسترجاع الرسائل القديمة (أقل من 5 دقائق)
  useEffect(() => {
    // جلب الاسم
    const apiKey = localStorage.getItem("TORN_API_KEY"); 
    if (apiKey) {
      fetch(`https://api.torn.com/user/?selections=profile&key=${apiKey}`)
        .then(res => res.json())
        .then(data => { if (data && data.name) setSenderName(data.name); })
        .catch(() => {});
    }

    // جلب الرسائل المحفوظة وفلترتها (5 دقائق = 300,000 ملي ثانية)
    const savedChat = localStorage.getItem("habibi_chat_history");
    if (savedChat) {
      const parsed = JSON.parse(savedChat);
      const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
      const validMessages = parsed.filter((m: any) => m.timestamp > fiveMinsAgo);
      setMessages(validMessages);
    }

    // جلب عدد الأونلاين كل 10 ثواني
    const fetchOnline = async () => {
      try {
        const res = await fetch('/api/users-online');
        const data = await res.json();
        setOnlineCount(data.count);
      } catch (e) {}
    };
    fetchOnline();
    const onlineInterval = setInterval(fetchOnline, 10000);

    return () => clearInterval(onlineInterval);
  }, []);

  // 2. إعداد Pusher وحفظ الرسائل عند التحديث
  useEffect(() => {
    // 🔴 حط مفاتيحك هون 🔴
    const pusher = new Pusher("4d6bb7f0a2ed140fe2a3", {
      cluster: "eu",
    });

    const channel = pusher.subscribe("habibi-chat");
    
    channel.bind("new-message", (data: any) => {
      // إضافة طابع زمني للرسالة لو مافيها
      const msgWithTime = { ...data, timestamp: Date.now() };
      
      setMessages((prev) => {
        const newMsgs = [...prev, msgWithTime];
        // حفظ في اللوكل ستورج فوراً
        localStorage.setItem("habibi_chat_history", JSON.stringify(newMsgs));
        return newMsgs;
      });

      // زيادة عداد الإشعارات إذا الشات مسكر
      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      pusher.unsubscribe("habibi-chat");
      pusher.disconnect();
    };
  }, []);

  // تنظيف الرسائل القديمة كل دقيقة (حتى لو ما حدا بعت رسالة)
  useEffect(() => {
    const cleaner = setInterval(() => {
      setMessages(prev => {
        const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
        const validMsgs = prev.filter(m => m.timestamp > fiveMinsAgo);
        if (validMsgs.length !== prev.length) {
          localStorage.setItem("habibi_chat_history", JSON.stringify(validMsgs));
          return validMsgs;
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(cleaner);
  }, []);

  // 3. النزول لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 4. إرسال الرسالة
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msg = input;
    setInput(""); 

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, sender: senderName }),
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sora">
      {/* نافذة الشات */}
      {isOpen && (
        <div className="mb-4 w-[320px] bg-[#0f111a]/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* الهيدر مع العداد */}
          <div className="bg-gradient-to-r from-emerald-900/80 to-gray-900/80 p-3.5 border-b border-emerald-500/20 flex justify-between items-center shadow-sm">
            <div>
              <h3 className="text-emerald-300 font-bold text-sm tracking-wide">Habibi Chat</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium">{onlineCount} Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full p-1.5 hover:bg-white/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {/* منطقة الرسائل */}
          <div className="h-[300px] overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <span className="text-3xl mb-2">👋</span>
                <p className="text-gray-400 text-xs">No one is talking right now.<br/>Be the first to say hi!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender === senderName;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <span className="text-[10px] text-gray-500 mb-1 px-1 font-medium tracking-wider">
                      {isMe ? 'You' : msg.sender} <span className="opacity-50 mx-1">•</span> {msg.time}
                    </span>
                    <div className={`px-3.5 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-sm break-words ${
                      isMe 
                        ? 'bg-emerald-600/90 text-white rounded-br-sm border border-emerald-500/30' 
                        : 'bg-gray-800/90 text-gray-100 rounded-bl-sm border border-gray-700/50'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* حقل الإدخال */}
          <form onSubmit={sendMessage} className="p-3 bg-gray-900/80 border-t border-emerald-500/20 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-950/50 text-white text-xs rounded-xl px-4 outline-none border border-gray-700/50 focus:border-emerald-500/50 focus:bg-gray-950 transition-all placeholder:text-gray-600"
            />
            {/* التعديل هنا: التوسيط الدقيق للأيقونة */}
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white w-9 h-9 rounded-xl transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95 flex items-center justify-center">
              <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      )}

      {/* الزر العائم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 ml-auto group relative"
      >
        <span className="text-2xl transition-transform group-hover:scale-110">
          {isOpen ? '💬' : '💭'}
        </span>
        {/* التعديل هنا: العداد الذكي للإشعارات */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative flex justify-center items-center rounded-full h-5 w-5 bg-red-500 border-2 border-gray-900 text-[9px] text-white font-bold">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* ستايل الـ Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
      `}</style>
    </div>
  );
}