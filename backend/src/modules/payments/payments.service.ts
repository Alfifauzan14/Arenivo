import { AppError, ErrorCode } from "@futsal/shared";
import { supabaseAdmin } from "../../lib/supabase";
import { camelize, dbError } from "../../lib/http";
import { MidtransClient } from "../../lib/midtrans";
import { bookingsRepository } from "../bookings/bookings.repository";
import type { AuthenticatedUser } from "../../middleware/auth";

const midtrans = new MidtransClient();

export const paymentsService = {
  /** Buat/lanjutkan pembayaran Snap untuk booking menunggu_bayar (P5.4, P5.7) */
  async createPayment(bookingId: string, user: AuthenticatedUser) {
    const booking = await bookingsRepository.getOwned(bookingId, user.id);

    if (booking.status !== "menunggu_bayar") {
      throw new AppError(ErrorCode.INVALID_STATUS_TRANSITION, "Pesanan ini tidak sedang menunggu pembayaran.");
    }
    if (booking.expiresAt && new Date(booking.expiresAt).getTime() <= Date.now()) {
      throw new AppError(ErrorCode.BOOKING_EXPIRED, "Batas waktu pembayaran telah habis.");
    }

    // Lanjutkan pembayaran yang masih pending
    const pending = (booking.payments || []).find((p: any) => p.status === "pending" && p.snapToken);
    if (pending) return { snapToken: pending.snapToken, orderId: pending.midtransOrderId, expiresAt: booking.expiresAt };

    const orderId = `${booking.bookingCode}-${Date.now().toString(36).toUpperCase()}`;
    const snap = await midtrans.createTransaction({
      orderId,
      grossAmount: booking.totalPrice,
      customerDetails: { firstName: booking.customerName, phone: booking.customerPhone, email: user.email },
      itemDetails: [
        { id: booking.fieldId, price: booking.subtotal, quantity: 1, name: `Sewa ${booking.field?.name || "Lapangan"} (${booking.totalHours} jam)` },
        ...(booking.serviceFee ? [{ id: "service-fee", price: booking.serviceFee, quantity: 1, name: "Biaya layanan" }] : []),
        ...(booking.discount ? [{ id: "discount", price: -booking.discount, quantity: 1, name: "Diskon promo" }] : []),
      ],
    });

    const { error } = await supabaseAdmin.from("payments").insert({
      booking_id: booking.id,
      midtrans_order_id: orderId,
      gross_amount: booking.totalPrice,
      snap_token: snap.token,
    });
    dbError(error);
    return { snapToken: snap.token, orderId, expiresAt: booking.expiresAt };
  },

  async getPaymentsByBooking(bookingId: string) {
    const { data } = await supabaseAdmin.from("payments").select("*").eq("booking_id", bookingId);
    return camelize<any[]>(data || []);
  },
};
