import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok } from "@/lib/http";

export const OPTIONS = handleOptions;

export const GET = withAuth(
  async (req) => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    let q = supabaseAdmin
      .from("venues")
      .select(
        "*, city:cities(*), mitra:mitra_profiles(*, profile:profiles!mitra_profiles_user_id_fkey(id, full_name, email)), fields(id, name, base_price, status)"
      )
      .order("created_at", { ascending: false });

    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    dbError(error);
    const rows = camelize<any[]>(data ?? []).map((v: any) => {
      const prices = Array.isArray(v.fields) ? v.fields.map((f: any) => Number(f.basePrice || 0)).filter((p: number) => p > 0) : [];
      return {
        ...v,
        startingPrice: v.startingPrice ?? (prices.length > 0 ? Math.min(...prices) : 0),
      };
    });
    return ok(req, rows);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
