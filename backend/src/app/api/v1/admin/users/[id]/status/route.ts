import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok, parseBody } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  status: z.enum(["aktif", "diblokir", "active", "suspended"]),
  reason: z.string().max(300).optional()
});

export const PATCH = withAuth(
  async (req, user, ctx) => {
    const id = await idParam(ctx);
    const body = await parseBody(req, schema);
    const normalizedStatus =
      body.status === "diblokir" || body.status === "suspended" ? "diblokir" : "aktif";
    const updated = await adminRepository.setUserStatus(id, normalizedStatus);
    await adminRepository.audit(
      user.id,
      `user.${normalizedStatus}`,
      "profiles",
      id,
      body.reason ?? `Status diubah menjadi ${normalizedStatus}`
    );
    return ok(req, updated);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
