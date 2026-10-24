import { z } from "zod";
import { BookingStatus, BookingSource } from "../constants/enums";
import { VenueSchema } from "./venue.schema";
import { FieldSchema } from "./field.schema";

export const BookingSchema = z.object({
  id: z.string().uuid(),
  bookingCode: z.string().min(5), // e.g. "FB-8K2M4Q"
  userId: z.string().uuid().nullable().optional(),
  customerName: z.string().min(2, "Nama pemesan minimal 2 karakter"),
  customerPhone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  fieldId: z.string().uuid(),
  venueId: z.string().uuid(),
  playStart: z.string().datetime(),
  playEnd: z.string().datetime(),
  totalHours: z.number().int().min(1),
  source: z.enum([BookingSource.ONLINE, BookingSource.MANUAL]),
  status: z.enum([
    BookingStatus.MENUNGGU_BAYAR,
    BookingStatus.DIKONFIRMASI,
    BookingStatus.DIGUNAKAN,
    BookingStatus.SELESAI,
    BookingStatus.KEDALUWARSA,
    BookingStatus.DIBATALKAN,
  ]),
  subtotal: z.number().int().min(0),
  serviceFee: z.number().int().min(0),
  discount: z.number().int().min(0).default(0),
  totalPrice: z.number().int().min(0),
  commissionRate: z.number().min(0).max(1).default(0.1),
  platformCommission: z.number().int().min(0),
  mitraAmount: z.number().int().min(0),
  expiresAt: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
  cancelledBy: z.string().uuid().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),
  cancelReason: z.string().nullable().optional(),
  rescheduleCount: z.number().int().default(0).optional(),
  idempotencyKey: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  // Relasi yang disertakan saat query
  venue: VenueSchema.optional(),
  field: FieldSchema.optional(),
});

export type Booking = z.infer<typeof BookingSchema>;

export const CreateBookingInputSchema = z.object({
  fieldId: z.string().uuid("ID lapangan tidak valid"),
  customerName: z.string().min(2, "Nama pemesan wajib diisi"),
  customerPhone: z.string().min(9, "Nomor WhatsApp/HP minimal 9 digit"),
  slotStarts: z.array(z.string().datetime({ offset: true })).min(1, "Pilih minimal 1 jam slot bermain"),
  promoCode: z.string().optional(),
  notes: z.string().max(250, "Catatan maksimal 250 karakter").optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>;

export const ManualBookingInputSchema = z.object({
  fieldId: z.string().uuid(),
  customerName: z.string().min(2, "Nama penyewa walk-in wajib diisi"),
  customerPhone: z.string().min(9, "Nomor telepon penyewa wajib diisi"),
  slotStarts: z.array(z.string().datetime({ offset: true })).min(1, "Pilih minimal 1 slot"),
  notes: z.string().optional(),
});

export type ManualBookingInput = z.infer<typeof ManualBookingInputSchema>;

export const CancelBookingInputSchema = z.object({
  reason: z.string().min(5, "Alasan pembatalan minimal 5 karakter"),
});

export type CancelBookingInput = z.infer<typeof CancelBookingInputSchema>;

export const RescheduleBookingInputSchema = z.object({
  newSlotStarts: z.array(z.string().datetime({ offset: true })).min(1, "Pilih slot jadwal baru"),
});

export type RescheduleBookingInput = z.infer<typeof RescheduleBookingInputSchema>;
