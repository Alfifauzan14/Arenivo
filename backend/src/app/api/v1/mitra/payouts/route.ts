import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { ok, parseBody } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  amount: z.number().int().min(50000)
});

export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const rows = await mitraRepository.payouts(mitraId);
    return ok(req, rows);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);

export const POST = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, schema);
    const payout = await mitraRepository.requestPayout(mitraId, body.amount);
    return ok(req, payout, undefined, 201);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
