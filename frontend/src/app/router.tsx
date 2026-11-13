import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { MitraLayout } from "@/layouts/MitraLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// ─── Lazy-loaded Pages ──────────────────────────────────────────────
// Setiap halaman hanya didownload saat user mengaksesnya (code splitting)

// 1. Publik & Penyewa
const LandingPage = React.lazy(() => import("@/pages/public/LandingPage").then(m => ({ default: m.LandingPage })));
const VenueExplorePage = React.lazy(() => import("@/pages/public/VenueExplorePage").then(m => ({ default: m.VenueExplorePage })));
const VenueDetailPage = React.lazy(() => import("@/pages/public/VenueDetailPage").then(m => ({ default: m.VenueDetailPage })));
const MitraLandingPage = React.lazy(() => import("@/pages/public/MitraLandingPage").then(m => ({ default: m.MitraLandingPage })));
const AuthPage = React.lazy(() => import("@/pages/public/AuthPage").then(m => ({ default: m.AuthPage })));
const ForgotPasswordPage = React.lazy(() => import("@/pages/public/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import("@/pages/public/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));

// 2. Penyewa Portal
const CheckoutPage = React.lazy(() => import("@/pages/penyewa/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const BookingListPage = React.lazy(() => import("@/pages/penyewa/BookingListPage").then(m => ({ default: m.BookingListPage })));
const BookingDetailPage = React.lazy(() => import("@/pages/penyewa/BookingDetailPage").then(m => ({ default: m.BookingDetailPage })));
const FavoritesPage = React.lazy(() => import("@/pages/penyewa/FavoritesPage").then(m => ({ default: m.FavoritesPage })));
const NotificationsPage = React.lazy(() => import("@/pages/penyewa/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const ProfilePage = React.lazy(() => import("@/pages/penyewa/ProfilePage").then(m => ({ default: m.ProfilePage })));

// 3. Mitra Lapangan
const MitraAuthPage = React.lazy(() => import("@/pages/mitra/MitraAuthPage").then(m => ({ default: m.MitraAuthPage })));
const MitraDashboardPage = React.lazy(() => import("@/pages/mitra/MitraDashboardPage").then(m => ({ default: m.MitraDashboardPage })));
const MitraSchedulePage = React.lazy(() => import("@/pages/mitra/MitraSchedulePage").then(m => ({ default: m.MitraSchedulePage })));
const MitraBookingsPage = React.lazy(() => import("@/pages/mitra/MitraBookingsPage").then(m => ({ default: m.MitraBookingsPage })));
const MitraScannerPage = React.lazy(() => import("@/pages/mitra/MitraScannerPage").then(m => ({ default: m.MitraScannerPage })));
const MitraFinancePage = React.lazy(() => import("@/pages/mitra/MitraFinancePage").then(m => ({ default: m.MitraFinancePage })));
const MitraVenuesPage = React.lazy(() => import("@/pages/mitra/MitraVenuesPage").then(m => ({ default: m.MitraVenuesPage })));
const MitraFieldsPage = React.lazy(() => import("@/pages/mitra/MitraFieldsPage").then(m => ({ default: m.MitraFieldsPage })));
const MitraReviewsPage = React.lazy(() => import("@/pages/mitra/MitraReviewsPage").then(m => ({ default: m.MitraReviewsPage })));
const MitraPromosPage = React.lazy(() => import("@/pages/mitra/MitraPromosPage").then(m => ({ default: m.MitraPromosPage })));
const MitraProfilePage = React.lazy(() => import("@/pages/mitra/MitraProfilePage").then(m => ({ default: m.MitraProfilePage })));
const MitraApplicationPage = React.lazy(() => import("@/pages/mitra/MitraApplicationPage").then(m => ({ default: m.MitraApplicationPage })));

// 4. Super Admin
const AdminLoginPage = React.lazy(() => import("@/pages/admin/AdminLoginPage").then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = React.lazy(() => import("@/pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminMitraPage = React.lazy(() => import("@/pages/admin/AdminMitraPage").then(m => ({ default: m.AdminMitraPage })));
const AdminUsersPage = React.lazy(() => import("@/pages/admin/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminVenuesPage = React.lazy(() => import("@/pages/admin/AdminVenuesPage").then(m => ({ default: m.AdminVenuesPage })));
const AdminMasterDataPage = React.lazy(() => import("@/pages/admin/AdminMasterDataPage").then(m => ({ default: m.AdminMasterDataPage })));
const AdminTransactionsPage = React.lazy(() => import("@/pages/admin/AdminTransactionsPage").then(m => ({ default: m.AdminTransactionsPage })));
const AdminRefundsPage = React.lazy(() => import("@/pages/admin/AdminRefundsPage").then(m => ({ default: m.AdminRefundsPage })));
const AdminPayoutsPage = React.lazy(() => import("@/pages/admin/AdminPayoutsPage").then(m => ({ default: m.AdminPayoutsPage })));
const AdminContentPage = React.lazy(() => import("@/pages/admin/AdminContentPage").then(m => ({ default: m.AdminContentPage })));
const AdminSettingsPage = React.lazy(() => import("@/pages/admin/AdminSettingsPage").then(m => ({ default: m.AdminSettingsPage })));
const AdminAuditLogsPage = React.lazy(() => import("@/pages/admin/AdminAuditLogsPage").then(m => ({ default: m.AdminAuditLogsPage })));

// ─── Page Loading Fallback ──────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Memuat halaman...</p>
      </div>
    </div>
  );
}

/** Wrap lazy component with Suspense */
function lazy(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Component />
    </React.Suspense>
  );
}

export const router = createBrowserRouter([
  // 1. Publik & Penyewa Routes (With Floating Navbar & Chatbot)
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: lazy(LandingPage) },
      { path: "venues", element: lazy(VenueExplorePage) },
      { path: "venues/:slug", element: lazy(VenueDetailPage) },
      { path: "promo", element: lazy(VenueExplorePage) },
      { path: "jadi-mitra", element: lazy(MitraLandingPage) },
      { path: "checkout/:bookingId", element: lazy(CheckoutPage) },
      { path: "bookings", element: lazy(BookingListPage) },
      { path: "bookings/:id", element: lazy(BookingDetailPage) },
      { path: "pesanan", element: lazy(BookingListPage) },
      { path: "pesanan/:id", element: lazy(BookingDetailPage) },
      { path: "tiket/:id", element: lazy(BookingDetailPage) },
      { path: "favorites", element: lazy(FavoritesPage) },
      { path: "notifications", element: lazy(NotificationsPage) },
      { path: "profile", element: lazy(ProfilePage) },
    ],
  },

  // 1.5. Standalone Auth Pages (No Floating Navbar, No Chatbot AI)
  { path: "/login", element: lazy(AuthPage) },
  { path: "/register", element: lazy(AuthPage) },
  { path: "/forgot-password", element: lazy(ForgotPasswordPage) },
  { path: "/reset-password", element: lazy(ResetPasswordPage) },


  // 2. Mitra Lapangan Auth Routes (Standalone without sidebar)
  { path: "/mitra/login", element: lazy(MitraAuthPage) },
  { path: "/mitra/register", element: lazy(MitraAuthPage) },

  // 3. Mitra Lapangan Portal (/mitra)
  {
    path: "/mitra",
    element: <MitraLayout />,
    children: [
      { index: true, element: lazy(MitraDashboardPage) },
      { path: "jadwal", element: lazy(MitraSchedulePage) },
      { path: "schedule", element: lazy(MitraSchedulePage) },
      { path: "pesanan", element: lazy(MitraBookingsPage) },
      { path: "bookings", element: lazy(MitraBookingsPage) },
      { path: "scanner", element: lazy(MitraScannerPage) },
      { path: "keuangan", element: lazy(MitraFinancePage) },
      { path: "finance", element: lazy(MitraFinancePage) },
      { path: "venues", element: lazy(MitraVenuesPage) },
      { path: "venues/:venueId/fields", element: lazy(MitraFieldsPage) },
      { path: "reviews", element: lazy(MitraReviewsPage) },
      { path: "promos", element: lazy(MitraPromosPage) },
      { path: "profile", element: lazy(MitraProfilePage) },
      { path: "application", element: lazy(MitraApplicationPage) },
    ],
  },

  // 4. Super Admin Auth Route (Standalone)
  { path: "/admin/login", element: lazy(AdminLoginPage) },

  // 5. Super Admin Platform Portal (/admin)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: lazy(AdminDashboardPage) },
      { path: "mitra", element: lazy(AdminMitraPage) },
      { path: "users", element: lazy(AdminUsersPage) },
      { path: "venues", element: lazy(AdminVenuesPage) },
      { path: "master", element: lazy(AdminMasterDataPage) },
      { path: "transactions", element: lazy(AdminTransactionsPage) },
      { path: "transaksi", element: lazy(AdminTransactionsPage) },
      { path: "refunds", element: lazy(AdminRefundsPage) },
      { path: "payouts", element: lazy(AdminPayoutsPage) },
      { path: "content", element: lazy(AdminContentPage) },
      { path: "settings", element: lazy(AdminSettingsPage) },
      { path: "audit-logs", element: lazy(AdminAuditLogsPage) },
    ],
  },

  // Fallback Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
