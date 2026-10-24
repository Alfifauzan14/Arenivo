import { supabaseAdmin } from "../../lib/supabase";
import { AppError, ErrorCode } from "@futsal/shared";

export const promosRepository = {
  /** Validasi kode promo terhadap subtotal & venue; mengembalikan estimasi diskon */
  async validate(code: string, venueId: string, subtotal: number) {
    const { data } = await supabaseAdmin
      .from("promos").select("*").ilike("code", code.trim()).eq("is_active", true).maybeSingle();
    const p = data as any;
    const now = Date.now();
    const valid =
      p &&
      now >= new Date(p.start_date).getTime() &&
      now <= new Date(p.end_date).getTime() &&
      (p.quota === 0 || p.used_count < p.quota) &&
      (p.venue_id == null || p.venue_id === venueId) &&
      subtotal >= p.min_spend;
    if (!valid) throw new AppError(ErrorCode.PROMO_INVALID, "Kode promo tidak valid atau syarat belum terpenuhi.");

    const raw = p.discount_type === "fixed" ? p.discount_value : Math.round((subtotal * p.discount_value) / 100);
    const discount = Math.min(raw, p.max_discount ?? Number.MAX_SAFE_INTEGER, subtotal);
    return { code: p.code, discountType: p.discount_type, discountValue: p.discount_value, discount, isGlobal: p.venue_id == null };
  },
};
