import * as React from "react";
import { useLocation } from "react-router-dom";
import { Bot, MessageSquare, Send, Sparkles, X, User } from "lucide-react";
import { MOCK_VENUES } from "@/lib/mock-data";
import { formatRupiah } from "@futsal/shared";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export function ChatbotWidget() {
  const location = useLocation();
  const isVenueDetail = location.pathname.startsWith("/venues/") && location.pathname !== "/venues";

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "bot",
      text: "Halo! Saya Asisten AI Arenivo. Ada yang bisa saya bantu terkait rekomendasi arena futsal/mini soccer, cek slot jadwal, atau info promo hari ini?",
      time: "Baru saja",
    },
  ]);

  const quickReplies = [
    "Rekomendasi lapangan futsal malam ini",
    "Cek aturan refund & pembatalan",
    "Cara reschedule jadwal booking",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 1. Coba panggil Live API Google Gemini Flash di Backend
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
      const res = await fetch(`${baseUrl}/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const json = await res.json();
        const reply = json.data?.message || json.data?.text || json.data?.reply;
        if (reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: "bot",
              text: reply,
              time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          setIsTyping(false);
          return;
        }
      }
    } catch {
      // Fallback lokal jika backend tidak terjangkau
    }

    // 2. Fallback cerdas lokal berdasarkan knowledge base PRD
    setTimeout(() => {
      let botReply = "";

      const lower = text.toLowerCase();
      if (lower.includes("rekomendasi") || lower.includes("malam")) {
        const v1 = MOCK_VENUES[0];
        const v2 = MOCK_VENUES[1];
        botReply = `Berikut rekomendasi lapangan terbaik untuk main malam ini:
1. **${v1.name}** (${v1.city?.name}) — Mulai ${formatRupiah(v1.startingPrice || 175000)}/jam. Lantai Vinyl Gerflor empuk & lampu sorot LED HD.
2. **${v2.name}** (${v2.city?.name}) — Mulai ${formatRupiah(v2.startingPrice || 200000)}/jam. Mini soccer outdoor rumput monofilament tebal.

Anda dapat langsung klik nama venue untuk mengecek slot kosong jam 19.00 - 22.00!`;
      } else if (lower.includes("refund") || lower.includes("batal")) {
        botReply = `Kebijakan pengembalian dana (Refund) resmi:
• **> 24 Jam sebelum main:** Refund 100% dari harga sewa.
• **6 s.d. 24 Jam sebelum main:** Refund 50%.
• **< 6 Jam sebelum main:** Refund 0% (tidak dapat dikembalikan).
*Catatan:* Jika pembatalan dilakukan sepihak oleh Mitra, dana dikembalikan 100% penuh termasuk biaya layanan.`;
      } else if (lower.includes("reschedule") || lower.includes("ganti jadwal")) {
        botReply = `Syarat pengajuan Reschedule:
1. Hanya berlaku untuk booking berstatus **Dikonfirmasi**.
2. Wajib diajukan **minimal 24 jam sebelum jam mulai bermain**.
3. Maksimal reschedule **1 kali** per booking ke slot kosong dengan total harga sepadan.`;
      } else {
        botReply = `Terima kasih atas pertanyaannya! Anda dapat mencari lapangan berdasarkan kota atau fasilitas di menu **Cari Lapangan**, lalu memilih slot jam yang diinginkan. Butuh bantuan lain?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div
      className={cn(
        "fixed right-4 sm:right-6 pb-safe z-40 select-none transition-all duration-200",
        isVenueDetail && !isOpen ? "bottom-20 sm:bottom-6" : "bottom-4 sm:bottom-6"
      )}
    >
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg p-3 sm:px-4 sm:py-3 shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-semibold text-xs sm:text-sm group min-touch-target cursor-pointer border border-red-700/20"
          aria-label="Tanya Asisten AI"
          title="Tanya Asisten AI"
        >
          <div className="relative">
            <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
          </div>
          <span className="hidden sm:inline">Tanya Asisten AI</span>
        </button>
      )}

      {/* Chat Window Panel - Fluid adaptive height to prevent landscape overflow */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-96 h-[min(500px,calc(100vh-100px))] max-h-[85vh] bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 z-50">
          {/* Header */}
          <div className="bg-red-700 text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Asisten AI Arenivo
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h4>
                <p className="text-[10px] text-red-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Google Gemini Flash AI
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-red-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold",
                    m.sender === "user" ? "bg-slate-700" : "bg-red-600"
                  )}
                >
                  {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={cn(
                    "p-3 rounded-xl shadow-xs whitespace-pre-line leading-relaxed",
                    m.sender === "user"
                      ? "bg-red-600 text-white rounded-tr-none font-medium"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                  )}
                >
                  {m.text}
                  <span
                    className={cn(
                      "block text-[9px] mt-1 text-right",
                      m.sender === "user" ? "text-red-200" : "text-slate-400"
                    )}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 mr-auto">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 p-2.5 rounded-xl rounded-tl-none flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            {quickReplies.map((qr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(qr)}
                className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 border border-red-200/70 cursor-pointer"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tanyakan jadwal atau rekomendasi..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-600 shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
