import * as React from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  MapPin,
  CreditCard,
  FileText,
  Upload,
  Eye,
  EyeOff,
  HelpCircle,
  Check,
} from "lucide-react";
import { BrandLogoIcon } from "@/components/common/BrandLogo";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";
import { useToast } from "@/components/ui";
import { MOCK_CITIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function MitraAuthPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Detect mode from path (/mitra/register vs /mitra/login) or query param (?mode=register)
  const isRegisterParam =
    location.pathname === "/mitra/register" || searchParams.get("mode") === "register";
  const [mode, setMode] = React.useState<"login" | "register">(
    isRegisterParam ? "register" : "login"
  );

  React.useEffect(() => {
    if (location.pathname === "/mitra/register" || searchParams.get("mode") === "register") {
      setMode("register");
    } else if (location.pathname === "/mitra/login") {
      setMode("login");
    }
  }, [location.pathname, searchParams]);

  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);
    setRegisterStep(1);
    if (newMode === "register") {
      navigate("/mitra/register", { replace: true });
    } else {
      navigate("/mitra/login", { replace: true });
    }
  };

  // State: Login
  const [loginEmail, setLoginEmail] = React.useState("mitra.spartan@gmail.com");
  const [loginPassword, setLoginPassword] = React.useState("mitrapass123");
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);

  // State: Register Multi-Step (4 Tahap)
  const [registerStep, setRegisterStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [managerName, setManagerName] = React.useState("Bambang Hermawan");
  const [managerPhone, setManagerPhone] = React.useState("081122334455");
  const [registerEmail, setRegisterEmail] = React.useState("mitra.spartan@gmail.com");
  const [registerPassword, setRegisterPassword] = React.useState("mitrapass123");
  const [showRegPassword, setShowRegPassword] = React.useState(false);

  const handleNextMitraStep1 = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!managerName.trim()) {
      addToast("warning", "Nama penanggung jawab wajib diisi.", "Data Belum Lengkap");
      return;
    }
    if (!managerPhone.trim()) {
      addToast("warning", "Nomor WhatsApp aktif wajib diisi.", "Data Belum Lengkap");
      return;
    }
    if (!registerEmail.trim() || !registerPassword.trim()) {
      addToast("warning", "Email bisnis dan kata sandi wajib diisi.", "Data Belum Lengkap");
      return;
    }
    if (registerPassword.length < 8) {
      addToast("warning", "Kata sandi akun minimal 8 karakter.", "Keamanan Sandi");
      return;
    }
    setRegisterStep(2);
  };

  const handleNextMitraStep2 = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      addToast("warning", "Nama arena atau usaha wajib diisi.", "Data Belum Lengkap");
      return;
    }
    if (!venueAddress.trim()) {
      addToast("warning", "Alamat lengkap venue wajib diisi.", "Data Belum Lengkap");
      return;
    }
    setRegisterStep(3);
  };

  const handleNextMitraStep3 = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!taxNibNumber.trim()) {
      addToast("warning", "Nomor NIB/SIUP/NPWP wajib diisi.", "Data Belum Lengkap");
      return;
    }
    setRegisterStep(4);
  };

  // Business & Venue Data
  const [businessName, setBusinessName] = React.useState("Spartan Sport Management");
  const [businessType, setBusinessType] = React.useState<"PT" | "CV" | "Perorangan">("PT");
  const [cityId, setCityId] = React.useState(MOCK_CITIES[0]?.id || "");
  const [venueAddress, setVenueAddress] = React.useState(
    "Jl. TB Simatupang No. 45, Cilandak Barat, Jakarta Selatan"
  );
  const [taxNibNumber, setTaxNibNumber] = React.useState("1234567890123");
  const [documentFileName, setDocumentFileName] = React.useState<string>("NIB_SIUP_Spartan.pdf");

  // Bank Account for Payouts
  const [bankName, setBankName] = React.useState("BCA");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("8830192831");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("PT SPARTAN OLAHRAGA SEJAHTERA");

  // Pakta Integritas Checkboxes
  const [pactDoubleBooking, setPactDoubleBooking] = React.useState(true);
  const [pactCommission, setPactCommission] = React.useState(true);
  const [pactRefund, setPactRefund] = React.useState(true);
  const [pactScanner, setPactScanner] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      addToast("warning", "Mohon isi email dan kata sandi pengelola.", "Data Belum Lengkap");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("futsal_mitra_authenticated", "true");
      addToast(
        "success",
        `Selamat datang kembali di Portal Pengelola!`,
        "Login Mitra Sukses"
      );
      navigate("/mitra");
    }, 500);
  };

  const handleGoogleLogin = () => {
    localStorage.setItem("futsal_mitra_authenticated", "true");
    addToast(
      "success",
      "Login Mitra dengan akun Google Workspace berhasil!",
      "Google Auth Berhasil"
    );
    navigate("/mitra");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!managerName || !managerPhone || !registerEmail || !registerPassword) {
      addToast("warning", "Mohon lengkapi seluruh kontak penanggung jawab.", "Kontak Wajib Diisi");
      return;
    }

    if (!businessName || !venueAddress || !taxNibNumber) {
      addToast("warning", "Mohon lengkapi data legalitas usaha dan arena lapangan.", "Legalitas Belum Lengkap");
      return;
    }

    if (!bankAccountNumber || !bankAccountHolder) {
      addToast("warning", "Mohon lengkapi rekening pencairan dana mitra.", "Rekening Wajib Diisi");
      return;
    }

    if (!pactDoubleBooking || !pactCommission || !pactRefund || !pactScanner) {
      addToast(
        "warning",
        "Anda harus menyetujui seluruh butir Pakta Integritas Kemitraan.",
        "Persetujuan Diperlukan"
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("futsal_mitra_authenticated", "true");
      localStorage.setItem("futsal_mitra_verification_status", "menunggu");
      localStorage.setItem(
        "futsal_mitra_profile",
        JSON.stringify({
          managerName,
          managerPhone,
          businessName,
          businessType,
          cityId,
          venueAddress,
          taxNibNumber,
          documentFileName,
          bankName,
          bankAccountNumber,
          bankAccountHolder,
        })
      );

      addToast(
        "success",
        "Pendaftaran berhasil diajukan! Berkas Anda sedang ditinjau oleh Super Admin.",
        "Pengajuan Kemitraan Terkirim"
      );
      navigate("/mitra/application");
    }, 700);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Decorative Sport Background Pattern */}
      <CleanBackgroundPattern variant="auth" />

      {/* Top Header / Back Navigation Bar */}
      <div className="w-full max-w-4xl mb-3.5 flex items-center justify-between relative z-10 px-1 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/jadi-mitra"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors px-3 sm:px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 shadow-xs border border-slate-200 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Info & Syarat Mitra</span>
            <span className="sm:hidden">Info Mitra</span>
          </Link>
        </div>
      </div>

      {/* Main Container Card (Dual Column Reference Style) */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 md:min-h-[630px]">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Modern Sporty Fluid Gradient Art & Branding  */}
        {/* ========================================================= */}
        <div className="hidden md:flex md:col-span-5 relative bg-gradient-to-br from-slate-900 via-red-950 to-red-800 p-8 sm:p-10 text-white flex-col justify-between overflow-hidden md:min-h-[630px]">
          
          {/* Dynamic Organic Fluid Droplet Shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* Fluid Capsule 1: Top-left vibrant warm amber-red */}
            <div className="absolute -top-14 -left-14 w-60 h-96 rounded-full bg-gradient-to-b from-orange-500 via-rose-600 to-red-900 opacity-90 transform -rotate-[35deg] shadow-sm" />
            {/* Fluid Capsule 2: Center deep crimson droplet */}
            <div className="absolute top-1/3 -left-12 w-48 h-80 rounded-full bg-gradient-to-br from-red-600 via-red-800 to-slate-950 opacity-95 transform -rotate-[35deg] shadow-xs" />
            {/* Fluid Capsule 3: Bottom-left emerald-tinted contrast */}
            <div className="absolute -bottom-16 -left-8 w-48 h-64 rounded-full bg-gradient-to-tr from-amber-500 via-orange-600 to-red-800 opacity-90 transform -rotate-[25deg]" />
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
                Aren<span className="text-orange-300">ivo</span> Mitra
              </span>
              <span className="text-[10px] text-white/80 block">Portal Pengelola Arena</span>
            </div>
          </div>

          {/* Middle Value Proposition (Title Only) */}
          <div className="relative z-10 my-auto py-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Maksimalkan Okupansi & Pendapatan Arena Anda
            </h2>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Sleek Form with Consistent Height & Style   */}
        {/* ========================================================= */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white relative md:min-h-[630px]">
          <div>
            {/* Mobile Top Brand Badge */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-4">
              <BrandLogoIcon size="sm" />
              <span className="font-extrabold text-base text-slate-900">
                Aren<span className="text-red-600">ivo</span> Mitra
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
                Daftar Mitra Baru
              </button>
            </div>

            {/* Mode Title & Step Indicator for Register (Same style as customer register) */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {mode === "login" ? "Login Mitra" : "Register Mitra"}
              </h1>

              {mode === "register" ? (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 transition-all bg-red-600 text-white shadow-xs">
                      {registerStep}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      <span className="sm:hidden">
                        {registerStep === 1 && "Kontak PIC & Akun"}
                        {registerStep === 2 && "Identitas Arena"}
                        {registerStep === 3 && "Legalitas & Berkas"}
                        {registerStep === 4 && "Rekening & Pakta"}
                      </span>
                      <span className="hidden sm:inline">
                        {registerStep === 1 && "Langkah 1: Kontak PIC & Akun"}
                        {registerStep === 2 && "Langkah 2: Identitas Arena & Lokasi"}
                        {registerStep === 3 && "Langkah 3: Legalitas & Berkas Dokumen"}
                        {registerStep === 4 && "Langkah 4: Rekening & Pakta Integritas"}
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 whitespace-nowrap">
                    <span className="sm:hidden">{registerStep}/4</span>
                    <span className="hidden sm:inline">Langkah {registerStep} dari 4</span>
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Masuk ke portal pengelolaan jadwal dan pendapatan arena.
                </p>
              )}
            </div>

            {/* ========================================================= */}
            {/* MODE 1: LOGIN MITRA                                      */}
            {/* ========================================================= */}
            {mode === "login" && (
              <div className="space-y-4 min-h-[360px] flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Google Workspace Bisnis */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
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
                    <span>Masuk dengan Google Workspace Bisnis</span>
                  </button>

                  <div className="relative flex items-center justify-center pt-1">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                      atau gunakan email mitra
                    </span>
                  </div>

                  <form onSubmit={handleLoginSubmit} id="mitra-login-form" className="space-y-3.5">
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 ml-0.5">Email Bisnis Mitra</label>
                      <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                        <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type="email"
                          required
                          placeholder="mitra@namaarena.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between ml-0.5 mr-0.5">
                        <label className="text-[11px] font-bold text-slate-700">Kata Sandi</label>
                        <Link
                          to="/forgot-password"
                          className="text-[11px] font-semibold text-red-600 hover:underline"
                        >
                          Lupa Sandi?
                        </Link>
                      </div>
                      <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                          aria-label="Toggle password visibility"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Login Button */}
                <div className="pt-2 mt-auto">
                  <button
                    type="submit"
                    form="mitra-login-form"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? <span>Memvalidasi Sesi...</span> : (
                      <>
                        <span>MASUK KE PORTAL MITRA</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* MODE 2: STRICT MITRA REGISTRATION (4-STEP WIZARD)         */}
            {/* ========================================================= */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* TAHAP 1: Kontak PIC & Kredensial Akun */}
                {registerStep === 1 && (
                  <div className="min-h-[360px] flex flex-col justify-between">
                    <div className="space-y-3.5">
                      {/* Row 1: Nama Lengkap PIC & No WhatsApp */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nama Lengkap PIC</label>
                          <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                            <User className="w-4 h-4 text-slate-500 shrink-0" />
                            <input
                              type="text"
                              required
                              placeholder="Nama penanggung jawab"
                              value={managerName}
                              onChange={(e) => setManagerName(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 ml-0.5">No. WhatsApp Aktif</label>
                          <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                            <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                            <input
                              type="tel"
                              required
                              placeholder="0812xxxxxxxx"
                              value={managerPhone}
                              onChange={(e) => setManagerPhone(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Email Bisnis Mitra */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5">Email Bisnis Mitra</label>
                        <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                          <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                          <input
                            type="email"
                            required
                            placeholder="mitra@namaarena.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                          />
                        </div>
                      </div>

                      {/* Row 3: Kata Sandi Akun */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5">Kata Sandi Akun</label>
                        <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                          <input
                            type={showRegPassword ? "text" : "password"}
                            required
                            placeholder="Minimal 8 karakter"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                            aria-label="Toggle password visibility"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 1 Action Button */}
                    <div className="pt-2 mt-auto">
                      <button
                        type="button"
                        onClick={handleNextMitraStep1}
                        className="w-full py-3 px-4 sm:px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">LANJUT KE IDENTITAS ARENA</span>
                        <span className="sm:hidden">IDENTITAS ARENA</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAHAP 2: Identitas Arena & Lokasi */}
                {registerStep === 2 && (
                  <div className="min-h-[360px] flex flex-col justify-between">
                    <div className="space-y-3.5">
                      {/* Row 1: Nama Arena / Usaha */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nama Arena / Usaha</label>
                        <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Spartan Futsal Arena"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                          />
                        </div>
                      </div>

                      {/* Row 2: Bentuk Usaha & Kota (2 cols) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 ml-0.5">Bentuk Usaha</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value as any)}
                            className="w-full rounded-lg bg-white border border-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-xs cursor-pointer"
                          >
                            <option value="PT">PT (Perseroan Terbatas)</option>
                            <option value="CV">CV (Komanditer)</option>
                            <option value="Perorangan">Perorangan / Usaha Dagang</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 ml-0.5">Kota Operasional</label>
                          <select
                            value={cityId}
                            onChange={(e) => setCityId(e.target.value)}
                            className="w-full rounded-lg bg-white border border-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-xs cursor-pointer"
                          >
                            {MOCK_CITIES.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Alamat Lengkap Arena */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5">Alamat Lengkap Arena</label>
                        <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                          <input
                            type="text"
                            required
                            placeholder="Jl. Nama Jalan, No, Kelurahan, Kecamatan"
                            value={venueAddress}
                            onChange={(e) => setVenueAddress(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Step 2 Buttons */}
                    <div className="flex items-center gap-2 sm:gap-2.5 pt-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="py-3 px-3.5 sm:px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>Kembali</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextMitraStep2}
                        className="flex-1 py-3 px-3 sm:px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">LANJUT KE LEGALITAS & BERKAS</span>
                        <span className="sm:hidden">LEGALITAS & BERKAS</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAHAP 3: Legalitas & Berkas Dokumen Usaha */}
                {registerStep === 3 && (
                  <div className="min-h-[360px] flex flex-col justify-between">
                    <div className="space-y-3.5">
                      {/* Row 1: Nomor NIB / SIUP / NPWP */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nomor NIB / SIUP / NPWP</label>
                        <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                          <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                          <input
                            type="text"
                            required
                            placeholder="13-16 digit nomor izin usaha resmi"
                            value={taxNibNumber}
                            onChange={(e) => setTaxNibNumber(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                          />
                        </div>
                      </div>

                      {/* Row 2: Berkas Dokumen Usaha */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5">
                          Berkas Dokumen Usaha <span className="text-slate-400 font-normal">(PDF, JPG, PNG - Maks. 10MB)</span>
                        </label>
                        <div className="rounded-lg bg-white border border-slate-900 px-3.5 py-2 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="truncate text-xs font-mono text-slate-800 font-medium" title={documentFileName}>
                              {documentFileName || "Belum ada berkas dipilih"}
                            </span>
                          </div>
                          <label className="shrink-0 text-xs font-bold text-slate-900 hover:text-red-600 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors border border-slate-300 select-none flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Pilih File</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setDocumentFileName(file.name);
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Assurance text */}
                      <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                        Dokumen izin usaha Anda dijamin kerahasiaannya dan hanya digunakan tim kepatuhan untuk verifikasi legalitas kemitraan resmi sebelum arena dipublikasikan.
                      </p>
                    </div>

                    {/* Step 3 Buttons */}
                    <div className="flex items-center gap-2 sm:gap-2.5 pt-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(2)}
                        className="py-3 px-3.5 sm:px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>Kembali</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextMitraStep3}
                        className="flex-1 py-3 px-3 sm:px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">LANJUT KE REKENING & PAKTA</span>
                        <span className="sm:hidden">REKENING & PAKTA</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAHAP 4: Rekening Pencairan & Pakta Integritas */}
                {registerStep === 4 && (
                  <div className="min-h-[360px] flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Row 1: Pilihan Bank & Nomor Rekening (2 cols) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 ml-0.5">Pilihan Bank Payouts</label>
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full rounded-lg bg-white border border-slate-900 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-xs cursor-pointer"
                          >
                            <option value="BCA">Bank BCA</option>
                            <option value="Mandiri">Bank Mandiri</option>
                            <option value="BRI">Bank BRI</option>
                            <option value="BNI">Bank BNI</option>
                            <option value="CIMB">CIMB Niaga</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nomor Rekening</label>
                          <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                            <CreditCard className="w-4 h-4 text-slate-500 shrink-0" />
                            <input
                              type="text"
                              required
                              placeholder="Contoh: 8830192831"
                              value={bankAccountNumber}
                              onChange={(e) => setBankAccountNumber(e.target.value)}
                              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Atas Nama Pemilik Rekening */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5">Atas Nama Pemilik Rekening</label>
                        <div className="rounded-lg bg-white border border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                          <input
                            type="text"
                            required
                            placeholder="Sesuai nama yang tertera di buku tabungan"
                            value={bankAccountHolder}
                            onChange={(e) => setBankAccountHolder(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium uppercase"
                          />
                        </div>
                      </div>

                      {/* Row 3: Pakta Integritas (2 Columns compact grid) */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold text-slate-700 ml-0.5 block">
                          Pakta Integritas Standar Kemitraan:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                            <input
                              type="checkbox"
                              checked={pactDoubleBooking}
                              onChange={(e) => setPactDoubleBooking(e.target.checked)}
                              className="mt-0.5 rounded-sm text-red-600 focus:ring-red-500 w-3.5 h-3.5 shrink-0"
                            />
                            <span className="text-[11px] text-slate-700 leading-tight">
                              <strong className="text-slate-900">Bebas Double Booking:</strong> Slot online tidak dijual offline.
                            </span>
                          </label>

                          <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                            <input
                              type="checkbox"
                              checked={pactCommission}
                              onChange={(e) => setPactCommission(e.target.checked)}
                              className="mt-0.5 rounded-sm text-red-600 focus:ring-red-500 w-3.5 h-3.5 shrink-0"
                            />
                            <span className="text-[11px] text-slate-700 leading-tight">
                              <strong className="text-slate-900">Bagi Hasil 10%:</strong> Berlaku khusus sewa via online.
                            </span>
                          </label>

                          <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                            <input
                              type="checkbox"
                              checked={pactRefund}
                              onChange={(e) => setPactRefund(e.target.checked)}
                              className="mt-0.5 rounded-sm text-red-600 focus:ring-red-500 w-3.5 h-3.5 shrink-0"
                            />
                            <span className="text-[11px] text-slate-700 leading-tight">
                              <strong className="text-slate-900">Garansi Refund 100%:</strong> Jika pembatalan sepihak venue.
                            </span>
                          </label>

                          <label className="flex items-start gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                            <input
                              type="checkbox"
                              checked={pactScanner}
                              onChange={(e) => setPactScanner(e.target.checked)}
                              className="mt-0.5 rounded-sm text-red-600 focus:ring-red-500 w-3.5 h-3.5 shrink-0"
                            />
                            <span className="text-[11px] text-slate-700 leading-tight">
                              <strong className="text-slate-900">Validasi Gate Scanner:</strong> Scan QR tiket saat check-in.
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 Buttons */}
                    <div className="flex items-center gap-2 sm:gap-2.5 pt-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => setRegisterStep(3)}
                        className="py-3 px-3.5 sm:px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                        <span>Kembali</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-3 sm:px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                      >
                        {isLoading ? (
                          <span>Mengirimkan Berkas...</span>
                        ) : (
                          <>
                            <span className="hidden sm:inline">AJUKAN PENDAFTARAN MITRA</span>
                            <span className="sm:hidden">AJUKAN PENDAFTARAN</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Switch to login / register */}
          <div className="mt-5 text-center text-xs text-slate-500">
            {mode === "login" ? (
              <>
                Belum terdaftar sebagai mitra pengelola?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("register")}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Daftarkan Arena Sekarang →
                </button>
              </>
            ) : (
              <>
                Sudah memiliki akun pengelola terverifikasi?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Masuk ke Portal Mitra →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MitraAuthPage;
