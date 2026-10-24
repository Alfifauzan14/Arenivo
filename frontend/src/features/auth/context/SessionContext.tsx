import * as React from "react";
import type { Profile } from "@futsal/shared";
import { supabase } from "@/lib/supabase";

interface SessionContextType {
  user: Profile | null;
  isLoggedIn: boolean;
  login: (userData?: Partial<Profile>) => void;
  logout: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [favorites, setFavorites] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("futsal_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadUserProfile = React.useCallback(async (userId: string, userMeta?: any, email?: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        setCurrentUser({
          id: profile.id,
          fullName: profile.full_name || userMeta?.full_name || "Pengguna Arenivo",
          email: profile.email || email || "",
          phone: profile.phone || userMeta?.phone || "",
          avatarUrl: profile.avatar_url || userMeta?.avatar_url || userMeta?.picture || "",
          role: profile.role || "penyewa",
          status: profile.status || "aktif",
        });
        setIsLoggedIn(true);
        return;
      }
    } catch (err) {
      console.warn("Gagal memuat profil Supabase:", err);
    }

    // Fallback dari session metadata jika profil belum ter-insert
    setCurrentUser({
      id: userId,
      fullName: userMeta?.full_name || email?.split("@")[0] || "Pengguna Arenivo",
      email: email || "",
      phone: userMeta?.phone || "",
      avatarUrl: userMeta?.avatar_url || userMeta?.picture || "",
      role: "penyewa",
      status: "aktif",
    });
    setIsLoggedIn(true);
  }, []);

  const refreshProfile = React.useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadUserProfile(session.user.id, session.user.user_metadata, session.user.email);
    } else {
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  }, [loadUserProfile]);

  // Sinkronisasi Sesi Realtime Supabase Auth
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem("sb_access_token", session.access_token);
        localStorage.setItem("futsal_logged_in", "true");
        loadUserProfile(session.user.id, session.user.user_metadata, session.user.email);
      } else {
        localStorage.removeItem("sb_access_token");
        localStorage.removeItem("futsal_logged_in");
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        localStorage.setItem("sb_access_token", session.access_token);
        localStorage.setItem("futsal_logged_in", "true");
        await loadUserProfile(session.user.id, session.user.user_metadata, session.user.email);
      } else {
        localStorage.removeItem("sb_access_token");
        localStorage.removeItem("futsal_logged_in");
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = React.useCallback((userData?: Partial<Profile>) => {
    if (userData) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : (userData as Profile)));
      setIsLoggedIn(true);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("futsal_logged_in");
    localStorage.removeItem("futsal_auth_token");
    localStorage.removeItem("sb_access_token");
    localStorage.removeItem("futsal_mitra_authenticated");
    localStorage.removeItem("futsal_admin_authenticated");
    await supabase.auth.signOut().catch(() => {});
  }, []);

  const toggleFavorite = React.useCallback((venueId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId];
      try {
        localStorage.setItem("futsal_favorites", JSON.stringify(next));
      } catch (e) {
        console.error("Gagal menyimpan favorit:", e);
      }
      return next;
    });
  }, []);

  const isFavorite = React.useCallback(
    (venueId: string) => favorites.includes(venueId),
    [favorites]
  );

  return (
    <SessionContext.Provider
      value={{
        user: currentUser,
        isLoggedIn,
        login,
        logout,
        favorites,
        toggleFavorite,
        isFavorite,
        refreshProfile,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
