import { supabaseAdmin } from "../../lib/supabase";
import { rpc, camelize, dbError, orNotFound } from "../../lib/http";

export const adminRepository = {
  async audit(adminId: string, action: string, targetType: string, targetId: string, details: string, ip?: string | null) {
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: adminId, action, target_type: targetType, target_id: targetId, details, ip_address: ip ?? null,
    });
  },

  async mitraList(p: { verification?: string; q?: string; from: number; to: number }) {
    let q = supabaseAdmin
      .from("mitra_profiles").select("*, profile:profiles!mitra_profiles_user_id_fkey(email, phone, status, full_name)", { count: "exact" })
      .order("created_at", { ascending: false }).range(p.from, p.to);
    if (p.verification) q = q.eq("verification_status", p.verification);
    if (p.q) q = q.ilike("business_name", `%${p.q}%`);
    const { data, error, count } = await q;
    dbError(error);
    // Merge mitra_profiles with profiles fields for display
    const rows = camelize<any[]>(data || []).map((r: any) => ({
      ...r,
      email: r.email || r.profile?.email || "",
      phone: r.phone || r.profile?.phone || "",
      accountStatus: r.profile?.status || "aktif",
      ownerName: r.profile?.fullName || "",
    }));
    return { rows, total: count || 0 };
  },

  /** Dokumen usaha privat: berikan signed URL berumur pendek */
  async documentSignedUrl(mitraId: string) {
    const { data } = await supabaseAdmin.from("mitra_profiles").select("document_url").eq("id", mitraId).maybeSingle();
    const path = (orNotFound(data) as any).document_url as string | null;
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    const { data: signed } = await supabaseAdmin.storage.from("mitra-documents").createSignedUrl(path, 300);
    return signed?.signedUrl ?? null;
  },

  async setMitraVerification(id: string, adminId: string, status: "disetujui" | "ditolak", reason?: string) {
    const { data, error } = await supabaseAdmin
      .from("mitra_profiles")
      .update({
        verification_status: status, rejection_reason: status === "ditolak" ? reason : null,
        verified_by: adminId, verified_at: new Date().toISOString(),
      })
      .eq("id", id).select("*").maybeSingle();
    dbError(error);
    return camelize<any>(orNotFound(data));
  },

  async setUserStatus(userId: string, status: "aktif" | "diblokir") {
    const { data, error } = await supabaseAdmin.from("profiles").update({ status }).eq("id", userId).select("*").maybeSingle();
    dbError(error);
    return camelize<any>(orNotFound(data));
  },

  async setMitraAccountStatus(mitraId: string, status: "aktif" | "diblokir") {
    const { data } = await supabaseAdmin.from("mitra_profiles").select("user_id").eq("id", mitraId).maybeSingle();
    const userId = (orNotFound(data) as any).user_id;
    // Venue mitra yang diblokir disembunyikan dari publik, pesanan berjalan tetap berlaku (PRD 4.1)
    await supabaseAdmin.from("venues").update({ status: status === "diblokir" ? "diblokir" : "aktif" }).eq("mitra_id", mitraId);
    return this.setUserStatus(userId, status);
  },

  async users(p: { q?: string; status?: string; from: number; to: number }) {
    let q = supabaseAdmin.from("profiles").select("*, bookings:bookings!bookings_user_id_fkey(count)", { count: "exact" }).eq("role", "penyewa")
      .order("created_at", { ascending: false }).range(p.from, p.to);
    if (p.status) q = q.eq("status", p.status);
    if (p.q) q = q.or(`full_name.ilike.%${p.q}%,email.ilike.%${p.q}%`);
    const { data, error, count } = await q;
    dbError(error);
    const rows = camelize<any[]>(data || []).map((u: any) => ({
      ...u,
      bookingsCount: Array.isArray(u.bookings) ? (u.bookings[0]?.count ?? 0) : 0,
    }));
    return { rows, total: count || 0 };
  },

  async payouts(status: string | undefined, from: number, to: number) {
    let q = supabaseAdmin.from("payouts").select("*, mitra:mitra_profiles(business_name)", { count: "exact" })
      .order("created_at", { ascending: false }).range(from, to);
    if (status) q = q.eq("status", status);
    const { data, error, count } = await q;
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async setPayoutStatus(id: string, adminId: string, status: "disetujui" | "ditolak", reason?: string) {
    const { data, error } = await supabaseAdmin
      .from("payouts")
      .update({ status, rejection_reason: reason ?? null, processed_by: adminId, processed_at: new Date().toISOString() })
      .eq("id", id).in("status", ["menunggu", "disetujui"]).select("*").maybeSingle();
    dbError(error);
    return camelize<any>(orNotFound(data));
  },

  completePayout(id: string, adminId: string, reference: string) {
    return rpc("complete_payout", { p_payout_id: id, p_admin_id: adminId, p_reference: reference });
  },

  async refunds(status: string | undefined, from: number, to: number) {
    let q = supabaseAdmin.from("refunds").select("*, booking:bookings(booking_code, customer_name)", { count: "exact" })
      .order("created_at", { ascending: false }).range(from, to);
    if (status) q = q.eq("status", status);
    const { data, error, count } = await q;
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async finishRefund(id: string, adminId: string, reference: string) {
    const { data, error } = await supabaseAdmin
      .from("refunds")
      .update({ status: "selesai", midtrans_refund_key: reference, processed_by: adminId, processed_at: new Date().toISOString() })
      .eq("id", id).in("status", ["diajukan", "disetujui", "diproses"]).select("*").maybeSingle();
    dbError(error);
    return camelize<any>(orNotFound(data));
  },

  async rejectRefund(id: string, adminId: string, reason: string) {
    const { data, error } = await supabaseAdmin
      .from("refunds")
      .update({ status: "ditolak", rejection_reason: reason, processed_by: adminId, processed_at: new Date().toISOString() })
      .eq("id", id).in("status", ["diajukan", "disetujui"]).select("*").maybeSingle();
    dbError(error);
    return camelize<any>(orNotFound(data));
  },

  async bookings(from: number, to: number) {
    const { data, error, count } = await supabaseAdmin
      .from("bookings").select("*, venue:venues(name), field:fields(name), payments(*)", { count: "exact" })
      .order("created_at", { ascending: false }).range(from, to);
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async settings() {
    const { data, error } = await supabaseAdmin.from("system_settings").select("*");
    dbError(error);
    const raw: Record<string, unknown> = {};
    // Utamakan key snake_case agar nilai canonical dari DB tidak tertimpa key camelCase lama
    for (const r of data || []) {
      if (!/[A-Z]/.test(r.key)) {
        raw[r.key] = r.value;
      } else if (raw[r.key] === undefined) {
        raw[r.key] = r.value;
      }
    }
    return {
      ...raw,
      bookingExpirationMinutes: raw.booking_expiration_minutes ?? raw.bookingExpirationMinutes ?? 15,
      maxBookingDaysAhead: raw.max_booking_days_ahead ?? raw.maxBookingDaysAhead ?? 30,
      defaultPlatformCommissionPercent: raw.default_platform_commission_percent ?? raw.defaultPlatformCommissionPercent ?? 10,
      defaultServiceFeeRupiah: raw.default_service_fee_rupiah ?? raw.defaultServiceFeeRupiah ?? 5000,
      minPayoutAmountRupiah: raw.min_payout_amount_rupiah ?? raw.minPayoutAmountRupiah ?? 100000,
      scannerEarlyCheckinMinutes: raw.scanner_early_checkin_minutes ?? raw.scannerEarlyCheckinMinutes ?? 30,
      primaryAiProvider: raw.primary_ai_provider ?? raw.primaryAiProvider ?? "gemini",
    };
  },

  async reviews(p: { q?: string; from: number; to: number }) {
    let q = supabaseAdmin
      .from("reviews")
      .select("*, user:profiles(full_name, avatar_url), venue:venues(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(p.from, p.to);
    if (p.q) {
      q = q.or(`comment.ilike.%${p.q}%,user.full_name.ilike.%${p.q}%,venue.name.ilike.%${p.q}%`);
    }
    const { data, error, count } = await q;
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async updateSettings(adminId: string, patch: Record<string, unknown>) {
    const KEY_MAP: Record<string, string> = {
      bookingExpirationMinutes: "booking_expiration_minutes",
      maxBookingDaysAhead: "max_booking_days_ahead",
      defaultPlatformCommissionPercent: "default_platform_commission_percent",
      defaultServiceFeeRupiah: "default_service_fee_rupiah",
      minPayoutAmountRupiah: "min_payout_amount_rupiah",
      scannerEarlyCheckinMinutes: "scanner_early_checkin_minutes",
      primaryAiProvider: "primary_ai_provider",
    };
    const rows = Object.entries(patch).map(([key, value]) => ({
      key: KEY_MAP[key] || key,
      value,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin.from("system_settings").upsert(rows);
    dbError(error);
    // Hapus baris duplikat camelCase bila ada
    await supabaseAdmin
      .from("system_settings")
      .delete()
      .in("key", Object.keys(KEY_MAP));
    return this.settings();
  },

  async dashboard() {
    const count = async (table: string, filter?: (q: any) => any) => {
      let q = supabaseAdmin.from(table).select("*", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count: c } = await q;
      return c || 0;
    };
    const [users, mitra, pendingMitra, pendingRefunds, pendingPayouts, venues, bookings, { data: paid }] = await Promise.all([
      count("profiles", (q) => q.eq("role", "penyewa")),
      count("mitra_profiles"),
      count("mitra_profiles", (q) => q.eq("verification_status", "menunggu")),
      count("refunds", (q) => q.eq("status", "diajukan")),
      count("payouts", (q) => q.eq("status", "menunggu")),
      count("venues"),
      count("bookings", (q) => q.in("status", ["dikonfirmasi", "digunakan", "selesai"])),
      supabaseAdmin.from("bookings").select("total_price, platform_commission").in("status", ["dikonfirmasi", "digunakan", "selesai"]).eq("source", "online"),
    ]);
    const gmv = (paid || []).reduce((s: number, r: any) => s + r.total_price, 0);
    const commission = (paid || []).reduce((s: number, r: any) => s + r.platform_commission, 0);
    return {
      totalUsers: users,
      totalMitra: mitra,
      pendingMitraCount: pendingMitra,
      pendingRefundsCount: pendingRefunds,
      pendingPayoutsCount: pendingPayouts,
      totalVenues: venues,
      totalBookings: bookings,
      gmv,
      platformCommission: commission,
    };
  },

  async auditLogs(from: number, to: number) {
    const { data, error, count } = await supabaseAdmin
      .from("audit_logs")
      .select("*, admin:profiles(email, full_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    dbError(error);
    const rows = camelize<any[]>(data || []).map((l: any) => ({
      ...l,
      adminEmail: l.admin?.email || l.adminId,
      adminName: l.admin?.fullName || null,
    }));
    return { rows, total: count || 0 };
  },
};
