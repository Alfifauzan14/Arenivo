import { env } from "../config/env";

export interface ChatMessageContext {
  role: "user" | "model" | "assistant" | "system";
  content: string;
}

export class GeminiService {
  private getApiKey(): string | undefined {
    return env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  }

  async generateReply(
    prompt: string,
    options?: {
      systemInstruction?: string;
      contextHistory?: ChatMessageContext[];
      temperature?: number;
      maxOutputTokens?: number;
    }
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return (
        "Halo! Saya asisten virtual Booking Lapangan. Untuk saat ini layanan AI sedang dalam mode simulasi. " +
        "Anda dapat mencari lapangan di menu Katalog atau melihat ketersediaan jadwal langsung."
      );
    }

    try {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (options?.contextHistory && options.contextHistory.length > 0) {
        for (const m of options.contextHistory) {
          contents.push({
            role: m.role === "assistant" ? "model" : m.role,
            parts: [{ text: m.content }],
          });
        }
      }

      const userText = options?.systemInstruction
        ? `${options.systemInstruction}\n\nPertanyaan pengguna: ${prompt}`
        : prompt;

      contents.push({
        role: "user",
        parts: [{ text: userText }],
      });

      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: options?.temperature ?? 0.3,
              maxOutputTokens: options?.maxOutputTokens ?? 450,
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          }),
          signal: AbortSignal.timeout(8000),
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Gemini API error [${res.status}]: ${errBody}`);
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
