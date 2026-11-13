import * as React from "react";

/**
 * Skeleton loading state for dashboard pages.
 * Shows animated placeholder cards while data is being fetched.
 */
export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-3 w-72 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
            </div>
            <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-48 w-full bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-full bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-page loading state for table-based pages.
 */
export function TableLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-3 w-72 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="h-10 bg-red-50/50 border-b border-slate-100 animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-slate-100 flex items-center px-4 gap-4">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-3 flex-1 bg-slate-100 rounded animate-pulse" style={{ maxWidth: `${60 + j * 20}px` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Error state component for failed API calls.
 */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-900">Gagal memuat data</p>
      <p className="text-xs text-slate-500 mt-1">{message || "Terjadi kesalahan saat mengambil data. Silakan coba lagi."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
