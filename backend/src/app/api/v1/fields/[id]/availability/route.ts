import { AppError, ErrorCode } from "@futsal/shared";
import { publicRoute, ok, idParam } from "@/lib/http";
import { handleOptions } from "@/middleware/cors";
import { fieldsRepository } from "@/modules/fields/fields.repository";

export const OPTIONS = handleOptions;

export const GET = publicRoute(async (req, ctx: any) => {
  const id = await idParam(ctx);
  const date = new URL(req.url).searchParams.get("date") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Parameter date wajib berformat YYYY-MM-DD.");
  }
  return ok(req, await fieldsRepository.availability(id, date));
});
