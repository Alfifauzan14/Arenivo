import { z } from "zod";
import { FieldStatus } from "../constants/enums";
import { FieldTypeSchema } from "./master.schema";

export const FieldOperatingHoursSchema = z.object({
  id: z.string().uuid(),
  fieldId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6), // 0: Minggu, 1: Senin, ..., 6: Sabtu
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam buka HH:mm"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam tutup HH:mm"),
  isClosed: z.boolean().default(false),
});

export type FieldOperatingHours = z.infer<typeof FieldOperatingHoursSchema>;

export const FieldPriceRuleSchema = z.object({
  id: z.string().uuid(),
  fieldId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu mulai HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu selesai HH:mm"),
  price: z.number().int().min(10000, "Harga minimal Rp10.000"),
  priority: z.number().int().default(1),
});

export type FieldPriceRule = z.infer<typeof FieldPriceRuleSchema>;

export const FieldSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  fieldTypeId: z.string().uuid(),
  name: z.string().min(2, "Nama lapangan minimal 2 karakter"),
  sizeDescription: z.string().nullable().optional(), // contoh: "26 x 16 meter (Standar Nasional)"
  surface: z.string().nullable().optional(), // contoh: "Vinyl Gerflor 7mm" / "Rumput Sintetis Monofilament"
  basePrice: z.number().int().min(10000, "Harga dasar minimal Rp10.000"),
  status: z.enum([FieldStatus.AKTIF, FieldStatus.NONAKTIF]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  // Relasi opsional
  fieldType: FieldTypeSchema.optional(),
  operatingHours: z.array(FieldOperatingHoursSchema).optional(),
  priceRules: z.array(FieldPriceRuleSchema).optional(),
});

export type Field = z.infer<typeof FieldSchema>;

export const CreateFieldInputSchema = z.object({
  venueId: z.string().uuid(),
  fieldTypeId: z.string().uuid(),
  name: z.string().min(2, "Nama lapangan minimal 2 karakter"),
  sizeDescription: z.string().optional(),
  surface: z.string().optional(),
  basePrice: z.number().int().min(10000, "Harga dasar minimal Rp10.000"),
});

export type CreateFieldInput = z.infer<typeof CreateFieldInputSchema>;
