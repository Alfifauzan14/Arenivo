import { withAuth } from "@/middleware/auth";
import { ok } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { authRepository } from "@/modules/auth/auth.repository";

export const OPTIONS = handleOptions;

export const PATCH = withAuth(async (req, user) => {
  await authRepository.markNotificationsRead(user.id);
  return ok(req, { updated: true });
});

export const POST = PATCH;
