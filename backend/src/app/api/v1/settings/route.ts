import { publicRoute, ok } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";

export const OPTIONS = handleOptions;

/**
 * Endpoint publik untuk membaca setting yang boleh ditampilkan ke penyewa.
 * Hanya expose key tertentu (faq, hero_slides) — bukan semua system_settings.
 */
export const GET = publicRoute(async (req) => {
  const { data, error } = await supabaseAdmin
    .from("system_settings")
    .select("key, value")
    .in("key", ["faq", "hero_slides"]);

  if (error) {
    return ok(req, {});
  }

  const result: Record<string, unknown> = {};
  for (const row of data || []) {
    result[row.key] = row.value;
  }
  return ok(req, result);
});
