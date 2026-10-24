import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok } from "@/lib/http";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(async (req, user, ctx) => {
  const id = await idParam(ctx);
  const booking = await bookingsRepository.getOwned(id, user.id);
  const ticket = await bookingsRepository.ticketFor(id, user.id);

  return ok(req, {
    invoiceNumber: `INV/${booking.bookingCode}`,
    issuedAt: booking.updatedAt ?? booking.createdAt,
    booking,
    ticket
  });
});
