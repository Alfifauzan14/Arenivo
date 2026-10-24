import { z } from "zod";
import { AppError, ErrorCode, UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { idParam, ok, parseBody } from "@/lib/http";
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
    const body = await parseBody(req, schema).catch(() => ({
      reference: undefined,
      proofUrl: undefined,
      reason: undefined
    }));

    if (action === "approve" || action === "complete") {
      const updated = await adminRepository.finishRefund(
        id,
        user.id,
        body.reference ?? body.proofUrl ?? `REF-${Date.now()}`
      );
      return ok(req, updated);
    }

    if (action === "reject") {
      const updated = await adminRepository.rejectRefund(
        id,
        user.id,
        body.reason ?? "Ditolak oleh Admin"
      );
      return ok(req, updated);
    }

    throw new AppError(ErrorCode.VALIDATION_ERROR, `Aksi refund tidak dikenal: ${action}`);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
