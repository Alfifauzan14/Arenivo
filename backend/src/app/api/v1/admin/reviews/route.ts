import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { meta, ok, pagination } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(
  async (req) => {
    const { page, limit, from, to, url } = pagination(req, 20);
    const q = url.searchParams.get("q") || undefined;
    const { rows, total } = await adminRepository.reviews({ q, from, to });
    return ok(req, rows, meta(page, limit, total));
  },
  { allowedRoles: [UserRole.ADMIN] }
);
