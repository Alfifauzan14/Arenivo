import { z } from "zod";
import { AppError, ErrorCode, UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

const createPromoSchema = z.object({
  venueId: z.string().uuid(),
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
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const venueIds = await mitraRepository.venueIds(mitraId);
    if (venueIds.length === 0) return ok(req, []);

    const { data, error } = await supabaseAdmin
      .from("promos")
      .select("*, venues(id, name)")
      .in("venue_id", venueIds)
      .order("created_at", { ascending: false });
    dbError(error);
    return ok(req, camelize(data ?? []));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);

export const POST = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, createPromoSchema);
    const venueIds = await mitraRepository.venueIds(mitraId);
    if (!venueIds.includes(body.venueId)) {
      throw new AppError(ErrorCode.FORBIDDEN, "Venue bukan milik Anda");
    }

    const { data, error } = await supabaseAdmin
      .from("promos")
      .insert({
        code: body.code.toUpperCase().trim(),
        venue_id: body.venueId,
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
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);

export const PATCH = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, patchPromoSchema);
    const venueIds = await mitraRepository.venueIds(mitraId);

    const { data, error } = await supabaseAdmin
      .from("promos")
      .update({
        ...(body.isActive !== undefined ? { is_active: body.isActive } : {}),
        ...(body.quota !== undefined ? { quota: body.quota } : {}),
        ...(body.endDate !== undefined ? { end_date: body.endDate } : {})
      })
      .eq("id", body.id)
      .in("venue_id", venueIds.length ? venueIds : ["00000000-0000-0000-0000-000000000000"])
      .select("*")
      .single();
    dbError(error);
    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
