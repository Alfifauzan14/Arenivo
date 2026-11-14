import { NextResponse } from "next/server";
import { env } from "../config/env";

function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  if (env.CORS_ORIGINS) {
    env.CORS_ORIGINS.split(",").forEach((o) => origins.add(o.trim()));
  }

  if (env.CORS_ORIGIN) {
    origins.add(env.CORS_ORIGIN);
  }

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:5173");
    origins.add("http://127.0.0.1:5173");
  }

  return Array.from(origins);
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin);
}

export function getCorsHeaders(origin?: string | null) {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = origin && isOriginAllowed(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Idempotency-Key",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function handleOptions(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}