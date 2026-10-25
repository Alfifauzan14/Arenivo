import { AppError, ErrorCode } from "@futsal/shared";
import { supabaseAdmin } from "../../lib/supabase";
import { camelize, dbError, rpc } from "../../lib/http";
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

  /** Verifikasi status pembayaran dan otomatis update tiket jika bayar sukses */
  async verifyPayment(bookingId: string, user: AuthenticatedUser) {
    const booking = await bookingsRepository.getOwned(bookingId, user.id);
    if (booking.status === "dikonfirmasi" || booking.status === "digunakan" || booking.status === "selesai") {
      return booking;
    }

    const pending = (booking.payments || []).find((p: any) => p.status === "pending" || p.status === "berhasil");
    if (!pending) {
      return booking;
    }

    try {
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
      const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
      const url = `${midtrans.getApiBaseUrl()}/${pending.midtransOrderId}/status`;
      const res = await fetch(url, { headers: { Authorization: authHeader, Accept: "application/json" } });
      if (res.ok) {
        const json = await res.json();
        const status = json.transaction_status;
        const paid = status === "settlement" || (status === "capture" && json.fraud_status !== "challenge");
        if (paid) {
          await rpc("confirm_payment", {
            p_order_id: pending.midtransOrderId,
            p_transaction_id: json.transaction_id ?? null,
            p_payment_type: json.payment_type ?? null,
            p_raw: json,
          });
          return await bookingsRepository.getOwned(bookingId, user.id);
        }
      }
    } catch (err) {
      console.warn("[verifyPayment] Status check to Midtrans API:", err);
    }

    // Dev/Sandbox simulation fallback jika dipanggil setelah pembayaran snap di frontend
    if (process.env.NODE_ENV !== "production") {
      try {
        await rpc("confirm_payment", {
          p_order_id: pending.midtransOrderId,
          p_transaction_id: `SIM-${Date.now()}`,
          p_payment_type: "sandbox_qris",
          p_raw: { simulated: true },
        });
        return await bookingsRepository.getOwned(bookingId, user.id);
      } catch (err) {
        console.warn("[verifyPayment] Simulation fallback:", err);
      }
    }

    return booking;
  },

  async getPaymentsByBooking(bookingId: string) {
    const { data } = await supabaseAdmin.from("payments").select("*").eq("booking_id", bookingId);
    return camelize<any[]>(data || []);
  },
};
