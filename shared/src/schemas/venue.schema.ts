import { z } from "zod";
import { VenueStatus } from "../constants/enums";
import { CitySchema, FacilitySchema } from "./master.schema";

export const VenuePhotoSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  url: z.string().url("URL foto venue tidak valid"),
  sortOrder: z.number().int().default(0),
  isCover: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
});

export type VenuePhoto = z.infer<typeof VenuePhotoSchema>;

export const RefundRuleSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid().nullable().optional(),
  minHoursBefore: z.number().int().min(0),
  refundPercent: z.number().int().min(0).max(100),
  createdAt: z.string().datetime().optional(),
});

export type RefundRule = z.infer<typeof RefundRuleSchema>;

export const VenueSchema = z.object({
  id: z.string().uuid(),
  mitraId: z.string().uuid(),
  cityId: z.string().uuid(),
  name: z.string().min(3, "Nama venue minimal 3 karakter"),
  slug: z.string().min(3),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  youtubeUrl: z.string().url("URL YouTube tidak valid").nullable().optional(),
  rules: z.string().nullable().optional(),
  status: z.enum([VenueStatus.AKTIF, VenueStatus.NONAKTIF, VenueStatus.DIBLOKIR]),
  ratingAvg: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  // Relasi opsional yang disertakan saat query
  city: CitySchema.optional(),
  photos: z.array(VenuePhotoSchema).optional(),
  facilities: z.array(FacilitySchema).optional(),
  refundRules: z.array(RefundRuleSchema).optional(),
  startingPrice: z.number().int().optional(),
});

export type Venue = z.infer<typeof VenueSchema>;

export const CreateVenueInputSchema = z.object({
  cityId: z.string().uuid("Pilih kota yang valid"),
  name: z.string().min(3, "Nama venue minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  address: z.string().min(5, "Alamat lengkap wajib diisi"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  youtubeUrl: z.string().url("URL YouTube tidak valid").optional().or(z.literal("")),
  rules: z.string().optional(),
  facilityIds: z.array(z.string().uuid()).min(1, "Pilih minimal 1 fasilitas"),
});

export type CreateVenueInput = z.infer<typeof CreateVenueInputSchema>;
