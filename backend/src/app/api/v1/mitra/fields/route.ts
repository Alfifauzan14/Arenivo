import { z } from "zod";
import { AppError, ErrorCode, UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";
import { mitraRepository } from "@/modules/mitra/mitra.repository";

export const OPTIONS = handleOptions;

const createFieldSchema = z.object({
  venueId: z.string().uuid(),
  fieldTypeId: z.string().uuid(),
  name: z.string().min(2).max(120),
  sizeDescription: z.string().max(120).optional().nullable(),
  surface: z.string().max(80).optional().nullable(),
  basePrice: z.number().int().min(0),
  operatingHours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: z.string(),
        closeTime: z.string(),
        isClosed: z.boolean().optional()
      })
    )
    .optional(),
  priceRules: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
        startTime: z.string(),
        endTime: z.string(),
        price: z.number().int().min(0),
        priority: z.number().int().optional()
      })
    )
    .optional()
});

const patchFieldSchema = z.object({
  id: z.string().uuid(),
  fieldTypeId: z.string().uuid().optional(),
  name: z.string().min(2).max(120).optional(),
  sizeDescription: z.string().max(120).optional().nullable(),
  surface: z.string().max(80).optional().nullable(),
  basePrice: z.number().int().min(0).optional(),
  status: z.enum(["aktif", "nonaktif"]).optional()
});

export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const venueIds = await mitraRepository.venueIds(mitraId);
    if (venueIds.length === 0) return ok(req, []);

    const { data, error } = await supabaseAdmin
      .from("fields")
      .select(
        "*, venues(id, name, slug), field_types(*), field_operating_hours(*), field_price_rules(*)"
      )
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
    const body = await parseBody(req, createFieldSchema);
    const venueIds = await mitraRepository.venueIds(mitraId);
    if (!venueIds.includes(body.venueId)) {
      throw new AppError(ErrorCode.FORBIDDEN, "Venue bukan milik Anda");
    }

    const { data: field, error } = await supabaseAdmin
      .from("fields")
      .insert({
        venue_id: body.venueId,
        field_type_id: body.fieldTypeId,
        name: body.name,
        size_description: body.sizeDescription ?? null,
        surface: body.surface ?? null,
        base_price: body.basePrice,
        status: "aktif"
      })
      .select("*")
      .single();
    dbError(error);

    const hours =
      body.operatingHours && body.operatingHours.length > 0
        ? body.operatingHours
        : [0, 1, 2, 3, 4, 5, 6].map((d) => ({
            dayOfWeek: d,
            openTime: "08:00",
            closeTime: "23:00",
            isClosed: false
          }));

    await supabaseAdmin.from("field_operating_hours").insert(
      hours.map((h) => ({
        field_id: field!.id,
        day_of_week: h.dayOfWeek,
        open_time: h.openTime,
        close_time: h.closeTime,
        is_closed: h.isClosed ?? false
      }))
    );

    if (body.priceRules && body.priceRules.length > 0) {
      await supabaseAdmin.from("field_price_rules").insert(
        body.priceRules.map((r) => ({
          field_id: field!.id,
          day_of_week: r.dayOfWeek ?? null,
          start_time: r.startTime,
          end_time: r.endTime,
          price: r.price,
          priority: r.priority ?? 0
        }))
      );
    }

    return ok(req, camelize(field), undefined, 201);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);

export const PATCH = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, patchFieldSchema);
    await mitraRepository.assertFieldOwned(mitraId, body.id);

    const { data, error } = await supabaseAdmin
      .from("fields")
      .update({
        ...(body.fieldTypeId !== undefined ? { field_type_id: body.fieldTypeId } : {}),
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.sizeDescription !== undefined ? { size_description: body.sizeDescription } : {}),
        ...(body.surface !== undefined ? { surface: body.surface } : {}),
        ...(body.basePrice !== undefined ? { base_price: body.basePrice } : {}),
        ...(body.status !== undefined ? { status: body.status } : {})
      })
      .eq("id", body.id)
      .select("*")
      .single();
    dbError(error);

    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
