import { supabaseAdmin } from "../../lib/supabase";
import { rpc, camelize, dbError, orNotFound } from "../../lib/http";
import type { CreateBookingInput } from "@futsal/shared";

const BOOKING_SELECT = `*, venue:venues(id, name, slug, address), field:fields(id, name, base_price)`;

export const bookingsRepository = {
  create(userId: string, input: CreateBookingInput, idempotencyKey: string) {
    return rpc("create_booking", {
      p_user_id: userId,
      p_field_id: input.fieldId,
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_slot_starts: input.slotStarts,
      p_promo_code: input.promoCode ?? null,
      p_notes: input.notes ?? null,
      p_idempotency_key: idempotencyKey,
      p_source: "online",
      p_created_by: userId,
    });
  },

  createManual(mitraUserId: string, input: { fieldId: string; customerName: string; customerPhone: string; slotStarts: string[]; notes?: string }) {
    return rpc("create_booking", {
      p_user_id: null,
      p_field_id: input.fieldId,
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_slot_starts: input.slotStarts,
      p_promo_code: null,
      p_notes: input.notes ?? null,
      p_idempotency_key: null,
      p_source: "manual",
      p_created_by: mitraUserId,
    });
  },

  async listByUser(userId: string, status: string | undefined, from: number, to: number) {
    let q = supabaseAdmin
      .from("bookings")
      .select(BOOKING_SELECT, { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (status) q = q.eq("status", status);
    const { data, error, count } = await q;
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  /** Kepemilikan dicek di query: milik pengguna lain => 404 (tidak membocorkan keberadaan data) */
  async getOwned(id: string, userId: string) {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(BOOKING_SELECT + ", payments(*), ticket:tickets(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    dbError(error);
    return camelize<any>(orNotFound(data));
  },

  async getRaw(id: string) {
    const { data, error } = await supabaseAdmin.from("bookings").select("*").eq("id", id).maybeSingle();
    dbError(error);
    return orNotFound(data) as any;
  },

  cancel(bookingId: string, actorId: string, role: string, reason: string) {
    return rpc("cancel_booking", { p_booking_id: bookingId, p_actor_id: actorId, p_actor_role: role, p_reason: reason });
  },

  reschedule(bookingId: string, userId: string, newSlotStarts: string[]) {
    return rpc("reschedule_booking", { p_booking_id: bookingId, p_user_id: userId, p_new_slot_starts: newSlotStarts });
  },

  async ticketFor(bookingId: string, userId: string) {
    await this.getOwned(bookingId, userId);
    const { data, error } = await supabaseAdmin.from("tickets").select("*").eq("booking_id", bookingId).maybeSingle();
    dbError(error);
    return camelize<any>(data);
  },

  /** Estimasi refund (tanpa mengubah data) */
  async refundPreview(bookingId: string, userId: string) {
    const b = await this.getOwned(bookingId, userId);
    const hours = (new Date(b.playStart).getTime() - Date.now()) / 3600000;
    const { data } = await supabaseAdmin
      .from("refund_rules")
      .select("*")
      .or(`venue_id.eq.${b.venueId},venue_id.is.null`)
      .lte("min_hours_before", Math.max(0, hours))
      .order("min_hours_before", { ascending: false });
    const rules = (data || []) as any[];
    const rule = rules.find((r) => r.venue_id) || rules[0];
    const pct = hours < 0 ? 0 : rule?.refund_percent ?? 0;
    const paid = (b.payments || []).some((p: any) => p.status === "berhasil");
    return {
      refundPercent: paid ? pct : 0,
      amount: paid ? Math.round(((b.totalPrice - b.serviceFee) * pct) / 100) : 0,
      note: "Biaya layanan tidak dikembalikan pada pembatalan oleh penyewa.",
    };
  },
};
