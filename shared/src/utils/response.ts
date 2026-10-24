import { ErrorCode, ERROR_HTTP_STATUS_MAP } from "../constants/error-codes";
import type { ApiResponse, ApiErrorResponse, PaginationMeta, ErrorDetail } from "../schemas/api-response.schema";

/**
 * Helper untuk membuat response sukses standar
 */
export function successResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return {
    data,
    ...(meta ? { meta } : {}),
  };
}

/**
 * Helper untuk membuat response error standar
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: ErrorDetail[],
  requestId?: string
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  };
}

/**
 * Kelas error khusus aplikasi dengan kode error terstandarisasi
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = ERROR_HTTP_STATUS_MAP[code] || 500;
    this.details = details;
  }
}
