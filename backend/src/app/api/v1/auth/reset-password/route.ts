import { z } from "zod";
import { AppError, ErrorCode } from "@futsal/shared";
import { ok, parseBody, publicRoute } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";

export const OPTIONS = handleOptions;

const Schema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const POST = publicRoute(async (req) => {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new AppError(ErrorCode.UNAUTHENTICATED, "Sesi pemulihan tidak ditemukan.");
  }

  const {
    data: { user },
    error: userErr,
  } = await supabaseAdmin.auth.getUser(token);

  if (userErr || !user) {
    throw new AppError(
      ErrorCode.UNAUTHENTICATED,
      "Sesi pemulihan tidak valid atau sudah kedaluwarsa. Silakan ajukan lupa kata sandi kembali."
    );
  }

  const body = await parseBody(req, Schema);
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: body.password,
  });

  if (error) {
    throw new AppError(ErrorCode.INTERNAL_ERROR, error.message);
  }

  return ok(req, { updated: true, message: "Kata sandi berhasil diperbarui. Silakan masuk kembali." });
});
