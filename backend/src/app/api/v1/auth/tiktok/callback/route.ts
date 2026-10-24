import { z } from "zod";
import { AppError, ErrorCode } from "@futsal/shared";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { env } from "@/config/env";
import { camelize, dbError, ok, parseBody, publicRoute } from "@/lib/http";

export const OPTIONS = handleOptions;

const schema = z.object({
  code: z.string().min(1),
  redirectUri: z.string().url().optional()
});

/**
 * Alur Login TikTok sesuai PRD Bab 8:
 * Karena TikTok tidak membagikan email pengguna, akun dibuat menggunakan alamat email
 * pengganti berdomain `.invalid` yang otomatis dilewati oleh pengirim email Brevo.
 */
export const POST = publicRoute(async (req) => {
  const body = await parseBody(req, schema);

  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) {
    throw new AppError(
      ErrorCode.PROVIDER_ERROR,
      "Konfigurasi TikTok Login Kit belum diaktifkan di server."
    );
  }

  const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      code: body.code,
      grant_type: "authorization_code",
      redirect_uri: body.redirectUri ?? `${env.CORS_ORIGIN}/auth/tiktok/callback`
    })
  });

  if (!tokenRes.ok) {
    throw new AppError(ErrorCode.PROVIDER_ERROR, "Gagal menukar kode otorisasi TikTok.");
  }

  const tokenJson: any = await tokenRes.json();
  const openId = tokenJson?.open_id as string | undefined;
  const accessToken = tokenJson?.access_token as string | undefined;

  if (!openId || !accessToken) {
    throw new AppError(ErrorCode.UNAUTHENTICATED, "Respons token TikTok tidak valid.");
  }

  const userRes = await fetch(
    "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  const userJson: any = await userRes.json().catch(() => ({}));
  const displayName = userJson?.data?.user?.display_name || "Pengguna TikTok";
  const avatarUrl = userJson?.data?.user?.avatar_url || null;

  // Cek apakah profil dengan tiktok_open_id sudah ada
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("tiktok_open_id", openId)
    .maybeSingle();

  if (existingProfile) {
    return ok(req, camelize({ profile: existingProfile, isNewUser: false }));
  }

  const fallbackEmail = `tiktok_${openId.toLowerCase().replace(/[^a-z0-9]/g, "")}@tiktok.invalid`;
  const { data: createdAuth, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: fallbackEmail,
    email_confirm: true,
    user_metadata: { full_name: displayName, tiktok_open_id: openId }
  });

  if (authErr || !createdAuth.user) {
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      authErr?.message ?? "Gagal membuat pengguna TikTok."
    );
  }

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: createdAuth.user.id,
      full_name: displayName,
      email: fallbackEmail,
      avatar_url: avatarUrl,
      role: "penyewa",
      status: "aktif",
      tiktok_open_id: openId
    })
    .select("*")
    .single();
  dbError(profErr);

  return ok(req, camelize({ profile, isNewUser: true }), undefined, 201);
});
