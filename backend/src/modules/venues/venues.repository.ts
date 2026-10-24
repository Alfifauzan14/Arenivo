import { supabaseAdmin } from "../../lib/supabase";
import { camelize, dbError, orNotFound } from "../../lib/http";

const VENUE_SELECT = `*, city:cities(*), photos:venue_photos(*),
  facilities:venue_facilities(facility:facilities(*)),
  fields(id, base_price, status, field_type:field_types(*))`;

function shape(row: any) {
  const v = camelize<any>(row);
  const activeFields = (v.fields || []).filter((f: any) => f.status === "aktif");
  return {
    ...v,
    facilities: (v.facilities || []).map((x: any) => x.facility),
    photos: (v.photos || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder),
    startingPrice: activeFields.length ? Math.min(...activeFields.map((f: any) => f.basePrice)) : 0,
    fieldTypeCodes: Array.from(new Set(activeFields.map((f: any) => f.fieldType?.code).filter(Boolean))),
  };
}

export interface VenueFilter {
  q?: string;
  cityId?: string;
  fieldType?: string;
  facilityId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "rating" | "termurah" | "terbaru";
}

export const venuesRepository = {
  async list(filter: VenueFilter) {
    let q = supabaseAdmin.from("venues").select(VENUE_SELECT).eq("status", "aktif");
    if (filter.q) q = q.ilike("name", `%${filter.q}%`);
    if (filter.cityId) q = q.eq("city_id", filter.cityId);
    if (filter.minRating) q = q.gte("rating_avg", filter.minRating);
    const { data, error } = await q;
    dbError(error);

    let rows = (data || []).map(shape);
    if (filter.fieldType) rows = rows.filter((v) => v.fieldTypeCodes.includes(filter.fieldType));
    if (filter.facilityId) rows = rows.filter((v) => v.facilities.some((f: any) => f.id === filter.facilityId));
    if (filter.minPrice != null) rows = rows.filter((v) => v.startingPrice >= filter.minPrice!);
    if (filter.maxPrice != null) rows = rows.filter((v) => v.startingPrice <= filter.maxPrice!);

    if (filter.sort === "termurah") rows.sort((a, b) => a.startingPrice - b.startingPrice);
    else if (filter.sort === "terbaru") rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    else rows.sort((a, b) => b.ratingAvg - a.ratingAvg);
    return rows;
  },

  async bySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from("venues")
      .select(VENUE_SELECT + ", refund_rules(*)")
      .eq("slug", slug)
      .eq("status", "aktif")
      .maybeSingle();
    dbError(error);
    return shape(orNotFound(data));
  },

  async reviews(venueId: string, from: number, to: number) {
    const { data, error, count } = await supabaseAdmin
      .from("reviews")
      .select("*, user:profiles(full_name, avatar_url)", { count: "exact" })
      .eq("venue_id", venueId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .range(from, to);
    dbError(error);
    return { rows: camelize<any[]>(data || []), total: count || 0 };
  },

  async idBySlug(slug: string) {
    const { data } = await supabaseAdmin.from("venues").select("id").eq("slug", slug).maybeSingle();
    return orNotFound(data).id as string;
  },
};

export const masterRepository = {
  async list(kind: "cities" | "facilities" | "field-types") {
    const table = kind === "field-types" ? "field_types" : kind;
    const { data, error } = await supabaseAdmin.from(table).select("*").order("name");
    dbError(error);
    return camelize<any[]>(data || []);
  },
  async banners() {
    const { data, error } = await supabaseAdmin
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    dbError(error);
    return camelize<any[]>(data || []);
  },
};
