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
      .from("mitra_profiles").select("*, profile:profiles(email, phone, status, full_name)", { count: "exact" })
      .order("created_at", { ascending: false }).range(p.from, p.to);
    if (p.verification) q = q.eq("verification_status", p.verification);
    if (p.q) q = q.ilike("business_name", `%${p.q}%`);
    const { data, error, count } = await q;
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
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
    let q = supabaseAdmin.from("profiles").select("*", { count: "exact" }).eq("role", "penyewa")
      .order("created_at", { ascending: false }).range(p.from, p.to);
    if (p.status) q = q.eq("status", p.status);
    if (p.q) q = q.or(`full_name.ilike.%${p.q}%,email.ilike.%${p.q}%`);
    const { data, error, count } = await q;
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
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
      .from("bookings").select("*, venue:venues(name), payments(*)", { count: "exact" })
      .order("created_at", { ascending: false }).range(from, to);
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async settings() {
    const { data, error } = await supabaseAdmin.from("system_settings").select("*");
    dbError(error);
    return Object.fromEntries((data || []).map((r: any) => [r.key, r.value]));
  },

  async updateSettings(adminId: string, patch: Record<string, unknown>) {
    const rows = Object.entries(patch).map(([key, value]) => ({
      key, value, updated_by: adminId, updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin.from("system_settings").upsert(rows);
    dbError(error);
    return this.settings();
  },

  async dashboard() {
    const count = async (table: string, filter?: (q: any) => any) => {
      let q = supabaseAdmin.from(table).select("*", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count: c } = await q;
      return c || 0;
    };
    const [users, mitra, venues, bookings, { data: paid }] = await Promise.all([
      count("profiles", (q) => q.eq("role", "penyewa")),
      count("mitra_profiles"),
      count("venues"),
      count("bookings", (q) => q.in("status", ["dikonfirmasi", "digunakan", "selesai"])),
      supabaseAdmin.from("bookings").select("total_price, platform_commission").in("status", ["dikonfirmasi", "digunakan", "selesai"]).eq("source", "online"),
    ]);
    const gmv = (paid || []).reduce((s: number, r: any) => s + r.total_price, 0);
    const commission = (paid || []).reduce((s: number, r: any) => s + r.platform_commission, 0);
    return { totalUsers: users, totalMitra: mitra, totalVenues: venues, totalBookings: bookings, gmv, platformCommission: commission };
  },

  async auditLogs(from: number, to: number) {
    const { data, error, count } = await supabaseAdmin
      .from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },
};
