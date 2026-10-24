import * as React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Camera,
  Lock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  Button,
  Input,
  useToast,
} from "@/components/ui";
import { useSession } from "@/features/auth/context/SessionContext";
import { cn } from "@/lib/utils";
import {
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getCurrentPushSubscription,
} from "@/lib/pushNotifications";

export function ProfilePage() {
  const { user, logout, isLoggedIn } = useSession();
  const { addToast } = useToast();

  // Profile form state
  const [fullName, setFullName] = React.useState(user?.fullName || "Rizky Ramadhan");
  const [phone, setPhone] = React.useState(user?.phone || "081234567890");
  const [email, setEmail] = React.useState(user?.email || "rizky.ramadhan@gmail.com");
  const [avatarUrl, setAvatarUrl] = React.useState(
    user?.avatarUrl ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
  );

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Firebase Web Push Notification state
  const [isPushLoading, setIsPushLoading] = React.useState(false);
  const [hasActiveSub, setHasActiveSub] = React.useState(false);
  const [pushStatus, setPushStatus] = React.useState<"default" | "granted" | "denied">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission as "default" | "granted" | "denied";
    }
    return "default";
  });

  // Check active subscription on load
  React.useEffect(() => {
    getCurrentPushSubscription().then((sub) => {
      if (sub) {
        setHasActiveSub(true);
        setPushStatus("granted");
      }
    });
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("success", "Profil Anda telah berhasil diperbarui.", "Profil Tersimpan");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast("warning", "Masukkan password saat ini.", "Password Lama");
      return;
    }
    if (newPassword.length < 8) {
      addToast("warning", "Password baru minimal 8 karakter.", "Password Baru");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("error", "Konfirmasi password baru tidak cocok.", "Password Tidak Cocok");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    addToast("success", "Password Anda berhasil diganti.", "Password Diperbarui");
  };

  // Toggle Firebase Web Push Notification
  const handleTogglePushNotifications = async () => {
    if (!isPushNotificationSupported()) {
      addToast("error", "Browser Anda tidak mendukung Web Push Notification.", "Tidak Didukung");
      return;
    }

    setIsPushLoading(true);
    try {
      if (hasActiveSub) {
        await unsubscribeFromPushNotifications();
        setHasActiveSub(false);
        setPushStatus("default");
        addToast("info", "Web Push Notification telah dinonaktifkan.", "Notifikasi Dimatikan");
      } else {
        const res = await subscribeToPushNotifications();
        setPushStatus(res.permission);
        if (res.success) {
          setHasActiveSub(true);
          addToast(
            "success",
            "Web Push Notification Firebase aktif! Anda akan menerima notifikasi pengingat jadwal langsung di layar.",
            "Notifikasi Aktif"
          );
        } else {
          addToast("error", res.error || "Gagal mengaktifkan notifikasi.", "Izin Ditolak");
        }
      }
    } catch {
      addToast("error", "Terjadi kesalahan saat mengatur notifikasi.", "Kesalahan");
    } finally {
      setIsPushLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* 1. Header Banner Warna (Sporty Crimson) */}
      <section className="relative bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white py-6 sm:py-8 md:py-10 overflow-hidden border-b border-red-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pengaturan Profil Akun
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1">
              Kelola informasi pribadi, preferensi keamanan, dan notifikasi pengingat jadwal.
            </p>
          </div>

          {isLoggedIn ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-800 border-white transition-all shadow-xs self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-800 border-white transition-all shadow-xs self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5 rotate-180" />
                <span>Masuk Akun</span>
              </Button>
            </Link>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-keyboard-safe pb-safe space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri: Avatar & Status Akun */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-200 ring-4 ring-slate-100 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAvatarUrl(
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    )
                  }
                  title="Ganti Foto"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">{fullName}</h3>
                <div>
                  <span className="bg-red-50 text-red-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-red-200 inline-block uppercase tracking-wide">
                    Penyewa Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">{email}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Akun Terverifikasi</span>
              </div>
            </div>

            {/* Firebase Web Push Notification Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Push Notification</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Firebase Cloud Messaging</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Dapatkan notifikasi pengingat jadwal bermain H-3 jam dan konfirmasi pembayaran langsung di browser Anda.
              </p>

              <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Status Izin:</span>
                <span
                  className={cn(
                    "font-bold font-mono text-[11px] px-2.5 py-0.5 rounded-full",
                    hasActiveSub
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : pushStatus === "denied"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-slate-100 text-slate-700"
                  )}
                >
                  {hasActiveSub
                    ? "Aktif & Terhubung"
                    : pushStatus === "denied"
                    ? "Diblokir Browser"
                    : "Belum Diaktifkan"}
                </span>
              </div>

              <Button
                type="button"
                variant={hasActiveSub ? "outline" : "primary"}
                size="sm"
                onClick={handleTogglePushNotifications}
                disabled={isPushLoading}
                className="w-full text-xs font-bold rounded-lg shadow-xs gap-2"
              >
                {isPushLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : hasActiveSub ? (
                  "Nonaktifkan Web Push"
                ) : pushStatus === "granted" ? (
                  "Hubungkan Ulang Web Push"
                ) : (
                  "Aktifkan Web Push"
                )}
              </Button>
            </div>
          </div>

          {/* Kolom Kanan: Form Edit Data & Ganti Password */}
          <div className="md:col-span-2 space-y-6">
            {/* Form Profil Utama */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <User className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-base text-slate-900">Informasi Kontak Pribadi</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nomor WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                  />
                  <Input
                    label="Alamat Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" size="md" className="font-bold text-xs rounded-lg shadow-xs">
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </div>

            {/* Form Ganti Kata Sandi */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Lock className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-base text-slate-900">Ubah Kata Sandi (Password)</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Kata Sandi Saat Ini"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Kata Sandi Baru"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  />
                  <Input
                    label="Ulangi Kata Sandi Baru"
                    type="password"
                    placeholder="Konfirmasi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="outline" size="md" className="font-bold text-xs rounded-lg shadow-xs">
                    Perbarui Kata Sandi
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
