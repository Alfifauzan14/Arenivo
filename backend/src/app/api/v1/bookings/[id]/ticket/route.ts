import { AppError, ErrorCode } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { ok, idParam } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(async (req, user, ctx) => {
  const ticket = await bookingsRepository.ticketFor(await idParam(ctx), user.id);
  if (!ticket) throw new AppError(ErrorCode.TICKET_NOT_AVAILABLE, "E-tiket belum terbit. Selesaikan pembayaran terlebih dahulu.");
  return ok(req, ticket);
}, { allowedRoles: ["penyewa"] });
