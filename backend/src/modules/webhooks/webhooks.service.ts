import { AppError, ErrorCode } from "@futsal/shared";
import { supabaseAdmin } from "../../lib/supabase";
import { rpc, dbError } from "../../lib/http";
import { MidtransClient } from "../../lib/midtrans";
import { pusherService } from "../../lib/pusher";

const midtrans = new MidtransClient();

export interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id?: string;
  payment_type?: string;
  fraud_status?: string;
}

export const webhooksService = {
  /** Proses notifikasi Midtrans secara idempotent */
  async handleMidtrans(n: MidtransNotification) {
    if (!midtrans.verifySignature(n.order_id, n.status_code, n.gross_amount, n.signature_key)) {
      throw new AppError(ErrorCode.FORBIDDEN, "Signature notifikasi tidak valid.");
    }

    const eventKey = `${n.order_id}:${n.transaction_status}:${n.status_code}`;
    const { error: evErr } = await supabaseAdmin
      .from("webhook_events")
      .insert({ event_key: eventKey, payload: n });
    if (evErr) {
      if (evErr.code === "23505") return { duplicate: true }; // sudah pernah diproses
      dbError(evErr);
    }

    const status = n.transaction_status;
    const paid = status === "settlement" || (status === "capture" && n.fraud_status !== "challenge");

    if (paid) {
      const booking = await rpc<any>("confirm_payment", {
        p_order_id: n.order_id,
        p_transaction_id: n.transaction_id ?? null,
        p_payment_type: n.payment_type ?? null,
        p_raw: n,
      });
      await pusherService.notifySlotUpdated(booking.fieldId, { bookingId: booking.id, status: booking.status });
    } else if (["expire", "cancel", "deny", "failure"].includes(status)) {
      await supabaseAdmin
        .from("payments")
        .update({ status: status === "expire" ? "kedaluwarsa" : "gagal", raw_notification: n })
        .eq("midtrans_order_id", n.order_id)
        .eq("status", "pending");
    }

    await supabaseAdmin.from("webhook_events").update({ processed: true }).eq("event_key", eventKey);
    return { duplicate: false };
  },
};
