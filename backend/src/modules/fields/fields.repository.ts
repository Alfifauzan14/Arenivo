import { supabaseAdmin } from "../../lib/supabase";
import { camelize, dbError, orNotFound } from "../../lib/http";

const WIB = "+07:00";

export interface AvailabilitySlot {
  slotStart: string;
  slotEnd: string;
  timeLabel: string;
  hour: number;
  status: "tersedia" | "dikunci" | "terisi" | "diblokir" | "lewat";
  price: number;
  bookingId?: string | null;
  lockExpiresAt?: string | null;
  reason?: string | null;
}

const pad = (n: number) => String(n).padStart(2, "0");
const minutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const fieldsRepository = {
  /** Jadwal per jam satu lapangan pada tanggal tertentu (WIB) */
  async availability(fieldId: string, date: string): Promise<AvailabilitySlot[]> {
    const { data: field, error } = await supabaseAdmin
      .from("fields")
      .select("id, base_price, status, venue:venues(status)")
      .eq("id", fieldId)
      .maybeSingle();
    dbError(error);
    const f = orNotFound(field) as any;
    if (f.status !== "aktif" || f.venue?.status !== "aktif") orNotFound(null);

    const dow = new Date(`${date}T12:00:00${WIB}`).getUTCDay(); // hari kalender sesuai tanggal WIB
    const [{ data: hours }, { data: rules }, { data: reservations }] = await Promise.all([
      supabaseAdmin.from("field_operating_hours").select("*").eq("field_id", fieldId).eq("day_of_week", dow).maybeSingle(),
      supabaseAdmin.from("field_price_rules").select("*").eq("field_id", fieldId),
      supabaseAdmin
        .from("slot_reservations")
        .select("slot_start, type, booking_id, reason, booking:bookings(status, expires_at)")
        .eq("field_id", fieldId)
        .eq("is_active", true)
        .gte("slot_start", `${date}T00:00:00${WIB}`)
        .lt("slot_start", new Date(new Date(`${date}T00:00:00${WIB}`).getTime() + 86400000).toISOString()),
    ]);

    if (!hours || hours.is_closed) return [];
    const open = minutes(hours.open_time);
    const close = hours.close_time.startsWith("00:00") ? 1440 : minutes(hours.close_time);
    const now = Date.now();
    const byStart = new Map<number, any>((reservations || []).map((r: any) => [new Date(r.slot_start).getTime(), r]));

    const priceAt = (hour: number) => {
      const t = hour * 60;
      const matched = (rules || [])
        .filter((r: any) => (r.day_of_week == null || r.day_of_week === dow) &&
          minutes(r.start_time) <= t && t < (r.end_time.startsWith("00:00") ? 1440 : minutes(r.end_time)))
        .sort((a: any, b: any) => b.priority - a.priority)[0];
      return matched ? matched.price : f.base_price;
    };

    const slots: AvailabilitySlot[] = [];
    for (let start = open; start + 60 <= close; start += 60) {
      const hour = Math.floor(start / 60);
      const startIso = new Date(`${date}T${pad(hour)}:00:00${WIB}`);
      const endIso = new Date(startIso.getTime() + 3600000);
      const res = byStart.get(startIso.getTime());

      let status: AvailabilitySlot["status"] = "tersedia";
      let lockExpiresAt: string | null = null;
      if (res) {
        if (res.type === "blokir") status = "diblokir";
        else if (res.booking?.status === "menunggu_bayar") {
          if (res.booking.expires_at && new Date(res.booking.expires_at).getTime() > now) {
            status = "dikunci";
            lockExpiresAt = res.booking.expires_at;
          } // kunci kedaluwarsa dianggap kosong (PRD 4.3)
        } else status = "terisi";
      }
      if (status === "tersedia" && startIso.getTime() <= now) status = "lewat";

      slots.push({
        slotStart: startIso.toISOString(),
        slotEnd: endIso.toISOString(),
        timeLabel: `${pad(hour)}.00 - ${pad((hour + 1) % 24)}.00`,
        hour,
        status,
        price: priceAt(hour),
        bookingId: res?.booking_id ?? null,
        lockExpiresAt,
        reason: res?.reason ?? null,
      });
    }
    return slots;
  },
};
