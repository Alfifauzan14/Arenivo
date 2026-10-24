import * as React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, useToast } from "@/components/ui";
import { CleanBackgroundPattern } from "@/components/common/CleanBackgroundPattern";

export function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isSent, setIsSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast("warning", "Masukkan alamat email Anda terlebih dahulu.", "Email Kosong");
      return;
    }

    setIsSent(true);
    addToast(
      "success",
      `Tautan pemulihan kata sandi telah dikirim ke ${email}.`,
      "Email Terkirim"
    );
  };

  return (
    <div className="bg-[#FCFCFC] min-h-screen py-12 flex flex-col justify-center relative overflow-hidden">
      <CleanBackgroundPattern variant="auth" />
      <div className="max-w-md w-full mx-auto px-4 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lupa Kata Sandi?
          </h1>
          <p className="text-xs text-slate-500">
            Masukkan email terdaftar Anda untuk menerima tautan pemulihan sandi
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-5">
          {isSent ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-lg text-slate-900">Email Pemulihan Terkirim</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Kami telah mengirimkan tautan ganti kata sandi ke{" "}
                <strong className="font-mono text-slate-800">{email}</strong>. Silakan periksa Inbox atau folder Spam.
              </p>
              <div className="pt-3">
                <Link to="/login">
                  <button
                    type="button"
                    className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                  >
                    Kembali ke Halaman Masuk
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 ml-0.5">Alamat Email Terdaftar</label>
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-orange-500 via-red-600 to-rose-700 hover:from-orange-600 hover:via-red-700 hover:to-rose-800 text-white font-black text-xs uppercase tracking-wider shadow-xs active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Kirim Tautan Pemulihan</span>
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

export default ForgotPasswordPage;
