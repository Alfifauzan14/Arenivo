import { z } from "zod";
import { PaymentStatus } from "../constants/enums";

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  midtransOrderId: z.string(),
  midtransTransactionId: z.string().nullable().optional(),
  paymentType: z.string().nullable().optional(), // qris, gopay, bca_va, bank_transfer, credit_card
  grossAmount: z.number().int().min(0),
  status: z.enum([
    PaymentStatus.PENDING,
    PaymentStatus.BERHASIL,
    PaymentStatus.GAGAL,
    PaymentStatus.KEDALUWARSA,
  ]),
  snapToken: z.string().nullable().optional(),
  paidAt: z.string().datetime().nullable().optional(),
  rawNotification: z.record(z.any()).nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const CreatePaymentResponseSchema = z.object({
  snapToken: z.string(),
  redirectUrl: z.string().optional(),
  orderId: z.string(),
  grossAmount: z.number().int(),
});

export type CreatePaymentResponse = z.infer<typeof CreatePaymentResponseSchema>;

export const MidtransNotificationSchema = z.object({
  order_id: z.string(),
  transaction_id: z.string().optional(),
  transaction_status: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  payment_type: z.string().optional(),
  signature_key: z.string(),
  fraud_status: z.string().optional(),
  settlement_time: z.string().optional(),
});

export type MidtransNotification = z.infer<typeof MidtransNotificationSchema>;
