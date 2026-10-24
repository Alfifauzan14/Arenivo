import type { ApiResponse, ApiErrorResponse } from "@futsal/shared";
import {
  MOCK_VENUES,
  MOCK_FIELDS,
  MOCK_BOOKINGS,
  MOCK_CITIES,
  MOCK_FACILITIES,
  MOCK_FIELD_TYPES,
  MOCK_BANNERS,
  MOCK_MITRA_BALANCE,
  MOCK_PAYOUTS,
  generateMockSlots,
} from "./mock-data";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";
    this.useMock = import.meta.env.VITE_USE_MOCK === "true";
  }

  isMockMode(): boolean {
    return this.useMock;
  }

  setMockMode(enable: boolean) {
    this.useMock = enable;
  }

  private buildUrl(path: string, params?: RequestOptions["params"]): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(
      this.baseUrl.startsWith("http")
        ? `${this.baseUrl}${cleanPath}`
        : `${window.location.origin}${this.baseUrl}${cleanPath}`
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // Jika mock mode aktif, tangani dengan mock router
    if (this.useMock) {
      return this.handleMockRequest<T>(path, options);
    }

    try {
      const url = this.buildUrl(path, options.params);
      const headers = new Headers(options.headers);

      if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
        headers.set("Content-Type", "application/json");
      }

      // Sisipkan token jika tersimpan di localStorage
      const token = localStorage.getItem("sb_access_token");
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const res = await fetch(url, {
        ...options,
        headers,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorBody = json as ApiErrorResponse;
        throw errorBody.error
          ? errorBody
          : {
              error: {
                code: "INTERNAL_ERROR",
                message: res.statusText || "Terjadi kesalahan pada request",
              },
            };
      }

      return json as ApiResponse<T>;
    } catch (err: any) {
      // Jika backend tidak aktif dan kita mencoba panggil health/api, fallback halus
      if (err instanceof TypeError && err.message.includes("fetch")) {
        console.warn(`[ApiClient] Server unreachable at ${path}, falling back to mock response.`);
        return this.handleMockRequest<T>(path, options);
      }
      throw err;
    }
  }

  /**
   * Mock request handler untuk pengembangan antarmuka UI/UX
   */
  private async handleMockRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    // Simulasi delay jaringan alami (120ms)
    await new Promise((r) => setTimeout(r, 120));

    const method = (options.method || "GET").toUpperCase();

    // GET /health
    if (path === "/health" || path === "health") {
      return {
        data: {
          status: "ok",
          timestamp: new Date().toISOString(),
          uptime: 3600,
          version: "0.1.0-mock",
        } as unknown as T,
      };
    }

    // GET /venues
    if (path === "/venues" || path === "venues") {
      return {
        data: MOCK_VENUES as unknown as T,
        meta: { page: 1, limit: 10, total: MOCK_VENUES.length, totalPages: 1 },
      };
    }

    // GET /venues/:slug
    if (path.startsWith("/venues/") || path.startsWith("venues/")) {
      const slug = path.split("/").pop();
      const venue = MOCK_VENUES.find((v) => v.slug === slug || v.id === slug) || MOCK_VENUES[0];
      return { data: venue as unknown as T };
    }

    // GET /fields/:id/availability
    if (path.includes("/availability")) {
      const date = (options.params?.date as string) || new Date().toISOString().split("T")[0];
      const slots = generateMockSlots("fld-1", date);
      return { data: slots as unknown as T };
    }

    // GET /bookings
    if (path === "/bookings" || path === "bookings") {
      return {
        data: MOCK_BOOKINGS as unknown as T,
        meta: { page: 1, limit: 10, total: MOCK_BOOKINGS.length, totalPages: 1 },
      };
    }

    // GET /bookings/:id
    if (path.startsWith("/bookings/") || path.startsWith("bookings/")) {
      const id = path.split("/").pop();
      const booking = MOCK_BOOKINGS.find((b) => b.id === id || b.bookingCode === id) || MOCK_BOOKINGS[0];
      return { data: booking as unknown as T };
    }

    // Master data
    if (path.includes("master/cities")) return { data: MOCK_CITIES as unknown as T };
    if (path.includes("master/facilities")) return { data: MOCK_FACILITIES as unknown as T };
    if (path.includes("master/field-types")) return { data: MOCK_FIELD_TYPES as unknown as T };
    if (path.includes("banners")) return { data: MOCK_BANNERS as unknown as T };
    if (path.includes("mitra/balance")) return { data: MOCK_MITRA_BALANCE as unknown as T };
    if (path.includes("mitra/payouts")) return { data: MOCK_PAYOUTS as unknown as T };

    // Default fallback
    return {
      data: { success: true } as unknown as T,
    };
  }

  // HTTP Helper Methods
  async get<T>(path: string, params?: RequestOptions["params"]): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET", params });
  }

  async post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "DELETE" });
  }

  /**
   * Health Check API
   */
  async getHealth(): Promise<{ status: string; timestamp: string; isRealBackend: boolean }> {
    try {
      const res = await fetch(this.buildUrl("/health"), { method: "GET" });
      if (res.ok) {
        const json = await res.json();
        return {
          status: json.data?.status || "ok",
          timestamp: json.data?.timestamp || new Date().toISOString(),
          isRealBackend: true,
        };
      }
    } catch {
      // ignore
    }

    return {
      status: "mock",
      timestamp: new Date().toISOString(),
      isRealBackend: false,
    };
  }
}

export const apiClient = new ApiClient();
