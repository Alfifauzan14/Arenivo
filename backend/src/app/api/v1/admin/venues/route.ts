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
        "*, cities(*), mitra_profiles(*, profiles!user_id(id, full_name, email)), fields(id, name, base_price, status)"
      )
      .order("created_at", { ascending: false });

    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    dbError(error);
    return ok(req, camelize(data ?? []));
  },
  { allowedRoles: [UserRole.ADMIN] }
);
