import { NextResponse } from "next/server";
import { env } from "../config/env";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getClientKey(req: Request, prefix: string): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const path = new URL(req.url).pathname;
  return `${prefix}:${ip}:${path}`;
}

function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

setInterval(cleanupExpired, 60_000);

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
  prefix?: string;
}

export function withRateLimit(
  handler: (req: Request, context?: any) => Promise<NextResponse>,
  options: RateLimitOptions = {}
) {
  const maxRequests = options.maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS;
  const windowMs = options.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const prefix = options.prefix ?? "api";

  return async (req: Request, context?: any): Promise<NextResponse> => {
    const key = getClientKey(req, prefix);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count++;
      if (entry.count > maxRequests) {
        const resetIn = Math.ceil((entry.resetAt - now) / 1000);
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: `Terlalu banyak permintaan. Coba lagi dalam ${resetIn} detik.`,
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(resetIn),
              "X-RateLimit-Limit": String(maxRequests),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
            },
          }
        );
      }
    }

    const currentEntry = store.get(key)!;
    const response = await handler(req, context);

    response.headers.set("X-RateLimit-Limit", String(maxRequests));
    response.headers.set("X-RateLimit-Remaining", String(Math.max(0, maxRequests - currentEntry.count)));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(currentEntry.resetAt / 1000)));

    return response;
  };
}

export const authRateLimit = (handler: (req: Request, context?: any) => Promise<NextResponse>) =>
  withRateLimit(handler, {
    maxRequests: 5,
    windowMs: 60_000,
    prefix: "auth",
  });

export const bookingRateLimit = (handler: (req: Request, context?: any) => Promise<NextResponse>) =>
  withRateLimit(handler, {
    maxRequests: 10,
    windowMs: 60_000,
    prefix: "booking",
  });