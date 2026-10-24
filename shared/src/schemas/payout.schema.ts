import { z } from "zod";
import { PayoutStatus } from "../constants/enums";

export const PayoutSchema = z.object({
  id: z.string().uuid(),
  mitraId: z.string().uuid(),
  amount: z.number().int().min(100000, "Penarikan minimal Rp100.000"),
  status: z.enum([
    PayoutStatus.MENUNGGU,
    PayoutStatus.DISETUJUI,
    PayoutStatus.DIPROSES,
    PayoutStatus.SELESAI,
    PayoutStatus.DITOLAK,
  ]),
  bankName: z.string(),
  bankAccountNumber: z.string(),
  bankAccountHolder: z.string(),
  notes: z.string().nullable().optional(),
  transferReference: z.string().nullable().optional(),
  approvedBy: z.string().uuid().nullable().optional(),
  approvedAt: z.string().datetime().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Payout = z.infer<typeof PayoutSchema>;

export const MitraBalanceSchema = z.object({
  mitraId: z.string().uuid(),
  saldoTotal: z.number().int(),
  saldoTertahan: z.number().int(),
  saldoBisaDicairkan: z.number().int(),
});

export type MitraBalance = z.infer<typeof MitraBalanceSchema>;

export const RequestPayoutInputSchema = z.object({
  amount: z.number().int().min(100000, "Penarikan minimal Rp100.000"),
  notes: z.string().optional(),
});

export type RequestPayoutInput = z.infer<typeof RequestPayoutInputSchema>;
