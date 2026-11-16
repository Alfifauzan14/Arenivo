import { z } from "zod";
import { AppError, ErrorCode, UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok, parseBody, reqIp } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

const schema = z.object({
  reference: z.string().optional(),
  proofUrl: z.string().optional(),
  reason: z.string().max(300).optional()
});

export const POST = withAuth(
  async (req, user, ctx) => {
    const id = await idParam(ctx, "id");
    const action = await idParam(ctx, "action");
    const ip = reqIp(req);
    const body = await parseBody(req, schema).catch(() => ({
      reference: undefined,
      proofUrl: undefined,
      reason: undefined
    }));

    if (action === "approve") {
      const updated = await adminRepository.setPayoutStatus(id, user.id, "disetujui");
      await adminRepository.audit(user.id, "payout.approve", "payouts", id, "Payout disetujui admin", ip);
      return ok(req, updated);
    }

    if (action === "complete") {
      const ref = body.reference ?? body.proofUrl ?? `TF-${Date.now()}`;
      const updated = await adminRepository.completePayout(id, user.id, ref);
      await adminRepository.audit(user.id, "payout.complete", "payouts", id, `Transfer selesai (Ref: ${ref})`, ip);
      return ok(req, updated);
    }

    if (action === "reject") {
      const reason = body.reason ?? "Ditolak oleh Admin";
      const updated = await adminRepository.setPayoutStatus(id, user.id, "ditolak", reason);
      await adminRepository.audit(user.id, "payout.reject", "payouts", id, `Ditolak: ${reason}`, ip);
      return ok(req, updated);
    }

    throw new AppError(ErrorCode.VALIDATION_ERROR, `Aksi payout tidak dikenal: ${action}`);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
