import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button, Card, CardContent, Input, useToast } from "@/components/ui";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast("warning", "Password minimal harus memiliki panjang 8 karakter.", "Password Lemah");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("error", "Konfirmasi password baru tidak cocok.", "Password Tidak Sama");
      return;
    }

    addToast("success", "Password berhasil diperbarui! Silakan masuk kembali.", "Berhasil");
    navigate("/login");
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
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Simpan Kata Sandi Baru</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
