import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok, parseBody } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  reason: z.string().min(3).max(500)
});

export const POST = withAuth(
  async (req, user, ctx) => {
    const id = await idParam(ctx);
    const body = await parseBody(req, schema);
    const updated = await adminRepository.setMitraVerification(
      id,
      user.id,
      "ditolak",
      body.reason
    );
    await adminRepository.audit(user.id, "mitra.reject", "mitra_profiles", id, body.reason);
    return ok(req, updated);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
