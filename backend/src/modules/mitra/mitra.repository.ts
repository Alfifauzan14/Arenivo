import { AppError, ErrorCode } from "@futsal/shared";
import { supabaseAdmin } from "../../lib/supabase";
import { rpc, camelize, dbError, orNotFound } from "../../lib/http";

const WIB_OFFSET = 7 * 60 * 60000; // WIB is UTC+7 in milliseconds

export const mitraRepository = {
  /** Get today's occupancy for all fields of a mitra */
  async todayOccupancy(mitraId: string) {
    const ids = await this.venueIds(mitraId);
    if (!ids.length) return [];

    const nowUtc = new Date();
    // Convert to WIB for date calculation
    const wibNow = new Date(nowUtc.getTime() + WIB_OFFSET);
    const yyyy = wibNow.getUTCFullYear();
    const mm = String(wibNow.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(wibNow.getUTCDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const currentWibHour = wibNow.getUTCHours();

    const { data: fields } = await supabaseAdmin
      .from("fields")
      .select("id, name, venue:venues!inner(id, name)")
      .in("venue_id", ids)
      .eq("status", "aktif") as any;
    
    if (!fields || fields.length === 0) return [];

    const fieldIds = fields.map((f: any) => f.id);
    
    // Get slot reservations for today (stored as UTC in DB)
    const { data: reservations } = await supabaseAdmin
      .from("slot_reservations")
      .select("field_id, slot_start, type, booking_id, booking:bookings(status, expires_at)")
      .in("field_id", fieldIds)
      .eq("is_active", true)
      .gte("slot_start", `${dateStr}T00:00:00+07:00`)
      .lt("slot_start", `${dateStr}T23:59:59+07:00`);

    const byField = new Map<string, Map<number, any>>();
    
    for (const res of reservations || []) {
      if (!byField.has(res.field_id)) byField.set(res.field_id, new Map());
      const fieldMap = byField.get(res.field_id)!;
      // Convert slot_start from UTC to WIB hour
      const slotStartUtc = new Date(res.slot_start).getTime();
      const slotStartWib = new Date(slotStartUtc + WIB_OFFSET);
      const wibHour = slotStartWib.getUTCHours();
      const booking = Array.isArray(res.booking) ? res.booking[0] : res.booking;
      let status = "tersedia";
      if (res.type === "blokir") status = "diblokir";
      else if (booking?.status === "menunggu_bayar") {
        if (booking?.expires_at && new Date(booking.expires_at).getTime() > nowUtc.getTime()) {
          status = "dikunci";
        }
      } else if (booking) status = "terisi";
      fieldMap.set(wibHour, { status, bookingId: res.booking_id });
    }

    const result = [];
    for (const field of fields) {
      const fieldReservations = byField.get(field.id) || new Map();
      const slots = [];
      for (let hour = 7; hour <= 22; hour++) {
        const res = fieldReservations.get(hour);
        let status = res?.status;
        if (!status) {
          // Only mark as "lewat" if current WIB hour is strictly past this slot
          status = hour < currentWibHour ? "lewat" : "tersedia";
        }
        slots.push({
          hour,
          timeLabel: `${String(hour).padStart(2, "0")}.00 - ${String((hour + 1) % 24).padStart(2, "0")}.00`,
          status,
          bookingId: res?.bookingId || null,
        });
      }
      const venueName = Array.isArray(field.venue) ? field.venue[0]?.name : field.venue?.name;
      result.push({ fieldId: field.id, fieldName: field.name, venueName, slots });
    }
    return result;
  },

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
    let resolvedCode = code.trim().toUpperCase();
    // Jika input berupa kode booking (misal FB-E51AB7), cari ticket_code terkait
    if (!resolvedCode.startsWith("TKT-")) {
      const { data: booking } = await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("booking_code", resolvedCode)
        .maybeSingle();
      if (booking?.id) {
        const { data: ticket } = await supabaseAdmin
          .from("tickets")
          .select("ticket_code")
          .eq("booking_id", booking.id)
          .maybeSingle();
        if (ticket?.ticket_code) {
          resolvedCode = ticket.ticket_code;
        }
      }
    }
    return rpc("validate_ticket", { p_code: resolvedCode, p_venue_id: venueId, p_scanned_by: userId });
  },

  async checkIns(mitraId: string, from: number, to: number) {
    const ids = await this.venueIds(mitraId);
    if (!ids.length) return { rows: [], total: 0 };
    const { data, error, count } = await supabaseAdmin
      .from("ticket_scans")
      .select("*, scanner:profiles(id, full_name, email), ticket:tickets(ticket_code, booking:bookings(booking_code, customer_name))", { count: "exact" })
      .in("venue_id", ids)
      .order("scanned_at", { ascending: false })
      .range(from, to);
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async balance(mitraId: string) {
    const { data: bal } = await supabaseAdmin.from("mitra_balances").select("*").eq("mitra_id", mitraId).maybeSingle();
    const { data: entries } = await supabaseAdmin
      .from("mitra_balance_entries")
      .select("*, booking:bookings(booking_code)")
      .eq("mitra_id", mitraId)
      .order("created_at", { ascending: false })
      .limit(100);
    const formattedEntries = (entries || []).map((e: any) => ({
      ...e,
      booking_code: e.booking?.booking_code || null,
    }));
    return camelize<any>({
      ...(bal || { saldo_total: 0, saldo_tertahan: 0, saldo_bisa_dicairkan: 0 }),
      entries: formattedEntries,
    });
  },

  async blocks(mitraId: string, fieldId?: string, date?: string) {
    const ids = await this.venueIds(mitraId);
    if (!ids.length) return [];
    const { data: fieldRows } = await supabaseAdmin
      .from("fields")
      .select("id")
      .in("venue_id", ids);
    const fIds = (fieldRows || []).map((f: any) => f.id);
    if (!fIds.length) return [];
    let q = supabaseAdmin
      .from("slot_reservations")
      .select("*")
      .eq("type", "blokir")
      .eq("is_active", true)
      .in("field_id", fieldId && fIds.includes(fieldId) ? [fieldId] : fIds)
      .order("slot_start", { ascending: true });
    if (date) {
      q = q.gte("slot_start", `${date}T00:00:00+07:00`).lt("slot_start", `${date}T23:59:59+07:00`);
    }
    const { data, error } = await q;
    dbError(error);
    return camelize<any[]>(data || []);
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
