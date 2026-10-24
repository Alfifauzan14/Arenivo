import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const createBannerSchema = z.object({
  title: z.string().min(2).max(150),
  imageUrl: z.string().min(3),
  linkUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
});

const patchBannerSchema = createBannerSchema.partial().extend({
  id: z.string().uuid()
});

export const GET = withAuth(
  async (req) => {
    const { data, error } = await supabaseAdmin
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    dbError(error);
    return ok(req, camelize(data ?? []));
  },
  { allowedRoles: [UserRole.ADMIN] }
);

export const POST = withAuth(
  async (req) => {
    const body = await parseBody(req, createBannerSchema);
    const { data, error } = await supabaseAdmin
      .from("banners")
      .insert({
        title: body.title,
        image_url: body.imageUrl,
        link_url: body.linkUrl ?? null,
        sort_order: body.sortOrder ?? 0,
        is_active: body.isActive ?? true
      })
      .select("*")
      .single();
    dbError(error);
    return ok(req, camelize(data), undefined, 201);
  },
  { allowedRoles: [UserRole.ADMIN] }
);

export const PATCH = withAuth(
  async (req) => {
    const body = await parseBody(req, patchBannerSchema);
    const { data, error } = await supabaseAdmin
      .from("banners")
      .update({
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.imageUrl !== undefined ? { image_url: body.imageUrl } : {}),
        ...(body.linkUrl !== undefined ? { link_url: body.linkUrl } : {}),
        ...(body.sortOrder !== undefined ? { sort_order: body.sortOrder } : {}),
        ...(body.isActive !== undefined ? { is_active: body.isActive } : {})
      })
      .eq("id", body.id)
      .select("*")
      .single();
    dbError(error);
    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.ADMIN] }
);
