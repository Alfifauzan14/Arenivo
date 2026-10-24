import { NextResponse } from "next/server";
import {
  ErrorCode,
  UserRole,
  AccountStatus,
  MitraVerificationStatus,
  AppError,
  type Profile,
  type MitraProfile,
} from "@futsal/shared";
import { supabaseAdmin } from "../lib/supabase";
import { handleApiError } from "./error-handler";

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: Profile;
  mitraProfile?: MitraProfile | null;
}

export interface AuthOptions {
  allowedRoles?: UserRole[];
  requireApprovedMitra?: boolean;
}

/**
 * Middleware autentikasi & otorisasi tingkat route handler
 * Memverifikasi token JWT Supabase, memuat role riil dari database profiles,
 * memverifikasi status aktif, dan memeriksa status verifikasi mitra jika disyaratkan.
 */
export function withAuth(
  handler: (req: Request, user: AuthenticatedUser, context?: any) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(
          ErrorCode.UNAUTHENTICATED,
          "Sesi Anda telah berakhir atau token tidak ditemukan. Silakan login kembali."
        );
      }

      const token = authHeader.split(" ")[1];

      // Verifikasi token via Supabase Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabaseAdmin.auth.getUser(token);

      if (authError || !authUser) {
        throw new AppError(
          ErrorCode.UNAUTHENTICATED,
          "Token autentikasi tidak valid atau kedaluwarsa."
        );
      }

      // Ambil profile langsung dari database (tidak percaya user_metadata token!)
      const { data: rawProfile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError || !rawProfile) {
        throw new AppError(
          ErrorCode.PROFILE_REQUIRED,
          "Profil pengguna belum terdaftar. Silakan lengkapi profil Anda."
        );
      }

      const profile: Profile = {
        id: rawProfile.id,
        fullName: rawProfile.full_name || rawProfile.fullName || "",
        email: rawProfile.email,
        phone: rawProfile.phone,
        avatarUrl: rawProfile.avatar_url || rawProfile.avatarUrl,
        role: rawProfile.role as UserRole,
        status: rawProfile.status as AccountStatus,
        tiktokOpenId: rawProfile.tiktok_open_id || rawProfile.tiktokOpenId,
        createdAt: rawProfile.created_at || rawProfile.createdAt,
        updatedAt: rawProfile.updated_at || rawProfile.updatedAt,
      };

      // Cek status akun
      if (profile.status === AccountStatus.DIBLOKIR) {
        throw new AppError(
          ErrorCode.ACCOUNT_BLOCKED,
          "Akun Anda telah dinonaktifkan oleh administrator. Hubungi bantuan jika ada kendala."
        );
      }

      // Cek izin role
      if (
        options.allowedRoles &&
        options.allowedRoles.length > 0 &&
        !options.allowedRoles.includes(profile.role)
      ) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          "Anda tidak memiliki hak akses untuk mengakses data atau aksi ini."
        );
      }

      let mitraProfile: MitraProfile | null = null;

      // Jika role adalah mitra, muat profil mitra
      if (profile.role === UserRole.MITRA) {
        const { data: rawMitra } = await supabaseAdmin
          .from("mitra_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        if (rawMitra) {
          mitraProfile = {
            id: rawMitra.id,
            userId: rawMitra.user_id || rawMitra.userId,
            businessName: rawMitra.business_name || rawMitra.businessName,
            businessAddress: rawMitra.business_address || rawMitra.businessAddress,
            documentUrl: rawMitra.document_url || rawMitra.documentUrl,
            verificationStatus: (rawMitra.verification_status ||
              rawMitra.verificationStatus) as MitraVerificationStatus,
            rejectionReason: rawMitra.rejection_reason || rawMitra.rejectionReason,
            verifiedBy: rawMitra.verified_by || rawMitra.verifiedBy,
            verifiedAt: rawMitra.verified_at || rawMitra.verifiedAt,
            bankName: rawMitra.bank_name || rawMitra.bankName,
            bankAccountNumber: rawMitra.bank_account_number || rawMitra.bankAccountNumber,
            bankAccountHolder: rawMitra.bank_account_holder || rawMitra.bankAccountHolder,
            createdAt: rawMitra.created_at || rawMitra.createdAt,
            updatedAt: rawMitra.updated_at || rawMitra.updatedAt,
          };
        }

        // Cek verifikasi mitra jika disyaratkan
        if (options.requireApprovedMitra) {
          if (
            !mitraProfile ||
            mitraProfile.verificationStatus !== MitraVerificationStatus.DISETUJUI
          ) {
            throw new AppError(
              ErrorCode.MITRA_NOT_VERIFIED,
              "Akun mitra Anda belum disetujui oleh admin atau masih dalam tahap verifikasi."
            );
          }
        }
      }

      const user: AuthenticatedUser = {
        id: authUser.id,
        email: authUser.email || profile.email,
        profile,
        mitraProfile,
      };

      return await handler(req, user, context);
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}
