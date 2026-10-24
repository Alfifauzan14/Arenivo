import { NextResponse } from "next/server";
import { env } from "../config/env";

export function getCorsHeaders(origin?: string | null) {
  const allowedOrigin = env.CORS_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": origin || allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Idempotency-Key",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleOptions(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
