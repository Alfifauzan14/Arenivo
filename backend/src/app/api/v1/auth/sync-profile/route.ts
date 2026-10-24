import { z } from "zod";
import { AppError, ErrorCode, RegisterMitraInputSchema } from "@futsal/shared";
import { ok, parseBody, publicRoute } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { authRepository } from "@/modules/auth/auth.repository";

export const OPTIONS = handleOptions;

const Schema = z.object({
  role: z.enum(["penyewa", "mitra"]),
  fullName: z.string().min(2),
  phone: z.string().min(9).optional(),
  avatarUrl: z.string().url().optional(),
  mitra: RegisterMitraInputSchema.optional(),
});

/**
 * Sinkronisasi profil pertama kali setelah signup Supabase Auth.
 * Role ditentukan sekali dan tidak dapat diubah lewat API (PRD 8). Admin hanya via seed.
 */
export const POST = publicRoute(async (req) => {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) throw new AppError(ErrorCode.UNAUTHENTICATED, "Token tidak ditemukan.");

  const authUser = await authRepository.verifyToken(token);
  const existing = await authRepository.findProfile(authUser.id);
  if (existing) return ok(req, { id: existing.id, role: existing.role, created: false });

  const body = await parseBody(req, Schema);
  if (body.role === "mitra" && !body.mitra) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Data usaha wajib diisi untuk pendaftaran mitra.");
  }

  const profile = await authRepository.createProfile({
    id: authUser.id,
    email: authUser.email || "",
    fullName: body.fullName,
    phone: body.phone,
    role: body.role,
    avatarUrl: body.avatarUrl,
  });
  if (body.role === "mitra") await authRepository.createMitraProfile(authUser.id, body.mitra);

  return ok(req, { ...profile, created: true }, undefined, 201);
});
