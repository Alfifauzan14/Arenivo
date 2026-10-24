import { NextResponse } from "next/server";
import { publicRoute } from "@/lib/http";
import { handleOptions, getCorsHeaders } from "@/middleware/cors";
import { webhooksService, type MidtransNotification } from "@/modules/webhooks/webhooks.service";

export const OPTIONS = handleOptions;

/** Webhook Midtrans: signature diverifikasi, diproses idempotent (PRD 9) */
export const POST = publicRoute(async (req) => {
  const payload = (await req.json()) as MidtransNotification;
  const result = await webhooksService.handleMidtrans(payload);
  return NextResponse.json({ ok: true, ...result }, { status: 200, headers: getCorsHeaders(req.headers.get("origin")) });
});
