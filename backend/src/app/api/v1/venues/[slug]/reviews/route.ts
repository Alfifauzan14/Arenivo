import { publicRoute, ok, idParam, pagination, meta } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { venuesRepository } from "@/modules/venues/venues.repository";

export const OPTIONS = handleOptions;

export const GET = publicRoute(async (req, ctx: any) => {
  const slug = await idParam(ctx, "slug");
  const { page, limit, from, to } = pagination(req, 10);
  const venueId = await venuesRepository.idBySlug(slug);
  const { rows, total } = await venuesRepository.reviews(venueId, from, to);
  return ok(req, rows, meta(page, limit, total));
});
