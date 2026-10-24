import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, meta, ok, pagination } from "@/lib/http";

export const OPTIONS = handleOptions;

export const GET = withAuth(
  async (req) => {
    const { page, limit, from, to, url } = pagination(req);
    const status = url.searchParams.get("status");

    let q = supabaseAdmin
      .from("payments")
      .select("*, bookings(id, booking_code, customer_name, total_price, status, venues(name))", {
        count: "exact"
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) q = q.eq("status", status);
    const { data, error, count } = await q;
    dbError(error);
    return ok(req, camelize(data ?? []), meta(page, limit, count ?? 0));
  },
  { allowedRoles: [UserRole.ADMIN] }
);
