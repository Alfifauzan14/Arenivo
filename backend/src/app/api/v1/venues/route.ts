import { publicRoute, ok, pagination, meta } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { venuesRepository } from "@/modules/venues/venues.repository";

export const OPTIONS = handleOptions;

export const GET = publicRoute(async (req) => {
  const { page, limit, from, url } = pagination(req, 12);
  const sp = url.searchParams;
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);

  const rows = await venuesRepository.list({
    q: sp.get("q") || undefined,
    cityId: sp.get("cityId") || undefined,
    fieldType: sp.get("fieldType") || undefined,
    facilityId: sp.get("facilityId") || undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    minRating: num("minRating"),
    sort: (sp.get("sort") as any) || "rating",
  });
  return ok(req, rows.slice(from, from + limit), meta(page, limit, rows.length));
});
