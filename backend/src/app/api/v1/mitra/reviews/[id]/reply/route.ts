import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok, parseBody } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  reply: z.string().min(2).max(1000)
});

export const POST = withAuth(
  async (req, user, ctx) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const id = await idParam(ctx);
    const body = await parseBody(req, schema);
    const updated = await mitraRepository.replyReview(mitraId, id, body.reply);
    return ok(req, updated);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
