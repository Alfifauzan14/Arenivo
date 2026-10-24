import * as React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { MitraLayout } from "@/layouts/MitraLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// 1. Publik & Penyewa Pages
import { LandingPage } from "@/pages/public/LandingPage";
import { VenueExplorePage } from "@/pages/public/VenueExplorePage";
import { VenueDetailPage } from "@/pages/public/VenueDetailPage";
import { MitraLandingPage } from "@/pages/public/MitraLandingPage";
import { AuthPage } from "@/pages/public/AuthPage";
import { ForgotPasswordPage } from "@/pages/public/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/public/ResetPasswordPage";
import { TikTokCallbackPage } from "@/pages/public/TikTokCallbackPage";

// 2. Penyewa Portal Pages
import { CheckoutPage } from "@/pages/penyewa/CheckoutPage";
import { BookingListPage } from "@/pages/penyewa/BookingListPage";
import { BookingDetailPage } from "@/pages/penyewa/BookingDetailPage";
import { FavoritesPage } from "@/pages/penyewa/FavoritesPage";
import { NotificationsPage } from "@/pages/penyewa/NotificationsPage";
import { ProfilePage } from "@/pages/penyewa/ProfilePage";

// 3. Mitra Lapangan Pages
import { MitraAuthPage } from "@/pages/mitra/MitraAuthPage";
import { MitraDashboardPage } from "@/pages/mitra/MitraDashboardPage";
import { MitraSchedulePage } from "@/pages/mitra/MitraSchedulePage";
import { MitraBookingsPage } from "@/pages/mitra/MitraBookingsPage";
import { MitraScannerPage } from "@/pages/mitra/MitraScannerPage";
import { MitraFinancePage } from "@/pages/mitra/MitraFinancePage";
import { MitraVenuesPage } from "@/pages/mitra/MitraVenuesPage";
import { MitraFieldsPage } from "@/pages/mitra/MitraFieldsPage";
import { MitraReviewsPage } from "@/pages/mitra/MitraReviewsPage";
import { MitraPromosPage } from "@/pages/mitra/MitraPromosPage";
import { MitraProfilePage } from "@/pages/mitra/MitraProfilePage";
import { MitraApplicationPage } from "@/pages/mitra/MitraApplicationPage";

// 4. Super Admin Pages
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminMitraPage } from "@/pages/admin/AdminMitraPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminVenuesPage } from "@/pages/admin/AdminVenuesPage";
import { AdminMasterDataPage } from "@/pages/admin/AdminMasterDataPage";
import { AdminTransactionsPage } from "@/pages/admin/AdminTransactionsPage";
import { AdminRefundsPage } from "@/pages/admin/AdminRefundsPage";
import { AdminPayoutsPage } from "@/pages/admin/AdminPayoutsPage";
import { AdminContentPage } from "@/pages/admin/AdminContentPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";
import { AdminAuditLogsPage } from "@/pages/admin/AdminAuditLogsPage";

export const router = createBrowserRouter([
  // 1. Publik & Penyewa Routes (With Floating Navbar & Chatbot)
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "venues", element: <VenueExplorePage /> },
      { path: "venues/:slug", element: <VenueDetailPage /> },
      { path: "promo", element: <VenueExplorePage /> },
      { path: "jadi-mitra", element: <MitraLandingPage /> },
      { path: "checkout/:bookingId", element: <CheckoutPage /> },
      { path: "bookings", element: <BookingListPage /> },
      { path: "bookings/:id", element: <BookingDetailPage /> },
      { path: "pesanan", element: <BookingListPage /> },
      { path: "pesanan/:id", element: <BookingDetailPage /> },
      { path: "tiket/:id", element: <BookingDetailPage /> },
      { path: "favorites", element: <FavoritesPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },

  // 1.5. Standalone Auth Pages (No Floating Navbar, No Chatbot AI)
  { path: "/login", element: <AuthPage /> },
  { path: "/register", element: <AuthPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/auth/tiktok/callback", element: <TikTokCallbackPage /> },

  // 2. Mitra Lapangan Auth Routes (Standalone without sidebar)
  { path: "/mitra/login", element: <MitraAuthPage /> },
  { path: "/mitra/register", element: <MitraAuthPage /> },

  // 3. Mitra Lapangan Portal (/mitra)
  {
    path: "/mitra",
    element: <MitraLayout />,
    children: [
      { index: true, element: <MitraDashboardPage /> },
      { path: "jadwal", element: <MitraSchedulePage /> },
      { path: "schedule", element: <MitraSchedulePage /> },
      { path: "pesanan", element: <MitraBookingsPage /> },
      { path: "bookings", element: <MitraBookingsPage /> },
      { path: "scanner", element: <MitraScannerPage /> },
      { path: "keuangan", element: <MitraFinancePage /> },
      { path: "finance", element: <MitraFinancePage /> },
      { path: "venues", element: <MitraVenuesPage /> },
      { path: "venues/:venueId/fields", element: <MitraFieldsPage /> },
      { path: "reviews", element: <MitraReviewsPage /> },
      { path: "promos", element: <MitraPromosPage /> },
      { path: "profile", element: <MitraProfilePage /> },
      { path: "application", element: <MitraApplicationPage /> },
    ],
  },

  // 4. Super Admin Auth Route (Standalone)
  { path: "/admin/login", element: <AdminLoginPage /> },

  // 5. Super Admin Platform Portal (/admin)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "mitra", element: <AdminMitraPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "venues", element: <AdminVenuesPage /> },
      { path: "master", element: <AdminMasterDataPage /> },
      { path: "transactions", element: <AdminTransactionsPage /> },
      { path: "transaksi", element: <AdminTransactionsPage /> },
      { path: "refunds", element: <AdminRefundsPage /> },
      { path: "payouts", element: <AdminPayoutsPage /> },
      { path: "content", element: <AdminContentPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
      { path: "audit-logs", element: <AdminAuditLogsPage /> },
    ],
  },

  // Fallback Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
