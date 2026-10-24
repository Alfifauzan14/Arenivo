import { z } from "zod";
import { AiProvider } from "../constants/enums";

export const SystemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.record(z.any()),
  description: z.string().nullable().optional(),
  updatedBy: z.string().uuid().nullable().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SystemSetting = z.infer<typeof SystemSettingSchema>;

export const SystemConfigSchema = z.object({
  bookingExpirationMinutes: z.number().int().min(5).max(60).default(15),
  maxBookingDaysAhead: z.number().int().min(1).max(90).default(30),
  defaultPlatformCommissionPercent: z.number().min(0).max(50).default(10),
  defaultServiceFeeRupiah: z.number().int().min(0).default(5000),
  minPayoutAmountRupiah: z.number().int().min(50000).default(100000),
  scannerEarlyCheckinMinutes: z.number().int().min(10).max(120).default(30),
  primaryAiProvider: z.literal(AiProvider.GEMINI).default(AiProvider.GEMINI),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;
