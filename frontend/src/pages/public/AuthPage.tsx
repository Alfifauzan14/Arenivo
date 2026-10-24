import * as React from "react";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { BrandLogoIcon } from "@/components/common/BrandLogo";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";
import { useSession } from "@/features/auth/context/SessionContext";
import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

export function AuthPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isLoggedIn, login } = useSession();

  // Mode: "login" | "register"
  const isRegisterParam = location.pathname === "/register" || searchParams.get("mode") === "register";
  const [mode, setMode] = React.useState<"login" | "register">(isRegisterParam ? "register" : "login");

  // Keep mode in sync if user directly visits /register or /login
  React.useEffect(() => {
    if (location.pathname === "/register" || searchParams.get("mode") === "register") {
      setMode("register");
    } else if (location.pathname === "/login") {
      setMode("login");
    }
  }, [location.pathname, searchParams]);

  // Synchronize URL when user clicks tabs
  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    setRegisterStep(1);
    if (newMode === "register") {
      navigate("/register", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  // Form states
  const [registerStep, setRegisterStep] = React.useState<1 | 2>(1);
  const [email, setEmail] = React.useState("rizky.ramadhan@gmail.com");
  const [password, setPassword] = React.useState("rahasia123");
  const [confirmPassword, setConfirmPassword] = React.useState("rahasia123");
  const [fullName, setFullName] = React.useState("Rizky Ramadhan");
  const [phone, setPhone] = React.useState("081234567890");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNextRegisterStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast("warning", "Nama lengkap wajib diisi.", "Data Belum Lengkap");
      return;
    }
    if (!phone.trim()) {
      addToast("warning", "Nomor WhatsApp wajib diisi.", "Data Belum Lengkap");
      return;
    }
    setRegisterStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      addToast("warning", "Mohon lengkapi email dan kata sandi Anda.", "Data Belum Lengkap");
      return;
    }

    if (mode === "register") {
      if (!fullName.trim() || !phone.trim()) {
        addToast("warning", "Nama lengkap dan nomor WhatsApp wajib diisi.", "Data Belum Lengkap");
        return;
      }
      if (password !== confirmPassword) {
        addToast("error", "Konfirmasi kata sandi tidak cocok.", "Kata Sandi Berbeda");
        return;
      }
      if (!agreeTerms) {
        addToast("warning", "Anda harus menyetujui syarat & ketentuan layanan.", "Persetujuan Diperlukan");
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      login({
        fullName: mode === "register" ? fullName : "Rizky Ramadhan",
        email: email,
        phone: mode === "register" ? phone : "081234567890",
      });

      addToast(
        "success",
        mode === "login"
          ? `Selamat datang kembali, ${fullName}!`
          : `Pendaftaran berhasil! Akun Anda telah aktif dan siap booking.`,
        "Autentikasi Berhasil"
      );

      navigate("/bookings");
    }, 600);
  };

  const handleSocialLogin = (provider: "google" | "tiktok") => {
    if (provider === "tiktok") {
      navigate("/auth/tiktok/callback");
      return;
    }

    login({
      fullName: "Rizky Ramadhan (Google)",
      email: "rizky.ramadhan@gmail.com",
    });

    addToast(
      "success",
      `Berhasil masuk menggunakan akun ${provider.toUpperCase()}!`,
      "Login Sukses"
    );
    navigate("/bookings");
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 pt-safe pb-keyboard-safe pb-safe flex flex-col items-center justify-center relative overflow-hidden bg-[#FCFCFC]">
      {/* Decorative Sport Background Pattern */}
      <CleanBackgroundPattern variant="auth" />

      {/* Top Back Navigation Bar */}
      <div className="w-full max-w-xl lg:max-w-4xl mb-3.5 flex items-center justify-between relative z-10 px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 shadow-xs border border-slate-200 min-touch-target"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Main Container Card (Dual Column Reference Style) */}
      <div className="w-full max-w-xl lg:max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 lg:min-h-[630px]">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Modern Sporty Fluid Gradient Art & Branding  */}
        {/* ========================================================= */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-red-700 via-red-600 to-rose-700 p-8 sm:p-10 text-white flex-col justify-between overflow-hidden lg:min-h-[630px]">
          
          {/* Dynamic Organic Fluid Droplet Shapes (Style Reference) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Fluid Capsule 1: Top-left vibrant energetic warm gradient */}
            <div className="absolute -top-14 -left-14 w-60 h-96 rounded-full bg-gradient-to-b from-orange-400 via-rose-500 to-red-700 opacity-90 transform -rotate-[35deg] shadow-2xl" />
            {/* Fluid Capsule 2: Center deep crimson droplet */}
            <div className="absolute top-1/4 -left-12 w-48 h-80 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-950 opacity-95 transform -rotate-[35deg] shadow-xl" />
            {/* Fluid Capsule 3: Bottom-left amber-orange highlight */}
            <div className="absolute -bottom-16 -left-8 w-48 h-64 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 opacity-90 transform -rotate-[25deg]" />
            {/* Subtle frosted bubble highlight */}
            <div className="absolute top-8 right-8 w-20 h-28 rounded-full bg-white/10 backdrop-blur-xs transform -rotate-[35deg] border border-white/20" />
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xs">
              <BrandLogoIcon size="sm" theme="dark" className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight block leading-tight text-white">
                Aren<span className="text-orange-300">ivo</span>
              </span>
              <span className="text-[10px] text-white/80 block">Satu Aplikasi, Banyak Arena</span>
            </div>
          </div>

          {/* Middle Value Proposition (Title Only) */}
          <div className="relative z-10 my-auto py-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Main Bareng Lebih Praktis Tanpa Ribet Antre
            </h2>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Sleek Form with Pill Inputs & Gradient Button */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white relative lg:min-h-[630px]">
          <div>
            {/* Mobile Top Brand Badge (Only on Small & Medium Screens) */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <BrandLogoIcon size="md" />
              <span className="font-extrabold text-lg text-slate-900">
                Aren<span className="text-red-600">ivo</span>
              </span>
            </div>

            {/* Box Mode Switcher (Masuk vs Daftar) */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={cn(
                  "flex-1 py-2 rounded-md text-xs font-bold transition-all text-center",
                  mode === "login"
                    ? "bg-white text-red-600 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("register")}
                className={cn(
                  "flex-1 py-2 rounded-md text-xs font-bold transition-all text-center",
                  mode === "register"
                    ? "bg-white text-red-600 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Daftar Akun Baru
              </button>
            </div>

            {/* Mode Title & Step Indicator for Register */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {mode === "login" ? "User Login" : "User Register"}
              </h1>

              {mode === "register" ? (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 transition-all",
                        registerStep === 1
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-emerald-600 text-white"
                      )}
                    >
                      {registerStep > 1 ? "✓" : "1"}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      <span className="sm:hidden">{registerStep === 1 ? "Data Kontak & Diri" : "Akun & Keamanan"}</span>
                      <span className="hidden sm:inline">{registerStep === 1 ? "Langkah 1: Data Kontak & Diri" : "Langkah 2: Akun & Keamanan"}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 whitespace-nowrap">
                    <span className="sm:hidden">{registerStep}/2</span>
                    <span className="hidden sm:inline">Langkah {registerStep} dari 2</span>
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Silakan masuk untuk melanjutkan pemesanan lapangan.
                </p>
              )}
            </div>

            {/* ========================================================= */}
            {/* VIEW 1: USER LOGIN                                        */}
            {/* ========================================================= */}
            {mode === "login" && (
              <form onSubmit={handleSubmit} className="min-h-[360px] flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Social Logins */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("google")}
                      className="py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin("tiktok")}
                      className="py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-slate-900 shrink-0" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.25 1.23 2.29 2.47 2.58 1.07.24 2.22.02 3.09-.64.71-.53 1.15-1.34 1.24-2.22.07-2.36.03-4.73.04-7.1v-11.2z" />
                      </svg>
                      <span>TikTok</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center pt-0.5">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                      atau via email
                    </span>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-0.5">Alamat Email / Username</label>
                    <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Kata Sandi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-0.5">Kata Sandi</label>
                    <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                      <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Ingat Saya & Forgot Password */}
                  <div className="flex items-center justify-between px-1 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-3.5 h-3.5 text-red-600 rounded-sm border-slate-300 focus:ring-red-500"
                      />
                      <span>Ingat Saya</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <div className="pt-2 mt-auto">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full py-3 px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60",
                      isLoading && "opacity-75 cursor-wait"
                    )}
                  >
                    {isLoading ? (
                      <span>Memproses...</span>
                    ) : (
                      <>
                        <span>LOGIN</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: REGISTER STEP 1 (NAMA & WHATSAPP)                 */}
            {/* ========================================================= */}
            {mode === "register" && registerStep === 1 && (
              <div className="min-h-[360px] flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Social Logins */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("google")}
                      className="py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialLogin("tiktok")}
                      className="py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4 fill-slate-900 shrink-0" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.25 1.23 2.29 2.47 2.58 1.07.24 2.22.02 3.09-.64.71-.53 1.15-1.34 1.24-2.22.07-2.36.03-4.73.04-7.1v-11.2z" />
                      </svg>
                      <span>TikTok</span>
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center pt-0.5">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                      atau isi formulir manual
                    </span>
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nama Lengkap</label>
                    <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                      <User className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Nama lengkap Anda"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nomor WhatsApp / HP</label>
                    <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Lanjut ke Langkah 2 */}
                <div className="pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={handleNextRegisterStep}
                    className="w-full py-3 px-4 sm:px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">LANJUT KE AKUN & KEAMANAN</span>
                    <span className="sm:hidden">AKUN & KEAMANAN</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: REGISTER STEP 2 (AKUN & KEAMANAN)                 */}
            {/* ========================================================= */}
            {mode === "register" && registerStep === 2 && (
              <form onSubmit={handleSubmit} className="min-h-[360px] flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-0.5">Alamat Email Akun</label>
                    <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Kata Sandi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-0.5">Kata Sandi</label>
                    <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                      <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 ml-0.5">Ulangi Kata Sandi</label>
                    <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                      <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 cursor-pointer"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="px-1 pt-0.5">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 select-none leading-tight">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-3.5 h-3.5 text-red-600 rounded-sm border-slate-300 focus:ring-red-500 mt-0.5 shrink-0"
                      />
                      <span>
                        Saya menyetujui <span className="text-red-600 font-semibold">Syarat & Ketentuan</span> serta{" "}
                        <span className="text-red-600 font-semibold">Kebijakan Privasi</span> platform.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Step 2 Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-2.5 pt-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="py-3 px-3.5 sm:px-5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "flex-1 py-3 px-3 sm:px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap",
                      isLoading && "opacity-75 cursor-wait"
                    )}
                  >
                    {isLoading ? (
                      <span>Memproses...</span>
                    ) : (
                      <>
                        <span className="hidden min-[380px]:inline">DAFTAR SEKARANG</span>
                        <span className="min-[380px]:hidden">DAFTAR</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Switcher Link */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === "login" ? (
              <p>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("register")}
                  className="font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Create Your Account →
                </button>
              </p>
            ) : (
              <p>
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className="font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Masuk ke Akun Anda →
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
