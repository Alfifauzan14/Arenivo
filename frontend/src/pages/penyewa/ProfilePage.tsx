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
  LogOut,
  Loader2,
  Check,
} from "lucide-react";
import {
  Button,
  Input,
  useToast,
} from "@/components/ui";
import { useSession } from "@/features/auth/context/SessionContext";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getCurrentPushSubscription,
} from "@/lib/pushNotifications";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
];

export function ProfilePage() {
  const { user, login, refreshProfile, logout, isLoggedIn } = useSession();
  const { addToast } = useToast();

  // Profile form state
  const [fullName, setFullName] = React.useState(user?.fullName || "");
  const [phone, setPhone] = React.useState(user?.phone || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = React.useState(
    user?.avatarUrl || AVATAR_PRESETS[0]
  );
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);

  // Loading states
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

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

  // Sinkronkan data saat objek `user` terisi atau berubah dari SessionContext
  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
      if (user.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
      }
    }
  }, [user]);

  // Check active subscription on load
  React.useEffect(() => {
    getCurrentPushSubscription().then((sub) => {
      if (sub) {
        setHasActiveSub(true);
        setPushStatus("granted");
      }
    });
  }, []);

  // Simpan Perubahan Profil (Nama, No HP, Email, Avatar)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast("warning", "Nama lengkap tidak boleh kosong.", "Nama Kosong");
      return;
    }

    setIsUpdating(true);
    try {
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const isEmailChanged = user?.email && trimmedEmail !== user.email.toLowerCase();

      // 1. Update Supabase Auth user metadata & email (jika berubah)
      const authPayload: any = {
        data: {
          full_name: trimmedName,
          phone: trimmedPhone,
          avatar_url: avatarUrl,
        },
      };

      let emailNotice = "";
      if (isEmailChanged) {
        authPayload.email = trimmedEmail;
        emailNotice = " Email verifikasi perubahan telah dikirim ke alamat email baru Anda.";
      }

      const { error: authErr } = await supabase.auth.updateUser(authPayload);
      if (authErr) throw authErr;

      // 2. Simpan perubahan ke Database profiles via Backend API & Supabase
      try {
        await apiClient.patch("/me", {
          fullName: trimmedName,
          phone: trimmedPhone,
          avatarUrl: avatarUrl || undefined,
        });
      } catch {
        // Fallback langsung ke Supabase Table jika backend offline
        if (user?.id) {
          await supabase
            .from("profiles")
            .update({
              full_name: trimmedName,
              phone: trimmedPhone,
              avatar_url: avatarUrl,
              ...(isEmailChanged ? { email: trimmedEmail } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }
      }

      // 3. Update Session Context seketika agar langsung terlihat di seluruh halaman
      login({
        fullName: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        avatarUrl: avatarUrl,
      });

      await refreshProfile();

      addToast(
        "success",
        `Perubahan profil Anda berhasil disimpan.${emailNotice}`,
        "Profil Diperbarui"
      );
    } catch (err: any) {
      addToast("error", err?.message || "Gagal memperbarui profil.", "Gagal Menyimpan");
    } finally {
      setIsUpdating(false);
    }
  };

  // Ubah Kata Sandi Akun
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast("warning", "Kata sandi baru minimal 8 karakter.", "Password Kurang Panjang");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("error", "Konfirmasi kata sandi baru tidak cocok.", "Password Tidak Cocok");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addToast("success", "Kata sandi akun Anda berhasil diperbarui.", "Password Diganti");
    } catch (err: any) {
      addToast("error", err?.message || "Gagal memperbarui kata sandi.", "Gagal Ganti Password");
    } finally {
      setIsChangingPassword(false);
    }
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
      addToast("error", "Terjadi kesalahan saat memproses izin notifikasi.", "Gagal");
    } finally {
      setIsPushLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
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
                  alt={fullName || "User Avatar"}
                  className="w-full h-full rounded-full object-cover border-2 border-slate-200 ring-4 ring-slate-100 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker((prev) => !prev)}
                  title="Pilih Avatar"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pilihan Preset Avatar */}
              {showAvatarPicker && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 block">Pilih Foto Profil:</span>
                  <div className="flex justify-center gap-2">
                    {AVATAR_PRESETS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(url);
                          setShowAvatarPicker(false);
                        }}
                        className={cn(
                          "w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110",
                          avatarUrl === url ? "border-red-600 ring-2 ring-red-400" : "border-slate-300"
                        )}
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">{fullName || "Pengguna Arenivo"}</h3>
                <div>
                  <span className="bg-red-50 text-red-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-red-200 inline-block uppercase tracking-wide">
                    {user?.role === "mitra" ? "Mitra Lapangan" : "Penyewa Aktif"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">{email || "Belum ada email"}</p>
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
                    label="Alamat Email (Gmail)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isUpdating}
                    className="font-bold text-xs rounded-lg shadow-xs"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
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
                    placeholder="Konfirmasi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    disabled={isChangingPassword}
                    className="font-bold text-xs rounded-lg shadow-xs"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Memperbarui...</span>
                      </>
                    ) : (
                      "Perbarui Kata Sandi"
                    )}
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
