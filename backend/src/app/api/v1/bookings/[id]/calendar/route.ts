import { NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam } from "@/lib/http";
import { bookingsRepository } from "@/modules/bookings/bookings.repository";

export const OPTIONS = handleOptions;

function toIcsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export const GET = withAuth(async (_req, user, ctx) => {
  const id = await idParam(ctx);
  const booking = await bookingsRepository.getOwned(id, user.id);

  const venueName = booking.venue?.name ?? "Venue Futsal";
  const fieldName = booking.field?.name ?? "Lapangan";
  const address = booking.venue?.address ?? "";
  const dtStart = toIcsDate(booking.playStart ?? booking.startTime);
  const dtEnd = toIcsDate(booking.playEnd ?? booking.endTime);
  const dtStamp = toIcsDate(new Date().toISOString());

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Arenivo//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@arenivo.id`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Booking Arenivo - ${venueName} - ${fieldName} (${booking.bookingCode})`,
    `LOCATION:${address.replace(/\r?\n/g, " ")}`,
    `DESCRIPTION:Kode Booking: ${booking.bookingCode}\\nStatus: ${booking.status}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.bookingCode}.ics"`
    }
  });
});
