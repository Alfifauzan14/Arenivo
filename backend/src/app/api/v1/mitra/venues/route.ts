import { z } from "zod";
import { UserRole } from "@futsal/shared";
import { withAuth } from "@/middleware/auth";
import { handleOptions } from "@/middleware/cors";
import { supabaseAdmin } from "@/lib/supabase";
import { camelize, dbError, ok, parseBody } from "@/lib/http";

export const OPTIONS = handleOptions;

const createVenueSchema = z.object({
  cityId: z.string().uuid(),
  name: z.string().min(3).max(140),
  slug: z.string().min(3).max(160).optional(),
  description: z.string().max(2000).optional().nullable(),
  address: z.string().min(5).max(500),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  youtubeUrl: z.string().url().optional().nullable(),
  rules: z.string().max(2000).optional().nullable(),
  facilityIds: z.array(z.string().uuid()).optional(),
  photos: z
    .array(
      z.object({
        url: z.string(),
        isCover: z.boolean().optional()
      })
    )
    .optional()
});

const patchVenueSchema = createVenueSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(["aktif", "nonaktif"]).optional()
});

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

export const GET = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const { data, error } = await supabaseAdmin
      .from("venues")
      .select(
        "*, cities(*), venue_photos(*), venue_facilities(facility_id, facilities(*)), fields(*, field_types(*))"
      )
      .eq("mitra_id", mitraId)
      .order("created_at", { ascending: false });
    dbError(error);
    return ok(req, camelize(data ?? []));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN] }
);

export const POST = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, createVenueSchema);
    const slug = body.slug || slugify(body.name);

    const { data: venue, error } = await supabaseAdmin
      .from("venues")
      .insert({
        mitra_id: mitraId,
        city_id: body.cityId,
        slug,
        name: body.name,
        description: body.description ?? null,
        address: body.address,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        youtube_url: body.youtubeUrl ?? null,
        rules: body.rules ?? null,
        status: "aktif"
      })
      .select("*")
      .single();
    dbError(error);

    if (body.facilityIds && body.facilityIds.length > 0) {
      await supabaseAdmin.from("venue_facilities").insert(
        body.facilityIds.map((fid: string) => ({
          venue_id: venue!.id,
          facility_id: fid
        }))
      );
    }

    if (body.photos && body.photos.length > 0) {
      await supabaseAdmin.from("venue_photos").insert(
        body.photos.map((p: { url: string; isCover?: boolean }, idx: number) => ({
          venue_id: venue!.id,
          url: p.url,
          is_cover: p.isCover ?? idx === 0,
          sort_order: idx
        }))
      );
    }

    return ok(req, camelize(venue), undefined, 201);
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);

export const PATCH = withAuth(
  async (req, user) => {
    const mitraId = user.mitraProfile?.id ?? user.id;
    const body = await parseBody(req, patchVenueSchema);

    const { data, error } = await supabaseAdmin
      .from("venues")
      .update({
        ...(body.cityId !== undefined ? { city_id: body.cityId } : {}),
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.latitude !== undefined ? { latitude: body.latitude } : {}),
        ...(body.longitude !== undefined ? { longitude: body.longitude } : {}),
        ...(body.youtubeUrl !== undefined ? { youtube_url: body.youtubeUrl } : {}),
        ...(body.rules !== undefined ? { rules: body.rules } : {}),
        ...(body.status !== undefined ? { status: body.status } : {})
      })
      .eq("id", body.id)
      .eq("mitra_id", mitraId)
      .select("*")
      .single();
    dbError(error);

    return ok(req, camelize(data));
  },
  { allowedRoles: [UserRole.MITRA, UserRole.ADMIN], requireApprovedMitra: true }
);
