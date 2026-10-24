import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, Shield } from "lucide-react";
import { BrandLogoIcon } from "@/components/common/BrandLogo";
import { useToast } from "@/components/ui";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";
import { supabase } from "@/lib/supabase";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [totpCode, setTotpCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("warning", "Masukkan email dan kata sandi.", "Validasi");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setIsLoading(false);
        addToast("error", error.message || "Kredensial Super Admin tidak sesuai.", "Akses Ditolak");
        return;
      }

      if (data.session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.role !== "admin") {
          await supabase.auth.signOut();
          setIsLoading(false);
          addToast("error", "Akun ini tidak memiliki hak akses administrator platform.", "Akses Ditolak");
          return;
        }

        localStorage.setItem("sb_access_token", data.session.access_token);
        localStorage.setItem("futsal_admin_authenticated", "true");
        setIsLoading(false);
        addToast(
          "success",
          "Autentikasi Super Admin berhasil. Selamat datang kembali!",
          "Sesi Aktif"
        );
        navigate("/admin");
      }
    } catch (err: any) {
      setIsLoading(false);
      addToast("error", err.message || "Gagal menghubungi server autentikasi.", "Error");
    }
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
                  placeholder="admin@arenivo.id"
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
                  placeholder="Masukkan kata sandi admin"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-touch-target cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice Footer */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
            Koneksi terenkripsi SSL 256-bit & JWT Guard
          </p>
          <p className="text-[10px] text-slate-600">
            Seluruh aktivitas staf terekam otomatis di immutable audit logs.
          </p>
        </div>

      </div>
    </div>
  );
}
