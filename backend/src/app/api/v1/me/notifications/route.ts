import { z } from "zod";
import { withAuth } from "@/middleware/auth";
import { ok, parseBody } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { authRepository } from "@/modules/auth/auth.repository";

export const OPTIONS = handleOptions;

export const GET = withAuth(async (req, user) => ok(req, await authRepository.notifications(user.id)));

/** Tandai dibaca; tanpa ids = semua */
export const PATCH = withAuth(async (req, user) => {
  const { ids } = await parseBody(req, z.object({ ids: z.array(z.string().uuid()).optional() }));
  await authRepository.markNotificationsRead(user.id, ids);
  return ok(req, { updated: true });
});
