import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, idParam, ok, parseBody } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  status: z.enum(["aktif", "nonaktif", "diblokir", "active", "inactive", "suspended"]),
  reason: z.string().max(500).optional()
});

export const PATCH = withAuth(
  async (req, user, ctx) => {
    const id = await idParam(ctx);
    const body = await parseBody(req, schema);
    const normalized =
      body.status === "diblokir" || body.status === "suspended"
        ? "diblokir"
        : body.status === "nonaktif" || body.status === "inactive"
          ? "nonaktif"
          : "aktif";

    const { data, error } = await supabaseAdmin
      .from("venues")
      .update({ status: normalized })
      .eq("id", id)
      .select("*")
      .single();
    dbError(error);

    await adminRepository.audit(
      user.id,
      `venue.${normalized}`,
      "venues",
      id,
      body.reason ?? `Status venue diubah menjadi ${normalized}`
    );

    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.ADMIN] }
);
