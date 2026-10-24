import { z } from "zod";
import { RefundStatus } from "../constants/enums";

export const RefundSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  paymentId: z.string().uuid().nullable().optional(),
  amount: z.number().int().min(0),
  refundPercent: z.number().int().min(0).max(100),
  status: z.enum([
    RefundStatus.DIAJUKAN,
    RefundStatus.DISETUJUI,
    RefundStatus.DIPROSES,
    RefundStatus.SELESAI,
    RefundStatus.DITOLAK,
  ]),
  reason: z.string().min(3),
  midtransRefundKey: z.string().nullable().optional(),
  requestedBy: z.string().uuid(),
  processedBy: z.string().uuid().nullable().optional(),
  processedAt: z.string().datetime().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Refund = z.infer<typeof RefundSchema>;

export const RefundPreviewSchema = z.object({
  eligible: z.boolean(),
  refundPercent: z.number().int().min(0).max(100),
  estimatedAmount: z.number().int().min(0),
  hoursBeforePlay: z.number(),
  explanation: z.string(),
});

export type RefundPreview = z.infer<typeof RefundPreviewSchema>;
