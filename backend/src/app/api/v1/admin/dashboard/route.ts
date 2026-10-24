import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { ok } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(
  async (req) => {
    const data = await adminRepository.dashboard();
    return ok(req, data);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
