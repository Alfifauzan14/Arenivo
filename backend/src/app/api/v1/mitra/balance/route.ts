import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { ok } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const balance = await mitraRepository.balance(mitraId);
    return ok(req, balance);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);
