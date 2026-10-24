import { RescheduleBookingInputSchema } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { ok, idParam, parseBody } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { pusherService } from "@/lib/pusher";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

export const POST = withAuth(async (req, user, ctx) => {
  const { newSlotStarts } = await parseBody(req, RescheduleBookingInputSchema);
  const booking = await bookingsRepository.reschedule(await idParam(ctx), user.id, newSlotStarts);
  await pusherService.notifySlotUpdated(booking.fieldId, { bookingId: booking.id, status: booking.status });
  return ok(req, booking);
}, { allowedRoles: ["penyewa"] });
