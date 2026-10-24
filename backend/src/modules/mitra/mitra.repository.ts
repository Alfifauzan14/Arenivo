import { AppError, ErrorCode } from "@futsal/shared";
import { supabaseAdmin } from "../../lib/supabase";
import { rpc, camelize, dbError, orNotFound } from "../../lib/http";

export const mitraRepository = {
  async venueIds(mitraId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin.from("venues").select("id").eq("mitra_id", mitraId);
    dbError(error);
    return (data || []).map((v: any) => v.id);
  },

  /** Pastikan lapangan milik mitra; selain itu 404 */
  async assertFieldOwned(mitraId: string, fieldId: string) {
    const { data, error } = await supabaseAdmin
      .from("fields").select("id, venue:venues!inner(mitra_id)").eq("id", fieldId).eq("venue.mitra_id", mitraId).maybeSingle();
    dbError(error);
    orNotFound(data);
  },

  async bookings(mitraId: string, p: { status?: string; date?: string; from: number; to: number }) {
    const ids = await this.venueIds(mitraId);
    if (!ids.length) return { rows: [], total: 0 };
    let q = supabaseAdmin
      .from("bookings")
      .select("*, field:fields(id, name), venue:venues(id, name)", { count: "exact" })
      .in("venue_id", ids)
      .order("play_start", { ascending: false })
      .range(p.from, p.to);
    if (p.status) q = q.eq("status", p.status);
    if (p.date) q = q.gte("play_start", `${p.date}T00:00:00+07:00`).lt("play_start", `${p.date}T23:59:59+07:00`);
    const { data, error, count } = await q;
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async assertBookingOwned(mitraId: string, bookingId: string) {
    const ids = await this.venueIds(mitraId);
    const { data } = await supabaseAdmin.from("bookings").select("id").eq("id", bookingId).in("venue_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]).maybeSingle();
    orNotFound(data);
  },

  async validateTicket(mitraId: string, userId: string, code: string, venueId: string) {
    const ids = await this.venueIds(mitraId);
    if (!ids.includes(venueId)) throw new AppError(ErrorCode.NOT_FOUND, "Venue tidak ditemukan.");
    return rpc("validate_ticket", { p_code: code, p_venue_id: venueId, p_scanned_by: userId });
  },

  async checkIns(mitraId: string, from: number, to: number) {
    const ids = await this.venueIds(mitraId);
    if (!ids.length) return { rows: [], total: 0 };
    const { data, error, count } = await supabaseAdmin
      .from("ticket_scans").select("*", { count: "exact" }).in("venue_id", ids).order("scanned_at", { ascending: false }).range(from, to);
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async balance(mitraId: string) {
    const { data: bal } = await supabaseAdmin.from("mitra_balances").select("*").eq("mitra_id", mitraId).maybeSingle();
    const { data: entries } = await supabaseAdmin
      .from("mitra_balance_entries").select("*").eq("mitra_id", mitraId).order("created_at", { ascending: false }).limit(100);
    return camelize<any>({
      ...(bal || { saldo_total: 0, saldo_tertahan: 0, saldo_bisa_dicairkan: 0 }),
      entries: entries || [],
    });
  },

  async payouts(mitraId: string) {
    const { data, error } = await supabaseAdmin.from("payouts").select("*").eq("mitra_id", mitraId).order("created_at", { ascending: false });
    dbError(error);
    return camelize<any[]>(data || []);
  },

  requestPayout(mitraId: string, amount: number) {
    return rpc("request_payout", { p_mitra_id: mitraId, p_amount: amount });
  },

  async createBlock(mitraId: string, userId: string, fieldId: string, slotStart: string, reason: string) {
    await this.assertFieldOwned(mitraId, fieldId);
    const start = new Date(slotStart);
    const { data, error } = await supabaseAdmin
      .from("slot_reservations")
      .insert({
        field_id: fieldId, slot_start: start.toISOString(), slot_end: new Date(+start + 3600000).toISOString(),
        type: "blokir", reason, created_by: userId,
      })
      .select("*").single();
    if (error?.code === "23505") throw new AppError(ErrorCode.SLOT_TAKEN, "Slot sudah terisi atau diblokir.");
    dbError(error);
    return camelize<any>(data);
  },

  async removeBlock(mitraId: string, blockId: string) {
    const { data } = await supabaseAdmin.from("slot_reservations").select("id, field_id").eq("id", blockId).eq("type", "blokir").maybeSingle();
    const row = orNotFound(data) as any;
    await this.assertFieldOwned(mitraId, row.field_id);
    const { error } = await supabaseAdmin.from("slot_reservations").update({ is_active: false }).eq("id", blockId);
    dbError(error);
    return row.field_id as string;
  },

  async reviews(mitraId: string) {
    const ids = await this.venueIds(mitraId);
    if (!ids.length) return [];
    const { data, error } = await supabaseAdmin
      .from("reviews").select("*, user:profiles(full_name)").in("venue_id", ids).order("created_at", { ascending: false });
    dbError(error);
    return camelize<any[]>(data || []);
  },

  async replyReview(mitraId: string, reviewId: string, reply: string) {
    const ids = await this.venueIds(mitraId);
    const { data, error } = await supabaseAdmin
      .from("reviews").update({ reply, replied_at: new Date().toISOString() })
      .eq("id", reviewId).in("venue_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]).select("*").maybeSingle();
    dbError(error);
    return camelize<any>(orNotFound(data));
  },
};
