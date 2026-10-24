import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { ok, parseBody } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

const blockSchema = z.object({
  fieldId: z.string().uuid(),
  slotStart: z.string(),
  reason: z.string().max(300).optional()
});

export const POST = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, blockSchema);
    const created = await mitraRepository.createBlock(
      mitraId,
      user.id,
      body.fieldId,
      body.slotStart,
      body.reason ?? "Maintenance / Jadwal Internal"
    );
    return ok(req, created, undefined, 201);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
