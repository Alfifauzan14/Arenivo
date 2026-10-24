import { publicRoute, ok, idParam } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { venuesRepository } from "@/modules/venues/venues.repository";

export const OPTIONS = handleOptions;

export const GET = publicRoute(async (req, ctx: any) => {
  const slug = await idParam(ctx, "slug");
  return ok(req, await venuesRepository.bySlug(slug));
});
