import { z } from "zod";

export const CitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Nama kota minimal 2 karakter"),
  province: z.string().min(2, "Nama provinsi minimal 2 karakter"),
  createdAt: z.string().datetime().optional(),
});

export type City = z.infer<typeof CitySchema>;

export const FacilitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Nama fasilitas minimal 2 karakter"),
  icon: z.string().min(2, "Kode ikon fasilitas wajib diisi"),
  createdAt: z.string().datetime().optional(),
});

export type Facility = z.infer<typeof FacilitySchema>;

export const FieldTypeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2, "Kode jenis lapangan wajib diisi"), // e.g. futsal_vinyl, mini_soccer
  name: z.string().min(2, "Nama jenis lapangan wajib diisi"), // e.g. Futsal Vinyl, Mini Soccer
  createdAt: z.string().datetime().optional(),
});

export type FieldType = z.infer<typeof FieldTypeSchema>;
