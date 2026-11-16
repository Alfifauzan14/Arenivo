import { publicRoute, ok } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError } from "@/lib/http";

export const OPTIONS = handleOptions;

export const GET = publicRoute(async (req) => {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("promos")
    .select("*, venue:venues(id, name, slug, address)")
    .eq("is_active", true)
    .gte("end_date", nowIso)
    .order("created_at", { ascending: false });

  dbError(error);
  const rows = camelize<any[]>(data || []).filter(
    (p: any) => !p.quota || Number(p.usedCount || 0) < Number(p.quota)
  );
  return ok(req, rows);
});
