import { AppError, ErrorCode } from "@futsal/shared";
import { supabaseAdmin } from "../../lib/supabase";
import { camelize, dbError, orNotFound } from "../../lib/http";

export const authRepository = {
  async verifyToken(token: string) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) throw new AppError(ErrorCode.UNAUTHENTICATED, "Token autentikasi tidak valid.");
    return data.user;
  },

  async findProfile(id: string) {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", id).maybeSingle();
    dbError(error);
    return data as any | null;
  },

  /** Role hanya ditentukan sekali (satu akun satu role). Admin hanya via seed. */
  async createProfile(p: { id: string; email: string; fullName: string; phone?: string; role: "penyewa" | "mitra"; avatarUrl?: string }) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({ id: p.id, email: p.email, full_name: p.fullName, phone: p.phone ?? null, role: p.role, avatar_url: p.avatarUrl ?? null })
      .select("*")
      .single();
    dbError(error);
    return camelize<any>(data);
  },

  async createMitraProfile(userId: string, m: any) {
    const { error } = await supabaseAdmin.from("mitra_profiles").insert({
      user_id: userId,
      business_name: m.businessName,
      business_address: m.businessAddress,
      document_url: m.documentUrl,
      bank_name: m.bankName,
      bank_account_number: m.bankAccountNumber,
      bank_account_holder: m.bankAccountHolder,
    });
    dbError(error);
  },

  async updateProfile(id: string, patch: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const row: Record<string, unknown> = {};
    if (patch.fullName !== undefined) row.full_name = patch.fullName;
    if (patch.phone !== undefined) row.phone = patch.phone;
    if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
    const { data, error } = await supabaseAdmin.from("profiles").update(row).eq("id", id).select("*").single();
    dbError(error);
    return camelize<any>(data);
  },

  async favorites(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("favorites")
      .select("venue:venues(*, city:cities(*))")
      .eq("user_id", userId);
    dbError(error);
    return camelize<any[]>((data || []).map((r: any) => r.venue));
  },
  async addFavorite(userId: string, venueId: string) {
    const { error } = await supabaseAdmin.from("favorites").upsert({ user_id: userId, venue_id: venueId });
    dbError(error);
  },
  async removeFavorite(userId: string, venueId: string) {
    const { error } = await supabaseAdmin.from("favorites").delete().eq("user_id", userId).eq("venue_id", venueId);
    dbError(error);
  },
  async notifications(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    dbError(error);
    return camelize<any[]>(data || []);
  },
  async markNotificationsRead(userId: string, ids?: string[]) {
    let q = supabaseAdmin.from("notifications").update({ is_read: true }).eq("user_id", userId);
    if (ids?.length) q = q.in("id", ids);
    const { error } = await q;
    dbError(error);
  },
};

export { orNotFound };
