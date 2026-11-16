import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { ok, parseBody, reqIp } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

const patchSchema = z.record(z.string(), z.unknown());

export const GET = withAuth(
  async (req) => {
    const data = await adminRepository.settings();
    return ok(req, data);
  },
  { allowedRoles: [UserRole.ADMIN] }
);

export const PATCH = withAuth(
  async (req, user) => {
    const body = await parseBody(req, patchSchema);
    const updated = await adminRepository.updateSettings(user.id, body);
    await adminRepository.audit(
      user.id,
      "UPDATE_SYSTEM_CONFIG",
      "system_settings",
      "global",
      `Memperbarui konfigurasi: ${Object.keys(body).join(", ")}`,
      reqIp(req)
    );
    return ok(req, updated);
  },
  { allowedRoles: [UserRole.ADMIN] }
);
