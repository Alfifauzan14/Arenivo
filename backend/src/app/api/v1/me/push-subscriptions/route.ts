import { z } from "zod";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const schema = z.object({
  token: z.string().min(10)
});

export const POST = withAuth(async (req, user) => {
  const body = await parseBody(req, schema);
  const { data, error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        token: body.token
      },
      { onConflict: "token" }
    )
    .select("*")
    .single();
  dbError(error);
  return ok(req, camelize(data), undefined, 201);
});

export const DELETE = withAuth(async (req, user) => {
  const body = await parseBody(req, schema);
  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("token", body.token);
  dbError(error);
  return ok(req, { deleted: true });
});
