import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok, parseBody } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  reason: z.string().min(3).max(300).optional()
});

export const POST = withAuth(
  async (req, user, ctx) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const id = await idParam(ctx);
    const body = await parseBody(req, schema);
    await mitraRepository.assertBookingOwned(mitraId, id);
    const res = await bookingsRepository.cancel(
      id,
      user.id,
      "mitra",
      body.reason ?? "Dibatalkan oleh Mitra"
    );
    return ok(req, res);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
