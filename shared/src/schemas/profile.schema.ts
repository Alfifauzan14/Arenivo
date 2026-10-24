import { z } from "zod";
import { UserRole, AccountStatus, MitraVerificationStatus } from "../constants/enums";

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().url("URL avatar tidak valid").nullable().optional(),
  role: z.enum([UserRole.PENYEWA, UserRole.MITRA, UserRole.ADMIN]),
  status: z.enum([AccountStatus.AKTIF, AccountStatus.DIBLOKIR]),
  tiktokOpenId: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const MitraProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  businessName: z.string().min(3, "Nama usaha minimal 3 karakter"),
  businessAddress: z.string().min(5, "Alamat usaha minimal 5 karakter"),
  documentUrl: z.string().url("URL dokumen tidak valid"),
  verificationStatus: z.enum([
    MitraVerificationStatus.MENUNGGU,
    MitraVerificationStatus.DISETUJUI,
    MitraVerificationStatus.DITOLAK,
  ]),
  rejectionReason: z.string().nullable().optional(),
  verifiedBy: z.string().uuid().nullable().optional(),
  verifiedAt: z.string().datetime().nullable().optional(),
  bankName: z.string().min(2, "Nama bank wajib diisi"),
  bankAccountNumber: z.string().min(5, "Nomor rekening minimal 5 karakter"),
  bankAccountHolder: z.string().min(2, "Nama pemilik rekening wajib diisi"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type MitraProfile = z.infer<typeof MitraProfileSchema>;

export const UpdateProfileInputSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").optional(),
  phone: z.string().min(9, "Nomor telepon minimal 9 digit").optional(),
  avatarUrl: z.string().url("URL avatar tidak valid").optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const RegisterMitraInputSchema = z.object({
  businessName: z.string().min(3, "Nama usaha minimal 3 karakter"),
  businessAddress: z.string().min(5, "Alamat usaha minimal 5 karakter"),
  documentUrl: z.string().url("Unggah dokumen izin/KTP terlebih dahulu"),
  bankName: z.string().min(2, "Pilih atau isi nama bank"),
  bankAccountNumber: z.string().min(5, "Nomor rekening minimal 5 digit"),
  bankAccountHolder: z.string().min(2, "Nama pemilik rekening wajib diisi"),
});

export type RegisterMitraInput = z.infer<typeof RegisterMitraInputSchema>;
