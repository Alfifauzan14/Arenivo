import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const createPromoSchema = z.object({
  venueId: z.string().uuid().optional().nullable(),
  code: z.string().min(3).max(30),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().int().min(1),
  maxDiscount: z.number().int().optional().nullable(),
  minSpend: z.number().int().optional(),
  quota: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime()
});

const patchPromoSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean().optional(),
  quota: z.number().int().min(0).optional(),
  endDate: z.string().datetime().optional()
});

export const GET = withAuth(
  async (req) => {
    const { data, error } = await supabaseAdmin
      .from("promos")
      .select("*, venues(id, name)")
      .order("created_at", { ascending: false });
    dbError(error);
    return ok(req, camelize(data ?? []));
  },
  { allowedRoles: [UserRole.ADMIN] }
);

export const POST = withAuth(
  async (req) => {
    const body = await parseBody(req, createPromoSchema);
    const { data, error } = await supabaseAdmin
      .from("promos")
      .insert({
        venue_id: body.venueId ?? null,
        code: body.code.toUpperCase().trim(),
        discount_type: body.discountType,
        discount_value: body.discountValue,
        max_discount: body.maxDiscount ?? null,
        min_spend: body.minSpend ?? 0,
        quota: body.quota ?? 0,
        start_date: body.startDate ?? new Date().toISOString(),
        end_date: body.endDate,
        is_active: true
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
    const body = await parseBody(req, patchPromoSchema);
    const { data, error } = await supabaseAdmin
      .from("promos")
      .update({
        ...(body.isActive !== undefined ? { is_active: body.isActive } : {}),
        ...(body.quota !== undefined ? { quota: body.quota } : {}),
        ...(body.endDate !== undefined ? { end_date: body.endDate } : {})
      })
      .eq("id", body.id)
      .select("*")
      .single();
    dbError(error);
    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.ADMIN] }
);
