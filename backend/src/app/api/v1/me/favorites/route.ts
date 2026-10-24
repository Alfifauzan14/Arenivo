import { z } from "zod";
import { AppError, ErrorCode } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { ok, parseBody } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { authRepository } from "@/modules/auth/auth.repository";

export const OPTIONS = handleOptions;

const Body = z.object({ venueId: z.string().uuid() });

export const GET = withAuth(async (req, user) => ok(req, await authRepository.favorites(user.id)));

export const PUT = withAuth(async (req, user) => {
  const { venueId } = await parseBody(req, Body);
  await authRepository.addFavorite(user.id, venueId);
  return ok(req, { venueId, favorite: true });
});

export const DELETE = withAuth(async (req, user) => {
  const venueId = new URL(req.url).searchParams.get("venueId");
  if (!venueId) throw new AppError(ErrorCode.VALIDATION_ERROR, "venueId wajib diisi.");
  await authRepository.removeFavorite(user.id, venueId);
  return ok(req, { venueId, favorite: false });
});
