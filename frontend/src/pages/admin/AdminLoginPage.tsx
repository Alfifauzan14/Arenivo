import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, Shield } from "lucide-react";
import { BrandLogoIcon } from "@/components/common/BrandLogo";
import { useToast } from "@/components/ui";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = React.useState("superadmin@futsal.id");
  const [password, setPassword] = React.useState("AdminMaster2026!");
  const [totpCode, setTotpCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("warning", "Masukkan email dan kata sandi.", "Validasi");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("futsal_admin_authenticated", "true");
      addToast(
        "success",
        "Autentikasi Super Admin berhasil. Selamat datang kembali!",
        "Sesi Aktif"
      );
      navigate("/admin");
    }, 400);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 flex flex-col justify-center items-center text-slate-900 relative">
      <CleanBackgroundPattern variant="subtle" />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        
        {/* Minimal Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <BrandLogoIcon size="lg" className="w-14 h-14 mx-auto" />
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Aren<span className="text-red-600">ivo</span> Admin
          </h1>
          <p className="text-xs text-slate-500">
            Akses internal staf & operator terotorisasi platform Arenivo
          </p>
        </div>

        {/* Clean Light Surface Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 ml-1">Email Operator</label>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 flex items-center gap-2.5 text-slate-900 focus-within:border-red-600 focus-within:bg-white transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="admin@platform.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 ml-1">Kata Sandi</label>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 flex items-center gap-2.5 text-slate-900 focus-within:border-red-600 focus-within:bg-white transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-mono"
                />
              </div>
            </div>

            {/* TOTP 2FA (Optional) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 ml-1">Kode TOTP 2FA (Opsional)</label>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 flex items-center gap-2.5 text-slate-900 focus-within:border-red-600 focus-within:bg-white transition-all">
                <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full font-mono tracking-widest"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-6 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credential Hint */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 flex items-start gap-2">
            <Shield className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block">Kredensial Demo Terisi:</span>
              <span className="font-mono text-[10px] text-slate-600">superadmin@futsal.id / AdminMaster2026!</span>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Kembali ke Beranda Publik
          </Link>
        </div>

      </div>
    </div>
  );
}

export default AdminLoginPage;
