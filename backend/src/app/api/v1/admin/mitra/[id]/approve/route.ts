import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

export const POST = withAuth(
  async (req, user, ctx) => {
    const id = await idParam(ctx);
    const updated = await adminRepository.setMitraVerification(id, user.id, "disetujui");
    await adminRepository.audit(user.id, "mitra.approve", "mitra_profiles", id, "Disetujui");
    return ok(req, updated);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
