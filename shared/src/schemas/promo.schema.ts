import { z } from "zod";

export const PromoSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().int().min(1),
  minSpend: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().nullable().optional(),
  quota: z.number().int().min(1),
  usedCount: z.number().int().min(0).default(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  venueId: z.string().uuid().nullable().optional(), // null = promo global platform
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Promo = z.infer<typeof PromoSchema>;

export const ValidatePromoInputSchema = z.object({
  code: z.string().min(3, "Kode promo minimal 3 karakter"),
  venueId: z.string().uuid(),
  subtotal: z.number().int().min(0),
});

export type ValidatePromoInput = z.infer<typeof ValidatePromoInputSchema>;

export const PromoValidationResultSchema = z.object({
  valid: z.boolean(),
  promo: PromoSchema.optional(),
  discountAmount: z.number().int(),
  finalSubtotal: z.number().int(),
  message: z.string(),
});

export type PromoValidationResult = z.infer<typeof PromoValidationResultSchema>;
