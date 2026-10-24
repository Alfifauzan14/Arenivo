import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { meta, ok, pagination } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const { page, limit, from, to } = pagination(req);
    const { rows, total } = await mitraRepository.checkIns(mitraId, from, to);
    return ok(req, rows, meta(page, limit, total));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);
