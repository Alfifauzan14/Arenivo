import { AppError, ErrorCode, CreateBookingInputSchema } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { ok, parseBody, pagination, meta } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { pusherService } from "@/lib/pusher";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;
const PENYEWA = { allowedRoles: ["penyewa" as const] };

export const GET = withAuth(async (req, user) => {
  const { page, limit, from, to, url } = pagination(req);
  const { rows, total } = await bookingsRepository.listByUser(user.id, url.searchParams.get("status") || undefined, from, to);
  return ok(req, rows, meta(page, limit, total));
}, PENYEWA);

/** Wajib header Idempotency-Key (PRD 7.2) */
export const POST = withAuth(async (req, user) => {
  const key = req.headers.get("idempotency-key");
  if (!key) throw new AppError(ErrorCode.VALIDATION_ERROR, "Header Idempotency-Key wajib disertakan.");

  const input = await parseBody(req, CreateBookingInputSchema);
  const booking = await bookingsRepository.create(user.id, input, key);
  await pusherService.notifySlotUpdated(input.fieldId, { bookingId: booking.id, status: booking.status });
  return ok(req, booking, undefined, 201);
}, PENYEWA);
