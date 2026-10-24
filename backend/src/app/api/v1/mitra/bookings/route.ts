import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { meta, ok, pagination, parseBody } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

const manualBookingSchema = z.object({
  fieldId: z.string().uuid(),
  slotStarts: z.array(z.string()).min(1),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(6).max(30),
  notes: z.string().max(500).optional()
});

export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const { page, limit, from, to, url } = pagination(req);
    const status = url.searchParams.get("status") ?? undefined;
    const date = url.searchParams.get("date") ?? undefined;
    const { rows, total } = await mitraRepository.bookings(mitraId, {
      status,
      date,
      from,
      to
    });
    return ok(req, rows, meta(page, limit, total));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);

export const POST = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, manualBookingSchema);
    await mitraRepository.assertFieldOwned(mitraId, body.fieldId);
    const booking = await bookingsRepository.createManual(user.id, {
      fieldId: body.fieldId,
      slotStarts: body.slotStarts,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      notes: body.notes
    });
    return ok(req, booking, undefined, 201);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
