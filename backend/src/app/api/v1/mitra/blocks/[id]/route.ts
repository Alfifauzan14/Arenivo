import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

export const DELETE = withAuth(
  async (req, user, ctx) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const id = await idParam(ctx);
    const fieldId = await mitraRepository.removeBlock(mitraId, id);
    return ok(req, { id, fieldId });
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
