import * as React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSession } from "@/features/auth/context/SessionContext";
import { useToast } from "@/components/ui";

export function TikTokCallbackPage() {
  const navigate = useNavigate();
  const { toggleSession, isLoggedIn } = useSession();
  const { addToast } = useToast();
  const [status, setStatus] = React.useState<"processing" | "success">("processing");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        toggleSession();
      }
      setStatus("success");
      addToast(
        "success",
        "Autentikasi TikTok OAuth2 berhasil! Selamat datang di aplikasi.",
        "TikTok Login Sukses"
      );
      setTimeout(() => {
        navigate("/bookings");
      }, 1000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoggedIn, toggleSession, addToast, navigate]);

  return (
    <div className="bg-[#FCFCFC] min-h-screen py-16 flex flex-col items-center justify-center">
      <div className="max-w-sm w-full mx-auto p-6 bg-white rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
        {status === "processing" ? (
          <>
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-base text-slate-900">Menghubungkan Akun TikTok</h2>
              <p className="text-xs text-slate-500">
                Memvalidasi token otorisasi OAuth2 dan profil pengguna...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-base text-slate-900">Login TikTok Berhasil!</h2>
              <p className="text-xs text-slate-500">
                Mengarahkan Anda ke dasbor pemesanan...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TikTokCallbackPage;
