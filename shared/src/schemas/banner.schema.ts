import { z } from "zod";

export const BannerSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2, "Judul banner wajib diisi"),
  imageUrl: z.string().url("URL gambar banner tidak valid"),
  linkUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Banner = z.infer<typeof BannerSchema>;
