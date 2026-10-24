import { publicRoute, ok } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { masterRepository } from "@/modules/venues/venues.repository";

export const OPTIONS = handleOptions;

export const GET = publicRoute(async (req) => ok(req, await masterRepository.banners()));
