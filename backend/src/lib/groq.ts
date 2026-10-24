import { env } from "../config/env";
import type { ChatMessageContext } from "./gemini";

export class GroqService {
  private apiKey = env.GROQ_API_KEY;

  async generateReply(prompt: string, contextHistory: ChatMessageContext[] = []): Promise<string> {
    if (!this.apiKey) {
      return (
        "Halo! Saya asisten virtual Groq Booking Lapangan (mode pengujian). " +
        "Silakan jelajahi lapangan futsal dan mini soccer favorit Anda."
      );
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            ...contextHistory.map((m) => ({
              role: m.role === "model" ? "assistant" : m.role,
              content: m.content,
            })),
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Groq API error ${res.statusText}`);
      }

      const data = await res.json();
      return (
        data.choices?.[0]?.message?.content ||
        "Maaf, saat ini saya tidak dapat menjawab pertanyaan Anda."
      );
    } catch (err) {
      console.error("[Groq Error]:", err);
      throw err;
    }
  }
}

export const groqService = new GroqService();
