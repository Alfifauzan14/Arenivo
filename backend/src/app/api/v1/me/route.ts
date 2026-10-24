import { UpdateProfileInputSchema } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { ok, parseBody } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { authRepository } from "@/modules/auth/auth.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(async (req, user) => ok(req, { ...user.profile, mitraProfile: user.mitraProfile ?? null }));

export const PATCH = withAuth(async (req, user) => {
  const patch = await parseBody(req, UpdateProfileInputSchema);
  return ok(req, await authRepository.updateProfile(user.id, patch));
});
