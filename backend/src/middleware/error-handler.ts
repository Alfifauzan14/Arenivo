import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  ErrorCode,
  ERROR_HTTP_STATUS_MAP,
  errorResponse,
  AppError,
  type ErrorDetail,
} from "@futsal/shared";
import { getCorsHeaders } from "./cors";

export function handleApiError(error: unknown, req?: Request): NextResponse {
  const origin = req?.headers.get("origin");
  const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;

  // Log server errors
  console.error(`[API Error] [${requestId}]:`, error);

  // 1. AppError (Custom domain errors)
  if (error instanceof AppError) {
    return NextResponse.json(
      errorResponse(error.code, error.message, error.details, requestId),
      {
        status: error.statusCode,
        headers: getCorsHeaders(origin),
      }
    );
  }

  // 2. Zod validation errors
  if (error instanceof ZodError) {
    const details: ErrorDetail[] = error.issues.map((issue) => ({
      field: issue.path.join("."),
      issue: issue.message,
    }));

    return NextResponse.json(
      errorResponse(
        ErrorCode.VALIDATION_ERROR,
        "Data yang dikirimkan tidak valid",
        details,
        requestId
      ),
      {
        status: 400,
        headers: getCorsHeaders(origin),
      }
    );
  }

  // 3. Unhandled standard error
  const message =
    error instanceof Error ? error.message : "Terjadi kesalahan internal pada server";

  return NextResponse.json(
    errorResponse(ErrorCode.INTERNAL_ERROR, message, undefined, requestId),
    {
      status: ERROR_HTTP_STATUS_MAP[ErrorCode.INTERNAL_ERROR],
      headers: getCorsHeaders(origin),
    }
  );
}
