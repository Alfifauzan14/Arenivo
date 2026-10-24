import { AppError, ErrorCode } from "@futsal/shared";
import { publicRoute, ok, idParam } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { masterRepository } from "@/modules/venues/venues.repository";

export const OPTIONS = handleOptions;

export const GET = publicRoute(async (req, ctx: any) => {
  const kind = await idParam(ctx, "kind");
  if (!["cities", "facilities", "field-types"].includes(kind)) {
    throw new AppError(ErrorCode.NOT_FOUND, "Data master tidak ditemukan.");
  }
  return ok(req, await masterRepository.list(kind as any));
});
