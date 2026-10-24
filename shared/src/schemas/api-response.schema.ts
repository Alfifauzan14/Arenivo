import { z } from "zod";
import { ErrorCode } from "../constants/error-codes";

/**
 * Metadata pagination untuk list response
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Format standar response sukses API
 * Sesuai PRD 7.1: { data, meta? }
 */
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: PaginationMetaSchema.optional(),
  });

export interface ApiResponse<T = any> {
  data: T;
  meta?: PaginationMeta;
}

/**
 * Detail error untuk field form / validasi
 */
export const ErrorDetailSchema = z.object({
  field: z.string().optional(),
  issue: z.string(),
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;

/**
 * Format standar response error API
 * Sesuai PRD 7.1: { error: { code, message, details?, requestId? } }
 */
export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.nativeEnum(ErrorCode as any),
    message: z.string(),
    details: z.array(ErrorDetailSchema).optional(),
    requestId: z.string().optional(),
  }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
