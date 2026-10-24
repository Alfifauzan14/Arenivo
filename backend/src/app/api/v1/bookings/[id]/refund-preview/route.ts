import { withAuth } from "@/middleware/auth";
import { ok, idParam } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(async (req, user, ctx) => {
  return ok(req, await bookingsRepository.refundPreview(await idParam(ctx), user.id));
}, { allowedRoles: ["penyewa"] });
