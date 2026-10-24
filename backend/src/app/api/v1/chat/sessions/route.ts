import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok } from "@/lib/http";

export const OPTIONS = handleOptions;

export const GET = withAuth(async (req, user) => {
  const { data, error } = await supabaseAdmin
    .from("chat_sessions")
    .select("*, chat_messages(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  dbError(error);
  return ok(req, camelize(data ?? []));
});
