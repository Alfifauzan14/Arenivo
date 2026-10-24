import { env } from "../config/env";

export interface ChatMessageContext {
  role: "user" | "model" | "assistant" | "system";
  content: string;
}

export class GeminiService {
  private apiKey = env.GEMINI_API_KEY;

  async generateReply(prompt: string, contextHistory: ChatMessageContext[] = []): Promise<string> {
    if (!this.apiKey) {
      return (
        "Halo! Saya asisten virtual Booking Lapangan. Untuk saat ini layanan AI sedang dalam mode simulasi. " +
        "Anda dapat mencari lapangan di menu Katalog atau melihat ketersediaan jadwal langsung."
      );
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              ...contextHistory.map((m) => ({
                role: m.role === "assistant" ? "model" : m.role,
                parts: [{ text: m.content }],
              })),
              { role: "user", parts: [{ text: prompt }] },
            ],
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Gemini API error ${res.statusText}`);
      }

      const data = await res.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Maaf, saat ini saya tidak dapat menjawab pesan Anda."
      );
    } catch (err) {
      console.error("[Gemini Error]:", err);
      throw err;
    }
  }
}

export const geminiService = new GeminiService();
