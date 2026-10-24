import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError } from "@/lib/http";
import { geminiService } from "@/lib/gemini";

interface ChatInput {
  sessionId?: string;
  userId?: string | null;
  message: string;
  citySlug?: string;
}

export const chatbotService = {
  async sendMessage(input: ChatInput) {
    let sessionId = input.sessionId;
    if (!sessionId) {
      const { data: session, error: sessionErr } = await supabaseAdmin
        .from("chat_sessions")
        .insert({
          user_id: input.userId ?? null
        })
        .select("id")
        .single();
      dbError(sessionErr);
      sessionId = session!.id;
    }

    await supabaseAdmin.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: input.message
    });

    const { data: venues } = await supabaseAdmin
      .from("venues")
      .select(
        "id, slug, name, address, rating_avg, review_count, cities(name), fields(id, name, base_price, field_types(name))"
      )
      .eq("status", "aktif")
      .order("rating_avg", { ascending: false })
      .limit(8);

    const { data: promos } = await supabaseAdmin
      .from("promos")
      .select("code, discount_type, discount_value, max_discount, min_spend")
      .eq("is_active", true)
      .limit(5);

    const venueContext = (venues ?? [])
      .map((v: any) => {
        const fieldsList = (v.fields ?? [])
          .map(
            (f: any) =>
              `${f.name} (Rp ${Number(f.base_price || 150000).toLocaleString("id-ID")}/jam)`
          )
          .join(", ");
        return `- ${v.name} (${v.cities?.name ?? "Indonesia"}, ★${v.rating_avg}): ${v.address}. Lapangan: ${fieldsList || "Tersedia"} [slug: ${v.slug}]`;
      })
      .join("\n");

    const promoContext = (promos ?? [])
      .map(
        (p: any) =>
          `- Kode ${p.code}: Diskon ${p.discount_type === "percent" ? `${p.discount_value}%` : `Rp ${Number(p.discount_value).toLocaleString("id-ID")}`} (min. belanja Rp ${Number(p.min_spend || 0).toLocaleString("id-ID")})`
      )
      .join("\n");

    const systemPrompt = [
      "Kamu adalah asisten AI resmi platform Arenivo (Satu Aplikasi, Banyak Arena) di Indonesia.",
      "Jawab dengan bahasa Indonesia yang ramah, ringkas, dan akurat berdasarkan data venue nyata di bawah ini.",
      "Jangan mengarang nama venue atau harga yang tidak ada di konteks.",
      "",
      "DAFTAR VENUE AKTIF:",
      venueContext || "Belum ada venue aktif.",
      "",
      "PROMO AKTIF:",
      promoContext || "Belum ada promo aktif."
    ].join("\n");

    let replyText = "";
    let usedProvider = "gemini";

    try {
      replyText = await geminiService.generateReply(input.message, {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: 450,
      });
    } catch (err) {
      console.error("[Chatbot Gemini Error]:", err);
      replyText = "";
    }

    if (!replyText) {
      usedProvider = "local-fallback";
      const topVenues = (venues ?? []).slice(0, 3);
      if (topVenues.length > 0) {
        const summary = topVenues
          .map((v: any) => {
            const minPrice = Math.min(
              ...(v.fields ?? []).map((f: any) => Number(f.base_price) || 150000)
            );
            return `• **${v.name}** (${v.cities?.name ?? "Kota"}) — mulai Rp ${minPrice.toLocaleString("id-ID")}/jam (★${v.rating_avg})`;
          })
          .join("\n");
        replyText = `Berikut rekomendasi venue terbaik yang tersedia saat ini:\n${summary}\n\nSilakan pilih venue di atas untuk melihat slot jadwal real-time dan melakukan booking instan.`;
      } else {
        replyText =
          "Halo! Saya asisten resmi Arenivo. Saya siap membantu Anda mencari lapangan futsal atau sepak bola, mengecek jadwal kosong, serta info promo aktif. Silakan sebutkan kota atau jam bermain yang Anda inginkan.";
      }
    }

    const recommendations = (venues ?? []).slice(0, 3).map((v: any) => ({
      id: v.id,
      slug: v.slug,
      name: v.name,
      city: v.cities?.name ?? "",
      ratingAvg: v.rating_avg
    }));

    const { data: savedMsg, error: saveErr } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role: "assistant",
        content: replyText
      })
      .select("*")
      .single();
    dbError(saveErr);

    return {
      sessionId,
      provider: usedProvider,
      message: camelize(savedMsg),
      recommendations
    };
  }
};
