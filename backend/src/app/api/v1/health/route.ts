import { NextResponse } from "next/server";
import { successResponse } from "@futsal/shared";
import { healthService } from "../../../../modules/health/health.service";
import { getCorsHeaders, handleOptions } from "../../../../middleware/cors";

export async function OPTIONS(request: Request) {
  return handleOptions(request);
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const healthData = healthService.getHealth();

  return NextResponse.json(
    successResponse({
      status: healthData.status,
      timestamp: healthData.timestamp,
      uptime: healthData.uptimeSeconds,
      version: healthData.version,
    }),
    {
      status: 200,
      headers: getCorsHeaders(origin),
    }
  );
}
