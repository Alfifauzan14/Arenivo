import { z } from "zod";
import { withAuth } from "@/middleware/auth";
import { ok, parseBody } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { promosRepository } from "@/modules/promos/promos.repository";

export const OPTIONS = handleOptions;

const Schema = z.object({ code: z.string().min(1), venueId: z.string().uuid(), subtotal: z.number().int().min(0) });

export const POST = withAuth(async (req) => {
  const b = await parseBody(req, Schema);
  return ok(req, await promosRepository.validate(b.code, b.venueId, b.subtotal));
});
