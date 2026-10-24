import { z } from "zod";
import { TicketStatus, TicketScanResult } from "../constants/enums";
import { BookingSchema } from "./booking.schema";

export const TicketSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  ticketCode: z.string().min(6), // Isi QR e.g. "TKT-FB-8K2M4Q-9A2"
  status: z.enum([TicketStatus.AKTIF, TicketStatus.DIGUNAKAN, TicketStatus.DIBATALKAN]),
  issuedAt: z.string().datetime().optional(),
  usedAt: z.string().datetime().nullable().optional(),
  checkedInBy: z.string().uuid().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  // Relasi opsional
  booking: BookingSchema.optional(),
});

export type Ticket = z.infer<typeof TicketSchema>;

export const TicketScanSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid().nullable().optional(),
  scannedCode: z.string(),
  venueId: z.string().uuid(),
  scannedBy: z.string().uuid(),
  result: z.enum([
    TicketScanResult.SAH,
    TicketScanResult.SUDAH_DIPAKAI,
    TicketScanResult.BELUM_DIBAYAR,
    TicketScanResult.SALAH_WAKTU,
    TicketScanResult.SALAH_VENUE,
    TicketScanResult.DIBATALKAN,
    TicketScanResult.TIDAK_DITEMUKAN,
  ]),
  scannedAt: z.string().datetime().optional(),

  // Data pendukung saat scan sukses
  ticket: TicketSchema.optional(),
});

export type TicketScan = z.infer<typeof TicketScanSchema>;

export const ValidateTicketInputSchema = z.object({
  venueId: z.string().uuid("Pilih venue aktif untuk memvalidasi tiket"),
  ticketCode: z.string().min(3, "Kode tiket atau QR tidak boleh kosong"),
});

export type ValidateTicketInput = z.infer<typeof ValidateTicketInputSchema>;

export const ValidateTicketResultSchema = z.object({
  result: z.enum([
    TicketScanResult.SAH,
    TicketScanResult.SUDAH_DIPAKAI,
    TicketScanResult.BELUM_DIBAYAR,
    TicketScanResult.SALAH_WAKTU,
    TicketScanResult.SALAH_VENUE,
    TicketScanResult.DIBATALKAN,
    TicketScanResult.TIDAK_DITEMUKAN,
  ]),
  message: z.string(),
  ticket: TicketSchema.optional(),
  customerName: z.string().optional(),
  fieldName: z.string().optional(),
  venueName: z.string().optional(),
  playStart: z.string().optional(),
  playEnd: z.string().optional(),
  scannedAt: z.string().datetime(),
});

export type ValidateTicketResult = z.infer<typeof ValidateTicketResultSchema>;
