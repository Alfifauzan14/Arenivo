import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import {
  AppError,
  ErrorCode,
  successResponse,
  type PaginationMeta,
} from "@futsal/shared";
import { supabaseAdmin } from "./supabase";
import { getCorsHeaders } from "../middleware/cors";
import { handleApiError } from "../middleware/error-handler";

/** snake_case -> camelCase (rekursif) agar field JSON sesuai kontrak (PRD 5.3) */
export function camelize<T = any>(input: any): T {
  if (Array.isArray(input)) return input.map(camelize) as any;
  if (input && typeof input === "object" && !(input instanceof Date)) {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        camelize(v),
      ])
    ) as any;
  }
  return input;
}

export function ok(req: Request, data: unknown, meta?: PaginationMeta, status = 200) {
  return NextResponse.json(successResponse(data, meta), {
    status,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

/** Bungkus route publik agar error ditangani seragam */
export function publicRoute<C = any>(fn: (req: Request, ctx: C) => Promise<NextResponse>) {
  return async (req: Request, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      return handleApiError(e, req);
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown = {};
  try {
    raw = await req.json();
  } catch {
    raw = {};
  }
  return schema.parse(raw);
}

export function pagination(req: Request, defaultLimit = 20) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || defaultLimit)));
  return { page, limit, from: (page - 1) * limit, to: page * limit - 1, url };
}

export function meta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

const KNOWN_CODES = new Set<string>(Object.values(ErrorCode));

/** Panggil fungsi RPC PostgreSQL; exception bisnis (MESSAGE = kode error) dipetakan ke AppError */
export async function rpc<T = any>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabaseAdmin.rpc(fn, args);
  if (error) {
    const code = error.message?.trim();
    if (code && KNOWN_CODES.has(code)) {
      throw new AppError(code as ErrorCode, messageFor(code as ErrorCode));
    }
    throw new AppError(ErrorCode.INTERNAL_ERROR, error.message);
  }
  return camelize<T>(data);
}

const MESSAGES: Partial<Record<ErrorCode, string>> = {
  SLOT_TAKEN: "Slot sudah dipesan. Silakan pilih jam lain.",
  OUT_OF_OPERATING_HOURS: "Jam yang dipilih di luar jam operasional atau batas pemesanan.",
  PROMO_INVALID: "Kode promo tidak valid, kedaluwarsa, atau syarat belum terpenuhi.",
  CANCEL_NOT_ALLOWED: "Pesanan ini tidak dapat dibatalkan.",
  RESCHEDULE_NOT_ALLOWED: "Pesanan ini tidak dapat dijadwalkan ulang.",
  PAYOUT_BELOW_MINIMUM: "Nominal pencairan di bawah batas minimum.",
  INSUFFICIENT_BALANCE: "Saldo yang bisa dicairkan tidak mencukupi.",
  NOT_FOUND: "Data tidak ditemukan.",
  INVALID_STATUS_TRANSITION: "Perubahan status tidak diperbolehkan.",
  VALIDATION_ERROR: "Data yang dikirimkan tidak valid.",
};
function messageFor(code: ErrorCode) {
  return MESSAGES[code] || code;
}

/** Ambil satu baris atau lempar 404 */
export function orNotFound<T>(row: T | null | undefined): T {
  if (!row) throw new AppError(ErrorCode.NOT_FOUND, "Data tidak ditemukan.");
  return row;
}

export function dbError(error: { message: string } | null) {
  if (error) throw new AppError(ErrorCode.INTERNAL_ERROR, error.message);
}

export async function idParam(ctx: { params: Promise<Record<string, string>> }, key = "id") {
  return (await ctx.params)[key];
}
