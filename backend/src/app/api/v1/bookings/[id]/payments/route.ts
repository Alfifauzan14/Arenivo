import { withAuth } from "@/middleware/auth";
import { ok, idParam } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { paymentsService } from "@/modules/payments/payments.service";

export const OPTIONS = handleOptions;

export const POST = withAuth(async (req, user, ctx) => {
  return ok(req, await paymentsService.createPayment(await idParam(ctx), user), undefined, 201);
}, { allowedRoles: ["penyewa"] });

export const GET = withAuth(async (req, user, ctx) => {
  return ok(req, await paymentsService.verifyPayment(await idParam(ctx), user));
}, { allowedRoles: ["penyewa"] });
