import { z } from "zod";
import { AppError, ErrorCode, UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, idParam, ok, parseBody, reqIp } from "@/lib/http";
import { adminRepository } from "@/modules/admin/admin.repository";

export const OPTIONS = handleOptions;

function resolveTable(kind: string) {
  if (kind === "cities") return "cities";
  if (kind === "facilities") return "facilities";
  if (kind === "field-types") return "field_types";
  throw new AppError(ErrorCode.NOT_FOUND, "Data master tidak ditemukan.");
}

const createSchema = z.object({
  name: z.string().min(2).max(120),
  province: z.string().max(120).optional(),
  code: z.string().max(80).optional(),
  icon: z.string().max(80).optional(),
});

const patchSchema = createSchema.partial().extend({
  id: z.string().uuid(),
});

export const GET = withAuth(
  async (req, _user, ctx) => {
    const kind = await idParam(ctx, "kind");
    const table = resolveTable(kind);
    const { data, error } = await supabaseAdmin.from(table).select("*").order("name");
    dbError(error);
    return ok(req, camelize(data ?? []));
  },
  { allowedRoles: [UserRole.ADMIN] }
);

export const POST = withAuth(
  async (req, user, ctx) => {
    const kind = await idParam(ctx, "kind");
    const table = resolveTable(kind);
    const body = await parseBody(req, createSchema);

    let payload: Record<string, unknown> = { name: body.name.trim() };
    if (table === "cities") {
      payload.province = (body.province || "").trim() || "Indonesia";
    } else if (table === "field_types") {
      payload.code =
        (body.code || body.name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_");
    } else if (table === "facilities") {
      payload.icon = (body.icon || "sparkles").trim();
    }

    const { data, error } = await supabaseAdmin.from(table).insert(payload).select("*").single();
    dbError(error);
    await adminRepository.audit(user.id, `master.create.${kind}`, table, data!.id, `Menambah ${body.name}`, reqIp(req));
    return ok(req, camelize(data), undefined, 201);
  },
  { allowedRoles: [UserRole.ADMIN] }
);

export const PATCH = withAuth(
  async (req, user, ctx) => {
    const kind = await idParam(ctx, "kind");
    const table = resolveTable(kind);
    const body = await parseBody(req, patchSchema);

    const payload: Record<string, unknown> = {};
    if (body.name !== undefined) payload.name = body.name.trim();
    if (table === "cities" && body.province !== undefined) payload.province = body.province.trim();
    if (table === "field_types" && body.code !== undefined) payload.code = body.code.trim().toLowerCase();
    if (table === "facilities" && body.icon !== undefined) payload.icon = body.icon.trim();

    const { data, error } = await supabaseAdmin.from(table).update(payload).eq("id", body.id).select("*").single();
    dbError(error);
    await adminRepository.audit(user.id, `master.update.${kind}`, table, body.id, `Mengubah data ${body.name || body.id}`, reqIp(req));
    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.ADMIN] }
);

export const DELETE = withAuth(
  async (req, user, ctx) => {
    const kind = await idParam(ctx, "kind");
    const table = resolveTable(kind);
    const id = new URL(req.url).searchParams.get("id");
    if (!id) throw new AppError(ErrorCode.VALIDATION_ERROR, "ID wajib diisi.");
    const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
    dbError(error);
    await adminRepository.audit(user.id, `master.delete.${kind}`, table, id, `Menghapus data master ${id}`, reqIp(req));
    return ok(req, { id, deleted: true });
  },
  { allowedRoles: [UserRole.ADMIN] }
);
