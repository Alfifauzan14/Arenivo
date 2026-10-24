import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";
import { supabase } from "@/lib/supabase";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast("warning", "Password minimal harus memiliki panjang 8 karakter.", "Password Lemah");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("error", "Konfirmasi password baru tidak cocok.", "Password Tidak Sama");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Coba update via Supabase Auth client (aktif saat pengguna mengklik link recovery)
      const { error: supaErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (supaErr) {
        // 2. Coba update via backend API route jika auth token ada di header
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          throw new Error(supaErr.message || "Tautan pemulihan tidak valid atau sesi telah kedaluwarsa.");
        }

        const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
        const res = await fetch(`${apiUrl}/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: newPassword }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error?.message || supaErr.message);
        }
      }

      // Logout recovery session agar pengguna login dengan password baru
      await supabase.auth.signOut().catch(() => {});

      setIsSuccess(true);
      addToast("success", "Password berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.", "Berhasil");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      addToast(
        "error",
        err?.message || "Gagal memperbarui kata sandi. Pastikan tautan dibuka langsung dari email.",
        "Gagal"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FCFCFC] min-h-screen py-12 flex flex-col justify-center relative overflow-hidden">
      <CleanBackgroundPattern variant="auth" />
      <div className="max-w-md w-full mx-auto px-4 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Atur Ulang Kata Sandi
          </h1>
          <p className="text-xs text-slate-500">
            Masukkan kata sandi baru untuk akun Anda (minimal 8 karakter)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-4">
          {isSuccess ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-lg text-slate-900">Kata Sandi Diperbarui!</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Kata sandi baru Anda telah berhasil disimpan. Anda akan dialihkan otomatis ke halaman masuk...
              </p>
              <div className="pt-3">
                <Link to="/login" className="block">
                  <button
                    type="button"
                    className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-0.5">Kata Sandi Baru</label>
                <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-0.5">Ulangi Kata Sandi Baru</label>
                <div className="rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-600 px-3.5 py-2.5 flex items-center gap-3 transition-all shadow-xs">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Sandi...</span>
                    </>
                  ) : (
                    <span>Simpan Kata Sandi Baru</span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
