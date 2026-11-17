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

      const candidateModels = ["gemini-3.5-flash", "gemini-3.8-flash"];
      let lastError: unknown = null;

      for (const model of candidateModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
              signal: AbortSignal.timeout(14000),
            }
          );

          if (!res.ok) {
            const errBody = await res.text();
            lastError = new Error(`Gemini API [${model}] error [${res.status}]: ${errBody}`);
            continue;
          }

          const data = await res.json();
          const parts: Array<{ text?: string; thought?: boolean }> =
            data.candidates?.[0]?.content?.parts || [];
          const text = parts
            .filter((p) => !p.thought && typeof p.text === "string")
            .map((p) => p.text)
            .join("")
            .trim();

          if (text) {
            return text;
          }

          lastError = new Error(`Gemini API [${model}] returned empty text`);
        } catch (modelErr) {
          lastError = modelErr;
        }
      }

      throw lastError ?? new Error("All Gemini models failed");
    } catch (err) {
      console.error("[Gemini Error]:", err);
      throw err;
    }
  }
}

export const geminiService = new GeminiService();
