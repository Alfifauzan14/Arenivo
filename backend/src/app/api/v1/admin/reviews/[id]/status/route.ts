import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, idParam, ok, parseBody } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  isVisible: z.boolean(),
  reason: z.string().max(300).optional()
});

export const PATCH = withAuth(
  async (req, user, ctx) => {
    const id = await idParam(ctx);
    const body = await parseBody(req, schema);

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .update({ is_visible: body.isVisible })
      .eq("id", id)
      .select("*")
      .single();
    dbError(error);

    await adminRepository.audit(
      user.id,
      body.isVisible ? "review.show" : "review.hide",
      "reviews",
      id,
      body.reason ?? `Moderasi ulasan is_visible=${body.isVisible}`
    );

    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.ADMIN] }
);
