import * as React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Facebook,
  Heart,
  HelpCircle,
  Instagram,
  Linkedin,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Twitter,
  User,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo, BrandLogoIcon } from "@/components/common/BrandLogo";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";
import { useSession } from "@/features/auth/context/SessionContext";
import { ChatbotWidget } from "@/features/chatbot/components/ChatbotWidget";
import { MOCK_NOTIFICATIONS, type InAppNotification } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PublicLayout() {
  const { user, isLoggedIn, logout, favorites } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<InAppNotification[]>(MOCK_NOTIFICATIONS);

  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Route Conditions
  const isCheckout = location.pathname.startsWith("/checkout");
  const isTicket =
    location.pathname.startsWith("/tiket/") ||
    (location.pathname.startsWith("/bookings/") && location.pathname !== "/bookings") ||
    (location.pathname.startsWith("/pesanan/") && location.pathname !== "/pesanan");

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFC] text-slate-900 relative">
      {/* Decorative Sport Background Pattern */}
      <CleanBackgroundPattern />

      {/* HEADER SECTION (Conditional based on flow) */}
      {isTicket ? (
        /* 1. CLEAN OFFICIAL E-TIKET HEADER (No distracting navbar, clean official ticket view) */
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md md:bg-white md:backdrop-blur-none border-b border-slate-200/90 px-4 sm:px-6 py-3.5 pt-safe no-print shadow-xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            {/* Logo & Official Badge */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <BrandLogoIcon size="sm" className="w-8 h-8" />
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Aren<span className="text-red-600">ivo</span>
                </span>
              </Link>
              <span className="hidden sm:inline-block w-px h-5 bg-slate-200" />
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                E-Tiket Resmi
              </span>
            </div>

            {/* Action Buttons: Kembali ke Riwayat Pesanan & Cetak */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                title="Cetak Tiket"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>

              <Link
                to="/pesanan"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Kembali ke Riwayat Pesanan</span>
                <span className="sm:hidden">Pesanan Saya</span>
              </Link>
            </div>
          </div>
        </header>
      ) : isCheckout ? (
        /* 2. CHECKOUT FLOW: NAV DIHILANGKAN TOTAL (Per Request #3: Nav tidak boleh ikut saat mau bayar) */
        null
      ) : (
        /* 3. SOLID WHITE STICKY NAVBAR (Blur only on mobile HP, solid white without blur on desktop) */
        <header className="sticky top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md md:bg-white md:backdrop-blur-none border-b border-slate-200 shadow-xs transition-all">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 pt-safe">
            {/* Logo Brand: Icon + Text */}
            <Link to="/" className="flex items-center gap-2 shrink-0 hover:opacity-95 transition-opacity">
              <BrandLogoIcon size="sm" className="w-7 h-7 sm:w-8 sm:h-8" />
              <div className="flex items-center">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  Aren<span className="text-red-600">ivo</span>
                </span>
              </div>
            </Link>

            {/* Navigation Links (Tablet & Desktop - Clean Typography with Red Underline Active State) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm font-semibold text-slate-700">
              <Link
                to="/"
                className={cn(
                  "px-3 py-2 transition-all whitespace-nowrap relative font-medium",
                  location.pathname === "/"
                    ? "text-red-600 font-bold after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-red-600 after:rounded-full"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Beranda
              </Link>

              <Link
                to="/venues"
                className={cn(
                  "px-3 py-2 transition-all whitespace-nowrap relative font-medium",
                  location.pathname === "/venues" && !location.search.includes("promo")
                    ? "text-red-600 font-bold after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-red-600 after:rounded-full"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Cari Lapangan
              </Link>

              <Link
                to="/pesanan"
                className={cn(
                  "px-3 py-2 transition-all whitespace-nowrap relative font-medium",
                  (location.pathname === "/pesanan" || location.pathname === "/bookings")
                    ? "text-red-600 font-bold after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-red-600 after:rounded-full"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Pesanan
              </Link>

              <Link
                to="/venues?filter=promo"
                className={cn(
                  "px-3 py-2 transition-all whitespace-nowrap relative font-medium",
                  location.pathname === "/promo" || location.search.includes("promo")
                    ? "text-red-600 font-bold after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-red-600 after:rounded-full"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Promo
              </Link>

              <Link
                to="/jadi-mitra"
                className={cn(
                  "px-3 py-2 transition-all whitespace-nowrap relative font-medium",
                  location.pathname === "/jadi-mitra"
                    ? "text-red-600 font-bold after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-red-600 after:rounded-full"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Jadi Mitra
              </Link>
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Tombol Favorit (Tampil di Tablet & Desktop, di HP tersimpan rapi di dalam Menu) */}
              <Link
                to="/favorites"
                className="hidden sm:inline-flex p-1.5 sm:p-2 text-slate-600 hover:text-red-600 hover:bg-red-50/60 rounded-xl relative transition-all"
                title="Venue Favorit Saya"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Dropdown Notifikasi In-App */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-all cursor-pointer"
                  title="Notifikasi"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 font-mono">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Content Notifikasi */}
                {notifDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotifDropdownOpen(false)}
                    />
                    <div className="fixed inset-x-3 top-16 sm:inset-x-auto sm:right-0 sm:absolute sm:top-full sm:mt-3 w-auto sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-xl border border-slate-200 shadow-md z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">Notifikasi</h4>
                          {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                              {unreadCount} baru
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                        {notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              "p-2.5 rounded-lg text-xs space-y-1 transition-colors border bg-white shadow-xs",
                              !n.isRead
                                ? "border-slate-200 border-l-4 border-l-red-600 text-slate-900 font-medium"
                                : "border-slate-200 text-slate-600"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-slate-900 truncate">{n.title}</span>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                                {n.createdAt}
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600">{n.message}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-red-600 hover:underline font-semibold block py-1"
                        >
                          Lihat Semua Notifikasi →
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar & Session Dropdown (Desktop/Tablet) */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    <img
                      src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt="Avatar"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-red-600/20"
                    />
                    <span className="text-xs font-bold text-slate-800 hidden sm:inline-block max-w-[120px] truncate">
                      {user?.fullName || "Penyewa"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl border border-slate-200 shadow-md z-50 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95">
                        <div className="px-3 py-2 border-b border-slate-100">
                          <p className="font-bold text-slate-900 truncate">{user?.fullName}</p>
                          <p className="text-slate-400 text-[10px] truncate font-mono">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          Profil Akun Saya
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          Pesanan Saya
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          Lapangan Favorit
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                        >
                          Pusat Notifikasi
                        </Link>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold flex items-center justify-between cursor-pointer"
                        >
                          <span>Keluar (Logout)</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-xs whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="hidden md:inline-flex px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg transition-all shadow-xs whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button (Gaya AYO: Rounded Border Box dengan 3 Garis) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-700 border-2 border-slate-500 rounded-lg hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer (Sesuai Persis Style Referensi AYO) */}
          {mobileMenuOpen && (
            <>
              {/* Full Screen Fixed Backdrop */}
              <div
                className="fixed inset-0 top-14 sm:top-16 z-40 bg-slate-950/20 md:hidden animate-in fade-in"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer Sheet */}
              <div className="fixed inset-x-0 top-14 sm:top-16 z-50 md:hidden bg-white border-b border-slate-200 shadow-xl max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain animate-in slide-in-from-top-2 px-6 py-6 flex flex-col">
                {/* Menu Text Links (Style AYO: Clean Typography, Left-Aligned, Tanpa Ikon) */}
                <nav className="flex flex-col space-y-0.5">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "py-2.5 text-[15px] font-medium transition-colors",
                      location.pathname === "/"
                        ? "text-[#990011] font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Beranda
                  </Link>

                  <Link
                    to="/venues"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "py-2.5 text-[15px] font-medium transition-colors",
                      location.pathname === "/venues" && !location.search.includes("promo")
                        ? "text-[#990011] font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Cari Lapangan
                  </Link>

                  <Link
                    to="/pesanan"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "py-2.5 text-[15px] font-medium transition-colors",
                      location.pathname === "/pesanan" || location.pathname === "/bookings"
                        ? "text-[#990011] font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Pesanan Saya
                  </Link>

                  <Link
                    to="/venues?filter=promo"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "py-2.5 text-[15px] font-medium transition-colors",
                      location.pathname === "/promo" || location.search.includes("promo")
                        ? "text-[#990011] font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Promo Venue
                  </Link>

                  <Link
                    to="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "py-2.5 text-[15px] font-medium flex items-center justify-between transition-colors",
                      location.pathname === "/favorites"
                        ? "text-[#990011] font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>Lapangan Favorit</span>
                    {favorites.length > 0 && (
                      <span className="text-xs font-bold text-[#990011] font-mono">
                        ({favorites.length})
                      </span>
                    )}
                  </Link>

                  <div className="border-t border-slate-150 my-2" />

                  <Link
                    to="/jadi-mitra"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "py-2.5 text-[15px] font-medium transition-colors",
                      location.pathname === "/jadi-mitra"
                        ? "text-[#990011] font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Gabung Jadi Mitra Arena
                  </Link>
                </nav>

                {/* Divider Line */}
                <div className="border-t border-slate-200 my-4" />

                {/* Auth Buttons: Stacked Masuk & Daftar (Persis Style AYO) */}
                {isLoggedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 min-w-0"
                      >
                        <img
                          src={
                            user?.avatarUrl ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                          }
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user?.fullName || "Penyewa"}
                          </p>
                          <p className="text-xs text-slate-500 font-mono truncate">{user?.email}</p>
                        </div>
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-center py-3 px-4 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Keluar (Logout)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full block text-center py-3 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full block text-center py-3 px-4 text-sm font-bold text-white bg-[#990011] hover:bg-[#80000e] rounded-lg transition-colors shadow-xs"
                    >
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </header>
      )}

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Chatbot AI Assistant (Disembunyikan di Checkout & E-Tiket agar tidak mendistraksi pembayaran & tiket) */}
      {!isCheckout && !isTicket && <ChatbotWidget />}

      {/* FOOTER SECTION (Teks dikurangi, terstruktur rapi, dan tetap hadir di semua halaman) */}
      {isTicket ? (
        /* Minimal Official Ticket Footer */
        <footer className="bg-white border-t border-slate-200 relative z-10 py-4 pb-safe text-center text-xs text-slate-400 no-print">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 Arenivo • Dokumen Resmi E-Tiket Digital Terverifikasi</p>
            <p className="font-mono text-[11px]">Valid QR Scanner Gate System</p>
          </div>
        </footer>
      ) : isCheckout ? (
        /* Minimal Official Checkout Security Footer */
        <footer className="bg-white border-t border-slate-200 relative z-10 py-3.5 pb-safe text-center text-xs text-slate-500">
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center justify-center gap-1.5 font-medium text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Checkout Aman & Terenkripsi 256-bit SSL via Midtrans Payment Gateway</span>
            </div>
            <p className="text-[11px] text-slate-400">© 2026 Arenivo • Seluruh hak cipta dilindungi</p>
          </div>
        </footer>
      ) : (
        /* Clean & Concise Footer (Responsive: 2-kolom rapi di HP persis referensi Image 1, 4-kolom proporsional di desktop) */
        <footer className="bg-white border-t border-slate-200 mt-12 pb-safe relative z-10 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-9">
            
            {/* TAMPILAN KHUSUS HP (Mobile < 768px): Persis Struktur Rapi Gambar 1 */}
            <div className="block md:hidden space-y-6">
              {/* Brand & Entitas PT & Alamat Kantor */}
              <div className="space-y-2.5">
                <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <BrandLogo size="md" />
                </Link>
                <div className="space-y-1">
                  <p className="font-bold text-xs text-slate-900">PT Arenivo Sport Indonesia</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Satu Aplikasi, Banyak Arena. Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal real-time dan pembayaran instan langsung dari HP Anda.
                  </p>
                </div>

                {/* Baris Logo Media Sosial Lengkap */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter / X"
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs"
                    title="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs"
                    title="TikTok"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Grid 2-Kolom Menu di HP (Persis referensi Perusahaan & Ekosistem / Hubungi & Unduh) */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 pt-3 border-t border-slate-100">
                {/* Kolom Kiri: Perusahaan & Kontak */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                      Perusahaan
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>
                        <Link to="/venues" className="hover:text-red-600 transition-colors">
                          Cari Lapangan
                        </Link>
                      </li>
                      <li>
                        <Link to="/pesanan" className="hover:text-red-600 transition-colors">
                          Riwayat Pesanan
                        </Link>
                      </li>
                      <li>
                        <Link to="/favorites" className="hover:text-red-600 transition-colors">
                          Venue Favorit
                        </Link>
                      </li>
                      <li>
                        <Link to="/jadi-mitra" className="hover:text-red-600 transition-colors font-semibold text-red-600">
                          Gabung Jadi Mitra
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                      Hubungi Kami
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>
                        <a
                          href="https://wa.me/6281234567890?text=Halo%20Admin%20Arenivo,%20saya%20butuh%20bantuan"
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 font-semibold text-emerald-700 text-[11px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>WhatsApp CS</span>
                        </a>
                      </li>
                      <li>
                        <a
                          href="mailto:support@arenivo.id"
                          className="hover:text-red-600 transition-colors flex items-center gap-1.5 text-[11px] truncate"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Email Support</span>
                        </a>
                      </li>
                      <li>
                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>(021) 5098-7654</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Kolom Kanan: Pusat Bantuan & Jaminan Sistem */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                      Pusat Bantuan
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>
                        <Link to="/venues" className="hover:text-red-600 transition-colors">
                          Panduan Booking
                        </Link>
                      </li>
                      <li>
                        <Link to="/venues" className="hover:text-red-600 transition-colors">
                          Ketentuan Refund
                        </Link>
                      </li>
                      <li>
                        <span className="text-slate-500">Kebijakan Privasi</span>
                      </li>
                      <li>
                        <span className="text-slate-500">Syarat Ketentuan</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                      Jaminan Resmi
                    </h4>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Bebas Double Book</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Midtrans SSL & E-Tiket QR gate terverifikasi resmi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TAMPILAN DESKTOP (Screens >= 768px): 4 Kolom Terstruktur & Padat */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Kolom 1: Brand, Deskripsi APK, & Logo Media Sosial */}
              <div className="lg:col-span-4 space-y-3">
                <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <BrandLogo size="md" />
                </Link>
                <div className="space-y-1">
                  <p className="font-bold text-xs text-slate-800">PT Arenivo Sport Indonesia</p>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    Satu Aplikasi, Banyak Arena. Pesan lapangan futsal, mini soccer, dan sepak bola terdekat dengan jadwal real-time dan pembayaran instan langsung dari HP Anda.
                  </p>
                </div>

                {/* Logo Media Sosial */}
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Ikuti Kami
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs hover:scale-105"
                      title="Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs hover:scale-105"
                      title="Facebook"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Twitter / X"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs hover:scale-105"
                      title="Twitter / X"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs hover:scale-105"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="TikTok"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs hover:scale-105"
                      title="TikTok"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="YouTube"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 flex items-center justify-center transition-all border border-slate-200/60 shadow-xs hover:scale-105"
                      title="YouTube"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-0.5 text-slate-500 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700 text-[11px]">Mitra Resmi Terverifikasi</span>
                </div>
              </div>

              {/* Kolom 2: Menu Utama */}
              <div className="lg:col-span-2 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Menu Utama
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li>
                    <Link to="/venues" className="hover:text-red-600 transition-colors">
                      Cari Lapangan
                    </Link>
                  </li>
                  <li>
                    <Link to="/pesanan" className="hover:text-red-600 transition-colors">
                      Riwayat Pesanan
                    </Link>
                  </li>
                  <li>
                    <Link to="/favorites" className="hover:text-red-600 transition-colors">
                      Venue Favorit
                    </Link>
                  </li>
                  <li>
                    <Link to="/jadi-mitra" className="hover:text-red-600 transition-colors font-semibold text-red-600">
                      Gabung Jadi Mitra
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Kolom 3: Layanan & Kebijakan */}
              <div className="lg:col-span-3 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Pusat Bantuan
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li>
                    <Link to="/venues" className="hover:text-red-600 transition-colors">
                      Panduan Booking
                    </Link>
                  </li>
                  <li>
                    <Link to="/venues" className="hover:text-red-600 transition-colors">
                      Ketentuan Refund
                    </Link>
                  </li>
                  <li>
                    <span className="text-slate-500">Syarat & Ketentuan</span>
                  </li>
                  <li>
                    <span className="text-slate-500">Kebijakan Privasi</span>
                  </li>
                </ul>
              </div>

              {/* Kolom 4: Kontak di Ujung Kanan */}
              <div className="lg:col-span-3 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Hubungi Kami
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>
                    <a
                      href="https://wa.me/6281234567890?text=Halo%20Admin%20Arenivo,%20saya%20butuh%20bantuan"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-emerald-700 transition-colors flex items-center gap-2 font-semibold text-emerald-700"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>+62 812-3456-7890 (WA)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:support@arenivo.id"
                      className="hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>support@arenivo.id</span>
                    </a>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>(021) 5098-7654</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Buka 08.00 - 24.00 WIB</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar Ringkas */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <p>© 2026 Arenivo. Seluruh hak cipta dilindungi.</p>
              <p className="text-[11px] font-mono text-slate-400">
                Aman & Terpercaya • Pembayaran Resmi Midtrans
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default PublicLayout;
