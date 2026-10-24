import { z } from "zod";
import { SlotStatus, ReservationType } from "../constants/enums";

/**
 * Item slot waktu untuk matriks jadwal per jam
 */
export const SlotItemSchema = z.object({
  slotStart: z.string().datetime({ offset: true }).or(z.string()),
  slotEnd: z.string().datetime({ offset: true }).or(z.string()),
  timeLabel: z.string(), // "09.00 - 10.00"
  hour: z.number().int().min(0).max(23),
  status: z.enum([
    SlotStatus.TERSEDIA,
    SlotStatus.DIKUNCI,
    SlotStatus.TERISI,
    SlotStatus.DIBLOKIR,
    SlotStatus.LEWAT,
  ]),
  price: z.number().int().min(0),
  bookingId: z.string().uuid().nullable().optional(),
  lockExpiresAt: z.string().datetime().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export type SlotItem = z.infer<typeof SlotItemSchema>;

export const SlotReservationSchema = z.object({
  id: z.string().uuid(),
  fieldId: z.string().uuid(),
  slotStart: z.string().datetime(),
  slotEnd: z.string().datetime(),
  type: z.enum([ReservationType.BOOKING, ReservationType.BLOKIR]),
  bookingId: z.string().uuid().nullable().optional(),
  price: z.number().int().min(0),
  reason: z.string().nullable().optional(),
  createdBy: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
});

export type SlotReservation = z.infer<typeof SlotReservationSchema>;

export const SlotAvailabilityQuerySchema = z.object({
  fieldId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
});

export type SlotAvailabilityQuery = z.infer<typeof SlotAvailabilityQuerySchema>;

export const BlockSlotInputSchema = z.object({
  fieldId: z.string().uuid(),
  slotStart: z.string().datetime(),
  slotEnd: z.string().datetime(),
  reason: z.string().min(3, "Alasan pemblokiran minimal 3 karakter"),
});

export type BlockSlotInput = z.infer<typeof BlockSlotInputSchema>;
